import { NextResponse } from 'next/server';

/** Legacy Cognito session endpoint retained only to return a clear response to stale clients. */
export async function POST() {
  return NextResponse.json({ error: 'Cognito authentication is no longer enabled. Use Clerk sign-in.' }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({ ok: true });
}
