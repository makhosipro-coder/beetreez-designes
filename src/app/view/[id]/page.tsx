'use client';

import { useEffect, useRef, useState } from 'react';
import { CanvasEngine } from '@/design-engine/canvas';

export default function ViewPage({ params }: { params: { id: string } }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetch(`/api/publish/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data) => {
        setTitle(data.title || '');
        setDescription(data.description || '');
        setLoading(false);
        if (canvasRef.current && data.layerState) {
          const canvas = canvasRef.current;
          canvas.width = data.document.width;
          canvas.height = data.document.height;
          const engine = new CanvasEngine(canvas, data.document.width, data.document.height);
          engine.render(data.layerState);
        }
      })
      .catch(() => {
        setError('Design not found');
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a14] text-text-secondary">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a14]">
        <h1 className="text-2xl font-bold text-text-primary">404</h1>
        <p className="text-text-secondary">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#0a0a14]">
      {title && (
        <div className="py-4 text-center">
          <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
          {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
        </div>
      )}
      <div className="flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          className="max-h-[90vh] max-w-full rounded-lg shadow-2xl"
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  );
}
