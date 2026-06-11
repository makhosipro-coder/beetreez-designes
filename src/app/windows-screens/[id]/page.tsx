'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wrench, Maximize, HardHat, Send, Trash2 } from 'lucide-react';

const SERVICE_OPTIONS = [
  { value: 'mesh_repair', label: 'Mesh Repair', icon: Wrench },
  { value: 'custom_glass', label: 'Custom Glass', icon: Maximize },
  { value: 'frame_align', label: 'Frame Alignment', icon: HardHat },
];

interface TicketDetail {
  id: string;
  designId: string;
  designName: string;
  serviceType: string;
  dimensionsMm: { width: number; height: number; depth: number };
  materialType: string;
  status: string;
  notes: string | null;
  updatedAt: string;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [serviceType, setServiceType] = useState('custom_glass');
  const [widthMm, setWidthMm] = useState(600);
  const [heightMm, setHeightMm] = useState(1200);
  const [depthMm, setDepthMm] = useState(50);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetch(`/api/windows-screens/tickets?designId=${id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list: TicketDetail[]) => {
        const found = list.find((t) => t.designId === id);
        if (found) {
          setTicket(found);
          setServiceType(found.serviceType);
          setWidthMm(found.dimensionsMm.width);
          setHeightMm(found.dimensionsMm.height);
          setDepthMm(found.dimensionsMm.depth);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const createOrUpdate = async () => {
    setStatusMsg('Saving...');
    try {
      if (ticket) {
        const res = await fetch(`/api/windows-screens/tickets/${ticket.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceType, widthMm, heightMm, depthMm }),
        });
        if (!res.ok) throw new Error('Update failed');
        setStatusMsg('Updated successfully');
      } else {
        const res = await fetch('/api/windows-screens/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ designId: id, serviceType, widthMm, heightMm, depthMm }),
        });
        if (!res.ok) throw new Error('Create failed');
        const data = await res.json();
        setTicket({ id: data.id, designId: id, designName: '', serviceType, dimensionsMm: { width: widthMm, height: heightMm, depth: depthMm }, materialType: 'aluminum', status: 'draft', notes: null, updatedAt: '' });
        setStatusMsg('Ticket created');
      }
    } catch {
      setStatusMsg('Error saving ticket');
    }
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const sendToFabrication = async () => {
    if (!ticket) return;
    setStatusMsg('Sending to fabrication...');
    try {
      const res = await fetch(`/api/windows-screens/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
      });
      if (!res.ok) throw new Error('Failed');
      setTicket({ ...ticket, status: 'pending' });
      setStatusMsg('Sent to fabrication');
    } catch {
      setStatusMsg('Error sending to fabrication');
    }
    setTimeout(() => setStatusMsg(''), 3000);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-text-secondary">Loading...</div>;
  }

  const ActiveIcon = SERVICE_OPTIONS.find((o) => o.value === serviceType)?.icon || Wrench;

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <Link href="/windows-screens" className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={16} />
        Back to Windows &amp; Screens
      </Link>

      <div className="rounded-lg border border-border bg-canvas-surface p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {ticket?.designName || 'New Window / Screen Project'}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">Project ID: {id}</p>
          </div>
          {ticket?.status && (
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {ticket.status.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-text-secondary">Service Type</label>
            <div className="mt-2 flex gap-2">
              {SERVICE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setServiceType(opt.value)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 text-xs font-medium transition-colors ${
                      serviceType === opt.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-text-secondary hover:border-text-tertiary'
                    }`}
                  >
                    <Icon size={16} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Material</label>
            <select
              value={ticket?.materialType || 'aluminum'}
              className="mt-2 w-full rounded-lg border border-border bg-canvas-surface p-2.5 text-sm text-text-primary"
            >
              <option value="aluminum">Aluminum</option>
              <option value="steel">Steel</option>
              <option value="vinyl">Vinyl</option>
              <option value="wood">Wood</option>
              <option value="fiberglass">Fiberglass</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Width (mm)</label>
            <input
              type="number"
              value={widthMm}
              onChange={(e) => setWidthMm(Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-border bg-canvas-surface p-2.5 text-sm text-text-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Height (mm)</label>
            <input
              type="number"
              value={heightMm}
              onChange={(e) => setHeightMm(Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-border bg-canvas-surface p-2.5 text-sm text-text-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Depth (mm)</label>
            <input
              type="number"
              value={depthMm}
              onChange={(e) => setDepthMm(Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-border bg-canvas-surface p-2.5 text-sm text-text-primary"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button onClick={createOrUpdate} className="btn-primary flex items-center gap-2 h-10 px-5 text-sm">
            <ActiveIcon size={16} />
            {ticket ? 'Update Ticket' : 'Create Ticket'}
          </button>
          {ticket && ticket.status === 'draft' && (
            <button onClick={sendToFabrication} className="btn-secondary flex items-center gap-2 h-10 px-5 text-sm">
              <Send size={16} />
              Send to Fabrication
            </button>
          )}
          {statusMsg && (
            <span className="text-sm text-text-secondary">{statusMsg}</span>
          )}
        </div>
      </div>
    </div>
  );
}
