'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Truck, Save, Trash2 } from 'lucide-react';

const STATUS_OPTIONS = ['manifested', 'in_transit', 'delayed', 'delivered'] as const;

interface ShipmentDetail {
  id: string;
  designId: string;
  designName: string;
  carrierId: string;
  carrierName: string;
  trackingNumber: string | null;
  packageWeightKg: number;
  cargoStatus: string;
  currentEta: { eta: string } | null;
  origin: string | null;
  destination: string | null;
  notes: string | null;
}

export default function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [carrierName, setCarrierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [cargoStatus, setCargoStatus] = useState('manifested');
  const [eta, setEta] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetch(`/api/transit/shipments/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setShipment(data);
          setCarrierName(data.carrierName);
          setTrackingNumber(data.trackingNumber || '');
          setCargoStatus(data.cargoStatus);
          setEta(data.currentEta?.eta?.split('T')[0] || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const updateShipment = async () => {
    setStatusMsg('Saving...');
    try {
      const res = await fetch(`/api/transit/shipments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrierName,
          trackingNumber: trackingNumber || null,
          cargoStatus,
          currentEta: eta || null,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      setStatusMsg('Updated successfully');
    } catch {
      setStatusMsg('Error updating shipment');
    }
    setTimeout(() => setStatusMsg(''), 3000);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-text-secondary">Loading...</div>;
  }

  if (!shipment) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-8">
        <Link href="/transit" className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
          <ArrowLeft size={16} /> Back to Transit
        </Link>
        <div className="rounded-lg border border-border bg-canvas-surface p-12 text-center">
          <p className="text-text-secondary">Shipment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <Link href="/transit" className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={16} /> Back to Transit
      </Link>

      <div className="rounded-lg border border-border bg-canvas-surface p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck size={24} className="text-accent" />
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{shipment.designName}</h1>
              <p className="mt-1 text-sm text-text-secondary">Shipment ID: {id}</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            cargoStatus === 'delayed' ? 'bg-red-500/10 text-red-400' :
            cargoStatus === 'delivered' ? 'bg-green-500/10 text-green-400' :
            cargoStatus === 'in_transit' ? 'bg-purple-500/10 text-purple-400' :
            'bg-blue-500/10 text-blue-400'
          }`}>
            {cargoStatus.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-text-secondary">Carrier Name</label>
            <input
              type="text"
              value={carrierName}
              onChange={(e) => setCarrierName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-canvas-surface p-2.5 text-sm text-text-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Tracking Number</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-canvas-surface p-2.5 text-sm text-text-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Cargo Status</label>
            <select
              value={cargoStatus}
              onChange={(e) => setCargoStatus(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-canvas-surface p-2.5 text-sm text-text-primary"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Estimated Delivery Date</label>
            <input
              type="date"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-canvas-surface p-2.5 text-sm text-text-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Origin</label>
            <input
              type="text"
              value={shipment.origin || ''}
              disabled
              className="mt-2 w-full rounded-lg border border-border bg-canvas-surface p-2.5 text-sm text-text-tertiary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Destination</label>
            <input
              type="text"
              value={shipment.destination || ''}
              disabled
              className="mt-2 w-full rounded-lg border border-border bg-canvas-surface p-2.5 text-sm text-text-tertiary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary">Weight (kg)</label>
            <input
              type="number"
              value={shipment.packageWeightKg}
              disabled
              className="mt-2 w-full rounded-lg border border-border bg-canvas-surface p-2.5 text-sm text-text-tertiary"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button onClick={updateShipment} className="btn-primary flex items-center gap-2 h-10 px-5 text-sm">
            <Save size={16} />
            Update Shipment
          </button>
          {statusMsg && (
            <span className="text-sm text-text-secondary">{statusMsg}</span>
          )}
        </div>
      </div>
    </div>
  );
}
