-- Pricing configuration, per-format prices and cover type catalog.
-- Everything an admin can edit from /admin/pricing lives here.

-- ── Tables ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pricing_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  base_pages INT NOT NULL DEFAULT 10,
  max_pages INT NOT NULL DEFAULT 40,
  currency TEXT NOT NULL DEFAULT 'MXN',
  default_cover_key TEXT NOT NULL DEFAULT 'pasta_sencilla',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS format_prices (
  format TEXT PRIMARY KEY,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  extra_page_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  extra_spread_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cover_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pricing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE format_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_types ENABLE ROW LEVEL SECURITY;

-- ── RLS: public read, admin write ───────────────────────────

DROP POLICY IF EXISTS "Public read pricing settings" ON pricing_settings;
CREATE POLICY "Public read pricing settings"
  ON pricing_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins write pricing settings" ON pricing_settings;
CREATE POLICY "Admins write pricing settings"
  ON pricing_settings FOR ALL USING (get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Public read format prices" ON format_prices;
CREATE POLICY "Public read format prices"
  ON format_prices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins write format prices" ON format_prices;
CREATE POLICY "Admins write format prices"
  ON format_prices FOR ALL USING (get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Public read cover types" ON cover_types;
CREATE POLICY "Public read cover types"
  ON cover_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins write cover types" ON cover_types;
CREATE POLICY "Admins write cover types"
  ON cover_types FOR ALL USING (get_current_user_role() = 'admin');

-- ── updated_at triggers ─────────────────────────────────────

DROP TRIGGER IF EXISTS set_pricing_settings_updated_at ON pricing_settings;
CREATE TRIGGER set_pricing_settings_updated_at
  BEFORE UPDATE ON pricing_settings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_format_prices_updated_at ON format_prices;
CREATE TRIGGER set_format_prices_updated_at
  BEFORE UPDATE ON format_prices
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_cover_types_updated_at ON cover_types;
CREATE TRIGGER set_cover_types_updated_at
  BEFORE UPDATE ON cover_types
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ── Seed: settings + per-format prices ──────────────────────

INSERT INTO pricing_settings (id, base_pages, max_pages, currency, default_cover_key)
VALUES ('default', 10, 40, 'MXN', 'pasta_sencilla')
ON CONFLICT (id) DO NOTHING;

INSERT INTO format_prices (format, base_price, extra_page_price, extra_spread_price, is_active) VALUES
  ('8x10',   23.99, 4.99, 9.98, true),
  ('8.5x11', 28.04, 4.99, 9.98, true),
  ('11x8.5', 28.04, 4.99, 9.98, true),
  ('10x10',  29.99, 4.99, 9.98, true),
  ('12x12',  43.19, 4.99, 9.98, true),
  ('11x14',  46.18, 4.99, 9.98, true),
  ('14x11',  46.18, 4.99, 9.98, true)
ON CONFLICT (format) DO NOTHING;

-- ── Seed: cover type catalog ────────────────────────────────

INSERT INTO cover_types (key, name, description, price, sort_order, is_active) VALUES
  ('color_book_pasta_dura', 'Color Book Pasta Dura', 'Color Book con pasta dura', 0, 1, true),
  ('pasta_acolchada', 'Pasta Acolchada', 'Pasta acolchada', 0, 2, true),
  ('pasta_acrilico_2mm', 'Pasta Acrilico de 2mm', 'Pasta en acrílico de 2mm', 0, 3, true),
  ('pasta_dura', 'Pasta Dura', 'Pasta dura', 0, 4, true),
  ('pasta_dura_caja_deslizable', 'Pasta Dura con Caja deslizable', 'Pasta dura con caja deslizable', 0, 5, true),
  ('pasta_foto_laminada_vinipiel', 'Pasta Foto Laminada con Vinipiel', 'Foto laminada con vinipiel', 0, 6, true),
  ('pasta_sencilla', 'Pasta Sencilla', 'Pasta sencilla', 0, 7, true),
  ('pasta_vinipiel_relieve', 'Pasta Vinipiel con Relieve', 'Vinipiel con relieve', 0, 8, true),
  ('pasta_vinipiel_foto_ventana_relieve', 'Pasta Vinipiel Foto-Ventana con Relieve', 'Vinipiel foto-ventana con relieve', 0, 9, true),
  ('pasta_vinipiel_foto_ventana_liso', 'Pasta Vinipiel Foto-Ventana Liso', 'Vinipiel foto-ventana liso', 0, 10, true),
  ('pasta_vinipiel_liso', 'Pasta Vinipiel Liso', 'Vinipiel liso', 0, 11, true),
  ('photo_book_acrilico_6mm', 'Photo Book Pasta en Acrílico de 6mm', 'Photo Book con pasta en acrílico de 6mm', 0, 12, true)
ON CONFLICT (key) DO NOTHING;

-- ── Migrate legacy cover_type values ────────────────────────

UPDATE projects SET cover_type = 'pasta_sencilla' WHERE cover_type = 'soft';
UPDATE projects SET cover_type = 'pasta_dura' WHERE cover_type = 'hard';
UPDATE projects SET cover_type = 'pasta_sencilla'
  WHERE cover_type IS NULL OR cover_type NOT IN (SELECT key FROM cover_types);

ALTER TABLE projects ALTER COLUMN cover_type SET DEFAULT 'pasta_sencilla';

CREATE INDEX IF NOT EXISTS idx_projects_cover_type ON projects(cover_type);
