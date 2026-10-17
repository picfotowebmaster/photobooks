-- Add the superadmin role. Superadmins have full admin access and, unlike
-- regular admins, can create client and administrator accounts from the
-- administrative panel.

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('client', 'admin', 'superadmin'));

-- ── Profiles ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (get_current_user_role() IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (get_current_user_role() IN ('admin', 'superadmin'));

-- ── Orders ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  USING (get_current_user_role() IN ('admin', 'superadmin'));

-- ── Projects ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can CRUD all projects" ON projects;
CREATE POLICY "Admins can CRUD all projects"
  ON projects FOR ALL
  USING (get_current_user_role() IN ('admin', 'superadmin'));

-- ── Pricing ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins write pricing settings" ON pricing_settings;
CREATE POLICY "Admins write pricing settings"
  ON pricing_settings FOR ALL
  USING (get_current_user_role() IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "Admins write format prices" ON format_prices;
CREATE POLICY "Admins write format prices"
  ON format_prices FOR ALL
  USING (get_current_user_role() IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "Admins write cover types" ON cover_types;
CREATE POLICY "Admins write cover types"
  ON cover_types FOR ALL
  USING (get_current_user_role() IN ('admin', 'superadmin'));
