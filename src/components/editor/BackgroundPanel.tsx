"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useEditorStore } from "@/stores/editorStore";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { PatternPicker } from "./PatternPicker";
import { DEFAULT_BACKGROUND } from "@/types/pattern";
import type { PageBackground } from "@/types/editor";
import { toast } from "sonner";

const PRESET_COLORS = [
  "#ffffff",
  "#f5f5f5",
  "#e5e5e5",
  "#d4d4d4",
  "#000000",
  "#333333",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#78716c",
];

const TINT_BASE_DEFAULT = "#e5e7eb";
const TINT_ACCENT_DEFAULT = "#3b82f6";

type Section = "color" | "pattern" | "texture";

function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-neutral-500 mb-1.5">
      {children}
    </label>
  );
}

type ApplyScope = "page" | "spread" | "all";

export function BackgroundPanel() {
  const { projectId } = useParams<{ projectId: string }>();
  const currentPage = useEditorStore((s) => s.currentPage);
  const pageBackgrounds = useEditorStore((s) => s.pageBackgrounds);

  const [section, setSection] = useState<Section>("color");
  const [applyScope, setApplyScope] = useState<ApplyScope>("page");
  const [targetPage, setTargetPage] = useState(currentPage);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTargetPage(Math.floor(currentPage / 2) * 2);
  }, [currentPage]);

  const leftPage = Math.floor(currentPage / 2) * 2;
  const rightPage = leftPage + 1;
  const isLeftActive = targetPage % 2 === 0;

  const current = pageBackgrounds[targetPage] ?? DEFAULT_BACKGROUND;
  const currentColor = current.color ?? "#ffffff";

  const [hexInput, setHexInput] = useState(currentColor);
  useEffect(() => {
    setHexInput(currentColor);
  }, [currentColor]);

  const applyBackground = (bg: PageBackground) => {
    const store = useEditorStore.getState();
    const pages: number[] = [];
    if (applyScope === "all") {
      for (let i = 0; i < store.totalPages; i++) pages.push(i);
    } else if (applyScope === "spread") {
      const pair = targetPage % 2 === 0 ? targetPage + 1 : targetPage - 1;
      pages.push(targetPage);
      if (pair >= 0 && pair < store.totalPages) pages.push(pair);
    } else {
      pages.push(targetPage);
    }

    pages.forEach((p) => store.setPageBackground(p, bg));

    if (projectId) {
      const supabase = createClient();
      Promise.all(
        pages.map((p) =>
          supabase.from("project_pages").upsert(
            { project_id: projectId, page_index: p, background: bg },
            { onConflict: "project_id, page_index" }
          )
        )
      )
        .then((results) => {
          const failedResult = results.find((result) => result.error);
          if (failedResult?.error) {
            toast.error(`No se pudo guardar el fondo: ${failedResult.error.message}`);
          }
        })
        .catch((error: unknown) => {
          toast.error(
            error instanceof Error
              ? `No se pudo guardar el fondo: ${error.message}`
              : "No se pudo guardar el fondo."
          );
        });
    }
  };

  const applyColor = (color: string) => applyBackground({ type: "color", color });

  const applyPattern = (patternId: string) => {
    applyBackground({
      type: "pattern",
      patternId,
      mode: current.mode ?? "tile",
      tintBase: current.tintBase ?? TINT_BASE_DEFAULT,
      tintAccent: current.tintAccent ?? TINT_ACCENT_DEFAULT,
    });
  };

  const applyTint = (key: "tintBase" | "tintAccent", value: string) => {
    if (current.type !== "pattern" || !current.patternId) return;
    applyBackground({ ...current, [key]: value });
  };

  const applyMode = (mode: "tile" | "stretch") => {
    if (current.type === "color") return;
    applyBackground({ ...current, mode });
  };

  const handleHexSubmit = () => {
    const hex = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      applyColor(hex);
    } else {
      setHexInput(currentColor);
    }
  };

  const handleReset = () => applyBackground(DEFAULT_BACKGROUND);

  const handleTextureUpload = async (file: File) => {
    if (!projectId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);

      const res = await fetch("/api/textures", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al subir la textura");
      }

      const { data } = await res.json();
      applyBackground({
        type: "image",
        imageUrl: data.imageUrl,
        imagePath: data.imagePath,
        mode: "tile",
        color: "#ffffff",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir la textura");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const selectedPatternId = current.type === "pattern" ? current.patternId ?? null : null;
  const currentMode = current.mode ?? "tile";
  const tintBase = current.tintBase ?? TINT_BASE_DEFAULT;
  const tintAccent = current.tintAccent ?? TINT_ACCENT_DEFAULT;

  const sections: { id: Section; label: string }[] = [
    { id: "color", label: "Color" },
    { id: "pattern", label: "Patrón" },
    { id: "texture", label: "Textura" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-1 p-1 rounded-lg bg-neutral-100">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={cn(
              "flex-1 h-8 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
              section === s.id
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
            aria-pressed={section === s.id}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "color" && (
        <div className="space-y-4">
          <div>
            <FieldLabel htmlFor="background-color">Color personalizado</FieldLabel>
            <div className="flex items-center gap-2">
              <input
                id="background-color"
                type="color"
                value={currentColor}
                onChange={(e) => applyColor(e.target.value)}
                aria-label="Elegir color de fondo"
                className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0.5"
              />
              <input
                id="background-color-hex"
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onBlur={handleHexSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleHexSubmit();
                }}
                aria-label="Código hexadecimal del fondo"
                className="flex-1 h-8 rounded border border-neutral-300 bg-white px-2 text-sm text-neutral-700 font-mono"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <FieldLabel>Predefinidos</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => applyColor(color)}
                  className={cn(
                    "w-6 h-6 rounded-full border transition-transform hover:scale-110",
                    currentColor.toLowerCase() === color.toLowerCase()
                      ? "border-neutral-900 ring-1 ring-neutral-900"
                      : "border-neutral-300"
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                  aria-label={`Color ${color}`}
                  aria-pressed={currentColor.toLowerCase() === color.toLowerCase()}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "pattern" && (
        <div className="space-y-4">
          <div>
            <FieldLabel>Patrón</FieldLabel>
            <PatternPicker selectedId={selectedPatternId} onSelect={applyPattern} />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <label htmlFor="pattern-tint-base" className="text-xs text-neutral-600">Base</label>
              <input
                id="pattern-tint-base"
                type="color"
                value={tintBase}
                onChange={(e) => applyTint("tintBase", e.target.value)}
                aria-label="Color base del patrón"
                className="w-7 h-7 rounded border border-neutral-300 cursor-pointer p-0.5"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label htmlFor="pattern-tint-accent" className="text-xs text-neutral-600">Acento</label>
              <input
                id="pattern-tint-accent"
                type="color"
                value={tintAccent}
                onChange={(e) => applyTint("tintAccent", e.target.value)}
                aria-label="Color de acento del patrón"
                className="w-7 h-7 rounded border border-neutral-300 cursor-pointer p-0.5"
              />
            </div>
          </div>
        </div>
      )}

      {section === "texture" && (
        <div>
          <FieldLabel htmlFor="background-texture">Subir textura</FieldLabel>
          <input
            id="background-texture"
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleTextureUpload(file);
            }}
            className="w-full text-xs text-neutral-600 file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-neutral-900 file:text-white file:text-xs file:cursor-pointer"
          />
          {uploading && (
            <span className="block mt-2 text-xs text-neutral-400">Subiendo...</span>
          )}
        </div>
      )}

      {(section === "pattern" || section === "texture") && (
        <div>
          <FieldLabel>Modo</FieldLabel>
          <div className="flex gap-1 p-1 rounded-lg bg-neutral-100" role="group" aria-label="Modo de fondo">
            <button
              type="button"
              onClick={() => applyMode("tile")}
              className={cn(
                "flex-1 h-8 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                currentMode === "tile"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
              aria-pressed={currentMode === "tile"}
            >
              Mosaico
            </button>
            <button
              type="button"
              onClick={() => applyMode("stretch")}
              className={cn(
                "flex-1 h-8 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                currentMode === "stretch"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
              aria-pressed={currentMode === "stretch"}
            >
              Estirar
            </button>
          </div>
        </div>
      )}

      <div>
        <FieldLabel>Alcance del fondo</FieldLabel>
        <div
          className="flex gap-1 rounded-lg bg-neutral-100 p-1"
          role="group"
          aria-label="Alcance del fondo"
        >
          <button
            type="button"
            onClick={() => setApplyScope("page")}
            aria-pressed={applyScope === "page"}
            className={cn(
              "flex-1 h-8 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
              applyScope === "page"
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            Esta página
          </button>
          <button
            type="button"
            onClick={() => setApplyScope("spread")}
            aria-pressed={applyScope === "spread"}
            className={cn(
              "flex-1 h-8 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
              applyScope === "spread"
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            Este pliego
          </button>
          <button
            type="button"
            onClick={() => setApplyScope("all")}
            aria-pressed={applyScope === "all"}
            className={cn(
              "flex-1 h-8 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
              applyScope === "all"
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            Todo el libro
          </button>
        </div>
      </div>

      {applyScope !== "all" && (
        <div>
          <FieldLabel>Página de referencia</FieldLabel>
          <div className="flex gap-1 rounded-lg bg-neutral-100 p-1" role="group" aria-label="Página de referencia">
            <button
              type="button"
              onClick={() => setTargetPage(leftPage)}
              aria-pressed={isLeftActive}
              className={cn(
                "flex-1 h-8 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                isLeftActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              Página izquierda
            </button>
            <button
              type="button"
              onClick={() => setTargetPage(rightPage)}
              aria-pressed={!isLeftActive}
              className={cn(
                "flex-1 h-8 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                !isLeftActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              Página derecha
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleReset}
        className="w-full h-9 rounded-lg border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
      >
        Restablecer fondo
      </button>
    </div>
  );
}
