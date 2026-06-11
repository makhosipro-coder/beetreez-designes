'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Plus, ExternalLink, HardHat, Wrench, Maximize } from 'lucide-react';

const SERVICE_ICONS: Record<string, typeof HardHat> = {
  mesh_repair: Wrench,
  custom_glass: Maximize,
  frame_align: HardHat,
};

const SERVICE_LABELS: Record<string, string> = {
  mesh_repair: 'Mesh Repair',
  custom_glass: 'Custom Glass',
  frame_align: 'Frame Alignment',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-500/10 text-yellow-400',
  pending: 'bg-blue-500/10 text-blue-400',
  approved: 'bg-green-500/10 text-green-400',
  in_production: 'bg-purple-500/10 text-purple-400',
  completed: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

interface Ticket {
  id: string;
  designId: string;
  designName: string;
  serviceType: string;
  dimensionsMm: { width: number; height: number; depth: number };
  materialType: string;
  status: string;
  createdAt: string;
}

export default function WindowsScreensPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/windows-screens/tickets')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { setTickets(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Windows &amp; Screens</h1>
          <p className="mt-2 text-text-secondary">
            Fabrication tickets for custom window frames, mesh screens, and glass panels
          </p>
        </div>
        <Link
          href="/design/new?projectType=window_screen"
          className="btn-primary flex items-center gap-2 h-11 px-6 text-sm"
        >
          <Plus size={16} />
          New Project
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        {loading ? (
          <p className="text-center text-text-secondary py-12">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="rounded-lg border border-border bg-canvas-surface p-12 text-center">
            <HardHat size={40} className="mx-auto text-text-tertiary" />
            <p className="mt-4 text-text-secondary">No fabrication tickets yet</p>
            <p className="mt-1 text-sm text-text-tertiary">
              Create a new window or screen project to get started
            </p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const Icon = SERVICE_ICONS[ticket.serviceType] || HardHat;
            return (
              <Link
                key={ticket.id}
                href={`/windows-screens/${ticket.designId}`}
                className="group flex items-center justify-between rounded-lg border border-border bg-canvas-surface p-5 transition-colors hover:border-brand-primary"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Icon size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-text-primary">
                      {ticket.designName}
                    </h3>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {SERVICE_LABELS[ticket.serviceType] || ticket.serviceType}
                      {' '}&middot;{' '}
                      {ticket.dimensionsMm.width}x{ticket.dimensionsMm.height}x{ticket.dimensionsMm.depth} mm
                      {' '}&middot;{' '}
                      {ticket.materialType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_COLORS[ticket.status] || ''}`}>
                    {ticket.status.replace(/_/g, ' ')}
                  </span>
                  <ExternalLink size={14} className="text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
