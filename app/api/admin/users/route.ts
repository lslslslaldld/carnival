import { NextResponse } from 'next/server';
import { getAdminContext, isAdminEmail } from '@/lib/admin';
import { CognitoIdentityProviderClient, AdminGetUserCommand, ListUsersCommand, AdminDisableUserCommand, AdminEnableUserCommand, AdminResetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';

export const runtime = 'nodejs';
const poolId = process.env.COGNITO_USER_POOL_ID!;
const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || poolId.split('_')[0] });

export async function GET() {
  if (!(await getAdminContext())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const result = await client.send(new ListUsersCommand({ UserPoolId: poolId, Limit: 60 }));
    const users = (result.Users ?? []).map((user) => {
      const attrs = Object.fromEntries((user.Attributes ?? []).map((attribute) => [attribute.Name, attribute.Value]));
      return { id: user.Username ?? '', name: [attrs.given_name, attrs.family_name].filter(Boolean).join(' ') || attrs.name || attrs.email || 'Unknown user', email: attrs.email || 'No email', status: user.Enabled === false ? 'deactivated' : 'active', createdAt: user.UserCreateDate?.toISOString() ?? '' };
    });
    return NextResponse.json({ users });
  } catch { return NextResponse.json({ error: 'Unable to load users from Cognito.' }, { status: 502 }); }
}

export async function POST(request: Request) {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  let body: { userId?: unknown; action?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  if (typeof body.userId !== 'string' || typeof body.action !== 'string') return NextResponse.json({ error: 'A userId and action are required.' }, { status: 400 });
  if (body.userId === admin.user.id) return NextResponse.json({ error: 'You cannot change your own account from this panel.' }, { status: 400 });
  if (!['deactivate', 'ban', 'reactivate', 'reset-password'].includes(body.action)) return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  try {
    const target = await client.send(new AdminGetUserCommand({ UserPoolId: poolId, Username: body.userId }));
    const attrs = Object.fromEntries((target.UserAttributes ?? []).map((attribute) => [attribute.Name, attribute.Value]));
    if (attrs.email_verified === 'true' && isAdminEmail(attrs.email)) return NextResponse.json({ error: 'The configured site administrator cannot be modified.' }, { status: 400 });
    if (body.action === 'deactivate' || body.action === 'ban') {
      await client.send(new AdminDisableUserCommand({ UserPoolId: poolId, Username: body.userId }));
      return NextResponse.json({ ok: true, status: body.action === 'ban' ? 'banned' : 'deactivated' });
    }
    if (body.action === 'reactivate') {
      await client.send(new AdminEnableUserCommand({ UserPoolId: poolId, Username: body.userId }));
      return NextResponse.json({ ok: true, status: 'active' });
    }
    await client.send(new AdminResetUserPasswordCommand({ UserPoolId: poolId, Username: body.userId }));
    return NextResponse.json({ ok: true, status: 'reset-flow', message: 'Cognito sent a password reset code to the user.' });
  } catch { return NextResponse.json({ error: 'Cognito could not complete this account action. Check the server AWS role permissions.' }, { status: 502 }); }
}
