"use client";

import { useCallback } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { Dropzone } from "@/components/ui/Dropzone";
import { generateLowResPreview, getImageDimensions } from "@/lib/editor/imageProcessor";
import { v4 as uuid } from "uuid";

export function EditorSidebar() {
  const { currentPage, photos, addPhotoToCanvas } = useEditorStore();

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
      }
    },
    [currentPage, photos.length, addPhotoToCanvas]
  );

  const pagePhotos = photos.filter((p) => p.pageIndex === currentPage);

  return (
    <aside className="w-72 border-l border-neutral-200 bg-white flex flex-col h-full">
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
