import Stripe from "stripe";

let cached: Stripe | null = null;

export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe no está configurado");
  }
  if (!cached) {
    cached = new Stripe(secretKey, {
      apiVersion: "2025-03-31.basil" as Stripe.LatestApiVersion,
    });
  }
  return cached;
}
