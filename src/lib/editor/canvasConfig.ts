import { FORMATS, PAGE_DPI, PAGE_BLEED_MM, getBleedMm, getPageDimensions } from "./formats";
import { SPREAD_GAP_PX } from "./templateBuilder.mjs";
import type { ProjectFormat } from "./formats";

export { PAGE_DPI, PAGE_BLEED_MM };
export type { ProjectFormat };
export { getPageDimensions, getBleedMm };
export { SPREAD_GAP_PX };

export const CANVAS_FORMAT_DIMENSIONS = Object.fromEntries(
  FORMATS.map((format) => [format.key, { w: format.w, h: format.h }])
) as Record<ProjectFormat, { w: number; h: number }>;

export function getSpreadPages(currentPage: number): [number, number] {
  const base = Math.floor(currentPage / 2) * 2;
  return [base, base + 1];
}

export function getSpreadCanvasWidth(pageWidth: number): number {
  return pageWidth * 2 + SPREAD_GAP_PX;
}

/**
 * Physical geometry of a page: the trim (cut) size plus the bleed band.
 * `bleedPx` is the sangrado on each side; `w`/`h` are the media dimensions
 * (trim + 2·bleed).
 */
export function getMediaDimensions(format: string | null | undefined): {
  trimW: number;
  trimH: number;
  bleedPx: number;
  w: number;
  h: number;
} {
  const { w, h } = getPageDimensions(format);
  const bleedPx = (getBleedMm(format) / 25.4) * PAGE_DPI;
  return {
    trimW: w,
    trimH: h,
    bleedPx,
    w: w + bleedPx * 2,
    h: h + bleedPx * 2,
  };
}

/** Width of a two-page spread canvas using media (bleed) widths. */
export function getMediaSpreadCanvasWidth(mediaWidth: number): number {
  return mediaWidth * 2 + SPREAD_GAP_PX;
}

export const MAX_ZOOM = 2;
export const MIN_ZOOM = 0.2;
export const ZOOM_STEP = 0.1;

export function clampZoom(zoom: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(zoom * 10) / 10));
}

export function stepZoom(zoom: number, direction: -1 | 1): number {
  return clampZoom(zoom + ZOOM_STEP * direction);
}

export const LOW_RES_MAX_DIMENSION = 800;
export const LOW_RES_QUALITY = 0.6;
