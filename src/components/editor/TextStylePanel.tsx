"use client";

import { useEffect, useState } from "react";
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
      aria-label={label === "B" ? "Negrita" : "Cursiva"}
      aria-pressed={active}
      className={cn(
        "w-8 h-8 rounded text-xs flex items-center justify-center transition-colors border border-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        active
          ? "bg-neutral-900 text-white border-neutral-900"
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
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "w-8 h-8 rounded flex items-center justify-center transition-colors border border-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        active
          ? "bg-neutral-900 text-white border-neutral-900"
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
  const [fontSizeDraft, setFontSizeDraft] = useState(String(textPlacement.fontSize));
  const [editingFontSize, setEditingFontSize] = useState(false);

  useEffect(() => {
    if (!editingFontSize) setFontSizeDraft(String(textPlacement.fontSize));
  }, [editingFontSize, textPlacement.fontSize]);

  const commitFontSize = () => {
    setEditingFontSize(false);
    const parsedSize = Number.parseInt(fontSizeDraft, 10);
    if (!Number.isFinite(parsedSize) || fontSizeDraft.trim() === "") {
      setFontSizeDraft(String(textPlacement.fontSize));
      return;
    }
    const fontSize = Math.max(8, Math.min(200, parsedSize));
    setFontSizeDraft(String(fontSize));
    onUpdate({ fontSize });
  };

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
    <div className="space-y-5">
      <div>
        <FieldLabel htmlFor="text-font-family">Fuente</FieldLabel>
        <select
          id="text-font-family"
          value={textPlacement.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="w-full h-8 rounded border border-neutral-300 bg-white px-2 text-sm text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel htmlFor="text-font-size">Tamaño de fuente</FieldLabel>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              onUpdate({ fontSize: Math.max(8, textPlacement.fontSize - 2) })
            }
            aria-label="Reducir tamaño de fuente"
            className="w-8 h-8 rounded border border-neutral-300 text-neutral-600 hover:bg-neutral-100 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            −
          </button>
          <input
            id="text-font-size"
            type="number"
            value={fontSizeDraft}
            onFocus={() => {
              setEditingFontSize(true);
              setFontSizeDraft(String(textPlacement.fontSize));
            }}
            onChange={(e) => setFontSizeDraft(e.target.value)}
            onBlur={commitFontSize}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            aria-label="Tamaño de fuente"
            className="flex-1 h-8 rounded border border-neutral-300 bg-white text-center text-sm text-neutral-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min={8}
            max={200}
            step={1}
          />
          <button
            type="button"
            onClick={() =>
              onUpdate({ fontSize: Math.min(200, textPlacement.fontSize + 2) })
            }
            aria-label="Aumentar tamaño de fuente"
            className="w-8 h-8 rounded border border-neutral-300 text-neutral-600 hover:bg-neutral-100 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="text-color">Color del texto</FieldLabel>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            id="text-color"
            type="color"
            value={textPlacement.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            aria-label="Elegir color del texto"
            className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0.5"
          />
          <div className="flex items-center gap-1 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onUpdate({ fill: color })}
                className={cn(
                  "w-5 h-5 rounded-full border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
                  textPlacement.fill === color
                    ? "border-neutral-900 ring-1 ring-neutral-900"
                    : "border-neutral-300"
                )}
                style={{ backgroundColor: color }}
                aria-label={`Color de texto ${color}`}
                aria-pressed={textPlacement.fill.toLowerCase() === color.toLowerCase()}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-medium text-neutral-500">Estilo y alineación</span>
        <div className="flex items-center gap-2">
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

          <div className="w-px h-5 bg-neutral-200 mx-1" />

          <div className="flex items-center gap-1">
            <AlignButton
              active={textPlacement.align === "left"}
              onClick={() => setAlign("left")}
              label="Alinear a la izquierda"
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
              label="Alinear al centro"
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
              label="Alinear a la derecha"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="0" y="1" width="12" height="1.5" rx="0.5" />
                <rect x="4" y="4" width="8" height="1.5" rx="0.5" />
                <rect x="2" y="7" width="10" height="1.5" rx="0.5" />
                <rect x="6" y="10" width="6" height="1.5" rx="0.5" />
              </svg>
            </AlignButton>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="w-full h-9 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </svg>
        Eliminar texto
      </button>
    </div>
  );
}
