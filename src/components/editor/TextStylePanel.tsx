"use client";

import { cn } from "@/lib/utils/cn";
import type { TextPlacement, FontStyle, TextAlign } from "@/types/editor";

const FONT_FAMILIES = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", serif' },
  { label: "Courier New", value: '"Courier New", monospace' },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Trebuchet MS", value: '"Trebuchet MS", sans-serif' },
];

const PRESET_COLORS = [
  "#000000",
  "#333333",
  "#666666",
  "#999999",
  "#E53E3E",
  "#3182CE",
  "#38A169",
  "#D69E2E",
];

interface TextStylePanelProps {
  textPlacement: TextPlacement;
  onUpdate: (data: Partial<TextPlacement>) => void;
  onDelete: () => void;
}

function FontStyleButton({
  active,
  label,
  onClick,
  bold,
  italic,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  bold?: boolean;
  italic?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-7 h-7 rounded text-xs flex items-center justify-center transition-colors",
        active
          ? "bg-neutral-900 text-white"
          : "text-neutral-600 hover:bg-neutral-100",
        bold && "font-bold",
        italic && "italic"
      )}
    >
      {label}
    </button>
  );
}

function AlignButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-7 h-7 rounded flex items-center justify-center transition-colors",
        active
          ? "bg-neutral-900 text-white"
          : "text-neutral-600 hover:bg-neutral-100"
      )}
    >
      {children}
    </button>
  );
}

export function TextStylePanel({
  textPlacement,
  onUpdate,
  onDelete,
}: TextStylePanelProps) {
  const fontStyleParts = textPlacement.fontStyle.split(" ");

  const toggleBold = () => {
    const isBold = fontStyleParts.includes("bold");
    const isItalic = fontStyleParts.includes("italic");
    const newStyle: FontStyle = isBold
      ? isItalic
        ? "italic"
        : "normal"
      : isItalic
        ? "bold italic"
        : "bold";
    onUpdate({ fontStyle: newStyle });
  };

  const toggleItalic = () => {
    const isBold = fontStyleParts.includes("bold");
    const isItalic = fontStyleParts.includes("italic");
    const newStyle: FontStyle = isItalic
      ? isBold
        ? "bold"
        : "normal"
      : isBold
        ? "bold italic"
        : "italic";
    onUpdate({ fontStyle: newStyle });
  };

  const setAlign = (align: TextAlign) => onUpdate({ align });

  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5 border-b border-neutral-200 bg-neutral-50">
      <select
        value={textPlacement.fontFamily}
        onChange={(e) => onUpdate({ fontFamily: e.target.value })}
        className="h-7 rounded border border-neutral-300 bg-white px-1.5 text-xs text-neutral-700"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() =>
            onUpdate({ fontSize: Math.max(8, textPlacement.fontSize - 2) })
          }
          className="w-6 h-7 rounded text-xs text-neutral-600 hover:bg-neutral-100 flex items-center justify-center"
        >
          −
        </button>
        <input
          type="number"
          value={textPlacement.fontSize}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) onUpdate({ fontSize: Math.max(8, Math.min(200, v)) });
          }}
          className="w-11 h-7 rounded border border-neutral-300 bg-white text-center text-xs text-neutral-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min={8}
          max={200}
        />
        <button
          type="button"
          onClick={() =>
            onUpdate({ fontSize: Math.min(200, textPlacement.fontSize + 2) })
          }
          className="w-6 h-7 rounded text-xs text-neutral-600 hover:bg-neutral-100 flex items-center justify-center"
        >
          +
        </button>
      </div>

      <div className="flex items-center gap-1">
        <div className="relative">
          <input
            type="color"
            value={textPlacement.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="w-7 h-7 rounded border border-neutral-300 cursor-pointer p-0.5"
          />
        </div>
        <div className="flex items-center gap-0.5">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onUpdate({ fill: color })}
              className={cn(
                "w-4 h-4 rounded-full border transition-transform hover:scale-110",
                textPlacement.fill === color
                  ? "border-neutral-900 ring-1 ring-neutral-900"
                  : "border-neutral-300"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="w-px h-5 bg-neutral-200" />

      <FontStyleButton
        active={fontStyleParts.includes("bold")}
        bold
        label="B"
        onClick={toggleBold}
      />
      <FontStyleButton
        active={fontStyleParts.includes("italic")}
        italic
        label="I"
        onClick={toggleItalic}
      />

      <div className="w-px h-5 bg-neutral-200" />

      <div className="flex items-center gap-0.5">
        <AlignButton
          active={textPlacement.align === "left"}
          onClick={() => setAlign("left")}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="0" y="1" width="12" height="1.5" rx="0.5" />
            <rect x="0" y="4" width="8" height="1.5" rx="0.5" />
            <rect x="0" y="7" width="10" height="1.5" rx="0.5" />
            <rect x="0" y="10" width="6" height="1.5" rx="0.5" />
          </svg>
        </AlignButton>
        <AlignButton
          active={textPlacement.align === "center"}
          onClick={() => setAlign("center")}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="0" y="1" width="12" height="1.5" rx="0.5" />
            <rect x="2" y="4" width="8" height="1.5" rx="0.5" />
            <rect x="1" y="7" width="10" height="1.5" rx="0.5" />
            <rect x="3" y="10" width="6" height="1.5" rx="0.5" />
          </svg>
        </AlignButton>
        <AlignButton
          active={textPlacement.align === "right"}
          onClick={() => setAlign("right")}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="0" y="1" width="12" height="1.5" rx="0.5" />
            <rect x="4" y="4" width="8" height="1.5" rx="0.5" />
            <rect x="2" y="7" width="10" height="1.5" rx="0.5" />
            <rect x="6" y="10" width="6" height="1.5" rx="0.5" />
          </svg>
        </AlignButton>
      </div>

      <div className="w-px h-5 bg-neutral-200" />

      <button
        type="button"
        onClick={onDelete}
        className="w-7 h-7 rounded text-xs text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
        title="Eliminar texto"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </svg>
      </button>
    </div>
  );
}
