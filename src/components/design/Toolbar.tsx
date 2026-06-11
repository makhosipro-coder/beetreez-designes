import { MousePointer2, Hand, Square, Circle, Type, Image, Move } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

interface Tool {
  id: string;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

const TOOLS: Tool[] = [
  { id: 'select', label: 'Select', shortcut: 'V', icon: <MousePointer2 size={18} /> },
  { id: 'move', label: 'Move', shortcut: 'M', icon: <Move size={18} /> },
  { id: 'hand', label: 'Hand', shortcut: 'H', icon: <Hand size={18} /> },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: <Square size={18} /> },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'O', icon: <Circle size={18} /> },
  { id: 'text', label: 'Text', shortcut: 'T', icon: <Type size={18} /> },
  { id: 'image', label: 'Image', shortcut: 'I', icon: <Image size={18} /> },
];

interface ToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
}

export function Toolbar({ activeTool, onToolChange }: ToolbarProps) {
  return (
    <div className="flex flex-col gap-1 p-3" role="toolbar" aria-label="Drawing tools">
      <span className="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-text-tertiary">
        Tools
      </span>
      {TOOLS.map((tool) => (
        <Tooltip key={tool.id} content={`${tool.label} ${tool.shortcut ? `(${tool.shortcut})` : ''}`} side="right">
          <button
            onClick={() => onToolChange(tool.id)}
            data-tool-id={tool.id}
            aria-label={`${tool.label} tool${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
            aria-current={activeTool === tool.id ? 'true' : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-all ${
              activeTool === tool.id
                ? 'bg-accent text-white shadow-lg shadow-accent/20'
                : 'text-text-tertiary hover:bg-hover hover:text-text-primary'
            }`}
          >
            {tool.icon}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
