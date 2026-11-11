import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { cookies } from 'next/headers';

const sessionCookie = 'carnival-cognito-id-token';
const poolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;

function verifier() {
  if (!poolId || !clientId) throw new Error('Cognito user pool configuration is missing.');
  return CognitoJwtVerifier.create({ userPoolId: poolId, tokenUse: 'id', clientId });
}

export const DEFAULT_ADMIN_EMAILS: string[] = [];

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && getAdminEmails().includes(email.trim().toLowerCase()));
}

export async function verifyCognitoToken(token: string) {
  return verifier().verify(token);
}

export async function getUserContext() {
  const token = cookies().get(sessionCookie)?.value;
  if (!token) return null;
  try {
    const claims = await verifyCognitoToken(token);
    return { token, claims, user: { id: claims.sub, email: typeof claims.email === 'string' ? claims.email : '', emailVerified: claims.email_verified === true || claims.email_verified === 'true' } };
  } catch {
    return null;
  }
}

export async function getAdminContext() {
  const context = await getUserContext();
  if (!context || !context.user.emailVerified || !isAdminEmail(context.user.email)) return null;
  return context;
}
