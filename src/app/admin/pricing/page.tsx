"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/Button";
import { CoverTypesManager } from "@/components/admin/CoverTypesManager";
import { invalidatePricingConfig } from "@/hooks/usePricing";
import { FORMATS } from "@/lib/editor/formats";
import { cn } from "@/lib/utils/cn";
import type { CoverType, FormatPrice, PricingConfig } from "@/types/pricing";

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

type Tab = "formats" | "covers";

export default function AdminPricingPage() {
  const [tab, setTab] = useState<Tab>("formats");
  const [settings, setSettings] = useState<PricingConfig["settings"] | null>(null);
  const [formats, setFormats] = useState<FormatPrice[]>([]);
  const [covers, setCovers] = useState<CoverType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/pricing")
      .then((res) => res.json())
      .then((payload) => {
        if (payload.error) throw new Error(payload.error);
        const config = payload.data as PricingConfig;
        setSettings(config.settings);
        setCovers(config.covers);
        const byFormat = new Map(config.formats.map((f) => [f.format, f]));
        setFormats(
          FORMATS.map(
            (format) =>
              byFormat.get(format.key) ?? {
                format: format.key,
                basePrice: format.basePrice,
                extraPagePrice: 4.99,
                extraSpreadPrice: 9.98,
                isActive: true,
              }
          )
        );
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateFormat = (format: FormatPrice["format"], patch: Partial<FormatPrice>) => {
    setFormats((prev) =>
      prev.map((f) => (f.format === format ? { ...f, ...patch } : f))
    );
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, formats }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Error al guardar");
      invalidatePricingConfig();
      setMessage("Precios guardados");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <p className="text-sm text-neutral-400">Cargando precios...</p>;
  }

  return (
    <div className="space-y-6">
      <PageTitle>Precios</PageTitle>

      <div className="flex gap-2 border-b border-neutral-200">
        {(
          [
            { id: "formats", label: "Formatos y general" },
            { id: "covers", label: "Tapas" },
          ] as { id: Tab; label: string }[]
        ).map((entry) => (
          <button
            key={entry.id}
            onClick={() => setTab(entry.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === entry.id
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      {message && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </div>
      )}

      {tab === "formats" && (
        <>
          <section className="rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-neutral-800">General</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <label className="text-xs text-neutral-600">
                Páginas base
                <input
                  type="number"
                  className={inputClass}
                  value={settings.basePages}
                  onChange={(e) =>
                    setSettings({ ...settings, basePages: Number(e.target.value) || 0 })
                  }
                />
              </label>
              <label className="text-xs text-neutral-600">
                Páginas máximo
                <input
                  type="number"
                  className={inputClass}
                  value={settings.maxPages}
                  onChange={(e) =>
                    setSettings({ ...settings, maxPages: Number(e.target.value) || 0 })
                  }
                />
              </label>
              <label className="text-xs text-neutral-600">
                Moneda
                <input
                  className={inputClass}
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                />
              </label>
              <label className="text-xs text-neutral-600">
                Tapa por defecto
                <select
                  className={inputClass}
                  value={settings.defaultCoverKey}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultCoverKey: e.target.value })
                  }
                >
                  {covers.map((cover) => (
                    <option key={cover.key} value={cover.key}>
                      {cover.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-3 py-2 text-left">Formato</th>
                  <th className="px-3 py-2 text-left">Precio base</th>
                  <th className="px-3 py-2 text-left">Página extra</th>
                  <th className="px-3 py-2 text-left">Spread extra</th>
                  <th className="px-3 py-2 text-center">Activo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {formats.map((format) => (
                  <tr key={format.format}>
                    <td className="px-3 py-2 font-medium text-neutral-800">
                      {format.format}
                    </td>
                    <td className="w-32 px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        className={inputClass}
                        value={format.basePrice}
                        onChange={(e) =>
                          updateFormat(format.format, {
                            basePrice: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td className="w-32 px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        className={inputClass}
                        value={format.extraPagePrice}
                        onChange={(e) =>
                          updateFormat(format.format, {
                            extraPagePrice: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td className="w-32 px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        className={inputClass}
                        value={format.extraSpreadPrice}
                        onChange={(e) =>
                          updateFormat(format.format, {
                            extraSpreadPrice: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={format.isActive}
                        onChange={(e) =>
                          updateFormat(format.format, { isActive: e.target.checked })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              {saving ? "Guardando..." : "Guardar precios"}
            </Button>
          </div>
        </>
      )}

      {tab === "covers" && <CoverTypesManager />}
    </div>
  );
}
