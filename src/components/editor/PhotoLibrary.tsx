"use client";

import { useCallback } from "react";
import { v4 as uuid } from "uuid";
import { toast } from "sonner";
import { useEditorStore } from "@/stores/editorStore";
import { Dropzone } from "@/components/ui/Dropzone";
import { generateLowResPreview } from "@/lib/editor/imageProcessor";
import type { PhotoPlacement } from "@/types/editor";

interface PhotoLibraryProps {
  projectId: string;
}

export function PhotoLibrary({ projectId }: PhotoLibraryProps) {
  const { currentPage, photos, addPhotoToCanvas } = useEditorStore();
  const libraryPhotos = photos.filter((photo) => photo.inLibrary);

  const handleFilesDrop = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        const preview = await generateLowResPreview(file);
        const id = uuid();

        addPhotoToCanvas({
          id,
          photoId: id,
          pageIndex: currentPage,
          x: 0,
          y: 0,
          width: preview.width,
          height: preview.height,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          zIndex: photos.length,
          lowResUrl: preview.objectUrl,
          highResUrl: "",
          inLibrary: true,
        });

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("projectId", projectId);
          formData.append("width", String(preview.width));
          formData.append("height", String(preview.height));

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json();
            toast.error(error.error || "Error al subir la imagen");
            continue;
          }

          const { data } = await response.json();
          useEditorStore.getState().updatePhotoPlacement(id, {
            highResUrl: data.highResUrl as string,
            photoId: data.id as string,
          });
        } catch {
          toast.error("Error de conexión al subir la imagen");
        }
      }
    },
    [addPhotoToCanvas, currentPage, photos.length, projectId]
  );

  const handleDragStart = (event: React.DragEvent<HTMLImageElement>, photo: PhotoPlacement) => {
    const data = JSON.stringify(photo);
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/json", data);
    event.dataTransfer.setData("text/plain", data);
  };

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden border-t border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-3 py-2">
        <h3 className="text-sm font-semibold text-neutral-900">
          Biblioteca <span className="text-neutral-400">({libraryPhotos.length})</span>
        </h3>
        <p className="mt-0.5 text-[11px] text-neutral-500">
          Arrastra una imagen a cualquier cuadro
        </p>
      </div>

      <div className="shrink-0 p-3">
        <Dropzone onFilesDrop={handleFilesDrop} className="p-4" />
      </div>

      <div className="editor-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 pb-3">
        {libraryPhotos.length === 0 ? (
          <p className="py-5 text-center text-xs text-neutral-400">
            Tus imágenes aparecerán aquí
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {libraryPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-md border border-neutral-200 bg-neutral-100"
              >
                <img
                  src={photo.lowResUrl}
                  alt=""
                  className="h-full w-full cursor-grab object-cover active:cursor-grabbing"
                  draggable
                  onDragStart={(event) => handleDragStart(event, photo)}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/55 px-1.5 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Arrastrar al cuadro
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
