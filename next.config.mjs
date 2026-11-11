import fs from 'node:fs';
import path from 'node:path';

// Optional local/deployment fallback. Environment variables take precedence.
// Never put real credentials in a tracked file; settings.json is gitignored.
const settingsPath = path.join(process.cwd(), 'settings.json');
if (fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (settings && typeof settings === 'object' && !Array.isArray(settings)) {
      for (const [key, value] of Object.entries(settings)) {
        if (typeof value === 'string' && !process.env[key]) process.env[key] = value;
      }
    }
  } catch (error) {
    console.error('[config] Could not parse settings.json:', error instanceof Error ? error.message : 'invalid JSON');
  }
}

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://*.clerk.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com;" },
];

const nextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  experimental: { serverActions: { bodySizeLimit: '10mb' } },
};

export default nextConfig;
