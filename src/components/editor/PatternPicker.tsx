"use client";

import { PATTERNS } from "@/types/pattern";
import { cn } from "@/lib/utils/cn";

interface PatternPickerProps {
  selectedId: string | null;
  onSelect: (patternId: string) => void;
}

export function PatternPicker({ selectedId, onSelect }: PatternPickerProps) {
  return (
    <div className="grid grid-cols-12 gap-1.5">
      {PATTERNS.map((pattern) => (
        <button
          key={pattern.id}
          type="button"
          onClick={() => onSelect(pattern.id)}
          title={pattern.name}
          className={cn(
            "aspect-square rounded-md border-2 overflow-hidden transition-all",
            selectedId === pattern.id
              ? "border-neutral-900 ring-1 ring-neutral-900"
              : "border-neutral-200 hover:border-neutral-300"
          )}
        >
          <img
            src={pattern.svgPath}
            alt={pattern.name}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}
