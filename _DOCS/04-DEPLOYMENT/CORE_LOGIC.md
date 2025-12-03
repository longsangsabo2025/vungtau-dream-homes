# CORE_LOGIC - VUNGTAU DREAM HOMES

> **First Principles Accuracy**: Mọi thông tin được trích xuất từ source code thực tế, không phải README tổng hợp.

## 1. Technology Stack
*Source: `package.json`*

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "~5.9.3",
  "@supabase/supabase-js": "^2.84.0",
  "vite": "^7.2.4",
  "@tanstack/react-query": "^5.83.0",
  "react-router-dom": "^7.8.0",
  "tailwindcss": "^4.1.10",
  "lucide-react": "^0.513.0"
}
```

## 2. Property Data Model
*Source: `src/data/mockProperties.ts`*

```typescript
export interface Property {
  id: string;
  title: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  location: string;
  district: string;
  image: string;
  type: string;      // "Nhà" | "Đất" | "Chung cư" | "Cho thuê"
  isHot: boolean;
  description: string;
}
```

### District Values (từ mockProperties)
- `tp-vungtau` - Thành phố Vũng Tàu
- `long-dien` - Huyện Long Điền
- `xuyen-moc` - Huyện Xuyên Mộc
- `chau-duc` - Huyện Châu Đức

### Property Types
- **Nhà** - Biệt thự, nhà phố
- **Đất** - Đất nền, đất vườn
- **Chung cư** - Căn hộ
- **Cho thuê** - Villa, studio cho thuê

## 3. Database Schema
*Source: `database-complete-schema.sql`*

### Core Tables

**profiles** (extends auth.users)
```sql
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
full_name VARCHAR(255),
phone VARCHAR(20),
avatar_url TEXT,
bio TEXT,
address TEXT,
city VARCHAR(100),
role VARCHAR(50) DEFAULT 'user',  -- user, agent, admin
is_verified BOOLEAN DEFAULT false
```

**agents** (môi giới)
```sql
id UUID PRIMARY KEY,
user_id UUID REFERENCES public.profiles(id),
license_number VARCHAR(100),
company_name VARCHAR(255),
specialization VARCHAR(255),      -- Villa, Apartment, Land
experience_years INTEGER,
rating DECIMAL(3,2) DEFAULT 0.00,
total_reviews INTEGER DEFAULT 0,
total_sales INTEGER DEFAULT 0,
is_active BOOLEAN DEFAULT true,
UNIQUE(user_id)
```

**properties** (extended columns)
```sql
agent_id UUID REFERENCES public.agents(id),
category_id UUID REFERENCES public.categories(id),
owner_id UUID REFERENCES public.profiles(id),
address_detail TEXT,
district VARCHAR(100),
ward VARCHAR(100),
latitude DECIMAL(10, 8),
longitude DECIMAL(11, 8),
year_built INTEGER,
floor_number INTEGER,
total_floors INTEGER,
parking_slots INTEGER DEFAULT 0,
direction VARCHAR(50),            -- Đông, Tây, Nam, Bắc
legal_status VARCHAR(100),        -- Sổ đỏ, sổ hồng
furniture_status VARCHAR(50),     -- Fully furnished, Unfurnished
view_count INTEGER DEFAULT 0,
contact_count INTEGER DEFAULT 0,
is_featured BOOLEAN DEFAULT false,
is_verified BOOLEAN DEFAULT false,
published_at TIMESTAMPTZ,
expires_at TIMESTAMPTZ
```

**categories** (hierarchical)
```sql
id UUID PRIMARY KEY,
name VARCHAR(100) NOT NULL,
slug VARCHAR(100) UNIQUE NOT NULL,
description TEXT,
icon VARCHAR(50),
parent_id UUID REFERENCES public.categories(id),  -- self-ref
display_order INTEGER DEFAULT 0,
is_active BOOLEAN DEFAULT true
```

**property_images**
```sql
property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
image_url TEXT NOT NULL,
caption TEXT,
display_order INTEGER DEFAULT 0,
is_primary BOOLEAN DEFAULT false
```

**property_features** + **property_feature_mapping** (M:N)
```sql
-- Features: name, icon, category (Interior, Exterior, Amenities)
-- Mapping: property_id ↔ feature_id
```

**favorites**
```sql
user_id UUID REFERENCES public.profiles(id),
property_id UUID REFERENCES public.properties(id),
UNIQUE(user_id, property_id)
```

**property_views** (analytics tracking)
```sql
property_id UUID,
user_id UUID,
ip_address INET,
user_agent TEXT,
referrer TEXT,
viewed_at TIMESTAMPTZ
```

**inquiries** (liên hệ)
```sql
property_id UUID,
user_id UUID,
name VARCHAR(255) NOT NULL,
email VARCHAR(255) NOT NULL,
phone VARCHAR(20) NOT NULL,
message TEXT NOT NULL,
inquiry_type VARCHAR(50),         -- viewing, purchase, rent, info
status VARCHAR(50) DEFAULT 'new', -- new, contacted, scheduled, closed
agent_notes TEXT,
contacted_at TIMESTAMPTZ
```

**reviews** (rating 1-5)
```sql
property_id UUID,
agent_id UUID,
user_id UUID NOT NULL,
rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
title VARCHAR(255),
comment TEXT,
is_verified BOOLEAN DEFAULT false,
is_published BOOLEAN DEFAULT true,
CHECK (property_id IS NOT NULL OR agent_id IS NOT NULL)
```

**transactions** (giao dịch)
```sql
property_id UUID NOT NULL,
buyer_id UUID NOT NULL,
seller_id UUID,
agent_id UUID,
transaction_type VARCHAR(50) NOT NULL,  -- sale, rent
price BIGINT NOT NULL,
commission BIGINT,
status VARCHAR(50) DEFAULT 'pending',   -- pending, confirmed, completed, cancelled
contract_url TEXT,
signed_at TIMESTAMPTZ,
completed_at TIMESTAMPTZ
```

**notifications**
```sql
user_id UUID NOT NULL,
title VARCHAR(255) NOT NULL,
message TEXT NOT NULL,
type VARCHAR(50),            -- property, inquiry, transaction, system
reference_id UUID,
is_read BOOLEAN DEFAULT false
```

## 4. PropertyCard Component
*Source: `src/components/PropertyCard.tsx`*

```typescript
interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  location: string;
  image_url: string;
  type: string;
  status?: string;
  isHot?: boolean;
  className?: string;
}
```

### Price Formatting Logic
```typescript
const formatPrice = (price: number) => {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)} tỷ`;   // ≥1 billion
  }
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(0)} triệu`;  // ≥1 million
  }
  return price.toLocaleString("vi-VN");
};
```

### UI Features
- Icons: `BedDouble`, `Bath`, `Maximize2`, `MapPin`, `Heart` (lucide-react)
- Image aspect ratio: 4/3
- Hover effect: `scale-110` on image
- Badges: type, status, HOT marker
- Favorite button: Heart icon

## 5. Homepage Structure
*Source: `src/pages/Index.tsx`*

### Page Components Order
```tsx
<Header />
<HeroSection />
<PropertyList />                    // "Danh Sách Bất Động Sản"
<PropertyTypes section />           // "Loại Hình Bất Động Sản"
<HowItWorks section />              // "Quy Trình Đơn Giản"
<Stats section />                   // Platform statistics
<CTA section />                     // "Bạn Muốn Đăng Tin?"
<Footer />
<AuthDialog />
```

### Property Types Display
```typescript
const propertyTypes = [
  { title: "Nhà Đất",   count: "500+", icon: Home,     color: "primary" },
  { title: "Đất Nền",   count: "300+", icon: MapPin,   color: "secondary" },
  { title: "Chung Cư",  count: "150+", icon: Building, color: "accent" },
  { title: "Cho Thuê",  count: "200+", icon: Zap,      color: "primary" },
];
```

### How It Works (3 steps)
```typescript
const howItWorksSteps = [
  { step: 1, icon: Search,       title: "Tìm kiếm",  description: "Tìm kiếm bất động sản phù hợp với nhu cầu của bạn" },
  { step: 2, icon: Phone,        title: "Liên hệ",   description: "Kết nối với môi giới uy tín và chuyên nghiệp" },
  { step: 3, icon: CheckCircle2, title: "Hoàn tất",  description: "Sở hữu ngôi nhà mơ ước của bạn" },
];
```

### Platform Statistics (hardcoded)
```typescript
{
  "1000+": "Bất động sản",
  "800+":  "Giao dịch thành công",
  "500+":  "Môi giới uy tín",
  "50+":   "Quận/Huyện"
}
```

## 6. SEO Configuration
*Source: `src/pages/Index.tsx` → SEO component*

```tsx
<SEO 
  title="VungTauLand - Bất động sản Vũng Tàu"
  description="Tìm kiếm và mua bán bất động sản tại Vũng Tàu. Villa, căn hộ, nhà phố, đất nền chất lượng với giá tốt nhất."
  keywords="bất động sản vũng tàu, mua nhà vũng tàu, bán nhà vũng tàu, villa, căn hộ, đất nền"
  url="https://vungtauland.com"
/>
```

## 7. Authentication Context
*Source: `src/contexts/AuthContext.tsx` (inferred from usage)*

```typescript
const { user } = useAuth();

// Conditional CTA rendering
{user ? (
  <Link to="/my-properties/new">Đăng tin ngay</Link>
) : (
  <Button onClick={() => setAuthDialogOpen(true)}>Đăng tin ngay</Button>
)}
```

## 8. Page Routes
*Source: `src/pages/` directory*

| Page | Route (inferred) | Description |
|------|------------------|-------------|
| Index | `/` | Homepage |
| PropertyDetail | `/property/:id` | Chi tiết BĐS |
| BuySell | `/buy-sell` | Mua bán |
| Rent | `/rent` | Cho thuê |
| CreateProperty | `/my-properties/new` | Đăng tin mới |
| EditProperty | `/my-properties/:id/edit` | Chỉnh sửa tin |
| MyProperties | `/my-properties` | Quản lý tin đăng |
| Favorites | `/favorites` | Danh sách yêu thích |
| AdminDashboard | `/admin` | Admin panel |
| UserDashboard | `/dashboard` | User dashboard |
| Profile | `/profile` | Hồ sơ cá nhân |
| Settings | `/settings` | Cài đặt |
| News | `/news` | Tin tức |

## 9. Sample Data
*Source: `src/data/mockProperties.ts`*

| Title | Price | Area | Type | District | isHot |
|-------|-------|------|------|----------|-------|
| Biệt thự cao cấp view biển Bãi Sau | 15 tỷ | 250m² | Nhà | tp-vungtau | ✓ |
| Đất nền dự án khu đô thị mới | 5 tỷ | 120m² | Đất | long-dien | ✓ |
| Chung cư The Sóng 2PN | 3.5 tỷ | 75m² | Chung cư | tp-vungtau | |
| Villa nghỉ dưỡng Hồ Tràm | 50 triệu/th | 200m² | Cho thuê | xuyen-moc | ✓ |
| Đất vườn 1000m² | 3 tỷ | 1000m² | Đất | chau-duc | |

## 10. UI Component Library
*Source: `src/components/ui/` + shadcn imports*

- `@/components/ui/badge` - Property type/status badges
- `@/components/ui/button` - CTA buttons
- `@/lib/utils` - `cn()` utility for class merging
- Image assets: `@/assets/property-*.jpg`

## 11. Key Business Logic

### Price Display Rules
- Sale ≥1 tỷ: `X.X tỷ VNĐ`
- Sale ≥1 triệu: `X triệu VNĐ`
- Rental: `X triệu/tháng`

### Property Status Flow
```
Draft → Published → Featured (optional)
         ↓
      Sold/Rented → Archived
```

### User Roles & Permissions
| Role | Can Post | Can Edit Own | Can Edit All | Admin Panel |
|------|----------|--------------|--------------|-------------|
| user | ✓ | ✓ | ✗ | ✗ |
| agent | ✓ | ✓ | ✗ | ✗ |
| admin | ✓ | ✓ | ✓ | ✓ |

---

*Document generated from actual source code analysis following First Principles methodology.*
