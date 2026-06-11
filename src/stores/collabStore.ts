import { create } from 'zustand';
import type { CursorPosition } from '@/lib/collab-types';

interface CollabStore {
  cursors: Record<string, CursorPosition>;
  setCursors: (cursors: CursorPosition[]) => void;
  connected: boolean;
  setConnected: (v: boolean) => void;
}

export const useCollabStore = create<CollabStore>((set) => ({
  cursors: {},
  connected: false,
  setCursors: (cursors) => {
    const map: Record<string, CursorPosition> = {};
    for (const c of cursors) {
      map[c.userId] = c;
    }
    set({ cursors: map });
  },
  setConnected: (v) => set({ connected: v }),
}));
