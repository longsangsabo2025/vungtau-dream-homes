# GitHub Copilot Instructions for VungTauLand

## Project Context
VungTauLand is a real estate platform for Vung Tau properties.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Radix UI, shadcn/ui
- **Backend**: Supabase PostgreSQL
- **Maps**: Google Maps API / Mapbox
- **Payment**: VNPAY (if needed)

## Code Style Guidelines
- Use TypeScript strict mode
- Implement proper type definitions
- Follow React best practices
- Use shadcn/ui components
- Add proper SEO meta tags

## File Organization
- Components: `/src/components/{feature}/{ComponentName}.tsx`
- Pages: `/src/pages/{PageName}.tsx`
- Hooks: `/src/hooks/use{HookName}.ts`
- Types: `/src/types/{featureName}.ts`
- Utils: `/src/lib/{utilName}.ts`

## Real Estate Features
- Property listings with filters
- Map view integration
- Image galleries
- Contact forms
- Price calculator
- Comparison tool

## SEO Best Practices
- Add meta tags for each property
- Implement structured data (JSON-LD)
- Use semantic HTML
- Optimize images
- Add alt texts
- Implement sitemap

## Property Data Model
```typescript
interface Property {
  id: string
  title: string
  description: string
  price: number
  location: {
    address: string
    lat: number
    lng: number
    ward: string
    district: string
  }
  features: {
    bedrooms: number
    bathrooms: number
    area: number
    floor: number
  }
  images: string[]
  status: 'available' | 'sold' | 'rented'
  type: 'apartment' | 'house' | 'land' | 'villa'
}
```

## Admin Features
- Property CRUD operations
- User management
- Analytics dashboard
- Inquiry management
