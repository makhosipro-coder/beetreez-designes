'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [name, setName] = useState('User');
  const [email, setEmail] = useState('user@example.com');

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
      <p className="mt-2 text-text-secondary">Manage your account settings</p>

      <div className="mt-8 space-y-6">
        <div className="panel p-6">
          <h2 className="text-lg font-medium text-text-primary">Profile</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn-primary">Save changes</button>
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="text-lg font-medium text-text-primary">Subscription</h2>
          <p className="mt-2 text-sm text-text-secondary">Free plan</p>
          <button className="btn-secondary mt-4">Upgrade</button>
        </div>
      </div>
    </div>
  );
}
