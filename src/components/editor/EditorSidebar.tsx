"use client";

import { useCallback } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { Dropzone } from "@/components/ui/Dropzone";
import { TemplatePicker } from "./TemplatePicker";
import { generateLowResPreview, getImageDimensions } from "@/lib/editor/imageProcessor";
import { useTemplates } from "@/hooks/useTemplates";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuid } from "uuid";
import { toast } from "sonner";
import type { PageTemplate } from "@/types/editor";

interface EditorSidebarProps {
  projectId: string;
  format: string;
}

export function EditorSidebar({ projectId, format }: EditorSidebarProps) {
  const {
    currentPage,
    photos,
    templates,
    addPhotoToCanvas,
    setPageTemplate,
    updatePhotoPlacement,
  } = useEditorStore();

  const { templates: dbTemplates, loading: templatesLoading } = useTemplates(format);

  const handleTemplateSelect = useCallback(
    async (template: PageTemplate) => {
      setPageTemplate(currentPage, template);

      const pagePhotos = photos.filter((p) => p.pageIndex === currentPage);
      const count = Math.min(pagePhotos.length, template.slots.length);

      for (let i = 0; i < count; i++) {
        const slot = template.slots[i];
        const photo = pagePhotos[i];
        const scaleX = slot.w / photo.width;
        const scaleY = slot.h / photo.height;
        const scale = Math.min(scaleX, scaleY);

        updatePhotoPlacement(photo.id, {
          x: slot.x,
          y: slot.y,
          scaleX: scale,
          scaleY: scale,
          rotation: 0,
        });
      }

      const supabase = createClient();
      await supabase.from("project_pages").upsert(
        {
          project_id: projectId,
          page_index: currentPage,
          template_id: template.id,
        },
        { onConflict: "project_id, page_index" }
      );
    },
    [currentPage, photos, projectId, setPageTemplate, updatePhotoPlacement]
  );

  const handleFilesDrop = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        const dims = await getImageDimensions(file);
        const preview = await generateLowResPreview(file);
        const id = uuid();

        addPhotoToCanvas({
          id,
          photoId: id,
          pageIndex: currentPage,
          x: 50 + Math.random() * 200,
          y: 50 + Math.random() * 200,
          width: preview.width,
          height: preview.height,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          zIndex: photos.length,
          lowResUrl: preview.objectUrl,
          highResUrl: "",
        });

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("projectId", projectId);

          const res = await fetch("/api/upload", { method: "POST", body: formData });

          if (!res.ok) {
            const err = await res.json();
            toast.error(err.error || "Error al subir la imagen");
            continue;
          }

          const { data } = await res.json();
          const highResUrl = data.highResUrl as string;

          useEditorStore.getState().updatePhotoPlacement(id, { highResUrl, photoId: data.id as string });
        } catch {
          toast.error("Error de conexión al subir la imagen");
        }
      }
    },
    [currentPage, photos.length, addPhotoToCanvas, projectId]
  );

  const pagePhotos = photos.filter((p) => p.pageIndex === currentPage);
  const activeTemplate = templates[currentPage];

  const pageTemplates: PageTemplate[] = dbTemplates.map((t) => ({
    id: t.id,
    name: t.name,
    slots: t.slots as PageTemplate["slots"],
  }));

  return (
    <aside className="w-72 border-l border-neutral-200 bg-white flex flex-col h-full">
      <div className="p-4 border-b border-neutral-100">
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">
          Plantillas
        </h3>
        {templatesLoading ? (
          <p className="text-xs text-neutral-400">Cargando...</p>
        ) : (
          <TemplatePicker
            templates={pageTemplates}
            selectedId={activeTemplate?.id ?? null}
            onSelect={handleTemplateSelect}
          />
        )}
      </div>

      <div className="p-4 border-b border-neutral-100">
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">
          Añadir fotos
        </h3>
        <Dropzone onFilesDrop={handleFilesDrop} />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">
          Fotos de la página ({pagePhotos.length})
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {pagePhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100"
            >
              <img
                src={photo.lowResUrl}
                alt=""
                className="w-full h-full object-cover"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/json", JSON.stringify(photo));
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
