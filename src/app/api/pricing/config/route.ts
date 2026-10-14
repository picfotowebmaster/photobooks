import { NextResponse } from "next/server";
import { getPricingConfig } from "@/lib/pricing/config";

export async function GET() {
  const config = await getPricingConfig();

  return NextResponse.json({
    data: {
      ...config,
      formats: config.formats.filter((format) => format.isActive),
      covers: config.covers.filter((cover) => cover.isActive),
    },
  });
}
