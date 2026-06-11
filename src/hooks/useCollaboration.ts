import { useEffect, useRef, useCallback } from 'react';
import { useCollabStore } from '@/stores/collabStore';

export function useCollaboration(designId: string | null) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const setCursors = useCollabStore((s) => s.setCursors);
  const setConnected = useCollabStore((s) => s.setConnected);
  const connected = useCollabStore((s) => s.connected);
  const sendPosRef = useRef<(x: number, y: number) => void>(() => {});

  useEffect(() => {
    if (!designId) return;
    const es = new EventSource(`/api/collab/${designId}`);
    eventSourceRef.current = es;
    setConnected(false);

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'cursors') {
          setCursors(data.cursors);
        }
      } catch {}
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
      setConnected(false);
    };
  }, [designId, setCursors, setConnected]);

  const sendCursor = useCallback(
    (x: number, y: number) => {
      if (!designId) return;
      fetch(`/api/collab/${designId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y }),
      }).catch(() => {});
    },
    [designId],
  );

  sendPosRef.current = sendCursor;

  return { connected, sendCursor };
}
