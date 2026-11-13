import { describe, expect, it, vi } from 'vitest';
import { createLead, moveLead } from '../src/domain/lead';
import { StorageLeadsRepository, type KeyValueStore } from '../src/repositories/leads.repo';

function fakeStore(): KeyValueStore {
  const data: Record<string, unknown> = {};
  return {
    async get(keys) {
      return Object.fromEntries(
        keys.filter((k) => k in data).map((k) => [k, structuredClone(data[k])]),
      );
    },
    async set(items) {
      Object.assign(data, structuredClone(items));
    },
  };
}

describe('StorageLeadsRepository', () => {
  it('guarda, mueve y conserva el historial', async () => {
    const repo = new StorageLeadsRepository(fakeStore());
    const created = createLead({ chatId: 'a@c.us', name: 'Ana' });
    await repo.save(created.lead, created.event);
    const moved = moveLead(created.lead, 'ganado');
    await repo.save(moved.lead, moved.event);

    const leads = await repo.getAll();
    expect(leads).toHaveLength(1);
    expect(leads[0]?.stage).toBe('ganado');
    expect((await repo.getEvents()).map((e) => e.to)).toEqual(['nuevo', 'ganado']);
  });

  it('remove quita la tarjeta pero no los eventos', async () => {
    const repo = new StorageLeadsRepository(fakeStore());
    const { lead, event } = createLead({ chatId: 'b@c.us' });
    await repo.save(lead, event);
    await repo.remove('b@c.us');
    expect(await repo.getAll()).toEqual([]);
    expect(await repo.getEvents()).toHaveLength(1);
  });

  it('ignora datos corruptos y notifica cambios', async () => {
    const store = fakeStore();
    await store.set({ 'crm.leads.v1': { x: { chatId: 'x' } } });
    const repo = new StorageLeadsRepository(store);
    expect(await repo.getAll()).toEqual([]);
    const listener = vi.fn();
    repo.onChange(listener);
    const { lead } = createLead({ chatId: 'c@c.us' });
    await repo.save(lead);
    expect(listener).toHaveBeenCalledOnce();
  });
});
