ALTER TABLE project_pages ADD COLUMN IF NOT EXISTS background JSONB;

UPDATE project_pages
SET background = jsonb_build_object('type', 'color', 'color', background_fill)
WHERE background_fill IS NOT NULL AND background IS NULL;

INSERT INTO storage.buckets (id, name, public) VALUES
  ('textures', 'textures', false),
  ('textures_lowres', 'textures_lowres', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload own textures" ON storage.objects;
CREATE POLICY "Users can upload own textures"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'textures' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can read own textures" ON storage.objects;
CREATE POLICY "Users can read own textures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'textures' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Public read texture lowres" ON storage.objects;
CREATE POLICY "Public read texture lowres"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'textures_lowres');
