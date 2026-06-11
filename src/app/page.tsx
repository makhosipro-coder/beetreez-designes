'use client';

import Link from 'next/link';
import { HardHat, Truck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-text-primary">
          beetreez designes
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Create stunning designs with powerful editing tools
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/design/new" className="btn-primary h-11 px-8 text-base">
            Create a design
          </Link>
          <Link href="/templates" className="btn-secondary h-11 px-8 text-base">
            Browse templates
          </Link>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-sm font-medium text-text-secondary">Modules</p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Link
              href="/windows-screens"
              className="flex items-center gap-2 rounded-lg border border-border bg-canvas-surface px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:border-accent hover:bg-accent/5"
            >
              <HardHat size={18} className="text-accent" />
              Windows &amp; Screens
            </Link>
            <Link
              href="/transit"
              className="flex items-center gap-2 rounded-lg border border-border bg-canvas-surface px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:border-accent hover:bg-accent/5"
            >
              <Truck size={18} className="text-accent" />
              Transit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
