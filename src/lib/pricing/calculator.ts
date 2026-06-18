import type { PricingInput, PricingOutput } from "@/types/pricing";

const BASE_PAGES = 10;
const MAX_PAGES = 40;
const PRICE_PER_EXTRA_PAGE = 4.99;

const BASE_PRICES: Record<PricingInput["format"], number> = {
  "20x20": 29.99,
  "21x28": 34.99,
  "28x21": 39.99,
};

const COVER_SURCHARGES: Record<PricingInput["coverType"], number> = {
  soft: 0,
  hard: 15.0,
};

export function validatePageCount(pages: number): boolean {
  return pages >= BASE_PAGES && pages <= MAX_PAGES;
}

export function calculatePricing(input: PricingInput): PricingOutput {
  if (!validatePageCount(input.totalPages)) {
    throw new Error(
      `El número de páginas debe estar entre ${BASE_PAGES} y ${MAX_PAGES}`
    );
  }

  const basePrice = BASE_PRICES[input.format];
  const extraPages = Math.max(0, input.totalPages - BASE_PAGES);
  const extraPagesCost = parseFloat(
    (extraPages * PRICE_PER_EXTRA_PAGE).toFixed(2)
  );
  const coverSurcharge = COVER_SURCHARGES[input.coverType];
  const total = parseFloat(
    (basePrice + extraPagesCost + coverSurcharge).toFixed(2)
  );

  return {
    basePrice,
    extraPages,
    extraPagesCost,
    coverSurcharge,
    total,
    currency: "EUR",
  };
}
