"use client";

import { useEffect, useLayoutEffect, useRef, useCallback, useState } from "react";
import { Stage, Layer, Transformer } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "@/stores/editorStore";
import { PhotoLayer } from "./PhotoLayer";
import { BackgroundLayer } from "./BackgroundLayer";
import {
  getSpreadPages,
  getSpreadCanvasWidth,
  SPREAD_GAP_PX,
} from "@/lib/editor/canvasConfig";
import type { PhotoPlacement } from "@/types/editor";

interface EditorCanvasProps {
  pageWidth: number;
  pageHeight: number;
  scale: number;
}

export function EditorCanvas({ pageWidth, pageHeight, scale }: EditorCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const didFit = useRef(false);

  const canvasWidth = getSpreadCanvasWidth(pageWidth);
  const rightPageX = pageWidth + SPREAD_GAP_PX;

  const [ready, setReady] = useState(false);
  const [stageSize, setStageSize] = useState({ w: canvasWidth, h: pageHeight });
  const [baseScale, setBaseScale] = useState(1);

  const {
    currentPage,
    photos,
    selectedPhotoId,
    selectPhoto,
    updatePhotoPlacement,
    addPhotoToCanvas,
    pageBackgrounds,
  } = useEditorStore();

  const [leftPage, rightPage] = getSpreadPages(currentPage);

  useLayoutEffect(() => {
    if (didFit.current) return;
    const el = containerRef.current;
    if (!el) return;
    const cw = el.clientWidth - 64;
    const ch = el.clientHeight - 64;
    if (cw <= 0 || ch <= 0) return;
    const bs = Math.min(cw / canvasWidth, ch / pageHeight);
    const clampedBs = Math.max(0.05, Math.round(bs * 10000) / 10000);
    setBaseScale(clampedBs);
    setStageSize({ w: Math.round(canvasWidth * clampedBs), h: Math.round(pageHeight * clampedBs) });
    didFit.current = true;
    setReady(true);
  }, [canvasWidth, pageHeight]);

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

      const x = pos.x;
      const y = pos.y;

      let targetPage: number;
      let adjustedX: number;

      if (x < pageWidth) {
        targetPage = leftPage;
        adjustedX = x;
      } else if (x >= rightPageX) {
        targetPage = rightPage;
        adjustedX = x - rightPageX;
      } else {
        targetPage = rightPage;
        adjustedX = 0;
      }

      try {
        const rawData = e.evt.dataTransfer?.getData("application/json");
        if (!rawData) return;
        const photoData: PhotoPlacement = JSON.parse(rawData);
        addPhotoToCanvas({
          ...photoData,
          pageIndex: targetPage,
          x: adjustedX,
          y,
        });
      } catch {
        return;
      }
    },
    [addPhotoToCanvas, leftPage, rightPage, pageWidth, rightPageX]
  );

  const spreadPhotos = photos.filter(
    (p) => p.pageIndex === leftPage || p.pageIndex === rightPage
  );

  return (
    <div ref={containerRef} className="flex items-center justify-center overflow-hidden bg-neutral-200 p-8 min-w-0 flex-1">
      {ready && (
      <Stage
        ref={stageRef}
        width={stageSize.w}
        height={stageSize.h}
        scaleX={baseScale * scale}
        scaleY={baseScale * scale}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={(e) => {
          if (e.target === e.target.getStage()) selectPhoto(null);
        }}
        className="shadow-2xl"
        style={{ background: "rgb(229, 229, 229)" }}
      >
        <Layer>
          <BackgroundLayer
            pageIndex={leftPage}
            width={pageWidth}
            height={pageHeight}
            backgroundColor={pageBackgrounds[leftPage]}
          />
          <BackgroundLayer
            pageIndex={rightPage}
            width={pageWidth}
            height={pageHeight}
            x={rightPageX}
            backgroundColor={pageBackgrounds[rightPage]}
          />
        </Layer>

        <Layer>
          {spreadPhotos.map((photo) => (
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
      )}
    </div>
  );
}
