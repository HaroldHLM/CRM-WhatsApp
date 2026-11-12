/**
 * Contrato de mensajes entre el bridge (mundo MAIN, con WA-JS)
 * y el content script (mundo aislado, con la UI).
 */
export const BRIDGE_SOURCE = 'crm-wa-bridge';
export const UI_SOURCE = 'crm-wa-ui';

export interface ActiveChat {
  chatId: string;
  name: string;
  isGroup: boolean;
}

export type BridgeMessage =
  | { source: typeof BRIDGE_SOURCE; type: 'READY' }
  | { source: typeof BRIDGE_SOURCE; type: 'ACTIVE_CHAT'; chat: ActiveChat | null }
  | { source: typeof BRIDGE_SOURCE; type: 'ERROR'; message: string };

export type UiMessage =
  | { source: typeof UI_SOURCE; type: 'GET_ACTIVE_CHAT' }
  | { source: typeof UI_SOURCE; type: 'OPEN_CHAT'; chatId: string };

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

function isActiveChat(v: unknown): v is ActiveChat {
  return (
    isObject(v) &&
    typeof v.chatId === 'string' &&
    typeof v.name === 'string' &&
    typeof v.isGroup === 'boolean'
  );
}

export function isBridgeMessage(v: unknown): v is BridgeMessage {
  if (!isObject(v) || v.source !== BRIDGE_SOURCE) return false;
  switch (v.type) {
    case 'READY':
      return true;
    case 'ACTIVE_CHAT':
      return v.chat === null || isActiveChat(v.chat);
    case 'ERROR':
      return typeof v.message === 'string';
    default:
      return false;
  }
}

export function isUiMessage(v: unknown): v is UiMessage {
  if (!isObject(v) || v.source !== UI_SOURCE) return false;
  if (v.type === 'GET_ACTIVE_CHAT') return true;
  if (v.type === 'OPEN_CHAT') return typeof v.chatId === 'string';
  return false;
}

/** Omit que respeta cada variante de la unión. */
export type WithoutSource<T> = T extends unknown ? Omit<T, 'source'> : never;
