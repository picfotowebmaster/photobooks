import { useEditorStore } from "@/stores/editorStore";
import { generateLowResPreview, getImageDimensions } from "@/lib/editor/imageProcessor";
import { v4 as uuid } from "uuid";
import { useCallback, useState } from "react";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const { currentPage, photos } = useEditorStore();

  const processImage = useCallback(
    async (file: File) => {
      const dims = await getImageDimensions(file);
      const preview = await generateLowResPreview(file);
      const id = uuid();

      return {
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
        file,
        originalDims: dims,
      };
    },
    [currentPage, photos.length]
  );

  return { uploading, processImage };
}
