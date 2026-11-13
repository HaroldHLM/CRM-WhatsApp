import { describe, expect, it } from 'vitest';
import { BRIDGE_SOURCE, UI_SOURCE, isBridgeMessage, isUiMessage } from '../src/contracts/bridge';

describe('contracts/bridge', () => {
  it('valida mensajes del bridge', () => {
    expect(isBridgeMessage({ source: BRIDGE_SOURCE, type: 'READY' })).toBe(true);
    expect(isBridgeMessage({ source: BRIDGE_SOURCE, type: 'ACTIVE_CHAT', chat: null })).toBe(true);
    expect(
      isBridgeMessage({ source: BRIDGE_SOURCE, type: 'ACTIVE_CHAT', chat: { chatId: 1 } }),
    ).toBe(false);
    expect(isBridgeMessage({ source: 'otro', type: 'READY' })).toBe(false);
  });
  it('valida mensajes de la UI', () => {
    expect(isUiMessage({ source: UI_SOURCE, type: 'OPEN_CHAT', chatId: 'a@c.us' })).toBe(true);
    expect(isUiMessage({ source: UI_SOURCE, type: 'SEND_TEXT', chatId: 'a' })).toBe(false);
  });
});
