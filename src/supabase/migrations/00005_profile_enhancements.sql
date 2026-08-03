ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rfc TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS razon_social TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS regimen_fiscal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cp_fiscal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS uso_cfdi TEXT;

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL DEFAULT 'Casa',
  full_name TEXT,
  phone TEXT,
  street TEXT NOT NULL,
  ext_number TEXT,
  int_number TEXT,
  neighborhood TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT DEFAULT 'México',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own addresses" ON addresses;
CREATE POLICY "Users can CRUD own addresses"
  ON addresses FOR ALL USING (auth.uid() = user_id);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number TEXT;

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
