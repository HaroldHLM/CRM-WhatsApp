import { isStageId, type Lead, type LeadEvent } from '../domain/lead';

/**
 * Interfaz única de acceso a datos. Hoy: chrome.storage.local.
 * En el Paso 3 se agrega una implementación con Supabase sin tocar la UI.
 */
export interface LeadsRepository {
  getAll(): Promise<Lead[]>;
  save(lead: Lead, event?: LeadEvent | null): Promise<void>;
  remove(chatId: string): Promise<void>;
  getEvents(): Promise<LeadEvent[]>;
  onChange(listener: () => void): () => void;
}

/** Subconjunto de chrome.storage.StorageArea; permite un fake en los tests. */
export interface KeyValueStore {
  get(keys: string[]): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}

const LEADS_KEY = 'crm.leads.v1';
const EVENTS_KEY = 'crm.lead_events.v1';

function isLead(v: unknown): v is Lead {
  if (typeof v !== 'object' || v === null) return false;
  const l = v as Record<string, unknown>;
  return (
    typeof l.chatId === 'string' &&
    typeof l.name === 'string' &&
    typeof l.phone === 'string' &&
    isStageId(l.stage) &&
    typeof l.firstContactAt === 'string' &&
    typeof l.updatedAt === 'string'
  );
}

export class StorageLeadsRepository implements LeadsRepository {
  private listeners = new Set<() => void>();

  constructor(private readonly store: KeyValueStore) {}

  async getAll(): Promise<Lead[]> {
    const data = await this.store.get([LEADS_KEY]);
    const raw = data[LEADS_KEY];
    if (typeof raw !== 'object' || raw === null) return [];
    return Object.values(raw).filter(isLead);
  }

  async save(lead: Lead, event?: LeadEvent | null): Promise<void> {
    const data = await this.store.get([LEADS_KEY, EVENTS_KEY]);
    const leads = { ...((data[LEADS_KEY] as Record<string, Lead>) ?? {}), [lead.chatId]: lead };
    const events = (data[EVENTS_KEY] as LeadEvent[]) ?? [];
    await this.store.set({
      [LEADS_KEY]: leads,
      [EVENTS_KEY]: event ? [...events, event] : events,
    });
    this.emit();
  }

  /** Quita la tarjeta del Kanban; el historial de eventos se conserva. */
  async remove(chatId: string): Promise<void> {
    const data = await this.store.get([LEADS_KEY]);
    const leads = { ...((data[LEADS_KEY] as Record<string, Lead>) ?? {}) };
    delete leads[chatId];
    await this.store.set({ [LEADS_KEY]: leads });
    this.emit();
  }

  async getEvents(): Promise<LeadEvent[]> {
    const data = await this.store.get([EVENTS_KEY]);
    return (data[EVENTS_KEY] as LeadEvent[]) ?? [];
  }

  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }
}
