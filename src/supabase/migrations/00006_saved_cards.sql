CREATE TABLE IF NOT EXISTS saved_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  card_brand TEXT NOT NULL,
  last4 TEXT NOT NULL,
  exp_month TEXT NOT NULL,
  exp_year TEXT NOT NULL,
  cardholder_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE saved_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own cards" ON saved_cards;
CREATE POLICY "Users can CRUD own cards"
  ON saved_cards FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_cards_user ON saved_cards(user_id);
