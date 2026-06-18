import { useEditorStore } from "@/stores/editorStore";
import { useCallback } from "react";
import { useImageUpload } from "./useImageUpload";

export function useEditor() {
  const store = useEditorStore();
  const { processImage } = useImageUpload();

  const addPhotoFromFile = useCallback(
    async (file: File) => {
      const placement = await processImage(file);
      store.addPhotoToCanvas(placement);
    },
    [store, processImage]
  );

  return {
    ...store,
    addPhotoFromFile,
  };
}
