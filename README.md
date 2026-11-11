# Carnival

Next.js admin/content app using Amazon Cognito for authentication and authorization. Neon Postgres remains the persistence layer for editable homepage content and registration settings. File uploads are intentionally disabled.

## Requirements

- Node.js 20+ and npm
- An Amazon Cognito User Pool with an app client (no client secret for browser authentication)
- AWS credentials for server-side Cognito user administration (IAM role in deployment; local AWS profile for development)
- Neon Postgres database

## Cognito setup

1. Create a Cognito User Pool. Enable email as a sign-in option and require email verification. Configure a password policy and email delivery.
2. Create a public app client without a client secret. Enable `ALLOW_USER_PASSWORD_AUTH` and `ALLOW_REFRESH_TOKEN_AUTH`; configure email verification and password reset.
3. Set `AWS_REGION`, `COGNITO_USER_POOL_ID`, `NEXT_PUBLIC_COGNITO_USER_POOL_ID`, and `NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID` in the runtime environment.
4. Set `ADMIN_EMAILS` to a comma-separated list of administrator email addresses. Only verified Cognito identities on this allowlist can access admin endpoints.
5. The app creates an HttpOnly, SameSite=Lax session cookie after Cognito authentication. Production deployments must use HTTPS.

The signup toggle in the admin panel gates this app's signup page. To prevent signups through other clients or APIs, also restrict self-service registration in Cognito or enforce the policy with a Cognito pre-sign-up Lambda trigger.

## AWS permissions for user administration

The server runtime must receive AWS credentials through an IAM role (recommended) or a local AWS profile. Grant only the required actions against this user pool: `cognito-idp:ListUsers`, `cognito-idp:AdminGetUser`, `cognito-idp:AdminDisableUser`, `cognito-idp:AdminEnableUser`, and `cognito-idp:AdminResetUserPassword`. Never place AWS access keys in `NEXT_PUBLIC_` variables or browser code.

## Persistent data

Set `DATABASE_URL` to the Neon Postgres connection string as a server-side secret. Settings and homepage HTML continue to be stored there; this migration changes authentication only.

## Local development

```bash
cp .env.example .env.local
# Set Cognito and database values; configure AWS credentials with your normal AWS profile/role
npm install
npm run dev
```

Run `npm run build` to validate a production build. Never commit `.env.local`.

## Deploy

Deploy the existing Next.js app to a Node.js-compatible hosting service (including Amplify Hosting with SSR support). Configure the same Cognito callback/origin domain as appropriate for the app client, set the environment variables above, and attach an IAM role with the least-privilege Cognito actions. Verify `/sign-in`, email-confirmed `/sign-up`, forgot-password, `/admin`, user administration, homepage edits, and sign-out in a non-production pool first.

## Security notes

- Every protected API request verifies the Cognito ID token signature, issuer, expiration, token use, and app-client audience on the server.
- Admin access is based on verified email and the server-only `ADMIN_EMAILS` allowlist; do not rely on browser-provided roles.
- The ID token is stored in an HttpOnly cookie; client-side Amplify auth remains responsible for sign-in and token refresh. If a Cognito token expires, sign in again to refresh the server session.
- Homepage HTML continues to be sanitized before saving and rendering.
- File upload endpoints remain disabled.
