import { describe, it, expect } from "vitest";
import { FORMATS } from "@/lib/editor/formats";
import { mmToPx } from "@/lib/editor/coordinateMapper";
import {
  buildFormatLayoutSlots,
  buildFormatSpreadSlots,
  buildFormatTemplates,
  TEMPLATE_BLEED_MM,
  TEMPLATE_LAYOUTS,
  TEMPLATE_SPREAD_LAYOUTS,
  type TemplateSlot,
} from "@/lib/editor/templateCatalog";

const BLEED = mmToPx(TEMPLATE_BLEED_MM);

function countSlots(cells: number[][]) {
  const set = new Set<number>();
  cells.forEach((row) => row.forEach((v) => v >= 0 && set.add(v)));
  return set.size;
}

function overlaps(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
) {
  const overlapW = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const overlapH = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return overlapW > 1 && overlapH > 1;
}

const pageSlots = buildFormatTemplates("10x10").filter((t) => t.scope === "page");

describe("template catalog", () => {
  it("genera todos los layouts (página + spread) para cada formato", () => {
    for (const format of FORMATS) {
      const templates = buildFormatTemplates(format.key);
      expect(templates).toHaveLength(
        TEMPLATE_LAYOUTS.length + TEMPLATE_SPREAD_LAYOUTS.length
      );
      templates.forEach((template) => {
        expect(template.format).toBe(format.key);
        expect(template.slots.length).toBeGreaterThan(0);
        expect(["page", "spread"]).toContain(template.scope);
      });
    }
  });

  it("coloca cada slot dentro de la página y dentro del sangrado físico", () => {
    for (const format of FORMATS) {
      for (const layout of TEMPLATE_LAYOUTS) {
        const slots = buildFormatLayoutSlots(format.key, layout.id);
        expect(slots).toHaveLength(countSlots(layout.cells));
        for (const slot of slots) {
          expect(slot.x).toBeGreaterThanOrEqual(Math.floor(-BLEED) - 1);
          expect(slot.y).toBeGreaterThanOrEqual(Math.floor(-BLEED) - 1);
          expect(slot.x + slot.w).toBeLessThanOrEqual(format.w + BLEED + 1);
          expect(slot.y + slot.h).toBeLessThanOrEqual(format.h + BLEED + 1);
          expect(slot.w).toBeGreaterThan(0);
          expect(slot.h).toBeGreaterThan(0);
        }
      }
    }
  });

  it("los slots a sangre llegan al borde físico (media)", () => {
    for (const format of FORMATS) {
      for (const layout of TEMPLATE_LAYOUTS) {
        const slots = buildFormatLayoutSlots(format.key, layout.id);
        for (const slot of slots) {
          const b = slot.bleed ?? {};
          if (b.left) expect(slot.x).toBeLessThanOrEqual(Math.floor(-BLEED) + 1);
          if (b.top) expect(slot.y).toBeLessThanOrEqual(Math.floor(-BLEED) + 1);
          if (b.right)
            expect(slot.x + slot.w).toBeGreaterThanOrEqual(format.w + BLEED - 1);
          if (b.bottom)
            expect(slot.y + slot.h).toBeGreaterThanOrEqual(format.h + BLEED - 1);
        }
      }
    }
  });

  it("las plantillas sin sangrado quedan dentro del corte", () => {
    const noBleed = TEMPLATE_LAYOUTS.filter(
      (l) => !l.bleed && l.kind !== "quadrant" && l.kind !== "half"
    );
    for (const format of FORMATS) {
      for (const layout of noBleed) {
        const slots = buildFormatLayoutSlots(format.key, layout.id);
        for (const slot of slots) {
          expect(slot.bleed).toBeUndefined();
          expect(slot.x).toBeGreaterThanOrEqual(0);
          expect(slot.y).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("no solapa fotos dentro de un mismo layout de página", () => {
    for (const format of FORMATS) {
      for (const layout of TEMPLATE_LAYOUTS) {
        const slots = buildFormatLayoutSlots(format.key, layout.id);
        for (let i = 0; i < slots.length; i++) {
          for (let j = i + 1; j < slots.length; j++) {
            expect(overlaps(slots[i], slots[j])).toBe(false);
          }
        }
      }
    }
  });

  it("coloca los slots de doble página dentro de su página", () => {
    for (const format of FORMATS) {
      for (const layout of TEMPLATE_SPREAD_LAYOUTS) {
        const slots = buildFormatSpreadSlots(format.key, layout.id);
        expect(slots).toHaveLength(layout.slots.length);
        for (const slot of slots) {
          expect([0, 1]).toContain(slot.page);
          expect(slot.x).toBeGreaterThanOrEqual(Math.floor(-BLEED) - 1);
          expect(slot.y).toBeGreaterThanOrEqual(Math.floor(-BLEED) - 1);
          if (slot.span === "spread") continue;
          expect(slot.x + slot.w).toBeLessThanOrEqual(format.w + BLEED + 1);
          expect(slot.y + slot.h).toBeLessThanOrEqual(format.h + BLEED + 1);
        }
      }
    }
  });

  it("no solapa fotos dentro de cada página de un layout doble", () => {
    for (const format of FORMATS) {
      for (const layout of TEMPLATE_SPREAD_LAYOUTS) {
        const slots = buildFormatSpreadSlots(format.key, layout.id).filter(
          (slot: TemplateSlot) => slot.span !== "spread"
        );
        for (const page of [0, 1] as const) {
          const pageSlots = slots.filter((slot) => slot.page === page);
          for (let i = 0; i < pageSlots.length; i++) {
            for (let j = i + 1; j < pageSlots.length; j++) {
              expect(overlaps(pageSlots[i], pageSlots[j])).toBe(false);
            }
          }
        }
      }
    }
  });

  it("adapta la página completa al área disponible de cada orientación", () => {
    const portrait = buildFormatLayoutSlots("11x14", "full")[0];
    const landscape = buildFormatLayoutSlots("14x11", "full")[0];
    expect(portrait.h).toBeGreaterThan(portrait.w);
    expect(landscape.w).toBeGreaterThan(landscape.h);
  });

  it("la página completa a sangre cubre la media (corte + sangrado)", () => {
    const format = FORMATS.find((f) => f.key === "10x10")!;
    const slot = buildFormatLayoutSlots("10x10", "full-bleed")[0];
    expect(slot.x).toBe(-Math.round(BLEED));
    expect(slot.y).toBe(-Math.round(BLEED));
    expect(slot.w).toBe(Math.round(format.w + BLEED * 2));
    expect(slot.h).toBe(Math.round(format.h + BLEED * 2));
  });

  it("la mitad superior a sangre llega al borde superior y no al inferior", () => {
    const format = FORMATS.find((f) => f.key === "10x10")!;
    const slot = buildFormatLayoutSlots("10x10", "half-top-bleed")[0];
    expect(slot.y).toBeLessThanOrEqual(Math.floor(-BLEED) + 1);
    expect(slot.x).toBeLessThanOrEqual(Math.floor(-BLEED) + 1);
    expect(slot.x + slot.w).toBeGreaterThanOrEqual(format.w + BLEED - 1);
    expect(slot.y + slot.h).toBeLessThan(format.h);
    expect(slot.bleed?.bottom).toBeUndefined();
  });

  it("incluye layouts de cuadrantes y doble página en el catálogo", () => {
    const kinds = new Set(pageSlots.map((t) => t.kind));
    expect(kinds.has("quadrant")).toBe(true);
    expect(pageSlots.filter((t) => t.kind === "quadrant").length).toBeGreaterThan(0);
  });
});
