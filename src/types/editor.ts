export type EditorTool =
  | "select"
  | "text"
  | "background"
  | "sticker"
  | "zoom"
  | "pan";

export type EditorPanel = "background" | "sticker" | "grid" | "templates" | "textStyle";

export type FontStyle = "normal" | "bold" | "italic" | "bold italic";

export type TextAlign = "left" | "center" | "right";

export interface TextPlacement {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width?: number;
  rotation: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: FontStyle;
  fill: string;
  align: TextAlign;
}

export interface PhotoPlacement {
  id: string;
  photoId: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  zIndex: number;
  lowResUrl: string;
  highResUrl: string;
  inLibrary?: boolean;
  slotIndex?: number;
}

export interface StickerPlacement {
  id: string;
  stickerId: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  zIndex: number;
}

export type TemplateBleedEdge = "top" | "right" | "bottom" | "left";

export interface TemplateSlot {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Spread layouts: 0 = left page, 1 = right page. */
  page?: 0 | 1;
  /** A single photo crossing the gutter. */
  span?: "spread";
  /** Edges that bleed past the trim line (sangrado a corte). */
  bleed?: Partial<Record<TemplateBleedEdge, boolean>>;
}

export interface PageTemplate {
  id: string;
  name: string;
  description?: string;
  slots: TemplateSlot[];
  /** "page" templates apply to one page, "spread" templates to a double page. */
  scope?: "page" | "spread";
  kind?: string;
  backgroundUrl?: string;
  backgroundColor?: string;
}

export type BackgroundFill = "tile" | "stretch";

export interface PageBackground {
  type: "color" | "pattern" | "image";
  color?: string;
  patternId?: string;
  imageUrl?: string;
  imagePath?: string;
  mode?: BackgroundFill;
  tintBase?: string;
  tintAccent?: string;
}

export interface CanvasConfig {
  pageWidth: number;
  pageHeight: number;
  dpi: number;
  maxScale: number;
  minScale: number;
  stepScale: number;
}

export type { GridConfig } from "@/lib/editor/gridConfig";
