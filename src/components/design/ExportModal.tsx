'use client';

import { useState } from 'react';
import { Download, X, FileImage, FileType2, FileCode } from 'lucide-react';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: 'png' | 'jpeg' | 'svg') => void;
}

export function ExportModal({ open, onClose, onExport }: ExportModalProps) {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'svg'>('png');

  if (!open) return null;

  const formats = [
    { id: 'png' as const, label: 'PNG', desc: 'Lossless, transparent background', icon: FileImage },
    { id: 'jpeg' as const, label: 'JPEG', desc: 'Smaller file, solid background', icon: FileType2 },
    { id: 'svg' as const, label: 'SVG', desc: 'Vector, scalable, editable', icon: FileCode },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[360px] rounded-xl border border-border bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Export Design</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary">
            <X size={15} />
          </button>
        </div>

        <div className="mb-5 space-y-2">
          {formats.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  format === f.id
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-text-tertiary'
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  format === f.id ? 'bg-accent text-white' : 'bg-grid text-text-tertiary'
                }`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{f.label}</p>
                  <p className="text-[11px] text-text-tertiary">{f.desc}</p>
                </div>
                {format === f.id && <div className="h-2 w-2 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onExport(format)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <Download size={15} />
          Export as {format.toUpperCase()}
        </button>
      </div>
    </div>
  );
}
