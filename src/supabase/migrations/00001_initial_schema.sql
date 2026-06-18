CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  format TEXT NOT NULL,
  thumbnail_url TEXT,
  slots JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Photobook',
  format TEXT NOT NULL DEFAULT '20x20',
  cover_type TEXT NOT NULL DEFAULT 'soft',
  cover_image_url TEXT,
  current_page INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE project_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  page_index INT NOT NULL CHECK (page_index >= 0 AND page_index <= 39),
  template_id UUID REFERENCES templates(id),
  background_fill TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, page_index)
);

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  bucket_path_highres TEXT NOT NULL,
  bucket_path_lowres TEXT NOT NULL,
  original_width INT NOT NULL,
  original_height INT NOT NULL,
  file_size BIGINT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE photo_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  page_id UUID REFERENCES project_pages(id) ON DELETE CASCADE NOT NULL,
  x FLOAT NOT NULL DEFAULT 0,
  y FLOAT NOT NULL DEFAULT 0,
  width FLOAT NOT NULL,
  height FLOAT NOT NULL,
  scale_x FLOAT NOT NULL DEFAULT 1,
  scale_y FLOAT NOT NULL DEFAULT 1,
  rotation FLOAT NOT NULL DEFAULT 0,
  z_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_pages INT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  extra_pages_cost DECIMAL(10,2) DEFAULT 0,
  cover_surcharge DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  stripe_session_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  export_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own projects"
  ON projects FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD pages of own projects"
  ON project_pages FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can CRUD own photos"
  ON photos FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD placements in own projects"
  ON photo_placements FOR ALL
  USING (page_id IN (
    SELECT pp.id FROM project_pages pp
    JOIN projects p ON pp.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public read templates"
  ON templates FOR SELECT USING (is_active = true);

INSERT INTO storage.buckets (id, name, public) VALUES
  ('photos_highres', 'photos_highres', false),
  ('photos_lowres', 'photos_lowres', true),
  ('exports', 'exports', false);

CREATE POLICY "Users can upload own highres photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photos_highres' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read own highres photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos_highres' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read lowres photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos_lowres');

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_project_pages_project ON project_pages(project_id);
CREATE INDEX idx_photos_project ON photos(project_id);
CREATE INDEX idx_photo_placements_page ON photo_placements(page_id);
CREATE INDEX idx_orders_user ON orders(user_id);
