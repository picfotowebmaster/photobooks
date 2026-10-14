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
      <p className="text-xs leading-5 text-neutral-500">
        Haz clic en un sticker para colocarlo al centro de la página, o arrástralo
        directamente al lugar que quieras.
      </p>
      {STICKER_CATEGORIES.map((category) => (
        <div key={category.id}>
          <h4 className="text-xs font-medium text-neutral-500 mb-2">
            {category.name}
          </h4>
          <div className="grid grid-cols-6 gap-1.5">
            {getStickersByCategory(category.id).map((sticker) => (
              <button
                key={sticker.id}
                type="button"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "copy";
                  event.dataTransfer.setData(
                    "application/x-photobook-sticker",
                    JSON.stringify({ stickerId: sticker.id })
                  );
                }}
                onClick={() => onSelect(sticker.id)}
                title={sticker.name}
                aria-label={`Agregar ${sticker.name} al centro de la página`}
                aria-pressed={selectedId === sticker.id}
                className={cn(
                  "aspect-square rounded-md border-2 overflow-hidden bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
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
