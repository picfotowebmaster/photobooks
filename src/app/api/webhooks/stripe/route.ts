import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, isStripeEnabled } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  if (!isStripeEnabled() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe no está configurado" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json(
      { error: `La verificación de la firma del webhook falló: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const projectId = session.metadata?.projectId;
    const userId = session.metadata?.userId;

    if (!projectId || !userId) {
      return NextResponse.json({ error: "Metadatos faltantes" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { error: orderError } = await admin
      .from("orders")
      .update({
        payment_status: "paid",
        stripe_session_id: session.id,
        paid_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq("project_id", projectId);

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const { error: projectError } = await admin
      .from("projects")
      .update({ status: "paid" } as Record<string, unknown>)
      .eq("id", projectId);

    if (projectError) {
      return NextResponse.json(
        { error: projectError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
