import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/api/admin";
import { getPricingConfig } from "@/lib/pricing/config";
import { isProjectFormat } from "@/lib/editor/formats";
import type { FormatPrice, PricingSettings } from "@/types/pricing";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const config = await getPricingConfig();
  return NextResponse.json({ data: config });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as {
    settings?: Partial<PricingSettings>;
    formats?: FormatPrice[];
  };

  const admin = createAdminClient();
  const errors: string[] = [];

  if (body.settings) {
    const number = (value: unknown, fallback: number) =>
      typeof value === "number" && Number.isFinite(value) ? value : fallback;

    const { error } = await admin.from("pricing_settings").upsert({
      id: "default",
      base_pages: number(body.settings.basePages, 10),
      max_pages: number(body.settings.maxPages, 40),
      currency: body.settings.currency || "MXN",
      default_cover_key: body.settings.defaultCoverKey || "pasta_sencilla",
    } as Record<string, unknown>);
    if (error) errors.push(error.message);
  }

  if (Array.isArray(body.formats)) {
    const rows = body.formats
      .filter((format) => isProjectFormat(format.format))
      .map((format) => ({
        format: format.format,
        base_price: Number(format.basePrice) || 0,
        extra_page_price: Number(format.extraPagePrice) || 0,
        extra_spread_price: Number(format.extraSpreadPrice) || 0,
        is_active: format.isActive !== false,
      }));

    if (rows.length > 0) {
      const { error } = await admin
        .from("format_prices")
        .upsert(rows as Record<string, unknown>[]);
      if (error) errors.push(error.message);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 500 });
  }

  const config = await getPricingConfig();
  return NextResponse.json({ data: config });
}
