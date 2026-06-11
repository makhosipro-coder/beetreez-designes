import { useEffect, useRef } from 'react';

interface ContextMenuAction {
  label: string;
  shortcut?: string;
  action: () => void;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  actions: ContextMenuAction[];
  onClose: () => void;
}

export function ContextMenu({ x, y, actions, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') {
        onClose();
        return;
      }
      if (e instanceof MouseEvent && ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  const menuX = Math.min(x, window.innerWidth - 200);
  const menuY = Math.min(y, window.innerHeight - actions.length * 36);

  return (
    <div
      ref={ref}
      role="menu"
      aria-orientation="vertical"
      className="fixed z-50 w-48 rounded-lg border border-border bg-canvas-surface py-1 shadow-xl animate-fade-in"
      style={{ left: menuX, top: menuY }}
    >
      {actions.map((item, i) => (
        item.label === '---' ? (
          <div key={i} role="separator" className="my-1 border-t border-border" />
        ) : (
          <button
            key={i}
            role="menuitem"
            aria-disabled={item.disabled || undefined}
            onClick={() => { if (!item.disabled) { item.action(); onClose(); } }}
            disabled={item.disabled}
            className="flex w-full items-center justify-between px-3 py-2 text-sm text-text-primary hover:bg-canvas-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-[10px] text-text-tertiary">{item.shortcut}</span>
            )}
          </button>
        )
      ))}
    </div>
  );
}
