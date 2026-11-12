import { useEffect, useMemo, useState, type DragEvent } from 'react';
import {
  STAGES,
  createLead,
  daysSince,
  isStageId,
  moveLead,
  type Lead,
  type StageId,
} from '../domain/lead';
import type { LeadsRepository } from '../repositories/leads.repo';
import { useBridge } from '../content/bridge-client';

const DRAG_TYPE = 'text/x-crm-chat-id';

export function App({ repo }: { repo: LeadsRepository }) {
  const [open, setOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dragOver, setDragOver] = useState<StageId | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { ready, activeChat, error, openChat } = useBridge();

  useEffect(() => {
    const load = () => repo.getAll().then(setLeads).catch(() => setSaveError('No se pudieron leer los datos.'));
    load();
    return repo.onChange(load);
  }, [repo]);

  const byStage = useMemo(() => {
    const map = new Map<StageId, Lead[]>(STAGES.map((s) => [s.id, []]));
    [...leads]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .forEach((l) => map.get(l.stage)?.push(l));
    return map;
  }, [leads]);

  const activeLead = activeChat ? leads.find((l) => l.chatId === activeChat.chatId) : undefined;

  async function run(action: () => Promise<void>) {
    try {
      setSaveError(null);
      await action();
    } catch {
      setSaveError('No se pudo guardar el cambio. Intenta de nuevo.');
    }
  }

  const addActive = () =>
    run(async () => {
      if (!activeChat || activeChat.isGroup || activeLead) return;
      const { lead, event } = createLead({ chatId: activeChat.chatId, name: activeChat.name });
      await repo.save(lead, event);
    });

  const move = (chatId: string, to: StageId) =>
    run(async () => {
      const lead = leads.find((l) => l.chatId === chatId);
      if (!lead) return;
      const result = moveLead(lead, to);
      if (result.event) await repo.save(result.lead, result.event);
    });

  const remove = (lead: Lead) =>
    run(async () => {
      if (window.confirm(`¿Quitar a ${lead.name} del Kanban? El historial se conserva.`)) {
        await repo.remove(lead.chatId);
      }
    });

  const onDrop = (e: DragEvent, stage: StageId) => {
    e.preventDefault();
    setDragOver(null);
    const chatId = e.dataTransfer.getData(DRAG_TYPE);
    if (chatId) move(chatId, stage);
  };

  return (
    <>
      <div className="fab-group">
        {ready && activeChat && !activeChat.isGroup && (
          activeLead ? (
            <select
              className="fab-stage"
              value={activeLead.stage}
              title="Etapa del chat abierto"
              onChange={(e) => isStageId(e.target.value) && move(activeLead.chatId, e.target.value)}
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          ) : (
            <button className="fab-add" onClick={addActive}>+ Agregar chat al CRM</button>
          )
        )}
        <button className="fab" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? 'Cerrar' : `CRM · ${leads.length}`}
        </button>
      </div>

      {open && (
        <section className="board" aria-label="Kanban de ventas">
          <header className="board-head">
            <h1>Kanban de ventas</h1>
            <span className={`status ${ready ? 'ok' : 'wait'}`}>
              {error ? error : ready ? 'Conectado a WhatsApp' : 'Esperando a WhatsApp Web…'}
            </span>
            {saveError && <span className="status err">{saveError}</span>}
          </header>
          <div className="columns">
            {STAGES.map((stage) => {
              const items = byStage.get(stage.id) ?? [];
              return (
                <div
                  key={stage.id}
                  className={`column stage-${stage.id} ${dragOver === stage.id ? 'over' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(stage.id);
                  }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => onDrop(e, stage.id)}
                >
                  <h2>
                    {stage.label} <span className="count">{items.length}</span>
                  </h2>
                  {items.length === 0 && <p className="empty">Arrastra un chat aquí</p>}
                  {items.map((lead) => (
                    <article
                      key={lead.chatId}
                      className={`card ${activeChat?.chatId === lead.chatId ? 'current' : ''}`}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData(DRAG_TYPE, lead.chatId)}
                      onClick={() => {
                        openChat(lead.chatId);
                        setOpen(false);
                      }}
                      title="Abrir chat"
                    >
                      <strong>{lead.name}</strong>
                      <span className="phone">+{lead.phone}</span>
                      <span className="meta">
                        Primer contacto: hace {daysSince(lead.firstContactAt)} d
                      </span>
                      <button
                        className="remove"
                        aria-label={`Quitar ${lead.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(lead);
                        }}
                      >
                        ×
                      </button>
                    </article>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
