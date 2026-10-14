import { mmToPx } from "./coordinateMapper";
import { DEFAULT_FORMAT, getFormat, resolveFormat } from "./formats";

/* ── Grid configuration types ─────────────────────────────── */

export interface GridConfig {
  /** Bleed (Cut Zone) in mm — area trimmed during print */
  bleedMm: number;
  /** Safe Zone margin in mm — content should stay inside */
  safeMarginMm: number;
  /** Columns per single page (not spread) */
  columns: number;
  /** Rows per single page */
  rows: number;
  /** Visibility toggles */
  showBleed: boolean;
  showSafeZone: boolean;
  showGrid: boolean;
  showSpine: boolean;
}

/**
 * Build the default grid for a given book format.
 * Column/row counts depend on the orientation and the safe margin scales
 * with the format size, so the reticle adapts to every format.
 */
export function getDefaultGridConfig(
  format: string | null | undefined
): GridConfig {
  const { defaultGrid } = getFormat(resolveFormat(format));
  return {
    ...defaultGrid,
    showBleed: true,
    showSafeZone: true,
    showGrid: true,
    showSpine: true,
  };
}

export const DEFAULT_GRID_CONFIG: GridConfig = getDefaultGridConfig(DEFAULT_FORMAT);

/* ── Preset library ───────────────────────────────────────── */

export interface GridPreset {
  id: string;
  label: string;
  columns: number;
  rows: number;
}

/**
 * Pre-defined grid layouts.
 * "5×2 (Referencia)" matches the image the user provided
 * (5 cols across the *spread*, so 3 + 2 per page ≈ 2–3 cols per page).
 * We store columns *per page* to keep the model simple.
 */
export const GRID_PRESETS: GridPreset[] = [
  { id: "2x2", label: "2 × 2", columns: 2, rows: 2 },
  { id: "3x2", label: "3 × 2 (Referencia)", columns: 3, rows: 2 },
  { id: "3x3", label: "3 × 3", columns: 3, rows: 3 },
  { id: "4x3", label: "4 × 3", columns: 4, rows: 3 },
  { id: "4x4", label: "4 × 4", columns: 4, rows: 4 },
];

/* ── Computed grid line coordinates ───────────────────────── */

export interface GridLines {
  /** Bleed rect inset in px from outer edge (each side) */
  bleedPx: number;
  /** Safe-zone rect inset in px from outer edge (each side) */
  safePx: number;
  /** X positions of vertical column dividers (within a single page, relative to page origin) */
  columnXs: number[];
  /** Y positions of horizontal row dividers (within a single page) */
  rowYs: number[];
}

/**
 * Calculate the pixel positions of every grid element for one page.
 * All values are in the same coordinate space as the Konva canvas (px at 300 dpi).
 */
export function calculateGridLines(
  config: GridConfig,
  pageWidthPx: number,
  pageHeightPx: number
): GridLines {
  const bleedPx = mmToPx(config.bleedMm);
  const safePx = mmToPx(config.safeMarginMm);

  // Column dividers sit inside the safe zone
  const safeW = pageWidthPx - safePx * 2;
  const colStep = safeW / config.columns;
  const columnXs: number[] = [];
  for (let i = 1; i < config.columns; i++) {
    columnXs.push(safePx + colStep * i);
  }

  // Row dividers
  const safeH = pageHeightPx - safePx * 2;
  const rowStep = safeH / config.rows;
  const rowYs: number[] = [];
  for (let i = 1; i < config.rows; i++) {
    rowYs.push(safePx + rowStep * i);
  }

  return { bleedPx, safePx, columnXs, rowYs };
}
