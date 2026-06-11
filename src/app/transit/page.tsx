'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Plus, ExternalLink, Truck, Package, MapPin, Clock } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  manifested: 'bg-blue-500/10 text-blue-400',
  in_transit: 'bg-purple-500/10 text-purple-400',
  delayed: 'bg-red-500/10 text-red-400',
  delivered: 'bg-green-500/10 text-green-400',
};

interface Shipment {
  id: string;
  designId: string;
  designName: string;
  carrierName: string;
  trackingNumber: string | null;
  packageWeightKg: number;
  cargoStatus: string;
  currentEta: { eta: string } | null;
  origin: string | null;
  destination: string | null;
  createdAt: string;
}

export default function TransitPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transit/shipments')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { setShipments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Active', count: shipments.filter((s) => s.cargoStatus === 'in_transit').length, color: 'text-purple-400' },
    { label: 'Delayed', count: shipments.filter((s) => s.cargoStatus === 'delayed').length, color: 'text-red-400' },
    { label: 'Delivered', count: shipments.filter((s) => s.cargoStatus === 'delivered').length, color: 'text-green-400' },
    { label: 'Manifested', count: shipments.filter((s) => s.cargoStatus === 'manifested').length, color: 'text-blue-400' },
  ];

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Transit</h1>
          <p className="mt-2 text-text-secondary">
            Freight logistics, carrier tracking, and delivery management
          </p>
        </div>
        <Link
          href="/design/new?projectType=transit"
          className="btn-primary flex items-center gap-2 h-11 px-6 text-sm"
        >
          <Plus size={16} />
          New Shipment
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-canvas-surface p-4">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="mt-1 text-xs text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4">
        {loading ? (
          <p className="text-center text-text-secondary py-12">Loading shipments...</p>
        ) : shipments.length === 0 ? (
          <div className="rounded-lg border border-border bg-canvas-surface p-12 text-center">
            <Truck size={40} className="mx-auto text-text-tertiary" />
            <p className="mt-4 text-text-secondary">No shipments yet</p>
            <p className="mt-1 text-sm text-text-tertiary">
              Create a new transit shipment to track freight and deliveries
            </p>
          </div>
        ) : (
          shipments.map((shipment) => {
            const eta = shipment.currentEta?.eta;
            return (
              <Link
                key={shipment.id}
                href={`/transit/shipments/${shipment.id}`}
                className="group flex items-center justify-between rounded-lg border border-border bg-canvas-surface p-5 transition-colors hover:border-brand-primary"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Package size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-text-primary">
                      {shipment.designName}
                    </h3>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      <Truck size={12} className="mr-1 inline" />
                      {shipment.carrierName}
                      {shipment.trackingNumber && (
                        <> &middot; #{shipment.trackingNumber}</>
                      )}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-text-tertiary">
                      {shipment.origin && (
                        <span><MapPin size={10} className="mr-0.5 inline" />{shipment.origin}</span>
                      )}
                      {shipment.destination && (
                        <span>&rarr; {shipment.destination}</span>
                      )}
                      {eta && (
                        <span><Clock size={10} className="mr-0.5 inline" />ETA: {new Date(eta).toLocaleDateString()}</span>
                      )}
                      <span>{shipment.packageWeightKg} kg</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_COLORS[shipment.cargoStatus] || ''}`}>
                    {shipment.cargoStatus.replace(/_/g, ' ')}
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
