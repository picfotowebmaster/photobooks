"use client";

import { Button } from "@/components/ui/Button";
import { useEditorStore } from "@/stores/editorStore";
import { usePricing } from "@/hooks/usePricing";
import type { ProjectFormat } from "@/lib/editor/formats";

interface ExportPreviewProps {
  format: ProjectFormat;
  coverType: string;
  onExport: () => void;
}

export function ExportPreview({ format, coverType, onExport }: ExportPreviewProps) {
  const { totalPages } = useEditorStore();
  const { pricing } = usePricing({ totalPages, coverType, format });

  if (!pricing) {
    return (
      <div className="p-6 text-sm text-neutral-500">
        No se pudo calcular el precio. Revisa la configuración.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900">Vista previa de exportación</h3>

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

        <div className="flex justify-between font-semibold text-neutral-900 border-t border-neutral-200 pt-2">
          <span>Total</span>
          <span>
            {pricing.total.toFixed(2)} {pricing.currency}
          </span>
        </div>
      </div>

      <Button className="w-full" onClick={onExport}>
        Ir al pago
      </Button>
    </div>
  );
}
