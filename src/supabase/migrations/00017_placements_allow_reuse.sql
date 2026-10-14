-- Allow the same photo to be used more than once on the same page (e.g. a
-- reusable library photo placed in several slots). Placements are reconciled
-- with delete + insert, so a (page_id, photo_id) uniqueness is not required.
ALTER TABLE photo_placements
  DROP CONSTRAINT IF EXISTS photo_placements_page_photo_key;
