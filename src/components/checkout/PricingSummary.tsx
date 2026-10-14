import type { PricingOutput } from "@/types/pricing";

interface PricingSummaryProps {
  pricing: PricingOutput;
}

export function PricingSummary({ pricing }: PricingSummaryProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-3">
      <h3 className="text-lg font-semibold text-neutral-900">Resumen del pedido</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>Base ({pricing.basePages} páginas)</span>
          <span>
            {pricing.basePrice.toFixed(2)} {pricing.currency}
          </span>
        </div>

        {pricing.extraSpreads > 0 && (
          <div className="flex justify-between text-neutral-600">
            <span>Spreads extra ({pricing.extraSpreads})</span>
            <span>
              {pricing.extraSpreadsCost.toFixed(2)} {pricing.currency}
            </span>
          </div>
        )}

        {pricing.extraPageRemainder > 0 && (
          <div className="flex justify-between text-neutral-600">
            <span>Página extra ({pricing.extraPageRemainder})</span>
            <span>
              {(pricing.extraPagesCost - pricing.extraSpreadsCost).toFixed(2)}{" "}
              {pricing.currency}
            </span>
          </div>
        )}

        {pricing.coverSurcharge > 0 && (
          <div className="flex justify-between text-neutral-600">
            <span>{pricing.coverName}</span>
            <span>
              +{pricing.coverSurcharge.toFixed(2)} {pricing.currency}
            </span>
          </div>
        )}

        {pricing.coverSurcharge > 0 && (
          <div className="flex justify-between text-neutral-600">
            <span>Recargo por tapa dura</span>
            <span>
              {pricing.coverSurcharge.toFixed(2)} {pricing.currency}
            </span>
          </div>
        )}

        <hr className="border-neutral-200" />

        <div className="flex justify-between font-semibold text-neutral-900 text-base">
          <span>Total</span>
          <span>
            {pricing.total.toFixed(2)} {pricing.currency}
          </span>
        </div>
      </div>
    </div>
  );
}
