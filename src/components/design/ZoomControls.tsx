import { Slider } from '@/components/ui/Slider';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function ZoomControls({ zoom, onZoomChange }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-1.5 shadow-lg">
        <button
          onClick={() => onZoomChange(Math.max(10, zoom - 10))}
          className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary"
          disabled={zoom <= 10}
          aria-label="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <span className="w-12 text-center text-xs font-medium text-text-primary" role="status" aria-live="polite">{zoom}%</span>
        <button
          onClick={() => onZoomChange(Math.min(1000, zoom + 10))}
          className="flex h-6 w-6 items-center justify-center rounded text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary"
          disabled={zoom >= 1000}
          aria-label="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        <div className="w-16">
          <Slider value={zoom} onChange={onZoomChange} min={10} max={400} />
        </div>
        <button
          onClick={() => onZoomChange(100)}
          className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary"
          aria-label="Reset zoom to 100%"
        >
          <Maximize2 size={12} />
          Fit
        </button>
      </div>
    </div>
  );
}
