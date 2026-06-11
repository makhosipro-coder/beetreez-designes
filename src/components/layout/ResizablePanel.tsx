import { useState, useRef, useCallback } from 'react';

interface ResizablePanelProps {
  side: 'left' | 'right';
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  children: React.ReactNode;
}

export function ResizablePanel({
  side,
  defaultWidth = 280,
  minWidth = 200,
  maxWidth = 480,
  children,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = side === 'left' ? e.clientX : window.innerWidth - e.clientX;
      setWidth(Math.min(maxWidth, Math.max(minWidth, newWidth)));
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [side, minWidth, maxWidth]);

  return (
    <div className="relative flex-shrink-0" style={{ width }}>
      {children}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute top-0 w-1 cursor-col-resize hover:bg-brand-primary transition-colors ${
          side === 'left' ? 'right-0' : 'left-0'
        } bottom-0 z-10`}
      />
    </div>
  );
}
