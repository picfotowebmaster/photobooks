-- Persist the book page count on the project so spreads survive reloads.

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS total_pages INT NOT NULL DEFAULT 10;

-- Backfill from the highest existing page row (rounded up to an even count).
UPDATE projects p
SET total_pages = GREATEST(
  10,
  COALESCE(
    (SELECT MAX(pp.page_index) + 1 FROM project_pages pp WHERE pp.project_id = p.id),
    10
  )
);

UPDATE projects
SET total_pages = total_pages + (total_pages % 2)
WHERE total_pages % 2 <> 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_total_pages_check'
  ) THEN
    ALTER TABLE projects
      ADD CONSTRAINT projects_total_pages_check CHECK (total_pages >= 2);
  END IF;
END $$;
