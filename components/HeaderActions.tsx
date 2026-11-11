'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchAuthSession, getCurrentUser, signOut } from 'aws-amplify/auth';
import { configureAmplify } from '@/lib/amplify-client';

export function HeaderActions() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    configureAmplify();
    void getCurrentUser().then(() => setSignedIn(true)).catch(() => setSignedIn(false));
  }, []);
  async function logOut() {
    try { await signOut(); } finally { await fetch('/api/auth/session', { method: 'DELETE' }); setSignedIn(false); window.location.assign('/'); }
  }
  return signedIn ? <><Link href="/admin" className="primary-btn">Open admin</Link><button className="secondary-btn" onClick={logOut}>Sign out</button></> : <><Link href="/sign-in" className="primary-btn">Sign in</Link><Link href="/sign-up" className="secondary-btn">Create account</Link></>;
}
