import { useCallback, useEffect, useState } from 'react';
import {
  UI_SOURCE,
  isBridgeMessage,
  type ActiveChat,
  type UiMessage,
  type WithoutSource,
} from '../contracts/bridge';

function send(msg: WithoutSource<UiMessage>) {
  window.postMessage({ source: UI_SOURCE, ...msg }, window.location.origin);
}

export function useBridge() {
  const [ready, setReady] = useState(false);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window || !isBridgeMessage(event.data)) return;
      const msg = event.data;
      if (msg.type === 'READY') {
        setReady(true);
        setError(null);
      }
      if (msg.type === 'ACTIVE_CHAT') {
        setReady(true);
        setActiveChat(msg.chat);
      }
      if (msg.type === 'ERROR') setError(msg.message);
    };
    window.addEventListener('message', onMessage);
    // Por si el bridge cargó antes que la UI.
    send({ type: 'GET_ACTIVE_CHAT' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const openChat = useCallback((chatId: string) => send({ type: 'OPEN_CHAT', chatId }), []);

  return { ready, activeChat, error, openChat };
}
