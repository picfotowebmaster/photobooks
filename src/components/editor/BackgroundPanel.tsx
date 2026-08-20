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

export function BackgroundPanel() {
  const { projectId } = useParams<{ projectId: string }>();
  const currentPage = useEditorStore((s) => s.currentPage);
  const pageBackgrounds = useEditorStore((s) => s.pageBackgrounds);

  const [section, setSection] = useState<Section>("color");
  const [applyToSpread, setApplyToSpread] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);
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
    if (applyToAll) {
      for (let i = 0; i < store.totalPages; i++) pages.push(i);
    } else if (applyToSpread) {
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
      ).catch(() => toast.error("Error al guardar el fondo"));
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
    <div className="border-b border-neutral-200 bg-neutral-50">
      <div className="flex items-center gap-1.5 px-4 py-1.5">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={cn(
              "h-7 px-2 rounded text-xs font-medium transition-colors",
              section === s.id
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            {s.label}
          </button>
        ))}

        <div className="w-px h-5 bg-neutral-200 mx-1" />

        {section === "color" && (
          <>
            <div className="relative">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => applyColor(e.target.value)}
                className="w-7 h-7 rounded border border-neutral-300 cursor-pointer p-0.5"
              />
            </div>

            <div className="flex items-center gap-0.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => applyColor(color)}
                  className={cn(
                    "w-4 h-4 rounded-full border transition-transform hover:scale-110",
                    currentColor.toLowerCase() === color.toLowerCase()
                      ? "border-neutral-900 ring-1 ring-neutral-900"
                      : "border-neutral-300"
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            <input
              type="text"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={handleHexSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleHexSubmit();
              }}
              className="w-[72px] h-7 rounded border border-neutral-300 bg-white px-1.5 text-xs text-neutral-700 font-mono"
              placeholder="#ffffff"
            />
          </>
        )}

        {section === "pattern" && (
          <>
            <PatternPicker selectedId={selectedPatternId} onSelect={applyPattern} />

            <div className="flex items-center gap-1 text-xs text-neutral-600 ml-2">
              <span>Base</span>
              <input
                type="color"
                value={tintBase}
                onChange={(e) => applyTint("tintBase", e.target.value)}
                className="w-6 h-6 rounded border border-neutral-300 cursor-pointer p-0.5"
              />
              <span className="ml-1">Acento</span>
              <input
                type="color"
                value={tintAccent}
                onChange={(e) => applyTint("tintAccent", e.target.value)}
                className="w-6 h-6 rounded border border-neutral-300 cursor-pointer p-0.5"
              />
            </div>
          </>
        )}

        {section === "texture" && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleTextureUpload(file);
              }}
              className="text-xs text-neutral-600 file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-neutral-900 file:text-white file:text-xs file:cursor-pointer"
            />
            {uploading && <span className="text-xs text-neutral-400">Subiendo...</span>}
          </>
        )}

        {(section === "pattern" || section === "texture") && (
          <>
            <div className="w-px h-5 bg-neutral-200 ml-1" />
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => applyMode("tile")}
                className={cn(
                  "h-7 px-2 rounded text-xs font-medium transition-colors",
                  currentMode === "tile"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                Mosaico
              </button>
              <button
                type="button"
                onClick={() => applyMode("stretch")}
                className={cn(
                  "h-7 px-2 rounded text-xs font-medium transition-colors",
                  currentMode === "stretch"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                Estirar
              </button>
            </div>
          </>
        )}

        <div className="w-px h-5 bg-neutral-200 ml-1" />

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setTargetPage(leftPage)}
            className={cn(
              "h-7 px-2 rounded text-xs font-medium transition-colors",
              isLeftActive ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            Izq
          </button>
          <button
            type="button"
            onClick={() => setTargetPage(rightPage)}
            className={cn(
              "h-7 px-2 rounded text-xs font-medium transition-colors",
              !isLeftActive ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            Der
          </button>
        </div>

        <label
          className={cn(
            "flex items-center gap-1 text-xs text-neutral-600 cursor-pointer",
            applyToAll && "opacity-40 pointer-events-none"
          )}
        >
          <input
            type="checkbox"
            checked={applyToSpread}
            onChange={(e) => setApplyToSpread(e.target.checked)}
            className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 h-3 w-3"
          />
          Pliego
        </label>
        <label className="flex items-center gap-1 text-xs text-neutral-600 cursor-pointer">
          <input
            type="checkbox"
            checked={applyToAll}
            onChange={(e) => setApplyToAll(e.target.checked)}
            className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 h-3 w-3"
          />
          Todas
        </label>

        <button
          type="button"
          onClick={handleReset}
          className="h-7 px-2 rounded text-xs text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
          Restablecer
        </button>
      </div>
    </div>
  );
}
