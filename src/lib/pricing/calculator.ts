import type { PricingConfig, PricingInput, PricingOutput } from "@/types/pricing";
import { DEFAULT_PRICING_CONFIG } from "./defaults";

function round(value: number): number {
  return parseFloat(value.toFixed(2));
}

export function validatePageCount(
  pages: number,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): boolean {
  return (
    Number.isFinite(pages) &&
    pages >= config.settings.basePages &&
    pages <= config.settings.maxPages
  );
}

export function calculatePricing(
  input: PricingInput,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): PricingOutput {
  const { basePages, currency } = config.settings;

  if (!validatePageCount(input.totalPages, config)) {
    throw new Error(
      `El número de páginas debe estar entre ${basePages} y ${config.settings.maxPages}`
    );
  }

  const formatPrice =
    config.formats.find(
      (format) => format.format === input.format && format.isActive
    ) ?? config.formats.find((format) => format.format === input.format);

  if (!formatPrice) {
    throw new Error("Formato no válido");
  }

  const cover = config.covers.find((entry) => entry.key === input.coverType);
  if (!cover || !cover.isActive) {
    throw new Error("Tipo de tapa no válido");
  }

  const extraPages = Math.max(0, input.totalPages - basePages);
  const extraSpreads = Math.floor(extraPages / 2);
  const extraPageRemainder = extraPages % 2;

  const extraSpreadsCost = round(extraSpreads * formatPrice.extraSpreadPrice);
  const extraPagesCost = round(
    extraSpreadsCost + extraPageRemainder * formatPrice.extraPagePrice
  );

  const { basePrice } = formatPrice;
  const coverSurcharge = cover.price;
  const total = round(basePrice + extraPagesCost + coverSurcharge);

  return {
    basePrice,
    basePages,
    totalPages: input.totalPages,
    extraPages,
    extraSpreads,
    extraSpreadsCost,
    extraPageRemainder,
    extraPagesCost,
    format: input.format,
    coverType: cover.key,
    coverName: cover.name,
    coverSurcharge,
    total,
    currency,
  };
}
