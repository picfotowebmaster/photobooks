import { describe, it, expect } from "vitest";
import { FORMATS } from "@/lib/editor/formats";
import { calculatePricing, validatePageCount } from "@/lib/pricing/calculator";
import { DEFAULT_PRICING_CONFIG } from "@/lib/pricing/defaults";
import type { PricingConfig } from "@/types/pricing";

const configWithCover = (price: number): PricingConfig => ({
  ...DEFAULT_PRICING_CONFIG,
  covers: DEFAULT_PRICING_CONFIG.covers.map((cover) =>
    cover.key === "pasta_dura" ? { ...cover, price } : cover
  ),
});

describe("calculatePricing", () => {
  it("usa el precio base del catálogo para cada formato", () => {
    for (const format of FORMATS) {
      const result = calculatePricing(
        { totalPages: 10, coverType: "pasta_sencilla", format: format.key },
        DEFAULT_PRICING_CONFIG
      );
      expect(result.basePrice).toBe(format.basePrice);
      expect(result.extraPagesCost).toBe(0);
      expect(result.total).toBe(format.basePrice);
    }
  });

  it("cobra el spread extra a su precio (no a 2 páginas)", () => {
    const result = calculatePricing(
      { totalPages: 14, coverType: "pasta_sencilla", format: "10x10" },
      DEFAULT_PRICING_CONFIG
    );
    expect(result.extraPages).toBe(4);
    expect(result.extraSpreads).toBe(2);
    expect(result.extraSpreadsCost).toBe(19.96);
    expect(result.extraPagesCost).toBe(19.96);
    expect(result.total).toBe(49.95);
  });

  it("cobra la página impar restante al precio por página", () => {
    const result = calculatePricing(
      { totalPages: 13, coverType: "pasta_sencilla", format: "10x10" },
      DEFAULT_PRICING_CONFIG
    );
    expect(result.extraSpreads).toBe(1);
    expect(result.extraPageRemainder).toBe(1);
    expect(result.extraPagesCost).toBe(14.97);
  });

  it("suma el recargo de la tapa elegida", () => {
    const result = calculatePricing(
      { totalPages: 10, coverType: "pasta_dura", format: "12x12" },
      configWithCover(15)
    );
    expect(result.coverName).toBe("Pasta Dura");
    expect(result.coverSurcharge).toBe(15);
    expect(result.total).toBe(58.19);
  });

  it("valida páginas y tapa", () => {
    expect(validatePageCount(9, DEFAULT_PRICING_CONFIG)).toBe(false);
    expect(validatePageCount(10, DEFAULT_PRICING_CONFIG)).toBe(true);
    expect(validatePageCount(40, DEFAULT_PRICING_CONFIG)).toBe(true);
    expect(validatePageCount(41, DEFAULT_PRICING_CONFIG)).toBe(false);

    expect(() =>
      calculatePricing(
        { totalPages: 4, coverType: "pasta_sencilla", format: "10x10" },
        DEFAULT_PRICING_CONFIG
      )
    ).toThrow();

    expect(() =>
      calculatePricing(
        { totalPages: 10, coverType: "tapa_inexistente", format: "10x10" },
        DEFAULT_PRICING_CONFIG
      )
    ).toThrow();
  });
});
