'use client';

import { useState, useEffect } from 'react';
import { X, MousePointer2, Square, Type, Image, Download, Share2 } from 'lucide-react';

const STEPS = [
  { icon: <MousePointer2 size={20} />, title: 'Select & Move', description: 'Use the Select tool (V) to pick and drag layers on the canvas.' },
  { icon: <Square size={20} />, title: 'Draw Shapes', description: 'Add rectangles (R), ellipses (O), and lines (L) from the toolbar.' },
  { icon: <Type size={20} />, title: 'Add Text', description: 'Click the Text tool (T) then click the canvas to start typing.' },
  { icon: <Image size={20} />, title: 'Upload Images', description: 'Select the Image tool (I) and click the canvas to upload from your device.' },
  { icon: <Download size={20} />, title: 'Export & Publish', description: 'Use the Export button to download as SVG, or Publish for a shareable link.' },
];

const ONBOARDING_KEY = 'beetreez_onboarding_done';

export function UserOnboarding() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (navigator.webdriver) return;
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-[400px] rounded-xl border border-border bg-canvas-surface p-6 shadow-2xl">
        <button onClick={dismiss} className="absolute right-3 top-3 text-text-tertiary hover:text-text-primary">
          <X size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent">
            {STEPS[step].icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{STEPS[step].title}</h3>
            <p className="mt-1 text-xs text-text-secondary">{STEPS[step].description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i === step ? 'bg-accent' : 'bg-canvas-grid'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {step < STEPS.length - 1 ? (
              <>
                <button onClick={dismiss} className="btn-ghost text-xs">Skip</button>
                <button onClick={() => setStep(step + 1)} className="btn-primary text-xs">Next</button>
              </>
            ) : (
              <button onClick={dismiss} className="btn-primary text-xs">Get Started</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
