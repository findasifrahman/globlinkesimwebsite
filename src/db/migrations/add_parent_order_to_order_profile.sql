-- Add parent order reference for top-ups
ALTER TABLE orderProfile ADD COLUMN IF NOT EXISTS parentOrderNo VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_profile_parent_order ON orderProfile(parentOrderNo);

-- Add foreign key constraint
ALTER TABLE orderProfile
ADD CONSTRAINT fk_parent_order
FOREIGN KEY (parentOrderNo)
REFERENCES orderProfile(orderNo)
ON DELETE SET NULL; 