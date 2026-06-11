import type { CursorPosition } from '@/lib/collab-types';

const cursorsByDesign = new Map<string, Map<string, CursorPosition>>();
const listenersByDesign = new Map<string, Set<(cursors: CursorPosition[]) => void>>();

export function updateCursor(designId: string, cursor: CursorPosition): void {
  let cursors = cursorsByDesign.get(designId);
  if (!cursors) {
    cursors = new Map();
    cursorsByDesign.set(designId, cursors);
  }
  cursors.set(cursor.userId, cursor);
  const listeners = listenersByDesign.get(designId);
  if (listeners) {
    const all = Array.from(cursors.values());
    for (const cb of listeners) {
      cb(all);
    }
  }
}

export function removeCursor(designId: string, userId: string): void {
  const cursors = cursorsByDesign.get(designId);
  if (cursors) {
    cursors.delete(userId);
    if (cursors.size === 0) {
      cursorsByDesign.delete(designId);
    }
  }
}

export function getCursors(designId: string): CursorPosition[] {
  const cursors = cursorsByDesign.get(designId);
  return cursors ? Array.from(cursors.values()) : [];
}

export function addListener(
  designId: string,
  cb: (cursors: CursorPosition[]) => void,
): () => void {
  let listeners = listenersByDesign.get(designId);
  if (!listeners) {
    listeners = new Set();
    listenersByDesign.set(designId, listeners);
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) {
      listenersByDesign.delete(designId);
    }
  };
}
