import { describe, expect, it } from 'vitest';
import { createLead, daysSince, isStageId, moveLead, phoneFromChatId } from '../src/domain/lead';

const t0 = new Date('2026-11-12T10:00:00.000Z');
const t1 = new Date('2026-11-13T15:30:00.000Z');

describe('domain/lead', () => {
  it('crea un lead en Nuevo con primer contacto y evento inicial', () => {
    const { lead, event } = createLead({ chatId: '51987654321@c.us', name: ' Ana ' }, t0);
    expect(lead).toMatchObject({ name: 'Ana', phone: '51987654321', stage: 'nuevo', firstContactAt: t0.toISOString() });
    expect(event).toEqual({ chatId: '51987654321@c.us', from: null, to: 'nuevo', at: t0.toISOString() });
  });

  it('usa el teléfono como nombre si no hay nombre', () => {
    expect(createLead({ chatId: '51999@c.us' }, t0).lead.name).toBe('51999');
  });

  it('mover registra evento y conserva el primer contacto', () => {
    const { lead } = createLead({ chatId: 'x@c.us' }, t0);
    const r = moveLead(lead, 'cotizado', t1);
    expect(r.lead.stage).toBe('cotizado');
    expect(r.lead.firstContactAt).toBe(t0.toISOString());
    expect(r.event).toEqual({ chatId: 'x@c.us', from: 'nuevo', to: 'cotizado', at: t1.toISOString() });
  });

  it('mover a la misma etapa no genera evento', () => {
    const { lead } = createLead({ chatId: 'x@c.us' }, t0);
    expect(moveLead(lead, 'nuevo', t1).event).toBeNull();
  });

  it('utilidades', () => {
    expect(isStageId('ganado')).toBe(true);
    expect(isStageId('otro')).toBe(false);
    expect(phoneFromChatId('51911@c.us')).toBe('51911');
    expect(daysSince(t0.toISOString(), t1)).toBe(1);
  });
});
