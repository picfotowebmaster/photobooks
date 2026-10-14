"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { useEditorStore } from "@/stores/editorStore";
import { usePricingConfig } from "@/hooks/usePricing";
import { useTemplates } from "@/hooks/useTemplates";
import { createClient } from "@/lib/supabase/client";
import { pageTemplateForPage } from "@/lib/editor/templateScope";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import type { PageTemplate } from "@/types/editor";

interface PageThumbnailsProps {
  format: string;
}

export function PageThumbnails({ format }: PageThumbnailsProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const currentPage = useEditorStore((s) => s.currentPage);
  const totalPages = useEditorStore((s) => s.totalPages);
  const lastTemplate = useEditorStore((s) => s.lastTemplate);
  const setCurrentPage = useEditorStore((s) => s.setCurrentPage);
  const setTotalPages = useEditorStore((s) => s.setTotalPages);

  const { config } = usePricingConfig();
  const { templates: dbTemplates } = useTemplates(format);

  const minPages = config.settings.basePages;
  const maxPages = config.settings.maxPages;

  const totalSpreads = totalPages / 2;
  const currentSpread = Math.floor(currentPage / 2);

  const fallbackTemplate: PageTemplate | null = (() => {
    if (lastTemplate) return lastTemplate;
    if (dbTemplates.length === 0) return null;
    const full =
      dbTemplates.find(
        (template) =>
          (template.scope ?? "page") === "page" &&
          template.name.toLowerCase().includes("completa")
      ) ??
      dbTemplates.find((template) => (template.scope ?? "page") === "page") ??
      dbTemplates[0];
    return {
      id: full.id,
      name: full.name,
      scope: full.scope ?? "page",
      kind: full.kind,
      slots: full.slots as PageTemplate["slots"],
    };
  })();

  const addSpread = useCallback(async () => {
    const newTotal = Math.min(maxPages, totalPages + 2);
    if (newTotal === totalPages) return;

    const store = useEditorStore.getState();
    const newPages = [totalPages, totalPages + 1];
    setTotalPages(newTotal);
    newPages.forEach((page) => {
      if (fallbackTemplate) {
        store.setPageTemplate(page, pageTemplateForPage(fallbackTemplate, page));
      }
    });

    if (!projectId) return;
    const supabase = createClient();
    await Promise.all([
      supabase
        .from("projects")
        .update({ total_pages: newTotal } as Record<string, unknown>)
        .eq("id", projectId),
      ...newPages.map((page) =>
        supabase.from("project_pages").upsert(
          {
            project_id: projectId,
            page_index: page,
            template_id: fallbackTemplate?.id ?? null,
          },
          { onConflict: "project_id, page_index" }
        )
      ),
    ]);
  }, [fallbackTemplate, maxPages, projectId, setTotalPages, totalPages]);

  const removeSpread = useCallback(async () => {
    const newTotal = Math.max(minPages, totalPages - 2);
    if (newTotal === totalPages) return;

    const store = useEditorStore.getState();
    const removedPages = [newTotal, newTotal + 1];

    store.photos
      .filter((photo) => removedPages.includes(photo.pageIndex))
      .forEach((photo) => store.removePhoto(photo.id));
    store.texts
      .filter((text) => removedPages.includes(text.pageIndex))
      .forEach((text) => store.removeText(text.id));
    store.stickers
      .filter((sticker) => removedPages.includes(sticker.pageIndex))
      .forEach((sticker) => store.removeSticker(sticker.id));

    setTotalPages(newTotal);
    if (store.currentPage >= newTotal) {
      setCurrentPage(Math.max(0, newTotal - 2));
    }

    if (!projectId) return;
    const supabase = createClient();
    await Promise.all([
      supabase
        .from("projects")
        .update({ total_pages: newTotal } as Record<string, unknown>)
        .eq("id", projectId),
      supabase
        .from("project_pages")
        .delete()
        .eq("project_id", projectId)
        .gte("page_index", newTotal),
    ]);
  }, [minPages, projectId, setCurrentPage, setTotalPages, totalPages]);

  return (
    <div className="w-64 shrink-0 border-r border-neutral-200 bg-neutral-50 flex flex-col h-full overflow-y-auto">
      <div className="shrink-0 border-b border-neutral-200 p-3">
        <h3 className="text-sm font-semibold text-neutral-900">
          Spreads ({totalSpreads})
        </h3>
      </div>

      <div className="max-h-48 shrink-0 space-y-1 overflow-y-auto p-2">
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
          onClick={addSpread}
          disabled={totalPages >= maxPages}
        >
          + Spread
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={removeSpread}
          disabled={totalPages <= minPages}
        >
          − Spread
        </Button>
      </div>
    </div>
  );
}
