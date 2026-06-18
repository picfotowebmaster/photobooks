"use client";

import { Button } from "@/components/ui/Button";
import { useEditorStore } from "@/stores/editorStore";
import { calculatePricing } from "@/lib/pricing/calculator";

interface ExportPreviewProps {
  format: "20x20" | "21x28" | "28x21";
  coverType: "soft" | "hard";
  onExport: () => void;
}

export function ExportPreview({ format, coverType, onExport }: ExportPreviewProps) {
  const { totalPages } = useEditorStore();
  const pricing = calculatePricing({ totalPages, coverType, format });

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900">Vista previa de exportación</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>
            Base ({pricing.extraPages > 0 ? `10 páginas` : `${totalPages} páginas`})
          </span>
          <span>
            {pricing.basePrice.toFixed(2)} {pricing.currency}
          </span>
        </div>

        {pricing.extraPages > 0 && (
          <div className="flex justify-between text-neutral-600">
            <span>Páginas extra ({pricing.extraPages} × {(4.99).toFixed(2)})</span>
            <span>
              {pricing.extraPagesCost.toFixed(2)} {pricing.currency}
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
