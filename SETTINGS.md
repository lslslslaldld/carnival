# Runtime settings fallback for local builds/development. process.env always takes precedence.
# For Amplify, add values in the branch's environment variable settings; the build workspace
# will not contain a local settings.json unless you deliberately provide it as a secret artifact.

```json
{
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "pk_test_replace_me",
  "CLERK_SECRET_KEY": "sk_test_replace_me",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL": "/sign-in",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL": "/sign-up",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL": "/admin",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL": "/admin",
  "ADMIN_EMAILS": "admin@example.com",
  "DATABASE_URL": "postgresql://user:password@host/dbname?sslmode=require"
}
```

Copy `settings.example.json` to `settings.json` and replace placeholders. Do not commit `settings.json`: it may contain private credentials. Existing environment variables override the file. Next.js reads this file during config startup/build, so rebuild after changing values. In Amplify, configure secrets as branch environment variables instead; an ignored local file is not uploaded with the repository.
