import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const sentryDsn =
    process.env.SENTRY_DSN ||
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    process.env.VITE_SENTRY_DSN;
  const gaId =
    process.env.VITE_GA_ID ||
    process.env.NEXT_PUBLIC_GA_ID ||
    process.env.VITE_GA_MEASUREMENT_ID;

  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'vungtauland',
    version: process.env.VITE_APP_VERSION || '1.0.0',
    environment: process.env.VERCEL_ENV || 'unknown',
    checks: {
      api: 'ok',
      supabase: process.env.VITE_SUPABASE_URL ? 'configured' : 'missing',
      sentry: sentryDsn ? 'configured' : 'not configured',
      analytics: gaId ? 'configured' : 'not configured',
    },
  };

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.status(200).json(healthCheck);
}
