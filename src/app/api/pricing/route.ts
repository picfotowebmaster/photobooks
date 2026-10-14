import { NextRequest, NextResponse } from "next/server";
import { calculatePricing, validatePageCount } from "@/lib/pricing/calculator";
import { getPricingConfig } from "@/lib/pricing/config";
import { isProjectFormat } from "@/lib/editor/formats";
import type { PricingInput } from "@/types/pricing";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as PricingInput;
  const config = await getPricingConfig();

  if (!isProjectFormat(body.format)) {
    return NextResponse.json({ error: "Formato no válido" }, { status: 400 });
  }

  if (!validatePageCount(body.totalPages, config)) {
    return NextResponse.json(
      {
        error: `El número de páginas debe estar entre ${config.settings.basePages} y ${config.settings.maxPages}`,
      },
      { status: 400 }
    );
  }

  const cover = config.covers.find(
    (entry) => entry.key === body.coverType && entry.isActive
  );
  if (!cover) {
    return NextResponse.json(
      { error: "Tipo de tapa no válido" },
      { status: 400 }
    );
  }

  try {
    const pricing = calculatePricing(body, config);
    return NextResponse.json({ data: pricing });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error de cálculo" },
      { status: 400 }
    );
  }
}
