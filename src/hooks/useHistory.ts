import { useCallback } from 'react';
import { useDesignStore } from '@/stores/designStore';

export function useHistory() {
  const undo = useDesignStore((s) => s.undo);
  const redo = useDesignStore((s) => s.redo);
  const commandStack = useDesignStore((s) => s.commandStack);

  return {
    undo: useCallback(() => undo(), [undo]),
    redo: useCallback(() => redo(), [redo]),
    canUndo: commandStack.canUndo,
    canRedo: commandStack.canRedo,
    history: commandStack.getHistory(),
  };
}
