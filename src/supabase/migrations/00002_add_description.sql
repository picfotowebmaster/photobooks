-- NOTE: this file historically shares the "00002" prefix with
-- 00002_profile_trigger.sql. Applied migrations are NOT renamed here to avoid
-- desyncing the migration history; instead the statement is made idempotent so
-- an accidental re-run is harmless.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
