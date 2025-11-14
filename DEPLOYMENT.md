# Deployment Guide

## Vercel Deployment

### Prerequisites
1. Create a Vercel account at https://vercel.com
2. Install Vercel CLI: `npm i -g vercel`

### Environment Variables
Add these environment variables in your Vercel project settings:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Deploy via GitHub Integration

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure environment variables
4. Deploy

## GitHub Actions CI/CD

### Setup Secrets

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

1. `VITE_SUPABASE_URL` - Your Supabase project URL
2. `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
3. `VERCEL_TOKEN` - Your Vercel token (from https://vercel.com/account/tokens)
4. `VERCEL_ORG_ID` - Your Vercel organization ID
5. `VERCEL_PROJECT_ID` - Your Vercel project ID

### Get Vercel IDs

```bash
# Link your project
vercel link

# Get org and project IDs from .vercel/project.json
cat .vercel/project.json
```

## Database Setup

Run the SQL script in your Supabase SQL Editor to create indexes:

```bash
# File: database-indexes.sql
```

## Post-Deployment

1. Test all functionality on production URL
2. Verify environment variables are loaded
3. Check database connection
4. Test authentication flow
5. Monitor error logs in Vercel dashboard

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for SSL certificate provisioning

## Performance Monitoring

- Enable Vercel Analytics in project settings
- Monitor Core Web Vitals
- Set up error tracking with Sentry (optional)

## Rollback

If needed, you can rollback to a previous deployment:
1. Go to Vercel dashboard
2. Select the deployment
3. Click "Promote to Production"
