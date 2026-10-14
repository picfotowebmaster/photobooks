"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { useEditorStore } from "@/stores/editorStore";
import { EditorToolbar } from "@/components/editor/EditorToolbar";

const EditorCanvas = dynamic(
  () =>
    import("@/components/editor/EditorCanvas").then((mod) => ({
      default: mod.EditorCanvas,
    })),
  { ssr: false, loading: () => <Spinner size="lg" /> }
);
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { EditorDrawer } from "@/components/editor/EditorDrawer";
import { PageThumbnails } from "@/components/editor/PageThumbnails";
import { ExportPreview } from "@/components/editor/ExportPreview";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { getPageDimensions } from "@/lib/editor/canvasConfig";
import { getDefaultGridConfig } from "@/lib/editor/gridConfig";
import { resolveFormat } from "@/lib/editor/formats";
import { pageTemplateForPage } from "@/lib/editor/templateScope";
import type { Project } from "@/types/project";
import type { PageBackground, PageTemplate, PhotoPlacement } from "@/types/editor";
import type { Template } from "@/types/template";

type PlacementRow = {
  id: string;
  photo_id: string;
  page_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale_x: number;
  scale_y: number;
  rotation: number;
  z_index: number;
  slot_index: number | null;
  photos: { bucket_path_highres: string | null } | null;
};

type PhotoRow = {
  id: string;
  bucket_path_highres: string | null;
  bucket_path_lowres: string | null;
  original_width: number | null;
  original_height: number | null;
};

function serializePlacements(photos: PhotoPlacement[]) {
  return photos
    .filter((photo) => !photo.inLibrary && photo.photoId)
    .map((photo) => ({
      pageIndex: photo.pageIndex,
      photoId: photo.photoId,
      x: photo.x,
      y: photo.y,
      width: photo.width,
      height: photo.height,
      scaleX: photo.scaleX,
      scaleY: photo.scaleY,
      rotation: photo.rotation,
      zIndex: photo.zIndex,
      slotIndex: photo.slotIndex,
    }));
}

export default function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [pageRows, setPageRows] = useState<
    {
      page_index: number;
      template_id: string | null;
      background_fill: string | null;
      background: PageBackground | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [placementsHydrated, setPlacementsHydrated] = useState(false);
  const { zoom, resetEditor } = useEditorStore();
  const photos = useEditorStore((s) => s.photos);
  const latestPhotos = useRef(photos);
  const latestPlacementsHydrated = useRef(placementsHydrated);

  useEffect(() => {
    latestPhotos.current = photos;
    latestPlacementsHydrated.current = placementsHydrated;
  }, [photos, placementsHydrated]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          const projectData = data as Project;
          setProject(projectData);
          useEditorStore
            .getState()
            .setGridConfig(getDefaultGridConfig(projectData.format));
          if (projectData.total_pages) {
            useEditorStore.getState().setTotalPages(projectData.total_pages);
          }
        }
        setLoading(false);
      });

    return () => {
      resetEditor();
    };
  }, [projectId, resetEditor]);

  useEffect(() => {
    if (!projectId) return;
    setPageRows([]);
    const supabase = createClient();
    supabase
      .from("project_pages")
      .select("page_index, template_id, background_fill, background")
      .eq("project_id", projectId)
      .then(({ data: pages, error }) => {
        if (error) {
          toast.error(`No se pudo cargar la estructura del fotolibro: ${error.message}`);
          return;
        }
        const typedPages = pages as {
          page_index: number;
          template_id: string | null;
          background_fill: string | null;
          background: PageBackground | null;
        }[] | null;
        if (!typedPages) return;

        setPageRows(typedPages);

        const backgrounds: Record<number, PageBackground> = {};
        typedPages.forEach((p) => {
          if (p.background) {
            backgrounds[p.page_index] = p.background;
          } else if (p.background_fill) {
            backgrounds[p.page_index] = { type: "color", color: p.background_fill };
          }
        });
        useEditorStore.getState().setPageBackgrounds(backgrounds);
      });
  }, [projectId]);

  useEffect(() => {
    if (!project || pageRows.length === 0) return;
    let active = true;

    fetch(`/api/templates?projectId=${encodeURIComponent(project.id)}`)
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || "No se pudieron cargar las plantillas guardadas.");
        }
        return result as { data?: Template[] };
      })
      .then(({ data }) => {
        if (!active) return;
        const byId = new Map<string, PageTemplate>();
        ((data as Template[]) ?? []).forEach((template) => {
          byId.set(template.id, {
            id: template.id,
            name: template.name,
            scope: template.scope ?? "page",
            kind: template.kind,
            slots: template.slots as PageTemplate["slots"],
          });
        });

        const store = useEditorStore.getState();
        const missingTemplates: number[] = [];
        pageRows.forEach((row) => {
          if (!row.template_id) return;
          const template = byId.get(row.template_id);
          if (template) {
            store.setPageTemplate(
              row.page_index,
              pageTemplateForPage(template, row.page_index)
            );
          } else {
            missingTemplates.push(row.page_index + 1);
          }
        });
        if (missingTemplates.length > 0) {
          toast.error(
            `No se pudieron recuperar las plantillas de las páginas ${missingTemplates.join(", ")}.`
          );
        }
      })
      .catch((cause: unknown) => {
        if (!active) return;
        toast.error(
          cause instanceof Error
            ? cause.message
            : "No se pudieron cargar las plantillas guardadas."
        );
      });

    return () => {
      active = false;
    };
  }, [project, pageRows]);

  // Load saved placements + uploaded photos (library) into the editor.
  useEffect(() => {
    if (!projectId) return;
    setPlacementsHydrated(false);
    let active = true;
    const supabase = createClient();

    (async () => {
      const { data: pages } = await supabase
        .from("project_pages")
        .select("id, page_index")
        .eq("project_id", projectId);

      const pageIndexByPageId = new Map<string, number>(
        (pages ?? []).map((p) => [p.id as string, p.page_index as number])
      );
      const pageIds = (pages ?? []).map((p) => p.id as string);

      const placementRows: PlacementRow[] = pageIds.length
        ? (((
            await supabase
              .from("photo_placements")
              .select("*, photos(bucket_path_highres)")
              .in("page_id", pageIds)
          ).data ?? []) as unknown as PlacementRow[])
        : [];

      const photoRows = ((
        await supabase
          .from("photos")
          .select(
            "id, bucket_path_highres, bucket_path_lowres, original_width, original_height"
          )
          .eq("project_id", projectId)
      ).data ?? []) as unknown as PhotoRow[];

      const paths = new Set<string>();
      placementRows.forEach((p) => {
        if (p.photos?.bucket_path_highres) paths.add(p.photos.bucket_path_highres);
      });
      photoRows.forEach((p) => {
        if (p.bucket_path_highres) paths.add(p.bucket_path_highres);
      });

      const urlByPath = new Map<string, string>();
      if (paths.size > 0) {
        const { data: signed } = await supabase.storage
          .from("photos_highres")
          .createSignedUrls(Array.from(paths), 3600);
        (signed ?? []).forEach((entry) => {
          if (entry.path && entry.signedUrl) {
            urlByPath.set(entry.path, entry.signedUrl);
          }
        });
      }

      const urlFor = (path: string | null | undefined) =>
        path ? urlByPath.get(path) ?? path : "";

      const mapped: PhotoPlacement[] = placementRows.map((p) => {
        const url = urlFor(p.photos?.bucket_path_highres);
        return {
          id: p.id,
          photoId: p.photo_id,
          pageIndex: pageIndexByPageId.get(p.page_id) ?? 0,
          x: p.x,
          y: p.y,
          width: p.width,
          height: p.height,
          scaleX: p.scale_x,
          scaleY: p.scale_y,
          rotation: p.rotation,
          zIndex: p.z_index,
          slotIndex: p.slot_index ?? undefined,
          lowResUrl: url,
          highResUrl: url,
          inLibrary: false,
        };
      });

      // The library lists EVERY uploaded photo (a reusable source), while
      // placements are separate canvas entries referencing the same photoId.
      const library: PhotoPlacement[] = photoRows.map((p) => {
        const url = urlFor(p.bucket_path_highres);
        return {
          id: p.id,
          photoId: p.id,
          pageIndex: 0,
          x: 0,
          y: 0,
          width: p.original_width || 200,
          height: p.original_height || 200,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          zIndex: 0,
          lowResUrl: url,
          highResUrl: url,
          inLibrary: true,
        };
      });

      if (!active) return;
      useEditorStore.setState({ photos: [...mapped, ...library] });
      setPlacementsHydrated(true);
    })();

    return () => {
      active = false;
    };
  }, [projectId]);

  // Persist placements (debounced) whenever the canvas changes.
  useEffect(() => {
    if (!placementsHydrated || !projectId) return;
    const timeout = setTimeout(() => {
      void fetch(`/api/projects/${projectId}/placements`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placements: serializePlacements(photos) }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || "No se pudieron guardar las fotos.");
          }
        })
        .catch((cause: unknown) => {
          toast.error(
            cause instanceof Error ? cause.message : "Error al guardar las fotos."
          );
        });
    }, 800);

    return () => clearTimeout(timeout);
  }, [photos, placementsHydrated, projectId]);

  useEffect(
    () => () => {
      if (!latestPlacementsHydrated.current) return;

      void fetch(`/api/projects/${projectId}/placements`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placements: serializePlacements(latestPhotos.current),
        }),
        keepalive: true,
      })
        .then(async (response) => {
          if (!response.ok) {
            const result = await response.json();
            toast.error(result.error || "No se pudieron guardar las fotos al salir.");
          }
        })
        .catch((cause: unknown) => {
          console.error("[editor] failed to save placements when leaving:", cause);
          toast.error("No se pudieron guardar las fotos al salir. Revisa tu conexión.");
        });
    },
    [projectId]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50">
        <p>Proyecto no encontrado</p>
      </div>
    );
  }

  const format = resolveFormat(project.format);
  const dims = getPageDimensions(format);

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <EditorToolbar />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <PageThumbnails format={format} />

          <EditorCanvas
            pageWidth={dims.w}
            pageHeight={dims.h}
            scale={zoom}
          />

          <EditorSidebar projectId={projectId} />
        </div>

        <div className="border-t border-neutral-200 bg-white px-4 py-2 flex items-center justify-end gap-2">
          <button
            onClick={() => setExportOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Exportar y pagar
          </button>
        </div>
      </div>

      <EditorDrawer
        pageWidth={dims.w}
        pageHeight={dims.h}
        projectId={projectId}
        format={format}
      />

      <Modal open={exportOpen} onClose={() => setExportOpen(false)} title="Vista previa de exportación">
        <ExportPreview
          format={format}
          coverType={project.cover_type}
          onExport={() => setExportOpen(false)}
        />
      </Modal>
    </>
  );
}
