# 🚀 OPTIMIZATION GUIDE - Vungtau Dream Homes

Hướng dẫn tối ưu hóa performance, security và UX cho website bất động sản.

---

## 📊 DATABASE OPTIMIZATION

### 1. Indexes (✅ Đã có script)

Chạy file `database-indexes.sql` trong Supabase SQL Editor:

```bash
# File: database-indexes.sql
# Bao gồm:
- Individual indexes (type, status, price, area, location)
- Time-based indexes (created_at, updated_at)
- Composite indexes (type+status, approval+type)
- Owner-based indexes (owner_id)
- Full-text search (title + location + description)
```

**Cách chạy:**
1. Mở Supabase Dashboard → SQL Editor
2. Copy nội dung `database-indexes.sql`
3. Run query
4. Verify: `SELECT indexname FROM pg_indexes WHERE tablename = 'properties';`

### 2. Query Optimization

**❌ Tránh:**
```typescript
// Load ALL properties (slow)
const { data } = await supabase.from('properties').select('*')
```

**✅ Nên:**
```typescript
// Pagination + selective fields
const { data } = await supabase
  .from('properties')
  .select('id, title, price, location, image_url, status')
  .eq('approval_status', 'approved')
  .range(0, 11) // Limit 12 items
  .order('created_at', { ascending: false })
```

### 3. Database Policies Review

Kiểm tra RLS policies trong Supabase:

```sql
-- List all policies
SELECT * FROM pg_policies WHERE tablename = 'properties';

-- Đảm bảo:
-- 1. SELECT: Public có thể xem tin đã approved
-- 2. INSERT: Chỉ authenticated users
-- 3. UPDATE: Chỉ owner hoặc admin
-- 4. DELETE: Chỉ admin
```

---

## 🖼️ IMAGE OPTIMIZATION

### Current State
- ❌ Sử dụng external URLs (Unsplash)
- ❌ Không có image compression
- ❌ Không có responsive images
- ✅ Có lazy loading

### Recommended Migration

#### Step 1: Setup Supabase Storage

```typescript
// src/lib/supabase-storage.ts
import { supabase } from './supabase'

export async function uploadPropertyImage(file: File, propertyId: string) {
  // 1. Compress image trước khi upload
  const compressed = await compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8
  })
  
  // 2. Upload to Supabase Storage
  const fileName = `${propertyId}-${Date.now()}.webp`
  const { data, error } = await supabase.storage
    .from('property-images')
    .upload(fileName, compressed)
  
  if (error) throw error
  
  // 3. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('property-images')
    .getPublicUrl(fileName)
  
  return publicUrl
}

async function compressImage(file: File, options: any) {
  // Sử dụng browser-image-compression
  // npm install browser-image-compression
  const imageCompression = await import('browser-image-compression')
  return await imageCompression.default(file, options)
}
```

#### Step 2: Create Storage Bucket

1. Supabase Dashboard → Storage → New Bucket
2. Name: `property-images`
3. Public: ✅ Yes
4. Allowed MIME types: `image/jpeg, image/png, image/webp`
5. Max file size: 5 MB

#### Step 3: Storage Policies

```sql
-- Allow public read
CREATE POLICY "Public can view property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

-- Allow owners to delete their images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Step 4: Update ImageUpload Component

```typescript
// src/components/ImageUpload.tsx
import { uploadPropertyImage } from '@/lib/supabase-storage'

const handleUpload = async (file: File) => {
  try {
    setUploading(true)
    const url = await uploadPropertyImage(file, propertyId)
    onImageUploaded(url)
  } catch (error) {
    toast.error('Upload failed')
  } finally {
    setUploading(false)
  }
}
```

#### Step 5: Responsive Images

```tsx
// src/components/PropertyCard.tsx
<picture>
  <source 
    srcSet={`${imageUrl}?width=400&quality=80`}
    media="(max-width: 640px)"
    type="image/webp"
  />
  <source 
    srcSet={`${imageUrl}?width=800&quality=80`}
    media="(max-width: 1024px)"
    type="image/webp"
  />
  <img
    src={`${imageUrl}?width=1200&quality=80`}
    alt={title}
    loading="lazy"
    className="..."
  />
</picture>
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### 1. Code Splitting

```typescript
// src/App.tsx - Lazy load heavy pages
import { lazy, Suspense } from 'react'

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'))

// Wrap with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

### 2. React Optimization

```typescript
// src/components/PropertyCard.tsx
import { memo } from 'react'

export const PropertyCard = memo(({ property }) => {
  // Component code
})

// src/hooks/useSupabase.ts
import { useCallback } from 'react'

const fetchProperties = useCallback(async () => {
  // Fetch logic
}, [page, filters]) // Only re-create when deps change
```

### 3. Bundle Size Analysis

```bash
# Add to package.json
"scripts": {
  "analyze": "vite-bundle-visualizer"
}

# Install
npm install --save-dev vite-bundle-visualizer

# Run
npm run build
npm run analyze
```

### 4. Lighthouse Targets

| Metric | Current | Target |
|--------|---------|--------|
| Performance | ? | > 90 |
| Accessibility | ? | > 95 |
| Best Practices | ? | > 95 |
| SEO | ? | > 95 |

---

## 🔒 SECURITY ENHANCEMENTS

### 1. Environment Variables Protection

✅ **Đã có:**
- `.env.local` in `.gitignore`
- `VITE_` prefix cho client-safe vars

⚠️ **Cần làm:**
- Remove `SUPABASE_SERVICE_ROLE_KEY` khỏi client code
- Chỉ dùng trong Edge Functions/API routes

### 2. Input Validation với Zod

```typescript
// src/lib/validations.ts
import { z } from 'zod'

export const propertySchema = z.object({
  title: z.string()
    .min(10, 'Tiêu đề phải có ít nhất 10 ký tự')
    .max(200, 'Tiêu đề không quá 200 ký tự'),
  
  price: z.number()
    .positive('Giá phải lớn hơn 0')
    .max(1000000000000, 'Giá không hợp lệ'),
  
  area: z.number()
    .positive('Diện tích phải lớn hơn 0')
    .max(100000, 'Diện tích không hợp lệ'),
  
  location: z.string()
    .min(5, 'Địa điểm phải có ít nhất 5 ký tự'),
  
  description: z.string()
    .min(50, 'Mô tả phải có ít nhất 50 ký tự')
    .max(5000, 'Mô tả không quá 5000 ký tự'),
  
  type: z.enum(['house', 'apartment', 'land', 'commercial']),
  status: z.enum(['for-sale', 'for-rent', 'sold', 'rented']),
})

export type PropertyInput = z.infer<typeof propertySchema>
```

### 3. XSS Protection

```typescript
// src/lib/sanitize.ts
import DOMPurify from 'dompurify'

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  })
}

// Usage in PropertyDetail
<div dangerouslySetInnerHTML={{ 
  __html: sanitizeHTML(description) 
}} />
```

### 4. Rate Limiting (Supabase Edge Function)

```typescript
// supabase/functions/rate-limit/index.ts
const RATE_LIMIT = 10 // requests per minute

Deno.serve(async (req) => {
  const ip = req.headers.get('x-forwarded-for')
  
  // Check rate limit in Redis/Supabase
  const count = await getRateLimit(ip)
  
  if (count > RATE_LIMIT) {
    return new Response('Too many requests', { status: 429 })
  }
  
  await incrementRateLimit(ip)
  // Continue with request
})
```

---

## 🧪 TESTING IMPROVEMENTS

### 1. Fix Test Mocks

```typescript
// src/test/setup.ts
import { vi } from 'vitest'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({
              data: mockProperties,
              error: null,
              count: 10
            }))
          }))
        }))
      }))
    }))
  }
}))
```

### 2. Add Coverage Reporting

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  }
})
```

### 3. E2E Testing with Playwright

```bash
npm install --save-dev @playwright/test

# playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:8080',
  },
})
```

---

## 📱 UX IMPROVEMENTS

### 1. Loading States

```typescript
// src/components/PropertyList.tsx
{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <PropertyCardSkeleton key={i} />
    ))}
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {properties.map(p => <PropertyCard key={p.id} {...p} />)}
  </div>
)}
```

### 2. Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo)
    // Send to Sentry
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>Đã xảy ra lỗi</h2>
          <button onClick={() => window.location.reload()}>
            Tải lại trang
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 3. Accessibility (A11y)

```tsx
// Add ARIA labels
<button
  aria-label="Thêm vào yêu thích"
  onClick={handleFavorite}
>
  <Heart className="w-5 h-5" />
</button>

// Keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Click me
</div>

// Form labels
<label htmlFor="property-title">
  Tiêu đề <span className="text-red-500">*</span>
</label>
<input
  id="property-title"
  type="text"
  required
  aria-required="true"
  aria-describedby="title-help"
/>
<p id="title-help" className="text-sm text-gray-500">
  Nhập tiêu đề mô tả bất động sản
</p>
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-deployment

- [ ] Run `npm audit` (0 vulnerabilities)
- [ ] Run `npm run build` (successful)
- [ ] Run `npm test` (all tests pass)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Check Lighthouse scores
- [ ] Review error logs in Sentry

### Environment Setup

```bash
# Vercel Environment Variables
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...

# Analytics (optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Post-deployment

- [ ] Verify production build works
- [ ] Test all features in production
- [ ] Check analytics tracking
- [ ] Monitor error logs (Sentry)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure custom domain
- [ ] Enable HTTPS (auto with Vercel)
- [ ] Set up CDN (auto with Vercel)

---

## 📊 MONITORING & ANALYTICS

### 1. Google Analytics (✅ Đã tích hợp)

```typescript
// Already implemented in src/lib/analytics.ts
useAnalytics('vungtau')
```

### 2. Sentry Error Tracking (✅ Đã tích hợp)

```typescript
// Already implemented in vite.config.ts
import { sentryVitePlugin } from '@sentry/vite-plugin'
```

### 3. Performance Monitoring

```typescript
// src/lib/performance.ts
export function measurePageLoad() {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
      
      // Send to analytics
      gtag('event', 'page_load_time', {
        value: pageLoadTime,
        event_category: 'Performance'
      })
    })
  }
}
```

### 4. Database Monitoring

Check in Supabase Dashboard:
- Query performance
- Connection pooling
- Storage usage
- API request logs

---

## 📝 NEXT STEPS PRIORITY

### Immediate (This Week)
1. ✅ Run database indexes script
2. ✅ Update all packages (done)
3. ✅ Fix build warnings (done)
4. 🔄 Deploy to Vercel production

### Short-term (2-3 weeks)
1. Implement image upload to Supabase Storage
2. Add comprehensive error handling
3. Improve test coverage to >70%
4. Add loading states everywhere
5. Implement pagination UI

### Medium-term (1-2 months)
1. Add advanced filters (price range, area range)
2. Implement favorites system
3. Add user reviews/ratings
4. Create mobile app (React Native)
5. Add map view with locations

### Long-term (3+ months)
1. Multi-language support (Vietnamese/English)
2. Admin analytics dashboard
3. Email notifications
4. SMS integration
5. Payment gateway integration

---

## 🎯 SUCCESS METRICS

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Security Vulnerabilities | 0 | 0 | ✅ |
| Build Time | ~2.5s | <3s | ✅ |
| Bundle Size | 817 kB | <1 MB | ✅ |
| Lighthouse Performance | ? | >90 | 🔄 |
| Test Coverage | ~20% | >70% | 🔄 |
| Page Load Time | ? | <2s | 🔄 |
| Mobile Score | ? | >90 | 🔄 |

---

**Last Updated:** November 22, 2025  
**Maintained by:** Development Team
