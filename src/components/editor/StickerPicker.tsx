"use client";

import { STICKER_CATEGORIES, getStickersByCategory } from "@/types/sticker";
import { cn } from "@/lib/utils/cn";

interface StickerPickerProps {
  selectedId: string | null;
  onSelect: (stickerId: string) => void;
}

export function StickerPicker({ selectedId, onSelect }: StickerPickerProps) {
  return (
    <div className="space-y-4">
      {STICKER_CATEGORIES.map((category) => (
        <div key={category.id}>
          <h4 className="text-xs font-medium text-neutral-500 mb-2">
            {category.name}
          </h4>
          <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1.5">
            {getStickersByCategory(category.id).map((sticker) => (
              <button
                key={sticker.id}
                type="button"
                onClick={() => onSelect(sticker.id)}
                title={sticker.name}
                className={cn(
                  "aspect-square rounded-md border-2 overflow-hidden bg-white transition-all",
                  selectedId === sticker.id
                    ? "border-neutral-900 ring-1 ring-neutral-900"
                    : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                <img
                  src={sticker.imagePath}
                  alt={sticker.name}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
