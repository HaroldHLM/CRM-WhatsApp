import { useState } from 'react';
import { STAGES, isStageId, type Lead, type StageId } from '../domain/lead';
import type { ActiveChat } from '../contracts/bridge';
import { agoLabel } from './format';

interface Props {
  ready: boolean;
  error: string | null;
  byStage: Map<StageId, Lead[]>;
  activeChat: ActiveChat | null;
  activeLead: Lead | undefined;
  boardOpen: boolean;
  onAdd: () => void;
  onMove: (chatId: string, to: StageId) => void;
  onOpenLead: (chatId: string) => void;
  onToggleBoard: () => void;
}

interface OpenMenu {
  stage: StageId;
  left: number;
}

export function TopBar(props: Props) {
  const { ready, error, byStage, activeChat, activeLead, boardOpen } = props;
  const [menu, setMenu] = useState<OpenMenu | null>(null);

  const status = error ? 'err' : ready ? 'ok' : 'wait';
  const statusText = error ?? (ready ? 'Conectado a WhatsApp' : 'Esperando a WhatsApp Web…');
  const menuStage = menu ? STAGES.find((s) => s.id === menu.stage) : undefined;
  const menuLeads = menu ? (byStage.get(menu.stage) ?? []) : [];

  return (
    <>
      <nav className="bar" aria-label="CRM de ventas">
        <span className="brand" title={statusText}>
          <span className={`status-dot ${status}`} />
          CRM
        </span>

        <div className="chips" role="tablist">
          {STAGES.map((s) => {
            const count = byStage.get(s.id)?.length ?? 0;
            const isOpen = menu?.stage === s.id;
            return (
              <button
                key={s.id}
                className={`chip ${isOpen ? 'open' : ''}`}
                aria-expanded={isOpen}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMenu(isOpen ? null : { stage: s.id, left: rect.left });
                }}
              >
                <span className={`dot stage-${s.id}`} />
                {s.label}
                <span className="chip-count">{count}</span>
              </button>
            );
          })}
        </div>

        {error && <span className="bar-error">{error}</span>}

        {ready && activeChat && (
          <div className="active">
            <span className="active-name" title={activeChat.name}>
              {activeChat.name}
            </span>
            {activeChat.isGroup ? (
              <span className="muted">Grupo · no se agrega</span>
            ) : activeLead ? (
              <select
                className={`stage-select stage-${activeLead.stage}`}
                value={activeLead.stage}
                title="Etapa del chat abierto"
                onChange={(e) =>
                  isStageId(e.target.value) && props.onMove(activeLead.chatId, e.target.value)
                }
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            ) : (
              <button className="btn btn-primary" onClick={props.onAdd}>
                + Agregar al CRM
              </button>
            )}
          </div>
        )}

        <button
          className={`btn ${boardOpen ? 'btn-primary' : ''}`}
          aria-pressed={boardOpen}
          onClick={() => {
            setMenu(null);
            props.onToggleBoard();
          }}
        >
          {boardOpen ? 'Cerrar tablero' : 'Tablero'}
        </button>
      </nav>

      {menu && menuStage && (
        <>
          <div className="backdrop" onClick={() => setMenu(null)} />
          <div className="menu" style={{ left: Math.max(8, menu.left) }} role="dialog">
            <div className="menu-head">
              <span className={`dot stage-${menuStage.id}`} />
              {menuStage.label}
              <span className="muted">· {menuLeads.length}</span>
            </div>
            {menuLeads.length === 0 ? (
              <p className="menu-empty">No hay chats en esta etapa.</p>
            ) : (
              <ul className="menu-list">
                {menuLeads.map((lead) => (
                  <li key={lead.chatId}>
                    <button
                      className={`menu-item ${activeChat?.chatId === lead.chatId ? 'current' : ''}`}
                      onClick={() => {
                        setMenu(null);
                        props.onOpenLead(lead.chatId);
                      }}
                    >
                      <span className="menu-name">{lead.name}</span>
                      <span className="muted">Movido {agoLabel(lead.updatedAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </>
  );
}
