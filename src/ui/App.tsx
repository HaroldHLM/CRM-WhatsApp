import { useEffect, useMemo, useState } from 'react';
import { STAGES, createLead, moveLead, type Lead, type StageId } from '../domain/lead';
import type { LeadsRepository } from '../repositories/leads.repo';
import { useBridge } from '../content/bridge-client';
import { TopBar } from './TopBar';
import { Board } from './Board';

export function App({ repo }: { repo: LeadsRepository }) {
  const [boardOpen, setBoardOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { ready, activeChat, error, openChat } = useBridge();

  useEffect(() => {
    const load = () =>
      repo
        .getAll()
        .then(setLeads)
        .catch(() => setSaveError('No se pudieron leer los datos.'));
    load();
    return repo.onChange(load);
  }, [repo]);

  // Esc cierra el tablero sin que WhatsApp lo reciba (WhatsApp cerraría el chat abierto).
  useEffect(() => {
    if (!boardOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      setBoardOpen(false);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [boardOpen]);

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

  const openLead = (chatId: string) => {
    openChat(chatId);
    setBoardOpen(false);
  };

  return (
    <>
      <TopBar
        ready={ready}
        error={error ?? saveError}
        byStage={byStage}
        activeChat={activeChat}
        activeLead={activeLead}
        boardOpen={boardOpen}
        onAdd={addActive}
        onMove={move}
        onOpenLead={openLead}
        onToggleBoard={() => setBoardOpen((v) => !v)}
      />
      {boardOpen && (
        <Board
          byStage={byStage}
          activeChatId={activeChat?.chatId ?? null}
          onMove={move}
          onRemove={remove}
          onOpenLead={openLead}
          onClose={() => setBoardOpen(false)}
        />
      )}
    </>
  );
}
