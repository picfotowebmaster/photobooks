import { createAdminClient } from "@/lib/supabase/admin";
import { resolveFormat } from "@/lib/editor/formats";
import { DEFAULT_PRICING_CONFIG } from "./defaults";
import type { CoverType, FormatPrice, PricingConfig } from "@/types/pricing";

type SettingsRow = {
  base_pages: number;
  max_pages: number;
  currency: string;
  default_cover_key: string;
};

type FormatRow = {
  format: string;
  base_price: number;
  extra_page_price: number;
  extra_spread_price: number;
  is_active: boolean;
};

type CoverRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  sort_order: number;
  is_active: boolean;
};

/** Map a raw `cover_types` row (snake_case) to the client-side `CoverType`. */
export function mapCoverRow(row: CoverRow): CoverType {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url ?? null,
    price: Number(row.price),
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

/**
 * Load the pricing configuration from the database.
 * Falls back to the built-in defaults when the tables are missing or empty,
 * so the app keeps working before the pricing migration is applied.
 */
export async function getPricingConfig(): Promise<PricingConfig> {
  try {
    const supabase = createAdminClient();

    const [settingsRes, formatsRes, coversRes] = await Promise.all([
      supabase.from("pricing_settings").select("*").eq("id", "default").maybeSingle(),
      supabase.from("format_prices").select("*"),
      supabase.from("cover_types").select("*").order("sort_order"),
    ]);

    if (settingsRes.error || formatsRes.error || coversRes.error) {
      return DEFAULT_PRICING_CONFIG;
    }

    const settingsRow = settingsRes.data as SettingsRow | null;
    const formatRows = (formatsRes.data as FormatRow[] | null) ?? [];
    const coverRows = (coversRes.data as CoverRow[] | null) ?? [];

    if (!settingsRow || formatRows.length === 0 || coverRows.length === 0) {
      return DEFAULT_PRICING_CONFIG;
    }

    const formats: FormatPrice[] = formatRows.map((row) => ({
      format: resolveFormat(row.format),
      basePrice: Number(row.base_price),
      extraPagePrice: Number(row.extra_page_price),
      extraSpreadPrice: Number(row.extra_spread_price),
      isActive: row.is_active,
    }));

    const covers: CoverType[] = coverRows.map(mapCoverRow);

    return {
      settings: {
        basePages: settingsRow.base_pages,
        maxPages: settingsRow.max_pages,
        currency: settingsRow.currency,
        defaultCoverKey: settingsRow.default_cover_key,
      },
      formats,
      covers,
    };
  } catch {
    return DEFAULT_PRICING_CONFIG;
  }
}
