"use client";

import { useState } from "react";

import { useEditorStore } from "@/stores/editorStore";
import { Button } from "@/components/ui/Button";
import { TextStylePanel } from "./TextStylePanel";
import { BackgroundPanel } from "./BackgroundPanel";
import { StickerPicker } from "./StickerPicker";
import { GridPanel } from "./GridPanel";
import { cn } from "@/lib/utils/cn";
import type { EditorTool } from "@/types/editor";

const tools: { id: EditorTool; label: string; icon: string }[] = [
  { id: "text", label: "Texto", icon: "T" },
  { id: "background", label: "Fondo", icon: "▣" },
  { id: "sticker", label: "Stickers", icon: "★" },
];

export function EditorToolbar() {
  const {
    activeTool,
    setActiveTool,
    zoom,
    setZoom,
    currentPage,
    totalPages,
    selectedTextId,
    texts,
    updateText,
    removeText,
    activeStickerId,
    setActiveStickerId,
  } = useEditorStore();

  const [showGrid, setShowGrid] = useState(false);

  const currentSpread = Math.floor(currentPage / 2) + 1;
  const totalSpreads = totalPages / 2;
  const selectedTextPlacement = selectedTextId
    ? texts.find((t) => t.id === selectedTextId) ?? null
    : null;

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-200 bg-white">
        <span className="text-sm font-medium text-neutral-500 tabular-nums">
          Spread {currentSpread} de {totalSpreads}
        </span>

        <div className="w-px h-5 bg-neutral-200 mx-1" />

        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              activeTool === tool.id
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
          >
            −
          </Button>
          <span className="text-sm text-neutral-600 w-14 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          >
            +
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setZoom(1)}>
            Ajustar
          </Button>

          <div className="w-px h-5 bg-neutral-200 mx-1" />

          <button
            onClick={() => setShowGrid((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              showGrid
                ? "bg-cyan-600 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
            title="Retícula"
          >
            <span className="text-base">⊞</span>
            <span className="hidden sm:inline">Retícula</span>
          </button>
        </div>
      </div>

      {selectedTextPlacement && (
        <TextStylePanel
          textPlacement={selectedTextPlacement}
          onUpdate={(data) => updateText(selectedTextPlacement.id, data)}
          onDelete={() => removeText(selectedTextPlacement.id)}
        />
      )}
      {activeTool === "background" && <BackgroundPanel />}
      {activeTool === "sticker" && (
        <div className="border-b border-neutral-200 bg-neutral-50 p-3">
          <StickerPicker
            selectedId={activeStickerId}
            onSelect={setActiveStickerId}
          />
        </div>
      )}
      {showGrid && <GridPanel />}
    </>
  );
}
