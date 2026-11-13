import { useState, type DragEvent } from 'react';
import { STAGES, type Lead, type StageId } from '../domain/lead';
import { agoLabel } from './format';

const DRAG_TYPE = 'text/x-crm-chat-id';

interface Props {
  byStage: Map<StageId, Lead[]>;
  activeChatId: string | null;
  onMove: (chatId: string, to: StageId) => void;
  onRemove: (lead: Lead) => void;
  onOpenLead: (chatId: string) => void;
  onClose: () => void;
}

export function Board({ byStage, activeChatId, onMove, onRemove, onOpenLead, onClose }: Props) {
  const [dragOver, setDragOver] = useState<StageId | null>(null);
  const total = STAGES.reduce((n, s) => n + (byStage.get(s.id)?.length ?? 0), 0);

  const onDrop = (e: DragEvent, stage: StageId) => {
    e.preventDefault();
    setDragOver(null);
    const chatId = e.dataTransfer.getData(DRAG_TYPE);
    if (chatId) onMove(chatId, stage);
  };

  return (
    <section className="board" aria-label="Kanban de ventas">
      <header className="board-head">
        <h1>Kanban de ventas</h1>
        <span className="muted">{total} chats · arrastra las tarjetas para cambiar de etapa</span>
        <button className="btn board-close" onClick={onClose}>
          Volver al chat <kbd>Esc</kbd>
        </button>
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
                  className={`card ${activeChatId === lead.chatId ? 'current' : ''}`}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData(DRAG_TYPE, lead.chatId)}
                  onClick={() => onOpenLead(lead.chatId)}
                  title="Abrir chat"
                >
                  <strong>{lead.name}</strong>
                  <span className="phone">+{lead.phone}</span>
                  <span className="meta">
                    Primer contacto {agoLabel(lead.firstContactAt)} · movido{' '}
                    {agoLabel(lead.updatedAt)}
                  </span>
                  <button
                    className="remove"
                    aria-label={`Quitar ${lead.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(lead);
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
  );
}
