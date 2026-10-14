"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageTitle } from "@/components/ui/PageTitle";
import { cn } from "@/lib/utils/cn";
import { calculatePricing } from "@/lib/pricing/calculator";
import { usePricingConfig } from "@/hooks/usePricing";
import { FORMATS, DEFAULT_FORMAT } from "@/lib/editor/formats";
import type { ProjectFormat } from "@/lib/editor/formats";
import { withSupabaseAssetApiKey } from "@/lib/supabase/assetUrl";

const MAX_COVER_BYTES = 5 * 1024 * 1024;
const COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function NewProjectPage() {
  const router = useRouter();
  const { config, loading: configLoading } = usePricingConfig();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<ProjectFormat>(DEFAULT_FORMAT);
  const [coverType, setCoverType] = useState("");
  const [previewCover, setPreviewCover] = useState<(typeof config.covers)[number] | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (coverType || config.covers.length === 0) return;
    const preferredCover = config.covers.find(
      (cover) => cover.key === config.settings.defaultCoverKey && cover.isActive
    );
    setCoverType(
      preferredCover?.key ?? config.covers.find((cover) => cover.isActive)?.key ?? ""
    );
  }, [config, coverType]);

  useEffect(() => {
    if (!coverImage) {
      setCoverPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(coverImage);
    setCoverPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [coverImage]);

  const activeCovers = useMemo(
    () => config.covers.filter((cover) => cover.isActive),
    [config.covers]
  );

  const selectedCover = activeCovers.find((cover) => cover.key === coverType);
  const pricing = useMemo(() => {
    if (!selectedCover) return null;
    try {
      return calculatePricing(
        { totalPages: config.settings.basePages, coverType, format },
        config
      );
    } catch {
      return null;
    }
  }, [config, coverType, format, selectedCover]);

  const selectCoverFile = (file?: File) => {
    if (!file) return;
    if (!COVER_TYPES.includes(file.type)) {
      setError("La portada debe ser una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_COVER_BYTES) {
      setError("La portada debe pesar menos de 5 MB.");
      return;
    }
    setError(null);
    setCoverImage(file);
  };

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectCoverFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const uploadCover = async (projectId: string) => {
    if (!coverImage) return;

    const formData = new FormData();
    formData.append("file", coverImage);
    const response = await fetch(`/api/projects/${projectId}/cover`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "No se pudo subir la portada.");
    }
  };

  const handleSubmit = async () => {
    if (creating || !selectedCover) return;
    setCreating(true);
    setError(null);

    try {
      let projectId = createdProjectId;
      if (!projectId) {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim() || undefined,
            description: description.trim() || undefined,
            format,
            cover_type: coverType,
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "No se pudo crear el fotolibro.");
        }
        projectId = result.data?.id;
        if (typeof projectId !== "string" || !projectId) {
          throw new Error("El proyecto se creó, pero no recibimos su identificador.");
        }
        setCreatedProjectId(projectId);
      }

      if (coverImage) await uploadCover(projectId);
      router.push(`/editor/${projectId}`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Ocurrió un error inesperado. Intenta de nuevo."
      );
    } finally {
      setCreating(false);
    }
  };

  const continueWithoutCover = () => {
    if (createdProjectId) router.push(`/editor/${createdProjectId}`);
  };

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <Link
        href="/projects"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <span aria-hidden="true">←</span> Mis fotolibros
      </Link>

      <div className="mb-7">
        <PageTitle>Crear un fotolibro</PageTitle>
        <p className="mt-1 text-sm text-neutral-600">
          Elige el formato, personaliza la tapa y agrega una imagen de portada si quieres.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-neutral-900">1. Datos del fotolibro</h2>
              <p className="mt-1 text-xs text-neutral-500">Puedes cambiar el nombre más adelante.</p>
            </div>
            <label htmlFor="project-title" className="mb-1.5 block text-sm font-medium text-neutral-700">
              Nombre <span className="font-normal text-neutral-400">(opcional)</span>
            </label>
            <input
              id="project-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej. Vacaciones en Oaxaca"
              maxLength={100}
              className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <details className="mt-3">
              <summary className="w-fit cursor-pointer text-xs font-medium text-primary-700 hover:text-primary-800">
                Agregar una descripción (opcional)
              </summary>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Un recuerdo, viaje o celebración…"
                maxLength={300}
                rows={2}
                className="mt-2 w-full resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </details>
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-neutral-900">2. Elige el formato</h2>
              <p className="mt-1 text-xs text-neutral-500">
                Selecciona el tamaño físico de tu fotolibro.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {FORMATS.map((item) => {
                const selected = format === item.key;
                const ratio = item.widthIn / item.heightIn;
                const previewHeight = ratio > 1 ? 46 : 58;
                const previewWidth = previewHeight * ratio;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFormat(item.key)}
                    aria-pressed={selected}
                    className={cn(
                      "flex min-h-28 items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                      selected
                        ? "border-primary-600 bg-primary-50"
                        : "border-neutral-200 hover:border-neutral-400"
                    )}
                  >
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                      <span
                        className={cn(
                          "block rounded-sm border-2 bg-white",
                          selected ? "border-primary-600" : "border-neutral-400"
                        )}
                        style={{ width: previewWidth, height: previewHeight }}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-neutral-900">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500">
                        {item.orientation === "portrait"
                          ? "Vertical"
                          : item.orientation === "landscape"
                            ? "Horizontal"
                            : "Cuadrado"}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500">
                        {item.widthIn} × {item.heightIn} pulgadas
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-neutral-900">3. Elige el tipo de tapa</h2>
              <p className="mt-1 text-xs text-neutral-500">
                El precio de la tapa se muestra antes de crear tu fotolibro.
              </p>
            </div>
            {configLoading ? (
              <p className="text-sm text-neutral-500" role="status">Cargando opciones de tapa…</p>
            ) : activeCovers.length === 0 ? (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800" role="alert">
                Por el momento no hay tipos de tapa disponibles. Intenta más tarde.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {activeCovers.map((cover) => {
                  const selected = coverType === cover.key;
                  return (
                    <div
                      key={cover.key}
                      className={cn(
                        "overflow-hidden rounded-xl border-2 text-left transition-colors",
                        selected
                          ? "border-primary-600 bg-primary-50"
                          : "border-neutral-200 hover:border-neutral-400"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewCover(cover)}
                        aria-label={`Ampliar imagen de ${cover.name}`}
                        className="group relative flex h-36 w-full items-center justify-center bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                      >
                        {cover.imageUrl ? (
                          <img
                            src={withSupabaseAssetApiKey(cover.imageUrl)}
                            alt={`Vista ampliada: ${cover.name}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm text-neutral-400">Vista previa no disponible</span>
                        )}
                        <span
                          aria-hidden="true"
                          className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-medium text-neutral-800 shadow-sm transition-colors group-hover:bg-white"
                        >
                          <Eye size={16} strokeWidth={2} />
                          Ver
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverType(cover.key)}
                        aria-pressed={selected}
                        className="block w-full px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                      >
                        <span className="block text-sm font-semibold text-neutral-900">
                          {cover.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-neutral-500">
                          {cover.description || "Tipo de tapa"}
                        </span>
                        <span className="mt-1 block text-xs text-neutral-500">
                          {cover.price > 0
                            ? `+${cover.price.toFixed(2)} ${config.settings.currency}`
                            : "Sin recargo"}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-neutral-900">4. Imagen de portada</h2>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Sube una imagen para identificar tu proyecto. Es opcional y podrás cambiarla después.
            </p>
            <input
              id="cover-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
              className="sr-only"
              aria-label="Seleccionar imagen de portada"
            />
            <label
              htmlFor="cover-image"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                selectCoverFile(event.dataTransfer.files[0]);
              }}
              className="mt-4 flex min-h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-center transition-colors hover:border-primary-500 hover:bg-primary-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500"
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Vista previa de la portada seleccionada"
                  className="h-52 w-full object-cover"
                />
              ) : (
                <span className="px-5 py-8">
                  <span className="mb-2 block text-3xl text-neutral-400" aria-hidden="true">＋</span>
                  <span className="block text-sm font-semibold text-primary-700">
                    Seleccionar imagen
                  </span>
                  <span className="mt-1 block text-xs text-neutral-500">
                    También puedes arrastrarla aquí
                  </span>
                  <span className="mt-2 block text-[11px] text-neutral-400">
                    JPG, PNG o WebP · Máximo 5 MB
                  </span>
                </span>
              )}
            </label>
            {coverImage && (
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="truncate text-xs text-neutral-600">{coverImage.name}</span>
                <button
                  type="button"
                  onClick={() => setCoverImage(null)}
                  className="shrink-0 text-xs font-medium text-neutral-600 underline underline-offset-2 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  Quitar
                </button>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-neutral-900">Resumen</h2>
            {pricing ? (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-neutral-600">{FORMATS.find((item) => item.key === format)?.label}</span>
                  <span className="font-medium text-neutral-900">
                    {pricing.basePrice.toFixed(2)} {pricing.currency}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-neutral-600">
                    {pricing.coverName}
                  </span>
                  <span className="font-medium text-neutral-900">
                    {pricing.coverSurcharge > 0
                      ? `+${pricing.coverSurcharge.toFixed(2)} ${pricing.currency}`
                      : "Incluida"}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Incluye {pricing.basePages} páginas. El total puede cambiar al elegir páginas adicionales.
                </p>
                <div className="flex justify-between border-t border-neutral-200 pt-3">
                  <span className="font-semibold text-neutral-900">Precio base</span>
                  <span className="text-lg font-bold text-primary-700">
                    {pricing.total.toFixed(2)} {pricing.currency}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">
                El precio estará disponible cuando haya una tapa activa.
              </p>
            )}
          </section>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={creating || configLoading || !selectedCover}
            >
              {creating
                ? coverImage && createdProjectId
                  ? "Subiendo portada…"
                  : "Creando fotolibro…"
                : createdProjectId
                  ? coverImage
                    ? "Reintentar y abrir editor"
                    : "Abrir editor"
                  : "Crear y empezar a diseñar"}
            </Button>
            {createdProjectId && coverImage && !creating && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={continueWithoutCover}
              >
                Continuar sin portada
              </Button>
            )}
            <Link
              href="/projects"
              className="block py-2 text-center text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              Cancelar
            </Link>
          </div>
        </aside>
      </div>

      <Modal
        open={previewCover !== null}
        onClose={() => setPreviewCover(null)}
        title={previewCover?.name}
        className="max-w-3xl"
      >
        {previewCover && (
          <div>
            {previewCover.imageUrl ? (
              <img
                src={withSupabaseAssetApiKey(previewCover.imageUrl)}
                alt={`Imagen ampliada de ${previewCover.name}`}
                className="max-h-[70vh] w-full rounded-lg bg-neutral-100 object-contain"
              />
            ) : (
              <div className="flex min-h-48 items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-500">
                Vista previa no disponible
              </div>
            )}
            {previewCover.description && (
              <p className="mt-3 text-sm text-neutral-600">{previewCover.description}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
