'use client';

import { useState } from 'react';
import { useDesignStore } from '@/stores/designStore';
import { Globe, Lock } from 'lucide-react';

export function PublishButton() {
  const [open, setOpen] = useState(false);
  const [publishUrl, setPublishUrl] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'unlisted'>('public');
  const getStore = useDesignStore.getState;

  const handlePublish = async () => {
    setLoading(true);
    const store = getStore();
    const res = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document: store.document,
        layerState: store.layerState,
        title: title || store.document?.name || 'Untitled',
        description,
        visibility,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setPublishUrl(window.location.origin + data.url);
      setPublishedAt(data.publishedAt || '');
    }
    setLoading(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost text-xs">
        Publish
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setOpen(false); setPublishUrl(''); }}>
          <div className="w-[440px] rounded-lg bg-canvas-surface p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-semibold text-text-primary">Publish Design</h2>

            {publishUrl ? (
              <div>
                <p className="mb-2 text-sm text-text-secondary">Your design is published!</p>
                {publishedAt && (
                  <p className="mb-3 text-xs text-text-tertiary">
                    Published {new Date(publishedAt).toLocaleString()}
                  </p>
                )}
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={publishUrl}
                    className="input flex-1 text-xs"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(publishUrl)}
                    className="btn-primary text-xs"
                  >
                    Copy
                  </button>
                </div>
                <button
                  onClick={() => { setOpen(false); setPublishUrl(''); }}
                  className="mt-3 w-full btn-ghost text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                  Create a shareable link to your design.
                </p>

                <div>
                  <label className="label">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={getStore().document?.name || 'Untitled'}
                    className="input mt-1 w-full text-sm"
                  />
                </div>

                <div>
                  <label className="label">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={2}
                    className="input mt-1 w-full resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="label">Visibility</label>
                  <div className="mt-1 flex gap-3">
                    <button
                      onClick={() => setVisibility('public')}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                        visibility === 'public' ? 'bg-accent text-white' : 'bg-canvas-grid text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Globe size={14} />
                      Public
                    </button>
                    <button
                      onClick={() => setVisibility('unlisted')}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                        visibility === 'unlisted' ? 'bg-accent text-white' : 'bg-canvas-grid text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Lock size={14} />
                      Unlisted
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setOpen(false)} className="btn-ghost text-xs">
                    Cancel
                  </button>
                  <button onClick={handlePublish} disabled={loading} className="btn-primary text-xs">
                    {loading ? 'Publishing...' : 'Publish'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
