import type { PageBackground } from "./editor";

export interface PatternDef {
  id: string;
  name: string;
  svgPath: string;
  tintable: boolean;
}

export const PATTERNS: PatternDef[] = [
  { id: "dots", name: "Puntos", svgPath: "/patterns/dots.svg", tintable: true },
  { id: "stripes", name: "Rayas", svgPath: "/patterns/stripes.svg", tintable: true },
  { id: "grid", name: "Cuadrícula", svgPath: "/patterns/grid.svg", tintable: true },
  { id: "chevron", name: "Chevron", svgPath: "/patterns/chevron.svg", tintable: true },
  { id: "checker", name: "Damero", svgPath: "/patterns/checker.svg", tintable: true },
  { id: "waves", name: "Ondas", svgPath: "/patterns/waves.svg", tintable: true },
  { id: "wood", name: "Madera", svgPath: "/patterns/wood.svg", tintable: true },
  { id: "marble", name: "Mármol", svgPath: "/patterns/marble.svg", tintable: true },
];

export function getPatternById(id: string | undefined): PatternDef | undefined {
  return PATTERNS.find((p) => p.id === id);
}

export const DEFAULT_BACKGROUND: PageBackground = { type: "color", color: "#ffffff" };
