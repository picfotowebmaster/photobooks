import type { PatternDef } from "@/types/pattern";

const DEFAULT_BASE = "#e5e7eb";
const DEFAULT_ACCENT = "#3b82f6";
const TILE_SIZE = 256;

const TOKEN_BASE = "\u0000BASE\u0000";
const TOKEN_ACCENT = "\u0000ACCENT\u0000";

export function tintSvg(svg: string, base: string, accent: string): string {
  return svg
    .split(DEFAULT_BASE)
    .join(TOKEN_BASE)
    .split(DEFAULT_ACCENT)
    .join(TOKEN_ACCENT)
    .split(TOKEN_BASE)
    .join(base)
    .split(TOKEN_ACCENT)
    .join(accent);
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function svgToPngDataUrl(svg: string): Promise<string> {
  return loadImage(svgToDataUrl(svg)).then((img) => {
    const canvas = document.createElement("canvas");
    canvas.width = TILE_SIZE;
    canvas.height = TILE_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");
    ctx.drawImage(img, 0, 0, TILE_SIZE, TILE_SIZE);
    return canvas.toDataURL("image/png");
  });
}

const patternCache = new Map<string, Promise<HTMLImageElement>>();

export function getPatternTileImage(
  pattern: PatternDef,
  base: string,
  accent: string
): Promise<HTMLImageElement> {
  const key = `${pattern.id}:${base}:${accent}`;
  const cached = patternCache.get(key);
  if (cached) return cached;

  const promise = fetch(pattern.svgPath)
    .then((res) => res.text())
    .then((svg) => tintSvg(svg, base, accent))
    .then(svgToPngDataUrl)
    .then(loadImage)
    .catch((err) => {
      patternCache.delete(key);
      throw err;
    });

  patternCache.set(key, promise);
  return promise;
}
