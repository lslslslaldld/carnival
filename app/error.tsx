'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // This runs in the browser so the failure is visible in Chrome DevTools.
    console.error('[Carnival] Page rendering failed', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      error,
    });
  }, [error]);

  return (
    <main className="page-shell">
      <div className="container empty-state">
        <h1>Something went wrong</h1>
        <p>Open Chrome DevTools → Console for the error details. Reference: {error.digest ?? 'unavailable'}.</p>
        <button className="primary-btn" onClick={() => reset()}>Try again</button>
      </div>
    </main>
  );
}
