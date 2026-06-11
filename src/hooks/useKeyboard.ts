import { useEffect, useRef } from 'react';

type KeyMap = Record<string, () => void>;

export function useKeyboard(keyMap: KeyMap) {
  const ref = useRef(keyMap);
  ref.current = keyMap;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const map = ref.current;
      const key = e.key.toLowerCase();
      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push('ctrl');
      if (e.shiftKey) parts.push('shift');
      if (e.altKey) parts.push('alt');
      parts.push(key);
      const combo = parts.join('+');

      if (map[combo]) {
        e.preventDefault();
        map[combo]();
        return;
      }

      if (map[key]) {
        e.preventDefault();
        map[key]();
        return;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
}
