# PROJECT STATUS — VT Dream Homes
> Bất Động Sản Vũng Tàu — Mua Bán Nhà Đất
> Last updated: 2026-02-25

---

## QUICK INFO

| Field | Value |
|-------|-------|
| **URL** | [vungtauland.store](https://vungtauland.store) |
| **Stack** | React 18 + Vite + TypeScript + Supabase + Tailwind + PWA |
| **Supabase** | `rxjsdoylkflzsxlyccqh` (riêng) |
| **Vercel** | `prj_ul06D1Gsb8kWZaObZ48OidtiMFIr` / `vungtauland` |
| **Completion** | **95%** |
| **Revenue** | ❌ $0 — chưa có payment integration |

---

## CHECKLIST → 100%

### ✅ Core (DONE)
- [x] React 18 + Vite + TypeScript + Supabase + Tailwind
- [x] 27 routes, admin dashboard
- [x] Real-time chat system
- [x] AI property recommendations
- [x] PWA (24 precache entries)
- [x] SEO optimized (sitemap gen, OG tags)
- [x] GA4 env-gated integration (`VITE_GA_ID`)
- [x] Sentry env-gated integration (`SENTRY_DSN`)
- [x] Ecosystem footer (links to sister products)
- [x] DEPLOY_CHECKLIST.md created

### ✅ Deploy (2026-02-25)
- [x] Vercel project linked
- [x] `npx vercel --prod` — deployed successfully
- [x] Domain vungtauland.store active
- [x] Vercel crons: health-report (daily), seo-check (weekly)

### ⬜ Content
- [ ] **Run seed script** — `node scripts/vt-homes-seed.js` (AI-generated properties)
- [ ] Replace placeholder images with real property photos
- [ ] Add real agent/broker profiles
- [ ] Vietnamese content review

### ⬜ Monitoring
- [ ] Set GA4 ID in Vercel env (`VITE_GA_ID`)
- [ ] Set Sentry DSN in Vercel env
- [ ] Set CRON_SECRET for Vercel crons
- [ ] UptimeRobot monitoring setup

### ⬜ Revenue (Future)
- [ ] Payment integration (not planned for Week 1)
- [ ] Agent listing fees
- [ ] Premium property placement

### ⚠️ Known Issues
- [ ] TS errors in `api/health.ts`, `api/robots.txt.ts`, `api/sitemap.xml.ts` (@vercel/node missing)
- [ ] prebuild script `generate-sitemap.js` — verify works in Vercel env

---

## BLOCKERS

| Blocker | Owner | Impact | ETA |
|---------|:-----:|--------|:---:|
| No real property content | CEO | Empty site | 5 min (seed script) |
| No GA4 tracking | CTO | Can't measure | 5 min |
| API route TS errors | CTO | Serverless functions broken | 30 min |

---

## RECENT CHANGES

| Date | Change |
|------|--------|
| 2026-02-25 | Deployed to vungtauland.store via Vercel |
| 2026-02-25 | GA4 + Sentry env-gated wiring added |
| 2026-02-25 | Content seeding script created |
| 2026-02-25 | Health check + monitoring scripts created |
| 2026-02-25 | Ecosystem footer added |
