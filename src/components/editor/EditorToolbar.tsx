"use client";

import { useEditorStore } from "@/stores/editorStore";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { EditorTool } from "@/types/editor";
import { MAX_ZOOM, MIN_ZOOM, stepZoom } from "@/lib/editor/canvasConfig";

const tools: { id: EditorTool; label: string; icon: string }[] = [
  { id: "text", label: "Texto", icon: "T" },
  { id: "background", label: "Fondo", icon: "▣" },
  { id: "sticker", label: "Stickers", icon: "★" },
];

export function EditorToolbar() {
  const {
    activeTool,
    setActiveTool,
    activePanel,
    setActivePanel,
    zoom,
    setZoom,
    currentPage,
    totalPages,
    previewMode,
    setPreviewMode,
  } = useEditorStore();

  const currentSpread = Math.floor(currentPage / 2) + 1;
  const totalSpreads = totalPages / 2;

  const handleToolClick = (id: EditorTool) => {
    if (id === "text") {
      setActiveTool("text");
      setActivePanel(null);
    } else if (id === "background") {
      setActiveTool("select");
      setActivePanel(activePanel === "background" ? null : "background");
    } else if (id === "sticker") {
      if (activePanel === "sticker") {
        setActiveTool("select");
        setActivePanel(null);
      } else {
        setActiveTool("sticker");
        setActivePanel("sticker");
      }
    }
  };

  const isToolActive = (id: EditorTool) => {
    if (id === "text") return activeTool === "text";
    if (id === "background") return activePanel === "background";
    if (id === "sticker") return activePanel === "sticker";
    return false;
  };

  const toggleGrid = () => {
    setActiveTool("select");
    setActivePanel(activePanel === "grid" ? null : "grid");
  };

  const toggleTemplates = () => {
    setActiveTool("select");
    setActivePanel(activePanel === "templates" ? null : "templates");
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-200 bg-white">
      <span className="text-sm font-medium text-neutral-500 tabular-nums">
        Spread {currentSpread} de {totalSpreads}
      </span>

      <div className="w-px h-5 bg-neutral-200 mx-1" />

      {!previewMode && tools.map((tool) => (
        <button
          key={tool.id}
          type="button"
          onClick={() => handleToolClick(tool.id)}
          aria-pressed={isToolActive(tool.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            isToolActive(tool.id)
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-100"
          )}
          title={tool.label}
        >
          <span className="text-base">{tool.icon}</span>
          <span className="hidden sm:inline">{tool.label}</span>
        </button>
      ))}

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          aria-pressed={previewMode}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
            previewMode
              ? "bg-primary-700 text-white hover:bg-primary-800"
              : "text-neutral-600 hover:bg-neutral-100"
          )}
          title={previewMode ? "Volver a editar" : "Vista previa sin guías ni slots"}
        >
          {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{previewMode ? "Volver a editar" : "Vista previa"}</span>
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom(stepZoom(zoom, -1))}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Alejar"
          title="Alejar"
        >
          −
        </Button>
        <output
          aria-label={`Zoom actual: ${Math.round(zoom * 100)} por ciento`}
          className="w-14 text-center text-sm tabular-nums text-neutral-600"
        >
          {Math.round(zoom * 100)}%
        </output>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom(stepZoom(zoom, 1))}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Acercar"
          title="Acercar"
        >
          +
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom(1)}
          aria-label="Restablecer zoom a 100 por ciento"
          title="Restablecer zoom a 100%"
        >
          Ajustar
        </Button>

        {!previewMode && (
          <>
        <div className="w-px h-5 bg-neutral-200 mx-1" />

        <button
          onClick={toggleGrid}
          aria-pressed={activePanel === "grid"}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            activePanel === "grid"
              ? "bg-cyan-600 text-white"
              : "text-neutral-600 hover:bg-neutral-100"
          )}
          title="Retícula"
        >
          <span className="text-base">⊞</span>
          <span className="hidden sm:inline">Retícula</span>
        </button>
        <button
          onClick={toggleTemplates}
          aria-pressed={activePanel === "templates"}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            activePanel === "templates"
              ? "bg-amber-600 text-white"
              : "text-neutral-600 hover:bg-neutral-100"
          )}
          title="Plantillas"
        >
          <span className="text-base">▦</span>
          <span className="hidden sm:inline">Plantillas</span>
        </button>
          </>
        )}
      </div>
    </div>
  );
}
