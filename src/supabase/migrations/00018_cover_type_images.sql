-- Sample images for cover types, shown to clients when creating a photobook.
-- Admins upload them from /admin/pricing (covers tab).

ALTER TABLE cover_types ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Public bucket so clients (even anonymous) can render the sample images.
INSERT INTO storage.buckets (id, name, public) VALUES
  ('cover_images', 'cover_images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read cover images" ON storage.objects;
CREATE POLICY "Public read cover images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cover_images');

-- Admin uploads/deletes go through the service role (bypasses RLS),
-- so only a public read policy is required here.
