'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Root-layout failures need the global boundary; log them to Chrome DevTools.
    console.error('[Carnival] Root application rendering failed', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      error,
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main style={{ maxWidth: 720, margin: '4rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
          <h1>Application error</h1>
          <p>Open Chrome DevTools → Console for details. Reference: {error.digest ?? 'unavailable'}.</p>
          <button onClick={() => reset()}>Try again</button>
        </main>
      </body>
    </html>
  );
}
