export const PAGE_DPI = 300;

export const CANVAS_FORMAT_DIMENSIONS = {
  "10x10": { w: 3000, h: 3000 },
  "8.5x11": { w: 2550, h: 3300 },
  "8x10": { w: 2400, h: 3000 },
} as const satisfies Record<string, { w: number; h: number }>;

export type ProjectFormat = keyof typeof CANVAS_FORMAT_DIMENSIONS;

export function getPageDimensions(format: ProjectFormat): { w: number; h: number } {
  return CANVAS_FORMAT_DIMENSIONS[format] ?? CANVAS_FORMAT_DIMENSIONS["10x10"];
}

export const SPREAD_GAP_PX = 16;

export function getSpreadPages(currentPage: number): [number, number] {
  const base = Math.floor(currentPage / 2) * 2;
  return [base, base + 1];
}

export function getSpreadCanvasWidth(pageWidth: number): number {
  return pageWidth * 2 + SPREAD_GAP_PX;
}

export const MAX_ZOOM = 2;
export const MIN_ZOOM = 0.2;
export const ZOOM_STEP = 0.1;

export const LOW_RES_MAX_DIMENSION = 800;
export const LOW_RES_QUALITY = 0.6;
