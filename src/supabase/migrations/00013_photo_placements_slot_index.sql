-- Persist photo placements from the editor.
--
-- Adds the slot association (needed to restore a photo into its template slot)
-- and a stable key so the editor can reconcile placements.

ALTER TABLE photo_placements
  ADD COLUMN IF NOT EXISTS slot_index INT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'photo_placements_page_photo_key'
  ) THEN
    ALTER TABLE photo_placements
      ADD CONSTRAINT photo_placements_page_photo_key UNIQUE (page_id, photo_id);
  END IF;
END $$;
