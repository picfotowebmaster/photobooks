-- Seed templates for each book format

-- ── 10x10 (3000×3000px @ 300dpi) margin: 200px ──

INSERT INTO templates (name, description, format, slots, is_active) VALUES
(
  '1 foto – Página completa',
  'Una foto a página completa con márgenes',
  '10x10',
  '[{"x":200,"y":200,"w":2600,"h":2600}]'::jsonb,
  true
),
(
  '2 fotos – Horizontal',
  'Dos fotos lado a lado en formato horizontal',
  '10x10',
  '[{"x":200,"y":200,"w":1250,"h":2600},{"x":1550,"y":200,"w":1250,"h":2600}]'::jsonb,
  true
),
(
  '3 fotos – Grid',
  'Una foto superior y dos inferiores',
  '10x10',
  '[{"x":200,"y":200,"w":2600,"h":1250},{"x":200,"y":1550,"w":1250,"h":1250},{"x":1550,"y":1550,"w":1250,"h":1250}]'::jsonb,
  true
),
(
  '4 fotos – Cuadrícula',
  'Distribución simétrica 2×2',
  '10x10',
  '[{"x":200,"y":200,"w":1250,"h":1250},{"x":1550,"y":200,"w":1250,"h":1250},{"x":200,"y":1550,"w":1250,"h":1250},{"x":1550,"y":1550,"w":1250,"h":1250}]'::jsonb,
  true
),
(
  '5 fotos – Collage',
  'Una foto grande a la izquierda y cuatro pequeñas a la derecha',
  '10x10',
  '[{"x":200,"y":200,"w":1200,"h":2600},{"x":1500,"y":200,"w":650,"h":1250},{"x":2250,"y":200,"w":650,"h":1250},{"x":1500,"y":1550,"w":650,"h":1250},{"x":2250,"y":1550,"w":650,"h":1250}]'::jsonb,
  true
);

-- ── 8.5×11 (2550×3300px @ 300dpi) margin: 200px ──

INSERT INTO templates (name, description, format, slots, is_active) VALUES
(
  '1 foto – Página completa',
  'Una foto a página completa con márgenes',
  '8.5x11',
  '[{"x":200,"y":200,"w":2150,"h":2900}]'::jsonb,
  true
),
(
  '2 fotos – Vertical',
  'Dos fotos apiladas verticalmente',
  '8.5x11',
  '[{"x":200,"y":200,"w":2150,"h":1400},{"x":200,"y":1700,"w":2150,"h":1400}]'::jsonb,
  true
),
(
  '3 fotos – Apilado',
  'Tres fotos en columna vertical',
  '8.5x11',
  '[{"x":200,"y":200,"w":2150,"h":900},{"x":200,"y":1200,"w":2150,"h":900},{"x":200,"y":2200,"w":2150,"h":900}]'::jsonb,
  true
),
(
  '4 fotos – Cuadrícula',
  'Distribución simétrica 2×2',
  '8.5x11',
  '[{"x":200,"y":200,"w":1025,"h":1400},{"x":1325,"y":200,"w":1025,"h":1400},{"x":200,"y":1700,"w":1025,"h":1400},{"x":1325,"y":1700,"w":1025,"h":1400}]'::jsonb,
  true
),
(
  '5 fotos – Collage',
  'Una foto grande superior y cuatro pequeñas inferiores',
  '8.5x11',
  '[{"x":200,"y":200,"w":2150,"h":1200},{"x":200,"y":1500,"w":1025,"h":750},{"x":1325,"y":1500,"w":1025,"h":750},{"x":200,"y":2350,"w":1025,"h":750},{"x":1325,"y":2350,"w":1025,"h":750}]'::jsonb,
  true
);

-- ── 8×10 (2400×3000px @ 300dpi) margin: 200px ──

INSERT INTO templates (name, description, format, slots, is_active) VALUES
(
  '1 foto – Página completa',
  'Una foto a página completa con márgenes',
  '8x10',
  '[{"x":200,"y":200,"w":2000,"h":2600}]'::jsonb,
  true
),
(
  '2 fotos – Horizontal',
  'Dos fotos lado a lado en formato apaisado',
  '8x10',
  '[{"x":200,"y":200,"w":950,"h":2600},{"x":1250,"y":200,"w":950,"h":2600}]'::jsonb,
  true
),
(
  '3 fotos – Tríptico',
  'Tres fotos en franjas verticales',
  '8x10',
  '[{"x":200,"y":200,"w":600,"h":2600},{"x":900,"y":200,"w":600,"h":2600},{"x":1600,"y":200,"w":600,"h":2600}]'::jsonb,
  true
),
(
  '4 fotos – Cuadrícula',
  'Distribución simétrica 2×2',
  '8x10',
  '[{"x":200,"y":200,"w":950,"h":1250},{"x":1250,"y":200,"w":950,"h":1250},{"x":200,"y":1550,"w":950,"h":1250},{"x":1250,"y":1550,"w":950,"h":1250}]'::jsonb,
  true
),
(
  '5 fotos – Collage',
  'Una foto grande a la izquierda y cuatro pequeñas a la derecha',
  '8x10',
  '[{"x":200,"y":200,"w":900,"h":2600},{"x":1200,"y":200,"w":450,"h":1250},{"x":1750,"y":200,"w":450,"h":1250},{"x":1200,"y":1550,"w":450,"h":1250},{"x":1750,"y":1550,"w":450,"h":1250}]'::jsonb,
  true
);
