import { NextRequest, NextResponse } from "next/server";
import { calculatePricing, validatePageCount } from "@/lib/pricing/calculator";
import type { PricingInput } from "@/types/pricing";

export async function POST(request: NextRequest) {
  const body: PricingInput = await request.json();

  if (!validatePageCount(body.totalPages)) {
    return NextResponse.json(
      { error: "El número de páginas debe estar entre 10 y 40" },
      { status: 400 }
    );
  }

  if (!["soft", "hard"].includes(body.coverType)) {
    return NextResponse.json({ error: "Tipo de tapa no válido" }, { status: 400 });
  }

  if (!["10x10", "8.5x11", "8x10"].includes(body.format)) {
    return NextResponse.json({ error: "Formato no válido" }, { status: 400 });
  }

  const pricing = calculatePricing(body);
  return NextResponse.json({ data: pricing });
}
