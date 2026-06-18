import { LOW_RES_MAX_DIMENSION, LOW_RES_QUALITY } from "./canvasConfig";

export function calculateLowResDims(w: number, h: number): {
  width: number;
  height: number;
} {
  if (w <= LOW_RES_MAX_DIMENSION && h <= LOW_RES_MAX_DIMENSION) {
    return { width: w, height: h };
  }
  const ratio = Math.min(LOW_RES_MAX_DIMENSION / w, LOW_RES_MAX_DIMENSION / h);
  return {
    width: Math.round(w * ratio),
    height: Math.round(h * ratio),
  };
}

export async function generateLowResPreview(file: File): Promise<{
  blob: Blob;
  objectUrl: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = calculateLowResDims(img.width, img.height);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Failed to create blob"));
          resolve({
            blob,
            objectUrl: URL.createObjectURL(blob),
            width,
            height,
          });
        },
        "image/jpeg",
        LOW_RES_QUALITY
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export function getImageDimensions(file: File): Promise<{
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}
