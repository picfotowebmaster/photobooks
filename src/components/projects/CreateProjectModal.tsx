"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { calculatePricing } from "@/lib/pricing/calculator";
import { usePricingConfig } from "@/hooks/usePricing";
import { FORMATS, DEFAULT_FORMAT } from "@/lib/editor/formats";
import type { ProjectFormat } from "@/lib/editor/formats";
import { withSupabaseAssetApiKey } from "@/lib/supabase/assetUrl";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const { config, loading: configLoading } = usePricingConfig();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<ProjectFormat>(DEFAULT_FORMAT);
  const [coverType, setCoverType] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (coverType || config.covers.length === 0) return;
    setCoverType(config.settings.defaultCoverKey || config.covers[0].key);
  }, [config, coverType]);

  const pricing = useMemo(() => {
    try {
      return calculatePricing(
        {
          totalPages: config.settings.basePages,
          coverType,
          format,
        },
        config
      );
    } catch {
      return null;
    }
  }, [format, coverType, config]);

  const selectedCover = config.covers.find((c) => c.key === coverType);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          format,
          cover_type: coverType,
        }),
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
          <label className="text-sm font-medium text-neutral-700 block mb-1">
            Nombre
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Fotolibro sin título"
            maxLength={100}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">
            Descripción <span className="text-neutral-400 font-normal">(opcional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe tu fotolibro..."
            maxLength={300}
            rows={2}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-3">Formato</h4>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {FORMATS.map((f) => {
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
                    {f.w}×{f.h} px
                  </span>
                  <span className="text-[10px] capitalize text-neutral-400">
                    {f.orientation === "portrait"
                      ? "Vertical"
                      : f.orientation === "landscape"
                        ? "Horizontal"
                        : "Cuadrado"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-3">Tipo de tapa</h4>
          {configLoading ? (
            <p className="text-xs text-neutral-400">Cargando tapas...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {config.covers.map((c) => {
                  const selected = coverType === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setCoverType(c.key)}
                      className={cn(
                        "flex flex-col overflow-hidden rounded-lg border-2 text-left transition-colors",
                        selected
                          ? "border-primary-600 ring-2 ring-primary-100"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <div className="aspect-[3/4] w-full bg-neutral-100">
                        {c.imageUrl ? (
                          <img
                            src={withSupabaseAssetApiKey(c.imageUrl)}
                            alt={`Tapa ${c.name}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                            Sin imagen
                          </div>
                        )}
                      </div>
                      <div
                        className={cn(
                          "px-2 py-1.5",
                          selected ? "bg-primary-50" : "bg-white"
                        )}
                      >
                        <span className="block text-xs font-semibold leading-tight text-neutral-800">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {c.price > 0 ? `+${c.price.toFixed(2)}` : "Sin recargo"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedCover && (
                <div className="mt-3 flex gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <div className="h-24 w-[72px] shrink-0 overflow-hidden rounded-md bg-neutral-100">
                    {selectedCover.imageUrl ? (
                      <img
                        src={withSupabaseAssetApiKey(selectedCover.imageUrl)}
                        alt={`Vista previa de ${selectedCover.name}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-800">
                      {selectedCover.name}
                    </p>
                    {selectedCover.description && (
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {selectedCover.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-neutral-200 pt-4">
          {pricing ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-neutral-600">
                  Precio base ({pricing.basePages} páginas)
                </span>
                <span className="text-sm font-semibold text-neutral-900">
                  {pricing.basePrice.toFixed(2)} {pricing.currency}
                </span>
              </div>

              {pricing.coverSurcharge > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-neutral-600">
                    {pricing.coverName}
                  </span>
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
            </>
          ) : (
            <p className="text-xs text-neutral-400">Selecciona un formato y una tapa.</p>
          )}
        </div>

        <Button
          className="w-full"
          onClick={handleCreate}
          disabled={creating || !coverType}
        >
          {creating ? "Creando..." : "Crear fotolibro"}
        </Button>
      </div>
    </Modal>
  );
}
