export type EditorTool = "select" | "text" | "background";

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
}

export interface PageTemplate {
  id: string;
  name: string;
  slots: { x: number; y: number; w: number; h: number }[];
  backgroundUrl?: string;
  backgroundColor?: string;
}

export interface CanvasConfig {
  pageWidth: number;
  pageHeight: number;
  dpi: number;
  maxScale: number;
  minScale: number;
  stepScale: number;
}
