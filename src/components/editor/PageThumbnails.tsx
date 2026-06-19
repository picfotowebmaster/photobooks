"use client";

import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

export function PageThumbnails() {
  const { currentPage, totalPages, setCurrentPage, setTotalPages } =
    useEditorStore();

  const totalSpreads = totalPages / 2;
  const currentSpread = Math.floor(currentPage / 2);

  return (
    <div className="w-48 border-r border-neutral-200 bg-neutral-50 flex flex-col h-full">
      <div className="p-3 border-b border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-900">
          Spreads ({totalSpreads})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {Array.from({ length: totalSpreads }, (_, i) => {
          const left = i * 2;
          const right = left + 1;
          return (
            <button
              key={i}
              onClick={() => setCurrentPage(left)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                i === currentSpread
                  ? "bg-primary-600 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              Págs. {left + 1} – {right + 1}
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-neutral-200 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={() => setTotalPages(totalPages + 2)}
          disabled={totalPages >= 40}
        >
          + Spread
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={() => setTotalPages(totalPages - 2)}
          disabled={totalPages <= 10}
        >
          − Spread
        </Button>
      </div>
    </div>
  );
}
