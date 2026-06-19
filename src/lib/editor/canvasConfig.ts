export const PAGE_WIDTH_PX = 2550;
export const PAGE_HEIGHT_PX = 2550;
export const PAGE_DPI = 300;

export const CANVAS_FORMAT_DIMENSIONS: Record<string, { w: number; h: number }> = {
  "20x20": { w: PAGE_WIDTH_PX, h: PAGE_HEIGHT_PX },
  "21x28": { w: 2520, h: 3360 },
  "28x21": { w: 3360, h: 2520 },
};

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
