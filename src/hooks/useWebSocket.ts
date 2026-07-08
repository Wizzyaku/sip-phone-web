import { useEffect, useRef, useState } from 'react';

export type WebSocketEvent = {
  type: 'incoming_call' | 'new_message' | 'system_alert';
  payload: Record<string, unknown>;
};

type Listener = (event: WebSocketEvent) => void;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef<Listener[]>([]);
  const mockRef = useRef<number | null>(null);

  const addListener = (listener: Listener) => {
    listenersRef.current.push(listener);
    return () => {
      listenersRef.current = listenersRef.current.filter((l) => l !== listener);
    };
  };

  const emit = (event: WebSocketEvent) => {
    listenersRef.current.forEach((l) => {
      try {
        l(event);
      } catch (err) {
        console.error('WebSocket listener error:', err);
      }
    });
  };

  useEffect(() => {
    const url = import.meta.env.VITE_WS_URL;
    if (url) {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;
        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);
        ws.onerror = () => setConnected(false);
        ws.onmessage = (message) => {
          try {
            const event = JSON.parse(message.data) as WebSocketEvent;
            emit(event);
          } catch {
            console.warn('Invalid WebSocket message:', message.data);
          }
        };
      } catch (err) {
        console.error('WebSocket connection failed:', err);
      }
    } else {
      // Mock mode for demo: emit periodic events
      const mockMessages = [
        { from: '+15551234567', body: 'Hey, are you available for a quick call?', type: 'text' },
        { from: '+15559876543', body: 'image.png', type: 'image' },
        { from: '+15551111111', body: 'Voice message', type: 'audio' },
      ];
      const interval = window.setInterval(() => {
        const rand = Math.random();
        if (rand < 0.3) {
          const msg = mockMessages[Math.floor(Math.random() * mockMessages.length)];
          emit({ type: 'new_message', payload: msg });
        } else if (rand < 0.4) {
          emit({ type: 'incoming_call', payload: { from: '+15552345678' } });
        }
      }, 30000);
      mockRef.current = interval;
    }

    return () => {
      wsRef.current?.close();
      if (mockRef.current) {
        window.clearInterval(mockRef.current);
      }
    };
  }, []);

  return { connected, addListener };
}
