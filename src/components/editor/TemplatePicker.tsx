"use client";

import { cn } from "@/lib/utils/cn";
import { TemplateThumbnail } from "./TemplateThumbnail";
import type { PageTemplate } from "@/types/editor";

interface TemplatePickerProps {
  templates: PageTemplate[];
  selectedId: string | null;
  onSelect: (template: PageTemplate) => void;
  title?: string;
  hint?: string;
  pageWidth: number;
  pageHeight: number;
}

function templateDescription(template: PageTemplate) {
  const photos = template.slots.filter((slot) => slot.span !== "spread").length;
  const count = (template.scope ?? "page") === "spread" ? template.slots.length : photos;
  const label = count === 1 ? "foto" : "fotos";
  const kind =
    template.kind === "full"
      ? "Página completa"
      : template.kind === "half"
        ? "Diseño parcial"
        : template.kind === "quadrant"
          ? "Cuadrantes"
          : template.kind === "spread"
            ? "Doble página"
            : "Composición";
  return `${kind} · ${count} ${label}`;
}

export function TemplatePicker({
  templates,
  selectedId,
  onSelect,
  title = "Plantillas",
  hint,
  pageWidth,
  pageHeight,
}: TemplatePickerProps) {
  if (templates.length === 0) return null;

  return (
    <div>
      <div className="mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-700">
          {title}
        </h3>
        {hint && <p className="text-[11px] text-neutral-400">{hint}</p>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => {
          const selected = selectedId === template.id;
          const isSpread = (template.scope ?? "page") === "spread";
          const previewWidth = isSpread ? pageWidth * 2.04 : pageWidth;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template)}
              title={template.description ?? template.name}
              aria-pressed={selected}
              aria-label={`${template.name}. ${template.description ?? templateDescription(template)}`}
              className={cn(
                "rounded-lg border-2 p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                selected
                  ? "border-primary-600 bg-primary-50"
                  : "border-neutral-200 bg-white hover:border-neutral-400"
              )}
            >
              <div
                className="overflow-hidden rounded bg-neutral-100 p-1"
                style={{ aspectRatio: `${previewWidth} / ${pageHeight}` }}
              >
                <TemplateThumbnail
                  slots={template.slots}
                  pageWidth={pageWidth}
                  pageHeight={pageHeight}
                />
              </div>
              <span
                className={cn(
                  "mt-2 block text-xs font-medium leading-4",
                  selected ? "text-primary-700" : "text-neutral-700"
                )}
              >
                {template.name}
              </span>
              <span className="mt-0.5 block h-8 overflow-hidden text-[10px] leading-4 text-neutral-500">
                {template.description ?? templateDescription(template)}
              </span>
              <span className="mt-0.5 block text-[10px] leading-4 text-neutral-500">
                {templateDescription(template)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
