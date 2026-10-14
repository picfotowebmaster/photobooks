import { describe, it, expect } from "vitest";
import {
  FORMATS,
  FORMAT_KEYS,
  PAGE_DPI,
  PRICE_PER_SQ_IN,
  DEFAULT_FORMAT,
  getFormat,
  getFormatLabel,
  getPageDimensions,
  isProjectFormat,
  resolveFormat,
} from "@/lib/editor/formats";

describe("format catalog", () => {
  it("expone exactamente los 7 formatos soportados", () => {
    expect(FORMATS.map((f) => f.key)).toEqual([...FORMAT_KEYS]);
    expect(FORMATS).toHaveLength(7);
  });

  it("calcula píxeles a 300 dpi a partir de las pulgadas", () => {
    for (const format of FORMATS) {
      expect(format.w).toBe(Math.round(format.widthIn * PAGE_DPI));
      expect(format.h).toBe(Math.round(format.heightIn * PAGE_DPI));
    }
  });

  it("asigna la orientación correcta", () => {
    expect(getFormat("8x10").orientation).toBe("portrait");
    expect(getFormat("11x8.5").orientation).toBe("landscape");
    expect(getFormat("10x10").orientation).toBe("square");
    expect(getFormat("14x11").orientation).toBe("landscape");
  });

  it("precia todos los formatos proporcionalmente al área", () => {
    for (const format of FORMATS) {
      const expected = parseFloat(
        (format.widthIn * format.heightIn * PRICE_PER_SQ_IN).toFixed(2)
      );
      expect(format.basePrice).toBe(expected);
    }
    expect(getFormat("10x10").basePrice).toBe(29.99);
  });

  it("resuelve formatos inválidos al default", () => {
    expect(resolveFormat("20x20")).toBe(DEFAULT_FORMAT);
    expect(resolveFormat(null)).toBe(DEFAULT_FORMAT);
    expect(resolveFormat("12x12")).toBe("12x12");
    expect(isProjectFormat("11x14")).toBe(true);
    expect(isProjectFormat("foo")).toBe(false);
  });

  it("etiqueta y dimensiona por formato", () => {
    expect(getFormatLabel("11x8.5")).toBe('11×8.5"');
    expect(getPageDimensions("12x12")).toEqual({ w: 3600, h: 3600 });
    expect(getPageDimensions("bogus")).toEqual({ w: 3000, h: 3000 });
  });
});
