"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useEditorStore } from "@/stores/editorStore";
import { TemplatePicker } from "./TemplatePicker";
import { useTemplates } from "@/hooks/useTemplates";
import { createClient } from "@/lib/supabase/client";
import { getSpreadPages, getPageDimensions } from "@/lib/editor/canvasConfig";
import {
  pageTemplateForPage,
  resolveTemplatePages,
  type TemplateScope,
} from "@/lib/editor/templateScope";
import { getPhotoPlacementForSlot } from "@/lib/editor/templateSlots";
import { cn } from "@/lib/utils/cn";
import type { PageTemplate } from "@/types/editor";

interface TemplatePanelProps {
  projectId: string;
  format: string;
}

const SCOPES: { id: TemplateScope; label: string }[] = [
  { id: "page", label: "Esta página" },
  { id: "spread", label: "Este pliego" },
  { id: "all", label: "Todo el libro" },
];

const KIND_GROUPS: { id: string; title: string; hint: string }[] = [
  { id: "full", title: "Una foto", hint: "A página completa, con o sin borde" },
  { id: "half", title: "Diseños parciales", hint: "Composiciones que ocupan parte de la página" },
  { id: "quadrant", title: "Cuadrantes", hint: "Una a cuatro fotos en bloques" },
  { id: "gallery", title: "Composiciones", hint: "Retículas y fotos destacadas" },
  { id: "spread", title: "Doble página", hint: "Composiciones para las dos páginas juntas" },
];

const RECOMMENDED_IDS = [
  "full",
  "full-bleed",
  "split-side",
  "split-stack",
  "three-hero-top",
  "four-grid",
  "panorama",
  "spread-2up-uniform",
  "spread-4-grid",
  "spread-hero-left-3",
];

export function TemplatePanel({ projectId, format }: TemplatePanelProps) {
  const currentPage = useEditorStore((s) => s.currentPage);
  const totalPages = useEditorStore((s) => s.totalPages);
  const templates = useEditorStore((s) => s.templates);
  const { templates: dbTemplates, loading, error, retry } = useTemplates(format);

  const [scope, setScope] = useState<TemplateScope>("spread");
  const [targetPage, setTargetPage] = useState(currentPage);
  const [showAll, setShowAll] = useState(true);

  const [leftPage, rightPage] = getSpreadPages(currentPage);

  const dims = useMemo(() => getPageDimensions(format), [format]);

  useEffect(() => {
    setTargetPage(leftPage);
  }, [leftPage]);

  const pageTemplates: PageTemplate[] = useMemo(
    () =>
      dbTemplates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description ?? undefined,
        scope: template.scope ?? "page",
        kind: template.kind,
        slots: template.slots as PageTemplate["slots"],
      })),
    [dbTemplates]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, PageTemplate[]>();
    for (const group of KIND_GROUPS) map.set(group.id, []);
    for (const template of pageTemplates) {
      const kind =
        (template.scope ?? "page") === "spread"
          ? "spread"
          : template.kind && map.has(template.kind)
            ? template.kind
            : "gallery";
      map.get(kind)!.push(template);
    }
    return map;
  }, [pageTemplates]);

  const recommended = useMemo(() => {
    return RECOMMENDED_IDS.map((id) =>
      pageTemplates.find((template) => template.id.endsWith(`--${id}`))
    ).filter(
      (template): template is PageTemplate => Boolean(template)
    );
  }, [pageTemplates]);

  const handleSelect = useCallback(
    async (template: PageTemplate) => {
      const isSpread = (template.scope ?? "page") === "spread";

      const pages = isSpread
        ? scope === "all"
          ? Array.from({ length: totalPages }, (_, i) => i)
          : [leftPage, rightPage]
        : resolveTemplatePages({
            scope,
            targetPage,
            leftPage,
            rightPage,
            totalPages,
          });

      if (pages.length === 0) return;

      const store = useEditorStore.getState();
      store.setLastTemplate(template);

      pages.forEach((page) => {
        const pageTemplate = pageTemplateForPage(template, page);
        store.setPageTemplate(page, pageTemplate);
        store.photos
          .filter((photo) => !photo.inLibrary && photo.pageIndex === page)
          .forEach((photo, index) => {
            if (index < pageTemplate.slots.length) {
              store.updatePhotoPlacement(photo.id, {
                ...getPhotoPlacementForSlot(photo, pageTemplate.slots[index]),
                inLibrary: false,
                slotIndex: index,
              });
            } else {
              // More photos than slots: return the extras to the library
              // instead of leaving them orphaned/overlapping on the page.
              store.updatePhotoPlacement(photo.id, {
                inLibrary: true,
                slotIndex: undefined,
              });
            }
          });
      });

      const supabase = createClient();
      const saveResults = await Promise.all(
        pages.map((page) =>
          supabase.from("project_pages").upsert(
            {
              project_id: projectId,
              page_index: page,
              template_id: template.id,
            },
            { onConflict: "project_id, page_index" }
          )
        )
      );
      const saveError = saveResults.find((result) => result.error)?.error;
      if (saveError) {
        toast.error(`La plantilla se aplicó, pero no se pudo guardar: ${saveError.message}`);
      }

      // Applying a single-page template breaks a spread pair: clear the sibling
      // page so it does not keep only half of the double-page layout.
      if (!isSpread && scope === "page") {
        const sibling = targetPage % 2 === 0 ? targetPage + 1 : targetPage - 1;
        if (templates[sibling]?.scope === "spread") {
          store.clearPageTemplate(sibling);
          const { error } = await supabase
            .from("project_pages")
            .update({ template_id: null })
            .eq("project_id", projectId)
            .eq("page_index", sibling);
          if (error) {
            toast.error(`No se pudo guardar el cambio de plantilla: ${error.message}`);
          }
        }
      }
    },
    [scope, targetPage, leftPage, rightPage, totalPages, projectId, templates]
  );

  const selectedId = templates[targetPage]?.id ?? null;
  const selectedIsSpread = templates[targetPage]?.scope === "spread";
  const isLeftActive = targetPage % 2 === 0;

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500">
        Elige una composición. Puedes cambiarla después sin perder tus fotos.
      </p>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-500">
          Aplicar diseño a
        </label>
        <div className="flex gap-1 rounded-lg bg-neutral-100 p-1">
          {SCOPES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setScope(entry.id)}
              className={cn(
                "flex-1 h-8 rounded-md text-xs font-medium transition-colors",
                scope === entry.id
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
              aria-pressed={scope === entry.id}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      {scope === "page" && (
        <div className="space-y-1.5">
          <div className="flex gap-1 rounded-lg bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => setTargetPage(leftPage)}
              className={cn(
                "flex-1 h-8 rounded-md text-xs font-medium transition-colors",
                isLeftActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
              aria-pressed={isLeftActive}
            >
              Página izquierda
            </button>
            <button
              type="button"
              onClick={() => setTargetPage(rightPage)}
              className={cn(
                "flex-1 h-8 rounded-md text-xs font-medium transition-colors",
                !isLeftActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
              aria-pressed={!isLeftActive}
            >
              Página derecha
            </button>
          </div>
          {selectedIsSpread && (
            <p className="text-[11px] text-amber-600">
              Las plantillas de doble página se aplican al pliego completo.
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-2" role="status" aria-live="polite">
          <p className="text-xs text-neutral-500">Cargando composiciones…</p>
          <div className="grid grid-cols-2 gap-2" aria-hidden="true">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-lg bg-neutral-100" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3" role="alert">
          <p className="text-sm font-medium text-red-800">
            No pudimos cargar las plantillas.
          </p>
          <p className="mt-1 text-xs text-red-700">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-3 rounded-md px-2 py-1 text-xs font-semibold text-red-800 underline decoration-red-300 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            Intentar de nuevo
          </button>
        </div>
      ) : pageTemplates.length === 0 ? (
        <p className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600" role="status">
          No hay plantillas disponibles para este formato.
        </p>
      ) : (
        <div className="space-y-5">
          <TemplatePicker
            title="Recomendadas"
            hint="Una selección de diseños versátiles para empezar"
            templates={recommended}
            selectedId={selectedId}
            onSelect={handleSelect}
            pageWidth={dims.w}
            pageHeight={dims.h}
          />

          <section className="border-t border-neutral-200 pt-4">
            <button
              type="button"
              onClick={() => setShowAll((visible) => !visible)}
              aria-expanded={showAll}
              className="flex w-full items-center justify-between gap-2 rounded-md py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <span className="text-sm font-semibold text-neutral-800">
                Explorar todas las plantillas
              </span>
              <span className="shrink-0 text-xs text-neutral-500">
                {pageTemplates.length} · {showAll ? "Ocultar" : "Ver"}
              </span>
            </button>
            {showAll && (
              <div className="mt-4 space-y-5">
                {KIND_GROUPS.map((group) => {
                  const items = grouped.get(group.id) ?? [];
                  if (items.length === 0) return null;
                  return (
                    <TemplatePicker
                      key={group.id}
                      title={group.title}
                      hint={group.hint}
                      templates={items}
                      selectedId={selectedId}
                      onSelect={handleSelect}
                      pageWidth={dims.w}
                      pageHeight={dims.h}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
