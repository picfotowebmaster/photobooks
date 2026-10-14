import formatsJson from "./formats.json";

export const PAGE_DPI = 300;

/** Physical bleed (sangrado a corte) around every page, in mm. */
export const PAGE_BLEED_MM = 3;

export type FormatOrientation = "portrait" | "landscape" | "square";

export interface DefaultGrid {
  bleedMm: number;
  safeMarginMm: number;
  columns: number;
  rows: number;
}

export interface FormatDefinition {
  key: ProjectFormat;
  label: string;
  widthIn: number;
  heightIn: number;
  w: number;
  h: number;
  orientation: FormatOrientation;
  basePrice: number;
  defaultGrid: DefaultGrid;
}

export const FORMAT_KEYS = [
  "8x10",
  "8.5x11",
  "11x8.5",
  "10x10",
  "12x12",
  "11x14",
  "14x11",
] as const;

export type ProjectFormat = (typeof FORMAT_KEYS)[number];

export const DEFAULT_FORMAT: ProjectFormat = "10x10";

/** Base price of the 10×10" format, used to derive the per-square-inch rate. */
const BASE_10X10_PRICE = 29.99;

/** Single proportional rate: all formats are priced by printed area. */
export const PRICE_PER_SQ_IN = BASE_10X10_PRICE / (10 * 10);

const RAW_FORMATS: {
  key: ProjectFormat;
  label: string;
  widthIn: number;
  heightIn: number;
}[] = formatsJson as {
  key: ProjectFormat;
  label: string;
  widthIn: number;
  heightIn: number;
}[];

function getOrientation(widthIn: number, heightIn: number): FormatOrientation {
  if (widthIn === heightIn) return "square";
  return widthIn > heightIn ? "landscape" : "portrait";
}

function getDefaultGrid(widthIn: number, heightIn: number): DefaultGrid {
  const orientation = getOrientation(widthIn, heightIn);
  const longestSide = Math.max(widthIn, heightIn);

  const layout: Pick<DefaultGrid, "columns" | "rows"> =
    orientation === "portrait"
      ? { columns: 2, rows: 3 }
      : orientation === "landscape"
        ? { columns: 3, rows: 2 }
        : { columns: 3, rows: 3 };

  return {
    bleedMm: 3,
    safeMarginMm: longestSide >= 12 ? 12 : 10,
    ...layout,
  };
}

export const FORMATS: FormatDefinition[] = RAW_FORMATS.map((raw) => ({
  ...raw,
  w: Math.round(raw.widthIn * PAGE_DPI),
  h: Math.round(raw.heightIn * PAGE_DPI),
  orientation: getOrientation(raw.widthIn, raw.heightIn),
  basePrice: parseFloat(
    (raw.widthIn * raw.heightIn * PRICE_PER_SQ_IN).toFixed(2)
  ),
  defaultGrid: getDefaultGrid(raw.widthIn, raw.heightIn),
}));

const FORMAT_MAP = new Map<string, FormatDefinition>(
  FORMATS.map((format) => [format.key, format])
);

export function isProjectFormat(value: unknown): value is ProjectFormat {
  return typeof value === "string" && FORMAT_MAP.has(value);
}

export function resolveFormat(value: string | null | undefined): ProjectFormat {
  return isProjectFormat(value) ? value : DEFAULT_FORMAT;
}

export function getFormat(key: ProjectFormat): FormatDefinition {
  return FORMAT_MAP.get(key) ?? FORMAT_MAP.get(DEFAULT_FORMAT)!;
}

export function getFormatLabel(value: string | null | undefined): string {
  return getFormat(resolveFormat(value)).label;
}

/** page dimensions in px at 300 dpi */
export function getPageDimensions(format: string | null | undefined): {
  w: number;
  h: number;
} {
  const def = FORMAT_MAP.get(resolveFormat(format));
  return { w: def!.w, h: def!.h };
}

/** Bleed (sangrado a corte) for a format, in mm. */
export function getBleedMm(format: string | null | undefined): number {
  const def = FORMAT_MAP.get(resolveFormat(format));
  return def?.defaultGrid.bleedMm ?? PAGE_BLEED_MM;
}
