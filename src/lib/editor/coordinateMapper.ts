import { PAGE_DPI } from "./canvasConfig";

export function pxToMm(px: number): number {
  return (px / PAGE_DPI) * 25.4;
}

export function mmToPx(mm: number): number {
  return (mm / 25.4) * PAGE_DPI;
}

export interface PlacedPhotoCoords {
  id: string;
  highResUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export function toExportCoords(
  placements: {
    id: string;
    photoId: string;
    highResUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
  }[]
): PlacedPhotoCoords[] {
  return placements.map((p) => ({
    id: p.photoId,
    highResUrl: p.highResUrl,
    x: p.x,
    y: p.y,
    width: p.width * p.scaleX,
    height: p.height * p.scaleY,
    rotation: p.rotation,
  }));
}
