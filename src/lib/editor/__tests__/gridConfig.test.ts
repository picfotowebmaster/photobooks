import { describe, it, expect } from "vitest";
import { FORMATS, getFormat } from "@/lib/editor/formats";
import {
  getDefaultGridConfig,
  calculateGridLines,
  GRID_PRESETS,
} from "@/lib/editor/gridConfig";

describe("per-format default grid", () => {
  it("usa 2×3 en vertical, 3×2 en horizontal y 3×3 en cuadrado", () => {
    expect(getDefaultGridConfig("8.5x11")).toMatchObject({
      columns: 2,
      rows: 3,
    });
    expect(getDefaultGridConfig("11x8.5")).toMatchObject({
      columns: 3,
      rows: 2,
    });
    expect(getDefaultGridConfig("12x12")).toMatchObject({
      columns: 3,
      rows: 3,
    });
  });

  it("escala el margen seguro según el tamaño del formato", () => {
    expect(getDefaultGridConfig("8x10").safeMarginMm).toBe(10);
    expect(getDefaultGridConfig("12x12").safeMarginMm).toBe(12);
    expect(getDefaultGridConfig("11x14").safeMarginMm).toBe(12);
    expect(getDefaultGridConfig("11x8.5").safeMarginMm).toBe(10);
    expect(getDefaultGridConfig("8x10").bleedMm).toBe(3);
  });

  it("cae al formato por defecto si el valor no es válido", () => {
    expect(getDefaultGridConfig("nope")).toEqual(
      getDefaultGridConfig("10x10")
    );
  });

  it("calcula las líneas dentro de cada página para todos los formatos", () => {
    for (const format of FORMATS) {
      const config = getDefaultGridConfig(format.key);
      const { columnXs, rowYs, safePx } = calculateGridLines(
        config,
        format.w,
        format.h
      );
      expect(columnXs).toHaveLength(config.columns - 1);
      expect(rowYs).toHaveLength(config.rows - 1);
      for (const x of columnXs) {
        expect(x).toBeGreaterThan(safePx);
        expect(x).toBeLessThan(format.w - safePx);
      }
      for (const y of rowYs) {
        expect(y).toBeGreaterThan(safePx);
        expect(y).toBeLessThan(format.h - safePx);
      }
    }
  });

  it("mantiene presets disponibles", () => {
    expect(GRID_PRESETS.length).toBeGreaterThan(0);
  });
});
