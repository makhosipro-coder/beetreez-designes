import { Select } from '@/components/ui/Select';

const FONTS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
];

const FONT_SIZES = [
  { value: '12', label: '12' },
  { value: '14', label: '14' },
  { value: '16', label: '16' },
  { value: '18', label: '18' },
  { value: '20', label: '20' },
  { value: '24', label: '24' },
  { value: '32', label: '32' },
  { value: '48', label: '48' },
  { value: '64', label: '64' },
  { value: '72', label: '72' },
];

const FONT_WEIGHTS = [
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
];

interface FontPickerProps {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  onFamilyChange: (family: string) => void;
  onSizeChange: (size: number) => void;
  onWeightChange: (weight: number) => void;
}

export function FontPicker({
  fontFamily = 'Inter',
  fontSize = 16,
  fontWeight = 400,
  onFamilyChange,
  onSizeChange,
  onWeightChange,
}: FontPickerProps) {
  return (
    <div className="space-y-3">
      <Select
        label="Font"
        value={fontFamily}
        onChange={(e) => onFamilyChange(e.target.value)}
        options={FONTS}
      />
      <div className="flex gap-2">
        <Select
          label="Size"
          value={String(fontSize)}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          options={FONT_SIZES}
        />
        <Select
          label="Weight"
          value={String(fontWeight)}
          onChange={(e) => onWeightChange(Number(e.target.value))}
          options={FONT_WEIGHTS}
        />
      </div>
    </div>
  );
}
