import sharp from "sharp";
import { readFile } from "fs/promises";
import path from "path";
import type { PageBackground } from "@/types/editor";
import { getPatternById } from "@/types/pattern";
import { tintSvg } from "./patternRenderer";

export interface RenderedBackground {
  dataUrl: string;
  format: "PNG" | "JPEG";
}

type TextureFetcher = (imagePath: string) => Promise<ArrayBuffer>;

const PATTERN_TILE_SIZE = 512;
const TEXTURE_TILE_SIZE = 1024;
const TINT_BASE_DEFAULT = "#e5e7eb";
const TINT_ACCENT_DEFAULT = "#3b82f6";

function toDataUrl(buf: Buffer, mime: string): string {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function tileToPage(
  tile: Buffer,
  pageWidth: number,
  pageHeight: number
): Promise<Buffer> {
  let input = tile;
  let meta = await sharp(tile).metadata();
  let tileW = meta.width ?? 256;
  let tileH = meta.height ?? 256;

  if (tileW > pageWidth || tileH > pageHeight) {
    input = await sharp(tile)
      .resize(pageWidth, pageHeight, { fit: "inside" })
      .png()
      .toBuffer();
    meta = await sharp(input).metadata();
    tileW = meta.width ?? pageWidth;
    tileH = meta.height ?? pageHeight;
  }

  const composites: { input: Buffer; left: number; top: number }[] = [];
  for (let y = 0; y < pageHeight; y += tileH) {
    for (let x = 0; x < pageWidth; x += tileW) {
      composites.push({ input, left: x, top: y });
    }
  }

  return sharp({
    create: {
      width: pageWidth,
      height: pageHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();
}

async function renderPatternBuffer(
  patternId: string,
  base: string,
  accent: string
): Promise<Buffer> {
  const pattern = getPatternById(patternId);
  if (!pattern) throw new Error(`Patrón no encontrado: ${patternId}`);

  const svgPath = path.join(process.cwd(), "public", pattern.svgPath.replace(/^\//, ""));
  const svg = await readFile(svgPath, "utf8");
  const tinted = tintSvg(svg, base, accent);

  return sharp(Buffer.from(tinted)).resize(PATTERN_TILE_SIZE, PATTERN_TILE_SIZE).png().toBuffer();
}

async function renderPatternStretch(
  patternId: string,
  base: string,
  accent: string,
  pageWidth: number,
  pageHeight: number
): Promise<Buffer> {
  const pattern = getPatternById(patternId);
  if (!pattern) throw new Error(`Patrón no encontrado: ${patternId}`);

  const svgPath = path.join(process.cwd(), "public", pattern.svgPath.replace(/^\//, ""));
  const svg = await readFile(svgPath, "utf8");
  const tinted = tintSvg(svg, base, accent);

  return sharp(Buffer.from(tinted))
    .resize(pageWidth, pageHeight, { fit: "fill" })
    .png()
    .toBuffer();
}

export async function renderBackground(
  background: PageBackground,
  pageWidth: number,
  pageHeight: number,
  textureFetcher: TextureFetcher
): Promise<RenderedBackground | null> {
  if (background.type === "color") return null;

  if (background.type === "pattern") {
    const base = background.tintBase ?? TINT_BASE_DEFAULT;
    const accent = background.tintAccent ?? TINT_ACCENT_DEFAULT;
    const patternId = background.patternId;
    if (!patternId) return null;

    if (background.mode === "stretch") {
      const buf = await renderPatternStretch(patternId, base, accent, pageWidth, pageHeight);
      return { dataUrl: toDataUrl(buf, "image/png"), format: "PNG" };
    }

    const tile = await renderPatternBuffer(patternId, base, accent);
    const page = await tileToPage(tile, pageWidth, pageHeight);
    return { dataUrl: toDataUrl(page, "image/png"), format: "PNG" };
  }

  if (background.type === "image") {
    const imagePath = background.imagePath;
    if (!imagePath) return null;

    const buffer = Buffer.from(await textureFetcher(imagePath));

    if (background.mode === "stretch") {
      const resized = await sharp(buffer)
        .resize(pageWidth, pageHeight, { fit: "fill" })
        .png()
        .toBuffer();
      return { dataUrl: toDataUrl(resized, "image/png"), format: "PNG" };
    }

    const tile = await sharp(buffer)
      .resize(Math.min(TEXTURE_TILE_SIZE, pageWidth, pageHeight), Math.min(TEXTURE_TILE_SIZE, pageWidth, pageHeight), {
        fit: "inside",
      })
      .png()
      .toBuffer();
    const page = await tileToPage(tile, pageWidth, pageHeight);
    return { dataUrl: toDataUrl(page, "image/png"), format: "PNG" };
  }

  return null;
}
