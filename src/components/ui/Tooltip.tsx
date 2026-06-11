import { useState, useRef, useId } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const id = useId();

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const handleShow = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(true);
  };

  const handleHide = () => {
    timeoutRef.current = window.setTimeout(() => setShow(false), 100);
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
      onFocus={handleShow}
      onBlur={handleHide}
    >
      <div aria-describedby={show ? id : undefined}>
        {children}
      </div>
      {show && (
        <div
          id={id}
          role="tooltip"
          className={`absolute z-50 ${positions[side]} whitespace-nowrap rounded-md bg-canvas-hover px-2.5 py-1.5 text-xs text-text-primary shadow-lg animate-fade-in pointer-events-none`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
