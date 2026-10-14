"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { invalidatePricingConfig } from "@/hooks/usePricing";
import { withSupabaseAssetApiKey } from "@/lib/supabase/assetUrl";
import type { CoverType } from "@/types/pricing";

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

export function CoverTypesManager() {
  const [covers, setCovers] = useState<CoverType[]>([]);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [newCover, setNewCover] = useState({ name: "", price: "", sortOrder: "" });
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cover-types");
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Error al cargar tapas");
      setCovers(payload.data ?? []);
      setDirty(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (id: string, patch: Partial<CoverType>) => {
    setCovers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    setDirty((prev) => new Set(prev).add(id));
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      for (const cover of covers.filter((c) => dirty.has(c.id))) {
        const res = await fetch(`/api/admin/cover-types/${cover.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: cover.name,
            description: cover.description,
            price: cover.price,
            sortOrder: cover.sortOrder,
            isActive: cover.isActive,
          }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Error al guardar tapa");
      }
      invalidatePricingConfig();
      await load();
      setMessage("Tapas guardadas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  const addCover = async () => {
    if (!newCover.name.trim()) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cover-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCover.name.trim(),
          price: Number(newCover.price) || 0,
          sortOrder: Number(newCover.sortOrder) || covers.length + 1,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Error al crear tapa");
      invalidatePricingConfig();
      await load();
      setNewCover({ name: "", price: "", sortOrder: "" });
      setMessage("Tapa creada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (id: string, file: File | undefined) => {
    if (!file) return;
    setUploadingId(id);
    setError(null);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("coverId", id);
      const res = await fetch("/api/admin/cover-types/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Error al subir la imagen");
      invalidatePricingConfig();
      await load();
      setMessage("Imagen actualizada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setUploadingId(null);
    }
  };

  const removeCover = async (id: string) => {
    if (!confirm("¿Eliminar esta tapa?")) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/cover-types/${id}`, { method: "DELETE" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Error al eliminar");
      invalidatePricingConfig();
      await load();
      setMessage("Tapa eliminada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-neutral-400">Cargando tapas...</p>;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      {message && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-3 py-2 text-left">Orden</th>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Key</th>
              <th className="px-3 py-2 text-left">Muestra</th>
              <th className="px-3 py-2 text-left">Precio</th>
              <th className="px-3 py-2 text-center">Activa</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {covers.map((cover) => (
              <tr key={cover.id}>
                <td className="px-3 py-2 w-20">
                  <input
                    type="number"
                    className={inputClass}
                    value={cover.sortOrder}
                    onChange={(e) =>
                      update(cover.id, { sortOrder: Number(e.target.value) || 0 })
                    }
                  />
                </td>
                <td className="px-3 py-2 min-w-[220px]">
                  <input
                    className={inputClass}
                    value={cover.name}
                    onChange={(e) => update(cover.id, { name: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2 text-xs text-neutral-400">{cover.key}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
                      {cover.imageUrl ? (
                        <img
                          src={withSupabaseAssetApiKey(cover.imageUrl)}
                          alt={cover.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer text-xs font-medium text-primary-700 hover:underline">
                      {uploadingId === cover.id
                        ? "Subiendo..."
                        : cover.imageUrl
                          ? "Cambiar"
                          : "Subir"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={uploadingId === cover.id}
                        onChange={(e) => {
                          uploadImage(cover.id, e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </td>
                <td className="px-3 py-2 w-28">
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    value={cover.price}
                    onChange={(e) =>
                      update(cover.id, { price: Number(e.target.value) || 0 })
                    }
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={cover.isActive}
                    onChange={(e) => update(cover.id, { isActive: e.target.checked })}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCover(cover.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-end gap-2 rounded-xl border border-neutral-200 bg-white p-3">
        <label className="flex-1 text-xs text-neutral-600">
          Nueva tapa
          <input
            className={inputClass}
            placeholder="Nombre de la tapa"
            value={newCover.name}
            onChange={(e) => setNewCover({ ...newCover, name: e.target.value })}
          />
        </label>
        <label className="w-28 text-xs text-neutral-600">
          Precio
          <input
            type="number"
            step="0.01"
            className={inputClass}
            value={newCover.price}
            onChange={(e) => setNewCover({ ...newCover, price: e.target.value })}
          />
        </label>
        <Button variant="secondary" onClick={addCover} disabled={saving}>
          Añadir
        </Button>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveAll} disabled={saving || dirty.size === 0}>
          {saving ? "Guardando..." : "Guardar tapas"}
        </Button>
      </div>
    </div>
  );
}
