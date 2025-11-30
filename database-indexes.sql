-- ============================================================================
-- DATABASE PERFORMANCE INDEXES - Vungtau Dream Homes
-- ============================================================================
-- Purpose: Optimize query performance for properties table
-- Run this after setting up the main schema
-- ============================================================================

-- 1. Individual column indexes for filtering
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_approval_status ON properties(approval_status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);

-- 2. Time-based indexes (for sorting and recent queries)
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_updated_at ON properties(updated_at DESC);

-- 3. Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_properties_type_status ON properties(type, status);
CREATE INDEX IF NOT EXISTS idx_properties_approval_type ON properties(approval_status, type);
CREATE INDEX IF NOT EXISTS idx_properties_status_created ON properties(status, created_at DESC);

-- 4. Owner-based queries (for user dashboard)
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner_status ON properties(owner_id, status);

-- 5. Price range queries
CREATE INDEX IF NOT EXISTS idx_properties_price_range ON properties(price) WHERE price > 0;

-- 6. Full-text search index for title and location (Vietnamese support)
CREATE INDEX IF NOT EXISTS idx_properties_search 
  ON properties 
  USING gin(to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(location, '') || ' ' || coalesce(description, '')));

-- 7. Geospatial index (if lat/lng columns exist)
-- Uncomment if you have latitude/longitude columns
-- CREATE INDEX IF NOT EXISTS idx_properties_location_geo ON properties USING gist(ll_to_earth(latitude, longitude));

-- ============================================================================
-- VERIFY INDEXES
-- ============================================================================
-- Run this query to check all indexes on properties table:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'properties';

-- ============================================================================
-- ANALYZE TABLE (Update statistics for query planner)
-- ============================================================================
ANALYZE properties;