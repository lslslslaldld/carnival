'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn, resetPassword, confirmResetPassword, fetchAuthSession } from 'aws-amplify/auth';
import { configureAmplify } from '@/lib/amplify-client';

async function establishSession() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error('Cognito did not return an ID token.');
  const response = await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }) });
  if (!response.ok) throw new Error('Unable to establish a secure session.');
}

export function SignInForm() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [code, setCode] = useState(''); const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'sign-in'|'forgot'|'confirm-reset'>('sign-in'); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); configureAmplify(); setError(''); setMessage('');
    try {
      if (step === 'sign-in') { const result = await signIn({ username: email, password }); if (result.isSignedIn) { await establishSession(); window.location.assign('/admin'); } else setMessage('Complete the additional sign-in challenge in your Cognito user pool.'); }
      else if (step === 'forgot') { await resetPassword({ username: email }); setStep('confirm-reset'); setMessage('Check your email for the password reset code.'); }
      else { await confirmResetPassword({ username: email, confirmationCode: code, newPassword }); setStep('sign-in'); setMessage('Password updated. Sign in with your new password.'); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Sign in failed.'); }
  }
  return <form className="auth-form" onSubmit={submit}><h1>{step === 'sign-in' ? 'Sign in' : 'Reset password'}</h1><label>Email<input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>{step === 'sign-in' && <label>Password<input className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>}{step === 'confirm-reset' && <><label>Reset code<input className="input" required value={code} onChange={(e) => setCode(e.target.value)} /></label><label>New password<input className="input" type="password" autoComplete="new-password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label></>}<button className="primary-btn" type="submit">{step === 'sign-in' ? 'Sign in' : step === 'forgot' ? 'Send reset code' : 'Update password'}</button>{step === 'sign-in' && <button type="button" className="text-button" onClick={() => { setStep('forgot'); setError(''); }}>Forgot password?</button>}{step !== 'sign-in' && <button type="button" className="text-button" onClick={() => setStep('sign-in')}>Back to sign in</button>}{(message || error) && <p role="status" className={error ? 'feedback feedback-error' : 'feedback'}>{error || message}</p>}<p>New here? <Link href="/sign-up">Create an account</Link></p></form>;
}
