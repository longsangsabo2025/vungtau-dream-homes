# VungTau Dream Homes - Deploy Checklist

## 1) Configure Production Environment Variables

- Set required app variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_APP_URL=https://vungtauland.store`
- Configure GA4 (optional; no-op when missing):
  - `VITE_GA_ID=G-XXXXXXXXXX`
  - Optional compatibility: `NEXT_PUBLIC_GA_ID`
- Configure Sentry (optional; no-op when missing):
  - `SENTRY_DSN=https://...`
  - Optional compatibility: `NEXT_PUBLIC_SENTRY_DSN`
- Keep server-side secrets out of client bundle:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL`

## 2) Install and Build

- Install dependencies: `npm install`
- Production build: `npm run build`
- Verify build artifacts are generated in `dist/`

## 3) Deploy

- Deploy with Vercel: `npx vercel --prod`
- Confirm `VERCEL_ENV=production` in deployment logs

## 4) Post-Deploy Verification

- Health endpoint: `/api/health`
  - `checks.supabase` should be `configured`
  - `checks.analytics` should be `configured` only when GA env is set
  - `checks.sentry` should be `configured` only when Sentry env is set
- Open main routes and verify no runtime errors:
  - `/`
  - `/mua-ban`
  - `/cho-thue`
  - `/tin-tuc`
- Trigger one client-side navigation and verify:
  - GA page view event is sent (if GA configured)
  - Sentry receives a test exception (if Sentry configured)

## 5) Rollback Readiness

- Keep previous successful Vercel deployment available for instant rollback.
- If critical regression occurs:
  - Roll back to previous deployment in Vercel.
  - Re-check env variables and rebuild locally before redeploy.
