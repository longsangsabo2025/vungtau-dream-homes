# 📊 Analytics Integration - VungTauLand

## ✅ Integrated Features

- ✅ Auto page view tracking on every route change
- ✅ Connected to unified analytics database
- ✅ Product identifier: `vungtau`

## 📖 Usage

### Automatic Tracking (Already Enabled)
Page views are automatically tracked when users navigate:
```tsx
// App.tsx
useAnalytics("vungtau"); // ✅ Already configured
```

### Manual Event Tracking

Import the analytics library:
```tsx
import { analytics } from "@/lib/analytics";
```

**Track Property Views:**
```tsx
// In PropertyDetail component
analytics.vungtau.trackClick("property_view", {
  property_id: propertyId,
  property_type: "apartment",
  price: 5000000000
});
```

**Track Search:**
```tsx
// In search filters
analytics.vungtau.trackClick("property_search", {
  location: "Thắng Tam",
  min_price: 1000000000,
  max_price: 5000000000,
  property_type: "house"
});
```

**Track Contact Form:**
```tsx
// In contact/inquiry form
analytics.vungtau.trackFormSubmit("contact_agent", {
  property_id: propertyId,
  contact_method: "email"
});
```

**Track Favorites:**
```tsx
// When user favorites a property
analytics.vungtau.trackClick("add_favorite", {
  property_id: propertyId
});
```

**Track Conversions:**
```tsx
// When user books viewing or makes deposit
analytics.vungtau.trackConversion("booking_deposit", {
  value: 50000000, // Deposit amount
  property_id: propertyId
});
```

## 🎯 Recommended Events to Track

1. **Property Interactions:**
   - `property_view` - User views property detail
   - `property_gallery_view` - User opens image gallery
   - `property_map_view` - User views property on map
   - `add_favorite` / `remove_favorite` - Favorites actions

2. **Search & Filters:**
   - `property_search` - Search with filters
   - `filter_change` - User changes filters
   - `search_results_view` - User views search results

3. **User Actions:**
   - `contact_agent` - Contact form submission
   - `phone_click` - User clicks phone number
   - `whatsapp_click` - User clicks WhatsApp button
   - `booking_deposit` - Booking/deposit conversion

4. **Navigation:**
   - `category_view` - View specific category (apartments, houses, land)
   - `location_view` - View properties in specific location

## 📊 View Dashboard

Admin dashboard with all analytics: `/admin/unified-analytics` (LongSang only)

Or query data directly:
```sql
-- VungTau events today
SELECT * FROM analytics_events 
WHERE product_name = 'vungtau' 
AND created_at >= CURRENT_DATE;

-- Top properties viewed
SELECT 
  properties->>'property_id' as property_id,
  COUNT(*) as views
FROM analytics_events
WHERE product_name = 'vungtau'
AND event_name = 'property_view'
GROUP BY properties->>'property_id'
ORDER BY views DESC
LIMIT 10;
```

## 🔗 Supabase Connection

Using shared analytics database from LongSang:
- Database: `diexsbzqwsbpilsymnfb`
- Table: `analytics_events`
- Auto-tracking: ✅ Enabled
