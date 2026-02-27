-- Add gallery_images column to items table (stored as JSONB array of URL strings)
ALTER TABLE items ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;
