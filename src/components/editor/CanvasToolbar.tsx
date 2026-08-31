"use client";

import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils/cn";

/* ── SVG Icons ────────────────────────────────────────────── */

function PointerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      <path d="M13 13l6 6" />
    </svg>
  );
}

function ZoomInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/* ── Component ────────────────────────────────────────────── */

export function CanvasToolbar() {
  const { activeTool, setActiveTool, zoom, setZoom } = useEditorStore();

  return (
    <div
      className={cn(
        "absolute bottom-4 left-4 z-30 flex items-center gap-0.5",
        "rounded-xl bg-white/90 backdrop-blur-md shadow-lg shadow-black/8",
        "border border-neutral-200/70 px-1 py-1"
      )}
    >
      {/* ── Pointer (select) ──────────────────────────────── */}
      <button
        onClick={() => setActiveTool("select")}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
          activeTool !== "zoom"
            ? "bg-neutral-900 text-white shadow-sm"
            : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
        )}
        title="Seleccionar (V)"
      >
        <PointerIcon />
      </button>

      {/* ── Zoom tool ─────────────────────────────────────── */}
      <button
        onClick={() => setActiveTool("zoom")}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
          activeTool === "zoom"
            ? "bg-neutral-900 text-white shadow-sm"
            : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
        )}
        title="Zoom (Z) · Click = acercar · Shift+Click = alejar"
      >
        <ZoomInIcon />
      </button>

      {/* ── Separator ─────────────────────────────────────── */}
      <div className="w-px h-5 bg-neutral-200 mx-1" />

      {/* ── Zoom out ──────────────────────────────────────── */}
      <button
        onClick={() => setZoom(Math.max(0.2, +(zoom - 0.1).toFixed(1)))}
        className="flex items-center justify-center w-7 h-7 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
        title="Alejar"
      >
        <MinusIcon />
      </button>

      {/* ── Zoom percentage ───────────────────────────────── */}
      <span className="text-xs font-medium text-neutral-600 w-10 text-center tabular-nums select-none">
        {Math.round(zoom * 100)}%
      </span>

      {/* ── Zoom in ───────────────────────────────────────── */}
      <button
        onClick={() => setZoom(Math.min(2, +(zoom + 0.1).toFixed(1)))}
        className="flex items-center justify-center w-7 h-7 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
        title="Acercar"
      >
        <PlusIcon />
      </button>

      {/* ── Separator ─────────────────────────────────────── */}
      <div className="w-px h-5 bg-neutral-200 mx-1" />

      {/* ── Fit / reset ───────────────────────────────────── */}
      <button
        onClick={() => setZoom(1)}
        className="px-2 h-7 rounded-md text-[11px] font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
        title="Ajustar a 100%"
      >
        Ajustar
      </button>
    </div>
  );
}
