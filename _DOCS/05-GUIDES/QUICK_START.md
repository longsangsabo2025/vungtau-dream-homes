# 🚀 Vung Tau Dream Homes - Quick Start Guide

> **Project:** vungtau-dream-homes v0.0.0  
> **Prerequisites:** Node.js 18+, npm/pnpm  
> **Time:** ~5 minutes

---

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm, pnpm, or bun
- ✅ Git
- ✅ Supabase account (for backend)
- ✅ (Optional) Python for database scripts

---

## ⚡ Quick Setup

### 1. Navigate to Project
```powershell
cd "D:\0.PROJECTS\01-MAIN-PRODUCTS\vungtau-dream-homes"
```

### 2. Install Dependencies
```powershell
# Using npm
npm install

# Or using bun (faster)
bun install
```

### 3. Environment Setup
```powershell
# Copy environment template
Copy-Item .env.example .env.local

# Edit with your Supabase credentials
code .env.local
```

### 4. Configure Environment Variables
```env
# .env.local

# Supabase (Required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Sentry (Optional - for monitoring)
VITE_SENTRY_DSN=your_sentry_dsn
```

### 5. Database Setup (Optional)
```powershell
# Using Python script
npm run db:setup

# Or manually run migrations in Supabase dashboard
```

### 6. Start Development Server
```powershell
npm run dev
```

### 7. Open in Browser
```
http://localhost:5173
```

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build for development |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage |
| `npm run db:setup` | Setup database |

---

## 🔧 Tech Stack Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│               VUNG TAU DREAM HOMES STACK                        │
├─────────────────────────────────────────────────────────────────┤
│  Framework:     React 18.3.1                                    │
│  Language:      TypeScript 5.9.3                                │
│  Build:         Vite 7.2.4                                      │
│  Styling:       TailwindCSS 3.4.18                              │
│  UI:            Radix UI (29 components)                        │
│  State:         TanStack Query 5.90.10                          │
│  Forms:         React Hook Form 7.66.1 + Zod 3.25.76            │
│  Backend:       Supabase 2.84.0                                 │
│  Monitoring:    Sentry 10.26.0                                  │
│  Charts:        Recharts 2.15.4                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
vungtau-dream-homes/
├── src/
│   ├── components/        # UI Components
│   │   ├── ui/            # shadcn/ui components
│   │   └── property/      # Property-specific components
│   ├── pages/             # Route pages
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── api/                   # API routes
├── supabase/              # Supabase config & migrations
├── public/                # Static assets
├── _DOCS/                 # Documentation
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies
```

---

## 🏠 Key Features

### Property Listings
- Browse properties by type (đất nền, nhà phố, biệt thự)
- Advanced filters (price, area, location)
- Map view with Google Maps
- Property detail pages

### Search & Discovery
- Full-text search
- Saved searches
- Price alerts
- Compare properties

### User Features
- Authentication (Supabase Auth)
- Favorites list
- Contact agent
- Inquiry history

### Admin Dashboard
- Property management
- User management
- Analytics
- Settings

---

## 🗄️ Database Setup

### Using Python Script
```powershell
# Make sure Python is installed
python --version

# Run database setup
npm run db:setup

# Or directly
python setup-database-full.py
```

### Manual Setup
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Run migrations from `supabase/` folder

---

## 🚀 Deployment

### Vercel (Recommended)
```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables
Set these in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SENTRY_DSN` (optional)

---

## 🧪 Running Tests

```powershell
# Run all tests
npm run test

# With UI
npm run test:ui

# With coverage report
npm run test:coverage
```

---

## ❓ Troubleshooting

### Port already in use
```powershell
npx kill-port 5173
```

### Dependencies issues
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Supabase connection issues
1. Check `.env.local` credentials
2. Verify Supabase project is active
3. Check RLS policies

### Build errors
```powershell
# Clear Vite cache
Remove-Item -Recurse -Force node_modules/.vite
npm run build
```

---

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [TanStack Query](https://tanstack.com/query)

---

## 📂 Related Documentation

- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Admin panel setup
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [INVESTOR_PITCH.md](./INVESTOR_PITCH.md) - Investment overview

---

*Quick Start Guide - Generated 06/2025*
