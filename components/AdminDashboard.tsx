'use client';

import { useEffect, useMemo, useState } from 'react';
import { ContentEditor } from '@/components/ContentEditor';

type UserRecord = { id: string; name: string; email: string; status: string; createdAt: string };

export function AdminDashboard() {
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [settingsResponse, usersResponse] = await Promise.all([fetch('/api/admin/settings'), fetch('/api/admin/users')]);
        const settings = await settingsResponse.json(); const userData = await usersResponse.json();
        if (!settingsResponse.ok || !usersResponse.ok) throw new Error(settings.error || userData.error || 'Could not load admin data.');
        setSignupEnabled(Boolean(settings.signupEnabled)); setUsers(userData.users || []);
      } catch (e) { setError(e instanceof Error ? e.message : 'Could not load admin data.'); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const activeCount = useMemo(() => users.filter((entry) => entry.status === 'active').length, [users]);

  async function toggleSignup() {
    setError(''); setNotice('');
    const response = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ signupEnabled: !signupEnabled }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error || 'Could not update signup settings.');
    setSignupEnabled(data.signupEnabled); setNotice(`Sign-up is now ${data.signupEnabled ? 'open' : 'closed'}.`);
  }

  async function updateUserAction(userId: string, action: string) {
    setError(''); setNotice(''); setBusy(`${userId}:${action}`);
    try {
      const response = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Action failed.');
      if (data.status && data.status !== 'reset-flow') setUsers((current) => current.map((entry) => entry.id === userId ? { ...entry, status: data.status } : entry));
      setNotice(action === 'reset-password' ? 'Clerk handles password reset through its sign-in flow. Ask the user to choose “Forgot password”.' : `Account ${data.status}.`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Action failed.'); }
    finally { setBusy(null); }
  }

  return <main className="admin-page">
    <div className="admin-heading"><div><div className="eyebrow">CONTROL CENTER <span className="live-dot"/> SECURE SESSION</div><h1>Workspace overview</h1><p>Manage access, accounts, and your published homepage.</p></div></div>
    {(error || notice) && <div role="status" className={`feedback ${error ? 'feedback-error' : ''}`}>{error || notice}</div>}
    <div className="stat-row dashboard-stats"><div className="stat-card"><span className="label">Directory</span><span className="value">{isLoading ? '—' : users.length}</span><span className="label">Clerk users</span></div><div className="stat-card"><span className="label">Active accounts</span><span className="value">{isLoading ? '—' : activeCount}</span><span className="label">Currently enabled</span></div></div>
    <div className="admin-grid">
      <div className="stack">
        <section className="panel control-panel"><div className="section-title"><div><div className="eyebrow">ACCESS POLICY</div><h2>Registration</h2></div><span className={`status-badge ${signupEnabled ? 'active' : ''}`}>{signupEnabled ? 'Open' : 'Closed'}</span></div><p>Control sign-up through this app.</p><button className="secondary-btn" onClick={toggleSignup}>{signupEnabled ? 'Close sign-up' : 'Open sign-up'}</button></section>
        <section className="table-wrap users-panel"><div className="section-title"><div><div className="eyebrow">IDENTITIES</div><h2>User directory</h2></div><span className="directory-count">{users.length} users</span></div>{isLoading ? <p>Loading users…</p> : users.length === 0 ? <p>No users found.</p> : <div className="user-list">{users.map((user) => <div className="user-row" key={user.id}><div><strong>{user.name}</strong><br/><span>{user.email}</span></div><span className={`status-badge ${user.status === 'active' ? 'active' : ''}`}>{user.status}</span><div className="user-actions">{user.status === 'active' ? <><button disabled={busy !== null} onClick={() => updateUserAction(user.id, 'deactivate')}>Deactivate</button><button disabled={busy !== null} onClick={() => updateUserAction(user.id, 'ban')}>Ban</button></> : <button disabled={busy !== null} onClick={() => updateUserAction(user.id, 'reactivate')}>Reactivate</button>}<button disabled={busy !== null} onClick={() => updateUserAction(user.id, 'reset-password')}>Reset password</button></div></div>)}</div>}</section>
      </div>
      <div className="stack"><ContentEditor/><section className="file-panel disabled-feature"><span className="eyebrow">STORAGE</span><h2>Uploads disabled</h2><p className="inline-note">Upload endpoints are intentionally disabled.</p></section></div>
    </div>
    <footer className="security-foot"><span className="security-icon">✓</span><span><strong>Protected by server-side checks</strong><br/>Every administrative request is verified against the signed-in Clerk user.</span></footer>
  </main>;
}
