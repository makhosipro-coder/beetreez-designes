'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Team } from '@/lib/collab-types';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    const res = await fetch('/api/teams');
    if (res.ok) {
      const data = await res.json();
      setTeams(data.items || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTeams(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setError('');
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      setName('');
      setShowCreate(false);
      fetchTeams();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create team');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-background">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-background p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Teams</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary text-sm"
          >
            New Team
          </button>
        </div>

        {showCreate && (
          <div className="mb-6 rounded-lg border border-border bg-canvas-surface p-4">
            <h2 className="mb-3 text-sm font-semibold text-text-primary">Create Team</h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Team name"
              className="input mb-3 w-full"
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            {error && <p className="mb-3 text-xs text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowCreate(false); setName(''); setError(''); }} className="btn-ghost text-xs">
                Cancel
              </button>
              <button onClick={handleCreate} className="btn-primary text-xs">
                Create
              </button>
            </div>
          </div>
        )}

        {teams.length === 0 ? (
          <div className="rounded-lg border border-border bg-canvas-surface p-8 text-center">
            <p className="text-text-secondary">You haven&apos;t joined any teams yet.</p>
            <p className="mt-2 text-sm text-text-secondary">Create a team to collaborate on designs.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-canvas-surface p-4 transition-colors hover:border-brand-primary"
              >
                <div>
                  <h3 className="font-medium text-text-primary">{team.name}</h3>
                  <p className="text-xs text-text-secondary">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</p>
                </div>
                <span className="text-xs text-text-secondary">
                  Created {new Date(team.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
