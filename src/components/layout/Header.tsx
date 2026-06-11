'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { PublishButton } from '@/components/design/PublishButton';
import { PanelLeft, PanelRight, Sun, Moon, ChevronDown, Download } from 'lucide-react';

interface HeaderProps {
  onExport?: () => void;
  onSave?: () => void;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
}

type MenuItem =
  | { label: string; shortcut?: string; onClick: () => void }
  | { separator: true };

function DropdownMenu({ label, items }: { label: string; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-hover hover:text-text-primary">
        {label}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-xl">
          {items.map((item, i) => {
            if ('separator' in item) {
              return <div key={i} className="my-1 border-t border-border" />;
            }
            return (
              <button key={item.label} onClick={() => { setOpen(false); item.onClick(); }} className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs text-text-secondary transition-colors hover:bg-hover hover:text-text-primary">
                <span>{item.label}</span>
                {item.shortcut && <span className="text-[10px] text-text-tertiary">{item.shortcut}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Header({ onExport, onSave, onToggleLeftPanel, onToggleRightPanel }: HeaderProps) {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const toggleGrid = useUIStore((s) => s.toggleGrid);
  const toggleSnap = useUIStore((s) => s.toggleSnap);
  const toggleGuides = useUIStore((s) => s.toggleGuides);
  const showGrid = useUIStore((s) => s.showGrid);
  const snapToGrid = useUIStore((s) => s.snapToGrid);
  const showGuides = useUIStore((s) => s.showGuides);
  const user = useAuthStore((s) => s.user);

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex items-center gap-3">
        {onToggleLeftPanel && (
          <button onClick={onToggleLeftPanel} className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary lg:hidden" aria-label="Toggle tools panel">
            <PanelLeft size={16} />
          </button>
        )}
        <Link href="/" className="text-base font-bold tracking-tight text-accent">
          beetreez designes
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <DropdownMenu label="File" items={[
            { label: 'New Design', shortcut: 'Ctrl+N', onClick: () => { window.location.href = '/design/new'; } },
            { label: 'Save', shortcut: 'Ctrl+S', onClick: () => onSave?.() },
            { separator: true },
            { label: 'Export...', shortcut: 'Ctrl+E', onClick: () => onExport?.() },
          ]} />
          <DropdownMenu label="Edit" items={[
            { label: 'Undo', shortcut: 'Ctrl+Z', onClick: () => {} },
            { label: 'Redo', shortcut: 'Shift+Ctrl+Z', onClick: () => {} },
            { separator: true },
            { label: 'Select All', shortcut: 'Ctrl+A', onClick: () => {} },
          ]} />
          <DropdownMenu label="View" items={[
            { label: `${showGrid ? 'Hide' : 'Show'} Grid`, shortcut: 'Ctrl+\'', onClick: () => toggleGrid() },
            { label: `${snapToGrid ? 'Disable' : 'Enable'} Snap`, shortcut: 'Ctrl+Shift+\'', onClick: () => toggleSnap() },
            { label: `${showGuides ? 'Hide' : 'Show'} Guides`, shortcut: 'Ctrl+;', onClick: () => toggleGuides() },
          ]} />
          <Link href="/templates" className="rounded-md px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-hover hover:text-text-primary">
            Templates
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onSave}>
          Save
        </Button>
        <PublishButton />
        <Button variant="primary" size="sm" onClick={onExport} className="gap-1.5">
          <Download size={14} />
          Export
        </Button>
        <button onClick={toggleTheme} className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        {onToggleRightPanel && (
          <button onClick={onToggleRightPanel} className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary lg:hidden" aria-label="Toggle layers panel">
            <PanelRight size={16} />
          </button>
        )}
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-medium text-white" title={user.email}>
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <button onClick={() => signOut()} className="rounded-md px-2 py-1 text-xs text-text-tertiary transition-colors hover:text-text-primary">
              Sign out
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn-secondary text-xs h-7 px-3">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
