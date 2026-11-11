import { NextResponse } from 'next/server';
import { verifyCognitoToken } from '@/lib/admin';

const cookieName = 'carnival-cognito-id-token';

export async function POST(request: Request) {
  let body: { idToken?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (typeof body.idToken !== 'string' || body.idToken.length > 20_000) return NextResponse.json({ error: 'An ID token is required.' }, { status: 400 });
  try {
    const claims = await verifyCognitoToken(body.idToken);
    const response = NextResponse.json({ ok: true, email: claims.email ?? null });
    response.cookies.set(cookieName, body.idToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 });
    return response;
  } catch {
    return NextResponse.json({ error: 'Cognito session could not be verified.' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
