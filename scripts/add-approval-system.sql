-- Add approval/moderation columns to properties table
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for faster queries by approval_status
CREATE INDEX IF NOT EXISTS idx_properties_approval_status ON properties(approval_status);
CREATE INDEX IF NOT EXISTS idx_properties_approved_by ON properties(approved_by);

-- Update existing properties to 'approved' status (backwards compatibility)
UPDATE properties 
SET approval_status = 'approved', 
    approved_at = published_at 
WHERE approval_status IS NULL OR approval_status = 'pending';

COMMENT ON COLUMN properties.approval_status IS 'Property approval status: pending, approved, rejected';
COMMENT ON COLUMN properties.approved_by IS 'Admin user who approved/rejected the property';
COMMENT ON COLUMN properties.approved_at IS 'Timestamp when property was approved';
COMMENT ON COLUMN properties.rejection_reason IS 'Reason for rejection (if rejected)';
