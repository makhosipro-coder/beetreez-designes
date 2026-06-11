interface SidebarProps {
  side: 'left' | 'right';
  width?: number;
  children: React.ReactNode;
}

export function Sidebar({ side, width = 280, children }: SidebarProps) {
  return (
    <aside
      className="flex-shrink-0 overflow-y-auto border-border bg-canvas-surface"
      style={{
        width: `${width}px`,
        borderRightWidth: side === 'left' ? '1px' : '0',
        borderLeftWidth: side === 'right' ? '1px' : '0',
      }}
    >
      {children}
    </aside>
  );
}
