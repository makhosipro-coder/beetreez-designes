import { useRef, useEffect, useCallback } from 'react';
import { CanvasEngine } from '@/design-engine/canvas';
import { useDesignStore } from '@/stores/designStore';
import { useCollabStore } from '@/stores/collabStore';
import type { SnapGuide } from '@/utils/design/alignment';

export function useCanvas(getGuides?: () => SnapGuide[]) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const rafRef = useRef<number>(0);
  const dirtyRef = useRef(true);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new CanvasEngine(canvasRef.current);
    engineRef.current = engine;

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    const unsub = useDesignStore.subscribe(() => {
      dirtyRef.current = true;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          if (!dirtyRef.current) return;
          dirtyRef.current = false;
          const state = useDesignStore.getState();
          const cursors = Object.values(useCollabStore.getState().cursors);
          engine.render(state.layerState, getGuides?.(), cursors.length > 0 ? cursors : undefined);
        });
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      unsub();
      engine.destroy();
      engineRef.current = null;
    };
  }, [getGuides]);

  const getEngine = useCallback((): CanvasEngine | null => engineRef.current, []);

  return { canvasRef, getEngine };
}
