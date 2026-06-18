"use client";

import { useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Transformer } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "@/stores/editorStore";
import { PhotoLayer } from "./PhotoLayer";
import { BackgroundLayer } from "./BackgroundLayer";
import type { PhotoPlacement } from "@/types/editor";

interface EditorCanvasProps {
  pageWidth: number;
  pageHeight: number;
  scale: number;
}

export function EditorCanvas({ pageWidth, pageHeight, scale }: EditorCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const {
    currentPage,
    photos,
    selectedPhotoId,
    selectPhoto,
    updatePhotoPlacement,
    addPhotoToCanvas,
    pageBackgrounds,
  } = useEditorStore();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const direction = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.max(0.2, Math.min(2, scale + direction));
        useEditorStore.getState().setZoom(newScale);
      }
    };

    stage.container().addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      stage.container()?.removeEventListener("wheel", handleWheel);
    };
  }, [scale]);

  const handleDragOver = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    e.evt.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      stage.container().style.cursor = "default";

      const pos = stage.getPointerPosition();
      if (!pos) return;

      try {
        const rawData = e.evt.dataTransfer?.getData("application/json");
        if (!rawData) return;
        const photoData: PhotoPlacement = JSON.parse(rawData);
        addPhotoToCanvas({
          ...photoData,
          x: pos.x / scale,
          y: pos.y / scale,
        });
      } catch {
        return;
      }
    },
    [addPhotoToCanvas, scale]
  );

  const pagePhotos = photos.filter((p) => p.pageIndex === currentPage);

  return (
    <div className="flex items-center justify-center overflow-hidden bg-neutral-200 p-8">
      <Stage
        ref={stageRef}
        width={pageWidth * scale}
        height={pageHeight * scale}
        scaleX={scale}
        scaleY={scale}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={(e) => {
          if (e.target === e.target.getStage()) selectPhoto(null);
        }}
        className="shadow-2xl"
        style={{ background: "white" }}
      >
        <Layer>
          <BackgroundLayer
            pageIndex={currentPage}
            width={pageWidth}
            height={pageHeight}
            backgroundColor={pageBackgrounds[currentPage]}
          />
        </Layer>

        <Layer>
          {pagePhotos.map((photo) => (
            <PhotoLayer
              key={photo.id}
              photo={photo}
              isSelected={photo.id === selectedPhotoId}
              onSelect={() => selectPhoto(photo.id)}
              onDragEnd={(x, y) =>
                updatePhotoPlacement(photo.id, { x, y })
              }
              onTransformEnd={(x, y, scaleX, scaleY, rotation) =>
                updatePhotoPlacement(photo.id, { x, y, scaleX, scaleY, rotation })
              }
              transformerRef={transformerRef}
            />
          ))}
        </Layer>

        <Layer>
          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            enabledAnchors={[
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right",
            ]}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 30 || newBox.height < 30) return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}
