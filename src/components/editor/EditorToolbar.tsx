"use client";

import { useEditorStore } from "@/stores/editorStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { EditorTool } from "@/types/editor";

const tools: { id: EditorTool; label: string; icon: string }[] = [
  { id: "select", label: "Seleccionar", icon: "⊹" },
  { id: "text", label: "Texto", icon: "T" },
  { id: "background", label: "Fondo", icon: "▣" },
];

export function EditorToolbar() {
  const { activeTool, setActiveTool, zoom, setZoom } = useEditorStore();

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-200 bg-white">
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
      </div>
    </div>
  );
}
