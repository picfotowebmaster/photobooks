import { useEditorStore } from "@/stores/editorStore";
import { generateLowResPreview, getImageDimensions } from "@/lib/editor/imageProcessor";
import { v4 as uuid } from "uuid";
import { useCallback, useState } from "react";

export function useImageUpload(projectId?: string) {
  const [uploading, setUploading] = useState(false);
  const { currentPage, photos } = useEditorStore();

  const processImage = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const dims = await getImageDimensions(file);
        const preview = await generateLowResPreview(file);
        const id = uuid();

        let highResUrl = "";
        let photoId = id;

        if (projectId) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("projectId", projectId);

          const res = await fetch("/api/upload", { method: "POST", body: formData });

          if (res.ok) {
            const { data } = await res.json();
            highResUrl = data.highResUrl as string;
            photoId = data.id as string;
          }
        }

        return {
          id,
          photoId,
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
          highResUrl,
        };
      } finally {
        setUploading(false);
      }
    },
    [currentPage, photos.length, projectId]
  );

  return { uploading, processImage };
}
