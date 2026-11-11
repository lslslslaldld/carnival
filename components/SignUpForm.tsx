'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signUp, confirmSignUp, autoSignIn, fetchAuthSession } from 'aws-amplify/auth';
import { configureAmplify } from '@/lib/amplify-client';

export function SignUpForm() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [code, setCode] = useState('');
  const [confirming, setConfirming] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); configureAmplify(); setError(''); setMessage('');
    try {
      if (!confirming) { const result = await signUp({ username: email, password, options: { userAttributes: { email }, autoSignIn: true } }); if (result.isSignUpComplete) { window.location.assign('/admin'); return; } setConfirming(true); setMessage('Enter the verification code sent to your email.'); }
      else { await confirmSignUp({ username: email, confirmationCode: code }); try { await autoSignIn(); const session = await fetchAuthSession(); const idToken = session.tokens?.idToken?.toString(); if (idToken) { await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }); window.location.assign('/admin'); return; } } catch { /* User can sign in after confirming. */ } setMessage('Your account is verified. You can now sign in.'); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Sign up failed.'); }
  }
  return <form className="auth-form" onSubmit={submit}><h1>Create account</h1><label>Email<input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>{!confirming && <label>Password<input className="input" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></label>}{confirming && <label>Verification code<input className="input" required value={code} onChange={(e) => setCode(e.target.value)} /></label>}<button className="primary-btn" type="submit">{confirming ? 'Verify email' : 'Create account'}</button>{(message || error) && <p role="status" className={error ? 'feedback feedback-error' : 'feedback'}>{error || message}</p>}<p>Already registered? <Link href="/sign-in">Sign in</Link></p></form>;
}
