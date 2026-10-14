import { FORMATS } from "@/lib/editor/formats";
import type { CoverType, FormatPrice, PricingConfig } from "@/types/pricing";
import coversJson from "./coverTypes.json";

export const DEFAULT_EXTRA_PAGE_PRICE = 4.99;
export const DEFAULT_EXTRA_SPREAD_PRICE = 9.98;

export const DEFAULT_PRICING_SETTINGS = {
  basePages: 10,
  maxPages: 40,
  currency: "MXN",
  defaultCoverKey: "pasta_sencilla",
} as const;

export const DEFAULT_COVER_TYPES: CoverType[] = coversJson.map((cover, index) => ({
  id: `default-${cover.key}`,
  key: cover.key,
  name: cover.name,
  description: cover.description ?? null,
  imageUrl: null,
  price: cover.price ?? 0,
  sortOrder: cover.sortOrder ?? index + 1,
  isActive: true,
}));

export const DEFAULT_FORMAT_PRICES: FormatPrice[] = FORMATS.map((format) => ({
  format: format.key,
  basePrice: format.basePrice,
  extraPagePrice: DEFAULT_EXTRA_PAGE_PRICE,
  extraSpreadPrice: DEFAULT_EXTRA_SPREAD_PRICE,
  isActive: true,
}));

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  settings: { ...DEFAULT_PRICING_SETTINGS },
  formats: DEFAULT_FORMAT_PRICES,
  covers: DEFAULT_COVER_TYPES,
};

/** Best-effort cover name from the built-in catalog (before DB config loads). */
export function getDefaultCoverName(key: string | null | undefined): string {
  if (!key) return "";
  return DEFAULT_COVER_TYPES.find((cover) => cover.key === key)?.name ?? key;
}

export function slugifyCoverName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}
