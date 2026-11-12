/**
 * Bridge: único archivo que usa WA-JS. Corre en el mundo MAIN de la página.
 * Solo LEE datos y abre chats. No envía mensajes (regla de oro 1).
 */
import {
  BRIDGE_SOURCE,
  isUiMessage,
  type ActiveChat,
  type BridgeMessage,
  type WithoutSource,
} from '../contracts/bridge';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WppGlobal = any;
declare global {
  interface Window {
    WPP?: WppGlobal;
  }
}

function post(msg: WithoutSource<BridgeMessage>) {
  window.postMessage({ source: BRIDGE_SOURCE, ...msg }, window.location.origin);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toActiveChat(chat: any): ActiveChat | null {
  if (!chat?.id?._serialized) return null;
  const name: string =
    chat.formattedTitle || chat.contact?.pushname || chat.name || chat.id.user || '';
  return { chatId: chat.id._serialized, name, isGroup: Boolean(chat.isGroup) };
}

function sendActiveChat(WPP: WppGlobal) {
  try {
    post({ type: 'ACTIVE_CHAT', chat: toActiveChat(WPP.chat.getActiveChat()) });
  } catch (e) {
    post({ type: 'ERROR', message: `No se pudo leer el chat activo: ${String(e)}` });
  }
}

function start(WPP: WppGlobal) {
  WPP.loader.onReady(() => {
    post({ type: 'READY' });
    sendActiveChat(WPP);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WPP.on('chat.active_chat', (chat: any) => {
      post({ type: 'ACTIVE_CHAT', chat: toActiveChat(chat) });
    });
  });

  window.addEventListener('message', (event) => {
    if (event.source !== window || !isUiMessage(event.data)) return;
    const msg = event.data;
    if (!WPP.isReady) return;
    if (msg.type === 'GET_ACTIVE_CHAT') sendActiveChat(WPP);
    if (msg.type === 'OPEN_CHAT') {
      Promise.resolve(WPP.chat.openChatBottom(msg.chatId)).catch((e: unknown) =>
        post({ type: 'ERROR', message: `No se pudo abrir el chat: ${String(e)}` }),
      );
    }
  });
}

if (window.WPP) {
  start(window.WPP);
} else {
  post({ type: 'ERROR', message: 'WA-JS no se cargó en la página.' });
}
