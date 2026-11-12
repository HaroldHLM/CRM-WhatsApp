export const STAGES = [
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'en_conversacion', label: 'En conversación' },
  { id: 'cotizado', label: 'Cotizado' },
  { id: 'ganado', label: 'Ganado' },
  { id: 'perdido', label: 'Perdido' },
] as const;

export type StageId = (typeof STAGES)[number]['id'];

export interface Lead {
  /** ID del chat de WhatsApp, p. ej. "51987654321@c.us" */
  chatId: string;
  name: string;
  phone: string;
  stage: StageId;
  /** ISO 8601. Base de los reportes por día, semana y mes. */
  firstContactAt: string;
  updatedAt: string;
}

export interface LeadEvent {
  chatId: string;
  from: StageId | null;
  to: StageId;
  at: string;
}

export function isStageId(value: unknown): value is StageId {
  return STAGES.some((s) => s.id === value);
}

export function phoneFromChatId(chatId: string): string {
  return chatId.split('@')[0] ?? '';
}

export function createLead(
  input: { chatId: string; name?: string },
  now: Date = new Date(),
): { lead: Lead; event: LeadEvent } {
  const at = now.toISOString();
  const phone = phoneFromChatId(input.chatId);
  const lead: Lead = {
    chatId: input.chatId,
    name: input.name?.trim() || phone,
    phone,
    stage: 'nuevo',
    firstContactAt: at,
    updatedAt: at,
  };
  return { lead, event: { chatId: lead.chatId, from: null, to: 'nuevo', at } };
}

export function moveLead(
  lead: Lead,
  to: StageId,
  now: Date = new Date(),
): { lead: Lead; event: LeadEvent | null } {
  if (lead.stage === to) return { lead, event: null };
  const at = now.toISOString();
  return {
    lead: { ...lead, stage: to, updatedAt: at },
    event: { chatId: lead.chatId, from: lead.stage, to, at },
  };
}

export function daysSince(iso: string, now: Date = new Date()): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
}
