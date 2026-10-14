import { FORMATS, resolveFormat } from "./formats";
import type { ProjectFormat } from "./formats";
import {
  TEMPLATE_BLEED_MM,
  TEMPLATE_GAP_MM,
  TEMPLATE_LAYOUTS,
  TEMPLATE_MARGIN_MM,
  TEMPLATE_SPREAD_LAYOUTS,
  buildSpreadTemplateSlots,
  buildSpreadTemplatesForFormat,
  buildTemplateSlots,
  buildTemplatesForFormat,
} from "./templateBuilder.mjs";

export {
  TEMPLATE_BLEED_MM,
  TEMPLATE_GAP_MM,
  TEMPLATE_LAYOUTS,
  TEMPLATE_MARGIN_MM,
  TEMPLATE_SPREAD_LAYOUTS,
};

export type TemplateScope = "page" | "spread";

export interface TemplateSlot {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Present for spread layouts: 0 = left page, 1 = right page. */
  page?: 0 | 1;
  /** Present when the slot crosses the gutter (single photo across the spread). */
  span?: "spread";
  /** Edges that bleed past the trim line (sangrado a corte). */
  bleed?: Partial<Record<"top" | "right" | "bottom" | "left", boolean>>;
}

export interface GeneratedTemplate {
  id: string;
  name: string;
  description: string;
  format: ProjectFormat;
  scope: TemplateScope;
  kind: string;
  slots: TemplateSlot[];
  is_active: boolean;
}

/** Layouts available for every format (relative definitions). */
export type TemplateLayout = (typeof TEMPLATE_LAYOUTS)[number];

function resolveDefinition(format: string | null | undefined) {
  const resolved = resolveFormat(format);
  return FORMATS.find((f) => f.key === resolved)!;
}

/**
 * Build every template for a given format: single-page layouts plus the
 * double-page (spread) layouts.
 */
export function buildFormatTemplates(
  format: string | null | undefined,
  options: { dpi?: number; marginMm?: number; gapMm?: number; bleedMm?: number } = {}
): GeneratedTemplate[] {
  const definition = resolveDefinition(format);
  const target = { key: definition.key, w: definition.w, h: definition.h };

  return [
    ...buildTemplatesForFormat(target, options),
    ...buildSpreadTemplatesForFormat(target, options),
  ] as GeneratedTemplate[];
}

/**
 * Build a single page layout's slots for a given format.
 */
export function buildFormatLayoutSlots(
  format: string | null | undefined,
  layoutId: string,
  options: { dpi?: number; marginMm?: number; gapMm?: number; bleedMm?: number } = {}
): TemplateSlot[] {
  const definition = resolveDefinition(format);
  const layout = TEMPLATE_LAYOUTS.find(
    (entry: { id: string }) => entry.id === layoutId
  );
  if (!layout) return [];

  return buildTemplateSlots(
    layout,
    definition.w,
    definition.h,
    options
  ) as TemplateSlot[];
}

/**
 * Build a single spread layout's slots for a given format.
 */
export function buildFormatSpreadSlots(
  format: string | null | undefined,
  layoutId: string,
  options: { gapPx?: number; bleedMm?: number } = {}
): TemplateSlot[] {
  const definition = resolveDefinition(format);
  const layout = TEMPLATE_SPREAD_LAYOUTS.find(
    (entry: { id: string }) => entry.id === layoutId
  );
  if (!layout) return [];

  return buildSpreadTemplateSlots(
    layout,
    definition.w,
    definition.h,
    options
  ) as TemplateSlot[];
}
