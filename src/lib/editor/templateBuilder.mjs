/**
 * Shared template catalog.
 *
 * Layouts are described as relative cell matrices so the very same catalog can
 * be scaled to any book format (portrait, landscape or square) without
 * hand-writing pixel coordinates. Imported by the TypeScript runtime (tests /
 * helpers) and by the Node seed script that generates the SQL migration.
 *
 * Two families live here:
 *  - Page layouts (`TEMPLATE_LAYOUTS`) work on a single page. A slot may
 *    "bleed" (sangrado a corte) to the page edge when it touches the content
 *    boundary and its layout enables it.
 *  - Spread layouts (`TEMPLATE_SPREAD_LAYOUTS`) describe a full double page
 *    (two pages + gutter). Slots carry a `page` index (0 = left, 1 = right) or
 *    `span: "spread"` for a single photo crossing the gutter.
 */

/** Physical margin kept around every page, in mm. */
export const TEMPLATE_MARGIN_MM = 15;
/** Gap between adjacent photo slots, in mm. */
export const TEMPLATE_GAP_MM = 4;
/** Bleed (cut) extension beyond the trim edge, in mm. */
export const TEMPLATE_BLEED_MM = 3;
/** Gap between the two pages of a spread, in px. */
export const SPREAD_GAP_PX = 16;

/**
 * @typedef {"full" | "half" | "gallery" | "quadrant"} PageLayoutKind
 * @typedef {"top" | "right" | "bottom" | "left"} BleedEdge
 * @typedef {boolean | BleedEdge[] | Partial<Record<BleedEdge, boolean>>} BleedSpec
 *
 * @typedef {Object} TemplateLayout
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {PageLayoutKind} [kind]
 * @property {BleedSpec} [bleed]
 * @property {number[][]} cells     Matrix of slot indexes (-1 = empty cell)
 * @property {number[]} colWeights
 * @property {number[]} rowWeights
 */

/**
 * Normalise a bleed spec into a per-edge boolean map.
 * @param {BleedSpec} [spec]
 * @returns {{ top: boolean; right: boolean; bottom: boolean; left: boolean }}
 */
function normalizeBleed(spec) {
  const edges = { top: false, right: false, bottom: false, left: false };
  if (!spec) return edges;
  if (spec === true) {
    edges.top = edges.right = edges.bottom = edges.left = true;
    return edges;
  }
  if (Array.isArray(spec)) {
    for (const edge of spec) {
      if (edge in edges) edges[edge] = true;
    }
    return edges;
  }
  edges.top = Boolean(spec.top);
  edges.right = Boolean(spec.right);
  edges.bottom = Boolean(spec.bottom);
  edges.left = Boolean(spec.left);
  return edges;
}

/** @type {TemplateLayout[]} */
export const TEMPLATE_LAYOUTS = [
  /* ── Página completa ─────────────────────────────────────── */
  {
    id: "full",
    name: "1 foto – Página completa",
    description: "Una foto a página completa con márgenes",
    kind: "full",
    cells: [[0]],
    colWeights: [1],
    rowWeights: [1],
  },
  {
    id: "full-bleed",
    name: "1 foto – Página completa a sangre",
    description: "Una foto a página completa sangrando por los 4 lados",
    kind: "full",
    bleed: true,
    cells: [[0]],
    colWeights: [1],
    rowWeights: [1],
  },
  {
    id: "full-bleed-top",
    name: "1 foto – Completa, sangre superior",
    description: "Foto a página completa con sangrado solo por arriba",
    kind: "full",
    bleed: ["top"],
    cells: [[0]],
    colWeights: [1],
    rowWeights: [1],
  },
  {
    id: "full-bleed-bottom",
    name: "1 foto – Completa, sangre inferior",
    description: "Foto a página completa con sangrado solo por abajo",
    kind: "full",
    bleed: ["bottom"],
    cells: [[0]],
    colWeights: [1],
    rowWeights: [1],
  },
  {
    id: "full-bleed-sides",
    name: "1 foto – Completa, sangre lateral",
    description: "Foto a página completa con sangrado a izquierda y derecha",
    kind: "full",
    bleed: ["left", "right"],
    cells: [[0]],
    colWeights: [1],
    rowWeights: [1],
  },

  /* ── Mitad de página con rebase ──────────────────────────── */
  {
    id: "half-top-bleed",
    name: "1 foto – Mitad superior a sangre",
    description: "Media página arriba, sangrando por arriba y laterales",
    kind: "half",
    bleed: true,
    cells: [
      [0, 0],
      [-1, -1],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "half-bottom-bleed",
    name: "1 foto – Mitad inferior a sangre",
    description: "Media página abajo, sangrando por abajo y laterales",
    kind: "half",
    bleed: true,
    cells: [
      [-1, -1],
      [0, 0],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "half-left-bleed",
    name: "1 foto – Mitad izquierda a sangre",
    description: "Media página a la izquierda, sangrando por izquierda",
    kind: "half",
    bleed: true,
    cells: [
      [0, -1],
      [0, -1],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "half-right-bleed",
    name: "1 foto – Mitad derecha a sangre",
    description: "Media página a la derecha, sangrando por derecha",
    kind: "half",
    bleed: true,
    cells: [
      [-1, 0],
      [-1, 0],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "half-hero-left-bleed",
    name: "3 fotos – Media izquierda + 2",
    description: "Media página izquierda a sangre y dos fotos a la derecha",
    kind: "half",
    bleed: true,
    cells: [
      [0, 1],
      [0, 2],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "half-hero-right-bleed",
    name: "3 fotos – 2 + media derecha",
    description: "Dos fotos a la izquierda y media página derecha a sangre",
    kind: "half",
    bleed: true,
    cells: [
      [1, 0],
      [2, 0],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "split-stack-bleed",
    name: "2 fotos – Apiladas a sangre",
    description: "Dos fotos apiladas sangrando por los bordes exteriores",
    kind: "half",
    bleed: true,
    cells: [[0], [1]],
    colWeights: [1],
    rowWeights: [1, 1],
  },
  {
    id: "split-side-bleed",
    name: "2 fotos – Lado a lado a sangre",
    description: "Dos fotos lado a lado sangrando por los bordes exteriores",
    kind: "half",
    bleed: true,
    cells: [[0, 1]],
    colWeights: [1, 1],
    rowWeights: [1],
  },

  /* ── Cuadrantes combinados (rebase) ──────────────────────── */
  {
    id: "quad-tl",
    name: "1 foto – Cuadrante sup. izq.",
    description: "Un cuadrante arriba a la izquierda, a sangre",
    kind: "quadrant",
    bleed: true,
    cells: [
      [0, -1],
      [-1, -1],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "quad-tr",
    name: "1 foto – Cuadrante sup. der.",
    description: "Un cuadrante arriba a la derecha, a sangre",
    kind: "quadrant",
    bleed: true,
    cells: [
      [-1, 0],
      [-1, -1],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "quad-bl",
    name: "1 foto – Cuadrante inf. izq.",
    description: "Un cuadrante abajo a la izquierda, a sangre",
    kind: "quadrant",
    bleed: true,
    cells: [
      [-1, -1],
      [0, -1],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "quad-br",
    name: "1 foto – Cuadrante inf. der.",
    description: "Un cuadrante abajo a la derecha, a sangre",
    kind: "quadrant",
    bleed: true,
    cells: [
      [-1, -1],
      [-1, 0],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "quad-2x2-bleed",
    name: "4 fotos – Cuadrícula a sangre",
    description: "Cuatro cuadrantes con sangrado exterior",
    kind: "quadrant",
    bleed: true,
    cells: [
      [0, 1],
      [2, 3],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "quad-3-empty-tl",
    name: "3 fotos – Cuadrantes, hueco sup. izq.",
    description: "Tres cuadrantes con el superior izquierdo libre",
    kind: "quadrant",
    bleed: true,
    cells: [
      [-1, 0],
      [1, 2],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "quad-3-empty-tr",
    name: "3 fotos – Cuadrantes, hueco sup. der.",
    description: "Tres cuadrantes con el superior derecho libre",
    kind: "quadrant",
    bleed: true,
    cells: [
      [0, -1],
      [1, 2],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "quad-3-empty-bl",
    name: "3 fotos – Cuadrantes, hueco inf. izq.",
    description: "Tres cuadrantes con el inferior izquierdo libre",
    kind: "quadrant",
    bleed: true,
    cells: [
      [0, 1],
      [-1, 2],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "quad-3-empty-br",
    name: "3 fotos – Cuadrantes, hueco inf. der.",
    description: "Tres cuadrantes con el inferior derecho libre",
    kind: "quadrant",
    bleed: true,
    cells: [
      [0, 1],
      [2, -1],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "quad-hero-top",
    name: "3 fotos – Héroe arriba a sangre",
    description: "Foto grande arriba y dos abajo, con sangrado exterior",
    kind: "quadrant",
    bleed: true,
    cells: [
      [0, 0],
      [1, 2],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "quad-hero-bottom",
    name: "3 fotos – Héroe abajo a sangre",
    description: "Dos fotos arriba y foto grande abajo, con sangrado exterior",
    kind: "quadrant",
    bleed: true,
    cells: [
      [0, 1],
      [2, 2],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "quad-hero-left",
    name: "3 fotos – Héroe izquierda a sangre",
    description: "Foto grande a la izquierda y dos a la derecha, con sangrado",
    kind: "quadrant",
    bleed: true,
    cells: [
      [0, 1],
      [0, 2],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "quad-hero-right",
    name: "3 fotos – Héroe derecha a sangre",
    description: "Dos fotos a la izquierda y foto grande a la derecha, con sangrado",
    kind: "quadrant",
    bleed: true,
    cells: [
      [1, 0],
      [2, 0],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },

  /* ── Galerías (slots) ────────────────────────────────────── */
  {
    id: "split-side",
    name: "2 fotos – Lado a lado",
    description: "Dos fotos lado a lado",
    kind: "gallery",
    cells: [[0, 1]],
    colWeights: [1, 1],
    rowWeights: [1],
  },
  {
    id: "split-stack",
    name: "2 fotos – Apiladas",
    description: "Dos fotos apiladas",
    kind: "gallery",
    cells: [[0], [1]],
    colWeights: [1],
    rowWeights: [1, 1],
  },
  {
    id: "duo-hero-left",
    name: "2 fotos – Héroe izquierda",
    description: "Foto grande a la izquierda y una pequeña a la derecha",
    kind: "gallery",
    cells: [[0, 1]],
    colWeights: [2, 1],
    rowWeights: [1],
  },
  {
    id: "duo-hero-right",
    name: "2 fotos – Héroe derecha",
    description: "Foto pequeña a la izquierda y grande a la derecha",
    kind: "gallery",
    cells: [[0, 1]],
    colWeights: [1, 2],
    rowWeights: [1],
  },
  {
    id: "duo-hero-top",
    name: "2 fotos – Héroe arriba",
    description: "Foto grande arriba y una pequeña abajo",
    kind: "gallery",
    cells: [[0], [1]],
    colWeights: [1],
    rowWeights: [2, 1],
  },
  {
    id: "three-grid",
    name: "3 fotos – Grid",
    description: "Una foto superior y dos inferiores",
    kind: "gallery",
    cells: [
      [0, 0],
      [1, 2],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "three-strip",
    name: "3 fotos – Tríptico",
    description: "Tres fotos en franjas verticales",
    kind: "gallery",
    cells: [[0, 1, 2]],
    colWeights: [1, 1, 1],
    rowWeights: [1],
  },
  {
    id: "three-strip-v",
    name: "3 fotos – Tríptico horizontal",
    description: "Tres fotos en franjas horizontales",
    kind: "gallery",
    cells: [[0], [1], [2]],
    colWeights: [1],
    rowWeights: [1, 1, 1],
  },
  {
    id: "three-hero-top",
    name: "3 fotos – Héroe arriba",
    description: "Foto grande arriba y dos abajo",
    kind: "gallery",
    cells: [
      [0, 0],
      [1, 2],
    ],
    colWeights: [1, 1],
    rowWeights: [2, 1],
  },
  {
    id: "three-hero-left",
    name: "3 fotos – Héroe izquierda",
    description: "Foto grande a la izquierda y dos a la derecha",
    kind: "gallery",
    cells: [
      [0, 1],
      [0, 2],
    ],
    colWeights: [2, 1],
    rowWeights: [1, 1],
  },
  {
    id: "four-grid",
    name: "4 fotos – Cuadrícula",
    description: "Distribución simétrica 2×2",
    kind: "gallery",
    cells: [
      [0, 1],
      [2, 3],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "four-strip",
    name: "4 fotos – Franjas verticales",
    description: "Cuatro fotos en franjas verticales",
    kind: "gallery",
    cells: [[0, 1, 2, 3]],
    colWeights: [1, 1, 1, 1],
    rowWeights: [1],
  },
  {
    id: "four-strip-h",
    name: "4 fotos – Franjas horizontales",
    description: "Cuatro fotos en franjas horizontales",
    kind: "gallery",
    cells: [[0], [1], [2], [3]],
    colWeights: [1],
    rowWeights: [1, 1, 1, 1],
  },
  {
    id: "four-hero-top",
    name: "4 fotos – Héroe arriba",
    description: "Foto grande arriba y tres abajo",
    kind: "gallery",
    cells: [
      [0, 0, 0],
      [1, 2, 3],
    ],
    colWeights: [1, 1, 1],
    rowWeights: [2, 1],
  },
  {
    id: "four-hero-left",
    name: "4 fotos – Héroe izquierda",
    description: "Foto grande a la izquierda y tres a la derecha",
    kind: "gallery",
    cells: [
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    colWeights: [2, 1],
    rowWeights: [1, 1, 1],
  },
  {
    id: "five-collage",
    name: "5 fotos – Collage",
    description: "Una foto grande y cuatro pequeñas",
    kind: "gallery",
    cells: [
      [0, 1, 2],
      [0, 3, 4],
    ],
    colWeights: [2, 1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "five-strip",
    name: "5 fotos – Franjas verticales",
    description: "Cinco fotos en franjas verticales",
    kind: "gallery",
    cells: [[0, 1, 2, 3, 4]],
    colWeights: [1, 1, 1, 1, 1],
    rowWeights: [1],
  },
  {
    id: "six-grid",
    name: "6 fotos – Cuadrícula",
    description: "Distribución 3×2",
    kind: "gallery",
    cells: [
      [0, 1, 2],
      [3, 4, 5],
    ],
    colWeights: [1, 1, 1],
    rowWeights: [1, 1],
  },
  {
    id: "six-grid-v",
    name: "6 fotos – Cuadrícula vertical",
    description: "Distribución 2×3",
    kind: "gallery",
    cells: [
      [0, 1],
      [2, 3],
      [4, 5],
    ],
    colWeights: [1, 1],
    rowWeights: [1, 1, 1],
  },
  {
    id: "eight-grid",
    name: "8 fotos – Cuadrícula 4×2",
    description: "Ocho fotos en cuadrícula de cuatro columnas",
    kind: "gallery",
    cells: [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
    ],
    colWeights: [1, 1, 1, 1],
    rowWeights: [1, 1],
  },
];

/**
 * Double page (spread) layouts.
 *
 * Slots use page-relative fractions (0…1). `page: 0` is the left page and
 * `page: 1` the right page. A slot with `span: "spread"` uses fractions of the
 * whole spread and is rendered from the left page (single photo across gutter).
 *
 * @typedef {Object} SpreadSlotSpec
 * @property {0 | 1} page
 * @property {number} x @property {number} y @property {number} w @property {number} h
 * @property {BleedSpec} [bleed]
 * @property {"spread"} [span]
 *
 * @typedef {Object} SpreadLayout
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {SpreadSlotSpec[]} slots
 */

/** @type {SpreadLayout[]} */
export const TEMPLATE_SPREAD_LAYOUTS = [
  {
    id: "panorama",
    name: "Doble – Panorama",
    description: "Una sola foto a lo ancho de las dos páginas",
    slots: [
      { page: 0, span: "spread", x: 0, y: 0.05, w: 1, h: 0.9, bleed: ["left", "right"] },
    ],
  },
  {
    id: "spread-2up-uniform",
    name: "Doble – 2 fotos",
    description: "Una foto por página con márgenes",
    slots: [
      { page: 0, x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
      { page: 1, x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
    ],
  },
  {
    id: "spread-2up-bleed",
    name: "Doble – 2 fotos a sangre",
    description: "Una foto por página sangrando por los cuatro lados",
    slots: [
      { page: 0, x: 0, y: 0, w: 1, h: 1, bleed: true },
      { page: 1, x: 0, y: 0, w: 1, h: 1, bleed: true },
    ],
  },
  {
    id: "spread-2up-outer-bleed",
    name: "Doble – 2 fotos sangre exterior",
    description: "Una foto por página sangrando solo por el exterior",
    slots: [
      { page: 0, x: 0, y: 0.05, w: 1, h: 0.9, bleed: ["left"] },
      { page: 1, x: 0, y: 0.05, w: 1, h: 0.9, bleed: ["right"] },
    ],
  },
  {
    id: "spread-4-grid",
    name: "Doble – 4 fotos (2×2)",
    description: "Dos fotos por página en cuadrícula",
    slots: [
      { page: 0, x: 0.05, y: 0.05, w: 0.9, h: 0.43 },
      { page: 0, x: 0.05, y: 0.52, w: 0.9, h: 0.43 },
      { page: 1, x: 0.05, y: 0.05, w: 0.9, h: 0.43 },
      { page: 1, x: 0.05, y: 0.52, w: 0.9, h: 0.43 },
    ],
  },
  {
    id: "spread-4-strips",
    name: "Doble – 4 tiras",
    description: "Cuatro franjas verticales a lo ancho del pliego",
    slots: [
      { page: 0, x: 0.05, y: 0.05, w: 0.43, h: 0.9 },
      { page: 0, x: 0.52, y: 0.05, w: 0.43, h: 0.9 },
      { page: 1, x: 0.05, y: 0.05, w: 0.43, h: 0.9 },
      { page: 1, x: 0.52, y: 0.05, w: 0.43, h: 0.9 },
    ],
  },
  {
    id: "spread-hero-left-3",
    name: "Doble – Héroe izq. + 2",
    description: "Foto grande en la página izquierda y dos en la derecha",
    slots: [
      { page: 0, x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
      { page: 1, x: 0.05, y: 0.05, w: 0.9, h: 0.43 },
      { page: 1, x: 0.05, y: 0.52, w: 0.9, h: 0.43 },
    ],
  },
  {
    id: "spread-hero-right-3",
    name: "Doble – 2 + héroe der.",
    description: "Dos fotos en la izquierda y una grande en la derecha",
    slots: [
      { page: 0, x: 0.05, y: 0.05, w: 0.9, h: 0.43 },
      { page: 0, x: 0.05, y: 0.52, w: 0.9, h: 0.43 },
      { page: 1, x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
    ],
  },
  {
    id: "spread-hero-top-3",
    name: "Doble – Héroe izq. + 2 lado a lado",
    description: "Foto grande a la izquierda y dos lado a lado",
    slots: [
      { page: 0, x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
      { page: 1, x: 0.05, y: 0.05, w: 0.43, h: 0.9 },
      { page: 1, x: 0.52, y: 0.05, w: 0.43, h: 0.9 },
    ],
  },
  {
    id: "spread-hero-bottom-3",
    name: "Doble – 2 lado a lado + héroe der.",
    description: "Dos lado a lado en la izquierda y una grande a la derecha",
    slots: [
      { page: 0, x: 0.05, y: 0.05, w: 0.43, h: 0.9 },
      { page: 0, x: 0.52, y: 0.05, w: 0.43, h: 0.9 },
      { page: 1, x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
    ],
  },
  {
    id: "spread-1plus3-strips",
    name: "Doble – Héroe + 3 tiras",
    description: "Foto grande a la izquierda y tres tiras a la derecha",
    slots: [
      { page: 0, x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
      { page: 1, x: 0.05, y: 0.05, w: 0.28, h: 0.9 },
      { page: 1, x: 0.36, y: 0.05, w: 0.28, h: 0.9 },
      { page: 1, x: 0.67, y: 0.05, w: 0.28, h: 0.9 },
    ],
  },
  {
    id: "spread-mixed-3-left",
    name: "Doble – 1 grande + 2 (izq.)",
    description: "Héroe y dos fotos apiladas en la izquierda, una grande a la derecha",
    slots: [
      { page: 0, x: 0.05, y: 0.05, w: 0.9, h: 0.43 },
      { page: 0, x: 0.05, y: 0.52, w: 0.43, h: 0.43 },
      { page: 0, x: 0.52, y: 0.52, w: 0.43, h: 0.43 },
      { page: 1, x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
    ],
  },
  {
    id: "spread-mixed-3-right",
    name: "Doble – 1 grande + 2 (der.)",
    description: "Una grande a la izquierda y héroe + dos a la derecha",
    slots: [
      { page: 0, x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
      { page: 1, x: 0.05, y: 0.05, w: 0.9, h: 0.43 },
      { page: 1, x: 0.05, y: 0.52, w: 0.43, h: 0.43 },
      { page: 1, x: 0.52, y: 0.52, w: 0.43, h: 0.43 },
    ],
  },
  {
    id: "spread-6-strips",
    name: "Doble – 6 tiras",
    description: "Tres franjas verticales por página",
    slots: [
      { page: 0, x: 0.05, y: 0.05, w: 0.28, h: 0.9 },
      { page: 0, x: 0.36, y: 0.05, w: 0.28, h: 0.9 },
      { page: 0, x: 0.67, y: 0.05, w: 0.28, h: 0.9 },
      { page: 1, x: 0.05, y: 0.05, w: 0.28, h: 0.9 },
      { page: 1, x: 0.36, y: 0.05, w: 0.28, h: 0.9 },
      { page: 1, x: 0.67, y: 0.05, w: 0.28, h: 0.9 },
    ],
  },
  {
    id: "spread-8-grid",
    name: "Doble – 8 fotos (4×2 por página)",
    description: "Cuatro fotos por página en cuadrícula 2×2",
    slots: [
      { page: 0, x: 0.05, y: 0.05, w: 0.43, h: 0.43 },
      { page: 0, x: 0.52, y: 0.05, w: 0.43, h: 0.43 },
      { page: 0, x: 0.05, y: 0.52, w: 0.43, h: 0.43 },
      { page: 0, x: 0.52, y: 0.52, w: 0.43, h: 0.43 },
      { page: 1, x: 0.05, y: 0.05, w: 0.43, h: 0.43 },
      { page: 1, x: 0.52, y: 0.05, w: 0.43, h: 0.43 },
      { page: 1, x: 0.05, y: 0.52, w: 0.43, h: 0.43 },
      { page: 1, x: 0.52, y: 0.52, w: 0.43, h: 0.43 },
    ],
  },
  {
    id: "spread-1plus2-h",
    name: "Doble – 1 + 2 horizontales",
    description: "Una foto grande a la izquierda y dos apiladas a la derecha",
    slots: [
      { page: 0, x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
      { page: 1, x: 0.05, y: 0.05, w: 0.9, h: 0.43 },
      { page: 1, x: 0.05, y: 0.52, w: 0.9, h: 0.43 },
    ],
  },
];

/**
 * @param {number} mm
 * @param {number} dpi
 */
function mmToPx(mm, dpi) {
  return (mm / 25.4) * dpi;
}

/**
 * @param {TemplateLayout} layout
 * @param {number} pageWidth
 * @param {number} pageHeight
 * @param {{ dpi?: number; marginMm?: number; gapMm?: number; bleedMm?: number }} [options]
 * @returns {{ x: number; y: number; w: number; h: number; bleed?: Record<string, boolean> }[]}
 */
export function buildTemplateSlots(layout, pageWidth, pageHeight, options = {}) {
  const dpi = options.dpi ?? 300;
  const marginMm = options.marginMm ?? TEMPLATE_MARGIN_MM;
  const gapMm = options.gapMm ?? TEMPLATE_GAP_MM;
  const bleedPx = options.bleedPx ?? mmToPx(options.bleedMm ?? TEMPLATE_BLEED_MM, dpi);

  const marginPx = mmToPx(marginMm, dpi);
  const gapPx = mmToPx(gapMm, dpi);
  const originX = marginPx;
  const originY = marginPx;
  const contentW = pageWidth - marginPx * 2;
  const contentH = pageHeight - marginPx * 2;

  const colCount = layout.colWeights.length;
  const rowCount = layout.rowWeights.length;
  const colSum = layout.colWeights.reduce((a, b) => a + b, 0);
  const rowSum = layout.rowWeights.reduce((a, b) => a + b, 0);

  const usableW = contentW - gapPx * (colCount - 1);
  const usableH = contentH - gapPx * (rowCount - 1);

  /** @type {number[]} */
  const colEdges = [0];
  layout.colWeights.forEach((weight, i) => {
    colEdges.push(colEdges[i] + (weight / colSum) * usableW + gapPx);
  });

  /** @type {number[]} */
  const rowEdges = [0];
  layout.rowWeights.forEach((weight, i) => {
    rowEdges.push(rowEdges[i] + (weight / rowSum) * usableH + gapPx);
  });

  /** @type {Map<number, { minRow: number; maxRow: number; minCol: number; maxCol: number }>} */
  const bounds = new Map();
  layout.cells.forEach((rowCells, row) => {
    rowCells.forEach((slotIndex, col) => {
      if (slotIndex < 0) return;
      const current =
        bounds.get(slotIndex) ?? {
          minRow: row,
          maxRow: row,
          minCol: col,
          maxCol: col,
        };
      current.minRow = Math.min(current.minRow, row);
      current.maxRow = Math.max(current.maxRow, row);
      current.minCol = Math.min(current.minCol, col);
      current.maxCol = Math.max(current.maxCol, col);
      bounds.set(slotIndex, current);
    });
  });

  const edges = normalizeBleed(layout.bleed);

  return [...bounds.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, box]) => {
      let x = originX + colEdges[box.minCol];
      let y = originY + rowEdges[box.minRow];
      let right = originX + colEdges[box.maxCol + 1] - gapPx;
      let bottom = originY + rowEdges[box.maxRow + 1] - gapPx;

      /** @type {Record<string, boolean>} */
      const slotBleed = {};
      const touch = 1;
      if (edges.left && Math.abs(x - originX) <= touch) {
        x = -bleedPx;
        slotBleed.left = true;
      }
      if (edges.top && Math.abs(y - originY) <= touch) {
        y = -bleedPx;
        slotBleed.top = true;
      }
      if (edges.right && Math.abs(right - (originX + contentW)) <= touch) {
        right = pageWidth + bleedPx;
        slotBleed.right = true;
      }
      if (edges.bottom && Math.abs(bottom - (originY + contentH)) <= touch) {
        bottom = pageHeight + bleedPx;
        slotBleed.bottom = true;
      }

      /** @type {{ x: number; y: number; w: number; h: number; bleed?: Record<string, boolean> }} */
      const slot = {
        x: Math.round(x),
        y: Math.round(y),
        w: Math.round(right - x),
        h: Math.round(bottom - y),
      };
      if (Object.keys(slotBleed).length > 0) slot.bleed = slotBleed;
      return slot;
    });
}

/**
 * Build the pixel slots for a spread layout.
 * @param {SpreadLayout} layout
 * @param {number} pageWidth
 * @param {number} pageHeight
 * @param {{ gapPx?: number; bleedMm?: number }} [options]
 * @returns {{ page: 0 | 1; x: number; y: number; w: number; h: number; span?: "spread"; bleed?: Record<string, boolean> }[]}
 */
export function buildSpreadTemplateSlots(layout, pageWidth, pageHeight, options = {}) {
  const gapPx = options.gapPx ?? SPREAD_GAP_PX;
  const bleedPx = options.bleedPx ?? mmToPx(options.bleedMm ?? TEMPLATE_BLEED_MM, options.dpi ?? 300);
  const spreadW = pageWidth * 2 + gapPx;

  return layout.slots.map((spec) => {
    const isSpan = spec.span === "spread";
    const baseW = isSpan ? spreadW : pageWidth;
    let x = Math.round(spec.x * baseW);
    let y = Math.round(spec.y * pageHeight);
    let w = Math.round(spec.w * baseW);
    let h = Math.round(spec.h * pageHeight);

    const edges = normalizeBleed(spec.bleed);
    /** @type {Record<string, boolean>} */
    const slotBleed = {};
    if (edges.left) {
      w += x + bleedPx;
      x = -bleedPx;
      slotBleed.left = true;
    }
    if (edges.top) {
      h += y + bleedPx;
      y = -bleedPx;
      slotBleed.top = true;
    }
    if (edges.right) {
      w = baseW + bleedPx - x;
      slotBleed.right = true;
    }
    if (edges.bottom) {
      h = pageHeight + bleedPx - y;
      slotBleed.bottom = true;
    }

    /** @type {{ page: 0 | 1; x: number; y: number; w: number; h: number; span?: "spread"; bleed?: Record<string, boolean> }} */
    const slot = { page: spec.page, x, y, w, h };
    if (isSpan) slot.span = "spread";
    if (Object.keys(slotBleed).length > 0) slot.bleed = slotBleed;
    return slot;
  });
}

/**
 * @param {{ key: string; w: number; h: number }} format
 * @param {{ dpi?: number; marginMm?: number; gapMm?: number; bleedMm?: number }} [options]
 */
export function buildTemplatesForFormat(format, options = {}) {
  return TEMPLATE_LAYOUTS.map((layout) => ({
    id: `${format.key}--${layout.id}`,
    name: layout.name,
    description: layout.description,
    format: format.key,
    scope: "page",
    kind: layout.kind ?? "gallery",
    slots: buildTemplateSlots(layout, format.w, format.h, options),
    is_active: true,
  }));
}

/**
 * @param {{ key: string; w: number; h: number }} format
 * @param {{ dpi?: number; marginMm?: number; gapMm?: number; gapPx?: number; bleedMm?: number }} [options]
 */
export function buildSpreadTemplatesForFormat(format, options = {}) {
  return TEMPLATE_SPREAD_LAYOUTS.map((layout) => ({
    id: `${format.key}--spread--${layout.id}`,
    name: layout.name,
    description: layout.description,
    format: format.key,
    scope: "spread",
    kind: "spread",
    slots: buildSpreadTemplateSlots(layout, format.w, format.h, options),
    is_active: true,
  }));
}
