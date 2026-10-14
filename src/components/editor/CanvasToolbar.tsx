"use client";

import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils/cn";
import { MAX_ZOOM, MIN_ZOOM, stepZoom } from "@/lib/editor/canvasConfig";

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

function HandIcon({ className }: { className?: string }) {
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
      <path d="M18 11V6a2 2 0 0 0-4 0v5" />
      <path d="M14 10V4a2 2 0 0 0-4 0v6" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
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
  const zoomOut = () => setZoom(stepZoom(zoom, -1));
  const zoomIn = () => setZoom(stepZoom(zoom, 1));

  return (
    <div
      role="group"
      aria-label="Herramientas del lienzo"
      className={cn(
        "absolute bottom-4 left-4 z-30 flex items-center gap-0.5",
        "rounded-xl bg-white/90 backdrop-blur-md shadow-lg shadow-black/8",
        "border border-neutral-200/70 px-1 py-1"
      )}
    >
      {/* ── Pointer (select) ──────────────────────────────── */}
      <button
        type="button"
        onClick={() => setActiveTool("select")}
        aria-label="Seleccionar (V)"
        aria-pressed={activeTool === "select"}
        aria-keyshortcuts="V"
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          activeTool === "select"
            ? "bg-neutral-900 text-white shadow-sm"
            : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
        )}
        title="Seleccionar (V)"
      >
        <PointerIcon />
      </button>

      {/* ── Hand (pan) ─────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setActiveTool("pan")}
        aria-label="Mover lienzo (H o mantener espacio y arrastrar)"
        aria-pressed={activeTool === "pan"}
        aria-keyshortcuts="H"
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          activeTool === "pan"
            ? "bg-neutral-900 text-white shadow-sm"
            : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
        )}
        title="Mover (H) · Mantén espacio y arrastra"
      >
        <HandIcon />
      </button>

      {/* ── Zoom tool ─────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setActiveTool("zoom")}
        aria-label="Lupa: clic para acercar, Mayús y clic para alejar (Z)"
        aria-pressed={activeTool === "zoom"}
        aria-keyshortcuts="Z"
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          activeTool === "zoom"
            ? "bg-neutral-900 text-white shadow-sm"
            : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
        )}
        title="Lupa (Z) · Clic para acercar · Mayús + clic para alejar"
      >
        <ZoomInIcon />
      </button>

      {/* ── Separator ─────────────────────────────────────── */}
      <div className="w-px h-5 bg-neutral-200 mx-1" />

      {/* ── Zoom out ──────────────────────────────────────── */}
      <button
        type="button"
        onClick={zoomOut}
        disabled={zoom <= MIN_ZOOM}
        aria-label="Alejar"
        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
        title="Alejar"
      >
        <MinusIcon />
      </button>

      {/* ── Zoom percentage ───────────────────────────────── */}
      <output
        aria-label={`Zoom actual: ${Math.round(zoom * 100)} por ciento`}
        className="w-10 select-none text-center text-xs font-medium tabular-nums text-neutral-600"
      >
        {Math.round(zoom * 100)}%
      </output>

      {/* ── Zoom in ───────────────────────────────────────── */}
      <button
        type="button"
        onClick={zoomIn}
        disabled={zoom >= MAX_ZOOM}
        aria-label="Acercar"
        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
        title="Acercar"
      >
        <PlusIcon />
      </button>

      {/* ── Separator ─────────────────────────────────────── */}
      <div className="w-px h-5 bg-neutral-200 mx-1" />

      {/* ── Fit / reset ───────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setZoom(1)}
        aria-label="Restablecer zoom a 100 por ciento"
        className="h-7 rounded-md px-2 text-[11px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        title="Restablecer a 100%"
      >
        Ajustar
      </button>
    </div>
  );
}
