import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase/server";
import { getPricingConfig } from "@/lib/pricing/config";
import { calculatePricing, validatePageCount } from "@/lib/pricing/calculator";
import { isProjectFormat } from "@/lib/editor/formats";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    totalPages?: number;
    coverType?: string;
  };

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  if (!isProjectFormat(project.format)) {
    return NextResponse.json({ error: "Formato no válido" }, { status: 400 });
  }

  const config = await getPricingConfig();
  const totalPages = Number(body.totalPages);
  const coverType =
    typeof body.coverType === "string" && body.coverType
      ? body.coverType
      : project.cover_type;

  if (!validatePageCount(totalPages, config)) {
    return NextResponse.json(
      {
        error: `El número de páginas debe estar entre ${config.settings.basePages} y ${config.settings.maxPages}`,
      },
      { status: 400 }
    );
  }

  let pricing;
  try {
    pricing = calculatePricing(
      { totalPages, coverType, format: project.format },
      config
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error de cálculo" },
      { status: 400 }
    );
  }

  const { error: orderError } = await supabase
    .from("orders")
    .upsert(
      {
        user_id: user.id,
        project_id: id,
        total_pages: totalPages,
        base_price: pricing.basePrice,
        extra_pages_cost: pricing.extraPagesCost,
        cover_surcharge: pricing.coverSurcharge,
        total_amount: pricing.total,
        payment_status: "pending",
      } as Record<string, unknown>,
      { onConflict: "project_id" }
    );

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe no está configurado" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-03-31.basil" as Stripe.LatestApiVersion,
  });

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: config.settings.currency.toLowerCase(),
          unit_amount: Math.round(pricing.total * 100),
          product_data: {
            name: `Fotolibro ${project.title}`,
            description: `${pricing.format} · ${pricing.totalPages} páginas · ${pricing.coverName}`,
          },
        },
      },
    ],
    metadata: { projectId: id, userId: user.id },
    success_url: `${origin}/projects/${id}?paid=1`,
    cancel_url: `${origin}/checkout/${id}`,
  });

  await supabase
    .from("orders")
    .update({ stripe_session_id: session.id } as Record<string, unknown>)
    .eq("project_id", id);

  return NextResponse.json({ url: session.url });
}
