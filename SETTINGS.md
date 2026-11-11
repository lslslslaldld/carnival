# Configuration and Amplify

## AWS Amplify

For Amplify deployments, configure credentials and settings in the Amplify Console under **App settings → Environment variables** for the deployed branch. The app reads these values from `process.env`; do not commit or upload a `settings.json` file to supply production secrets.

Configure the variables needed by the app:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key (public key)
- `CLERK_SECRET_KEY` — Clerk secret key; mark/store as a secret
- `DATABASE_URL` — Neon connection string; mark/store as a secret
- `ADMIN_EMAILS` — allowed admin email addresses
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` — `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` — `/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` — `/admin`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` — `/admin`

After adding or changing variables, redeploy the branch so the build and SSR runtime use the updated configuration. The build log previously showed Amplify failing to set up SSM secrets; if using Amplify's secret/SSM integration, resolve that setup failure and verify the variables are available to the build/runtime. Do not paste secret values into build logs or browser console.

The app ignores local `settings.json` on Amplify (`AWS_APP_ID` is set there). Locally, you may copy `settings.example.json` to `settings.json`; environment variables still take precedence. Never commit the real file.
