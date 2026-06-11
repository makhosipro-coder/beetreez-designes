'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Team, TeamMember } from '@/lib/collab-types';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [inviteError, setInviteError] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchTeam = async () => {
    setLoading(true);
    const res = await fetch(`/api/teams/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setTeam(data);
      setNewName(data.name);
    } else {
      setError('Team not found');
    }
    setLoading(false);
  };

  useEffect(() => { fetchTeam(); }, [params.id]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteError('');
    const res = await fetch(`/api/teams/${params.id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    });
    if (res.ok) {
      setInviteEmail('');
      fetchTeam();
    } else {
      const data = await res.json();
      setInviteError(data.error || 'Failed to invite');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    const res = await fetch(`/api/teams/${params.id}/members/${userId}`, {
      method: 'DELETE',
    });
    if (res.ok) fetchTeam();
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    const res = await fetch(`/api/teams/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setEditingName(false);
      fetchTeam();
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this team? This cannot be undone.')) return;
    const res = await fetch(`/api/teams/${params.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/teams');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-background">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-background">
        <div className="text-center">
          <p className="mb-4 text-text-secondary">{error || 'Team not found'}</p>
          <Link href="/teams" className="btn-ghost text-xs">Back to Teams</Link>
        </div>
      </div>
    );
  }

  const isAdmin = team.members.some((m) => m.role === 'admin' && m.userId === 'demo@example.com');

  return (
    <div className="min-h-screen bg-canvas-background p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/teams" className="mb-4 inline-block text-xs text-text-secondary hover:text-text-primary">
            &larr; Back to Teams
          </Link>

          <div className="flex items-center justify-between">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input text-xl font-bold"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateName(); }}
                />
                <button onClick={handleUpdateName} className="btn-primary text-xs">Save</button>
                <button onClick={() => setEditingName(false)} className="btn-ghost text-xs">Cancel</button>
              </div>
            ) : (
              <h1
                className="text-2xl font-bold text-text-primary"
              >
                {team.name}
              </h1>
            )}
          </div>
          <p className="mt-1 text-sm text-text-secondary">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="mb-8 rounded-lg border border-border bg-canvas-surface p-4">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Invite Member</h2>
          <div className="flex gap-2">
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              className="input flex-1"
              onKeyDown={(e) => { if (e.key === 'Enter') handleInvite(); }}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
              className="input w-28"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button onClick={handleInvite} className="btn-primary text-xs">Invite</button>
          </div>
          {inviteError && <p className="mt-2 text-xs text-red-500">{inviteError}</p>}
        </div>

        <div className="rounded-lg border border-border bg-canvas-surface">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-text-primary">Members</h2>
          </div>
          <div className="divide-y divide-border">
            {team.members.map((member) => (
              <div key={member.userId} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{member.name}</p>
                  <p className="text-xs text-text-secondary">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${
                    member.role === 'admin' ? 'text-brand-primary' :
                    member.role === 'editor' ? 'text-green-500' : 'text-text-secondary'
                  }`}>
                    {member.role}
                  </span>
                  {team.ownerId === member.userId ? (
                    <span className="text-xs text-text-secondary">Owner</span>
                  ) : isAdmin ? (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="text-xs text-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="mt-8">
            <button
              onClick={handleDelete}
              className="text-xs text-red-500 hover:text-red-400"
            >
              Delete Team
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
