import { useState } from 'react';

const PRESET_COLORS = [
  '#6c63ff', '#ff6584', '#45eba5', '#ffa502', '#ff4757',
  '#3742fa', '#1e90ff', '#2ed573', '#ff6348', '#a29bfe',
  '#fd79a8', '#e17055', '#00cec9', '#636e72', '#dfe6e9',
  '#000000', '#ffffff', '#f0f0f5', '#a0a0b8', '#2a2a4a',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [hex, setHex] = useState(value);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={hex}
            onChange={(e) => {
              setHex(e.target.value);
              onChange(e.target.value);
            }}
            className="h-8 w-8 cursor-pointer rounded-md border border-border bg-transparent p-0"
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-md border border-border"
            style={{ backgroundColor: hex }}
          />
        </div>
        <input
          className="input flex-1 font-mono text-xs"
          value={hex}
          onChange={(e) => {
            setHex(e.target.value);
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
              onChange(e.target.value);
            }
          }}
        />
      </div>
      <div className="grid grid-cols-10 gap-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => {
              setHex(color);
              onChange(color);
            }}
            className={`h-6 w-6 rounded-md border transition-transform hover:scale-110 ${
              color === hex ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-border'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
