-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);

-- Create a composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_properties_type_status ON properties(type, status);

-- Add full-text search index for title and location
CREATE INDEX IF NOT EXISTS idx_properties_search ON properties USING gin(to_tsvector('english', title || ' ' || location));