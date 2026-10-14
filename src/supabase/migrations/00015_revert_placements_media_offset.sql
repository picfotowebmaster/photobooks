-- Revert the erroneous +3 mm "media offset" that 00012/00014 applied to stored
-- placements.
--
-- Placements are persisted in trim-origin coordinates (slots can be negative
-- for bleed); the bleed offset is added ONLY at export time. Pre-shifting the
-- stored values moved every photo 3 mm down-right.
--
-- This migration subtracts the offset once. It assumes no *correct* placement
-- was created after 00014 and before this migration (all existing rows were
-- shifted by the erroneous offset).
UPDATE photo_placements
SET x = x - 35.433, y = y - 35.433;
