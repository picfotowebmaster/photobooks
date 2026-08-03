"use client";

import { useState, useEffect } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils/cn";

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

export function BackgroundColorPanel() {
  const currentPage = useEditorStore((s) => s.currentPage);
  const totalPages = useEditorStore((s) => s.totalPages);
  const pageBackgrounds = useEditorStore((s) => s.pageBackgrounds);
  const setPageBackground = useEditorStore((s) => s.setPageBackground);

  const [applyToSpread, setApplyToSpread] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);
  const [targetPage, setTargetPage] = useState(currentPage);

  useEffect(() => {
    setTargetPage(Math.floor(currentPage / 2) * 2);
  }, [currentPage]);

  const leftPage = Math.floor(currentPage / 2) * 2;
  const rightPage = leftPage + 1;
  const isLeftActive = targetPage % 2 === 0;

  const currentColor = pageBackgrounds[targetPage] ?? "#ffffff";
  const [hexInput, setHexInput] = useState(currentColor);

  useEffect(() => {
    setHexInput(currentColor);
  }, [currentColor]);

  const applyColor = (color: string) => {
    const store = useEditorStore.getState();
    if (applyToAll) {
      for (let i = 0; i < store.totalPages; i++) {
        store.setPageBackground(i, color);
      }
    } else if (applyToSpread) {
      const pairPage =
        targetPage % 2 === 0 ? targetPage + 1 : targetPage - 1;
      store.setPageBackground(targetPage, color);
      if (pairPage >= 0 && pairPage < store.totalPages) {
        store.setPageBackground(pairPage, color);
      }
    } else {
      store.setPageBackground(targetPage, color);
    }
  };

  const handleHexSubmit = () => {
    const hex = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      applyColor(hex);
    } else {
      setHexInput(currentColor);
    }
  };

  const handleReset = () => {
    applyColor("#ffffff");
  };

  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5 border-b border-neutral-200 bg-neutral-50">
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

      <div className="w-px h-5 bg-neutral-200" />

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

      <div className="w-px h-5 bg-neutral-200" />

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => setTargetPage(leftPage)}
          className={cn(
            "h-7 px-2 rounded text-xs font-medium transition-colors",
            isLeftActive
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-100"
          )}
        >
          Izq
        </button>
        <button
          type="button"
          onClick={() => setTargetPage(rightPage)}
          className={cn(
            "h-7 px-2 rounded text-xs font-medium transition-colors",
            !isLeftActive
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-100"
          )}
        >
          Der
        </button>
      </div>

      <div className="w-px h-5 bg-neutral-200" />

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

      <div className="w-px h-5 bg-neutral-200" />

      <button
        type="button"
        onClick={handleReset}
        className="h-7 px-2 rounded text-xs text-neutral-600 hover:bg-neutral-100 transition-colors"
      >
        Restablecer
      </button>
    </div>
  );
}
