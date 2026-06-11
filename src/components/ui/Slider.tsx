interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export function Slider({ value, onChange, min = 0, max = 100, step = 1, label }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between">
          <span className="label mb-0">{label}</span>
          <span className="text-xs text-text-secondary">{value}</span>
        </div>
      )}
      <div className="relative h-2">
        <div className="absolute inset-0 rounded-full bg-canvas-grid" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-brand-primary transition-[width]"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}
