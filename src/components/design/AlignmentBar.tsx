'use client';

import { useDesignStore } from '@/stores/designStore';

const modes = [
  { id: 'left', label: 'Align left', icon: '⊢' },
  { id: 'centerH', label: 'Center horizontally', icon: '↔' },
  { id: 'right', label: 'Align right', icon: '⊣' },
  { id: 'top', label: 'Align top', icon: '⊤' },
  { id: 'centerV', label: 'Center vertically', icon: '↕' },
  { id: 'bottom', label: 'Align bottom', icon: '⊥' },
  { id: '---', label: '', icon: '' },
  { id: 'horizontal', label: 'Distribute horizontally', icon: '⇔' },
  { id: 'vertical', label: 'Distribute vertically', icon: '⇕' },
] as const;

export function AlignmentBar() {
  const selectedCount = useDesignStore((s) => s.layerState.selectedIds.size);
  const alignSelected = useDesignStore((s) => s.alignSelectedLayers);
  const distributeSelected = useDesignStore((s) => s.distributeSelectedLayers);

  if (selectedCount < 2) return null;

  return (
    <div className="flex items-center gap-1 border-b border-border bg-canvas-surface px-2 py-1.5">
      {modes.map((m) =>
        m.id === '---' ? (
          <div key="sep" className="mx-1 h-5 w-px bg-border" />
        ) : (
          <button
            key={m.id}
            title={m.label}
            onClick={() => {
              if (m.id === 'horizontal' || m.id === 'vertical') {
                distributeSelected(m.id);
              } else {
                alignSelected(m.id as any);
              }
            }}
            disabled={m.id === 'horizontal' || m.id === 'vertical' ? selectedCount < 3 : false}
            className="flex h-7 w-7 items-center justify-center rounded text-xs text-text-secondary hover:bg-canvas-hover hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {m.icon}
          </button>
        )
      )}
    </div>
  );
}
