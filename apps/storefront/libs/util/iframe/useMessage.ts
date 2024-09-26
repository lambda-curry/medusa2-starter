/**
 * Adapted from https://github.com/rottitime/react-hook-window-message-event
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { isBrowser } from '@utils/browser';

export type PostMessage = { type: string; payload: Record<string, unknown> };
export type Payload = PostMessage['payload'];
export type EventHandler = (callback: (data: PostMessage) => unknown, payload: Payload) => unknown;
export type Source = MessageEvent['source'];

export const postMessage = (data: PostMessage, target: Source, origin = '*') =>
  target?.postMessage(data, { targetOrigin: origin });

export const useMessage = (messageType: string, eventHandler?: EventHandler) => {
  const [history, setHistory] = useState<PostMessage[]>([]);
  const [origin, setOrigin] = useState<string>();
  const [source, setSource] = useState<Source | null>(null);

  const originRef = useRef<string>();
  const sourceRef = useRef<Source>(null);

  if (!isBrowser()) return;

  originRef.current = origin;
  sourceRef.current = source as Source;

  const sendToSender = (data: PostMessage) => postMessage(data, sourceRef.current, originRef.current);

  const sendToParent = (data: PostMessage) => {
    if (!window.opener) throw new Error('Parent window has closed');
    postMessage(data, opener);
  };

  const onMessageReceived = useCallback(
    ({ origin: updatedOrigin, source: updatedSource, data }: MessageEvent) => {
      const { type, payload } = data;

      if (type === messageType) {
        setSource(updatedSource);
        setOrigin(updatedOrigin);
        setHistory(old => [...old, payload]);

        if (typeof eventHandler === 'function') eventHandler(sendToSender, payload);
      }
    },
    [messageType, eventHandler, setSource, setOrigin]
  );

  useEffect(() => {
    window.addEventListener('message', onMessageReceived);

    return () => window.removeEventListener('message', onMessageReceived);
  }, [messageType, source, origin, onMessageReceived]);

  return { history, sendToParent };
};
