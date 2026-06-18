"use client";

import { useCallback, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils/cn";

interface DropzoneProps {
  onFilesDrop: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export function Dropzone({
  onFilesDrop,
  accept = "image/*",
  multiple = true,
  className,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length > 0) onFilesDrop(files);
    },
    [onFilesDrop]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
        isDragging
          ? "border-primary-500 bg-primary-50"
          : "border-neutral-300 bg-neutral-50 hover:border-neutral-400",
        className
      )}
    >
      <label className="cursor-pointer">
        <span className="text-sm font-medium text-primary-600 hover:text-primary-700">
          Haz clic para subir
        </span>
        <span className="text-sm text-neutral-500"> o arrastra y suelta</span>
        <input
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) onFilesDrop(files);
            e.target.value = "";
          }}
        />
      </label>
      <p className="text-xs text-neutral-400">JPG, PNG o WebP hasta 30MB</p>
    </div>
  );
}
