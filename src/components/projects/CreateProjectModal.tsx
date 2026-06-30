"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { calculatePricing } from "@/lib/pricing/calculator";
import { CANVAS_FORMAT_DIMENSIONS } from "@/lib/editor/canvasConfig";
import type { ProjectFormat } from "@/lib/editor/canvasConfig";
import type { PricingOutput } from "@/types/pricing";

const FORMATS: { key: ProjectFormat; label: string }[] = [
  { key: "10x10", label: "10×10\"" },
  { key: "8.5x11", label: "8.5×11\"" },
  { key: "8x10", label: "8×10\"" },
];

const COVERS: { key: "soft" | "hard"; label: string; surcharge: string }[] = [
  { key: "soft", label: "Tapa blanda", surcharge: "+0 €" },
  { key: "hard", label: "Tapa dura", surcharge: "+15 €" },
];

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const [format, setFormat] = useState<ProjectFormat>("10x10");
  const [coverType, setCoverType] = useState<"soft" | "hard">("soft");
  const [creating, setCreating] = useState(false);

  const pricing: PricingOutput = useMemo(
    () => calculatePricing({ totalPages: 10, coverType, format }),
    [format, coverType]
  );

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, cover_type: coverType }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear el proyecto");
      }

      const { data } = await res.json();
      router.push(`/editor/${data.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error inesperado");
      onClose();
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nuevo fotolibro">
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-3">Formato</h4>
          <div className="grid grid-cols-3 gap-2">
            {FORMATS.map((f) => {
              const dims = CANVAS_FORMAT_DIMENSIONS[f.key];
              const selected = format === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFormat(f.key)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-2 text-center transition-colors",
                    selected
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  )}
                >
                  <span className="text-xs font-semibold">{f.label}</span>
                  <span className="text-[10px] text-neutral-400">
                    {dims.w}×{dims.h} px
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-3">Tipo de tapa</h4>
          <div className="grid grid-cols-2 gap-2">
            {COVERS.map((c) => {
              const selected = coverType === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCoverType(c.key)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-2 text-center transition-colors",
                    selected
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  )}
                >
                  <span className="text-xs font-semibold">{c.label}</span>
                  <span className="text-[10px] text-neutral-400">
                    {c.surcharge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-neutral-600">
              Precio base (10 páginas)
            </span>
            <span className="text-sm font-semibold text-neutral-900">
              {pricing.basePrice.toFixed(2)} {pricing.currency}
            </span>
          </div>

          {pricing.coverSurcharge > 0 && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-neutral-600">Recargo tapa dura</span>
              <span className="text-sm font-semibold text-neutral-900">
                +{pricing.coverSurcharge.toFixed(2)} {pricing.currency}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
            <span className="text-sm font-semibold text-neutral-900">Total</span>
            <span className="text-lg font-bold text-primary-700">
              {pricing.total.toFixed(2)} {pricing.currency}
            </span>
          </div>
        </div>

        <Button className="w-full" onClick={handleCreate} disabled={creating}>
          {creating ? "Creando..." : "Crear fotolibro"}
        </Button>
      </div>
    </Modal>
  );
}
