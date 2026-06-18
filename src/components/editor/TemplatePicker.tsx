"use client";

import { cn } from "@/lib/utils/cn";
import type { PageTemplate } from "@/types/editor";

interface TemplatePickerProps {
  templates: PageTemplate[];
  selectedId: string | null;
  onSelect: (template: PageTemplate) => void;
}

export function TemplatePicker({
  templates,
  selectedId,
  onSelect,
}: TemplatePickerProps) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-neutral-900 mb-3">Plantillas</h3>
      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={cn(
              "aspect-square rounded-lg border-2 transition-all text-xs font-medium",
              selectedId === template.id
                ? "border-primary-600 bg-primary-50 text-primary-700"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            )}
          >
            {template.name}
            <span className="block text-neutral-400 font-normal">
              {template.slots.length} espacios
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
