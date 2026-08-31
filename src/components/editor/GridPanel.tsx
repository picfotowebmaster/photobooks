"use client";

import { useEditorStore } from "@/stores/editorStore";
import { GRID_PRESETS } from "@/lib/editor/gridConfig";
import { cn } from "@/lib/utils/cn";

const VISIBILITY_TOGGLES = [
  { key: "showBleed" as const, label: "Cut Zone", color: "bg-red-400" },
  { key: "showSafeZone" as const, label: "Safe Zone", color: "bg-cyan-400" },
  { key: "showGrid" as const, label: "Grid", color: "bg-cyan-300" },
  { key: "showSpine" as const, label: "Spine", color: "bg-neutral-400" },
] as const;

export function GridPanel() {
  const { gridConfig, setGridConfig, toggleGridVisibility } = useEditorStore();

  const activePreset = GRID_PRESETS.find(
    (p) => p.columns === gridConfig.columns && p.rows === gridConfig.rows
  );

  return (
    <div className="border-b border-neutral-200 bg-neutral-50 p-3 space-y-3">
      {/* ── Visibility toggles ─────────────────────────────── */}
      <div>
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Capas visibles
        </h4>
        <div className="flex flex-wrap gap-2">
          {VISIBILITY_TOGGLES.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => toggleGridVisibility(key)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                gridConfig[key]
                  ? "bg-white text-neutral-800 shadow-sm ring-1 ring-neutral-200"
                  : "bg-neutral-200/60 text-neutral-400"
              )}
            >
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-sm transition-opacity",
                  color,
                  !gridConfig[key] && "opacity-30"
                )}
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid presets ───────────────────────────────────── */}
      <div>
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Retícula
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {GRID_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() =>
                setGridConfig({ columns: preset.columns, rows: preset.rows })
              }
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                activePreset?.id === preset.id
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-100"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Custom columns/rows ────────────────────────────── */}
      <div>
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Personalizado
        </h4>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-neutral-600">
            Cols
            <input
              type="number"
              min={1}
              max={12}
              value={gridConfig.columns}
              onChange={(e) =>
                setGridConfig({
                  columns: Math.max(1, Math.min(12, Number(e.target.value) || 1)),
                })
              }
              className="w-14 px-2 py-1 rounded-md border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </label>
          <span className="text-neutral-300">×</span>
          <label className="flex items-center gap-1.5 text-xs text-neutral-600">
            Filas
            <input
              type="number"
              min={1}
              max={12}
              value={gridConfig.rows}
              onChange={(e) =>
                setGridConfig({
                  rows: Math.max(1, Math.min(12, Number(e.target.value) || 1)),
                })
              }
              className="w-14 px-2 py-1 rounded-md border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </label>
        </div>
      </div>

      {/* ── Legend ──────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pt-1 border-t border-neutral-200 text-[10px] text-neutral-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm bg-red-300/60 ring-1 ring-red-400/40" />
          Cut Zone
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm bg-cyan-200/60 ring-1 ring-cyan-400/40" />
          Safe Zone
        </span>
      </div>
    </div>
  );
}
