ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT ''pending'';

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_provider TEXT;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_metadata JSONB DEFAULT '{}'::jsonb;
