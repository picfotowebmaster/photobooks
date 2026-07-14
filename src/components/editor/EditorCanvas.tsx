"use client";

import { useEffect, useLayoutEffect, useRef, useCallback, useState } from "react";
import { Stage, Layer, Transformer } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "@/stores/editorStore";
import { PhotoLayer } from "./PhotoLayer";
import { TextLayer } from "./TextLayer";
import { TextEditPanel } from "./TextEditPanel";
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
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const {
    currentPage,
    photos,
    selectedPhotoId,
    selectPhoto,
    updatePhotoPlacement,
    addPhotoToCanvas,
    pageBackgrounds,
    texts,
    selectedTextId,
    selectText,
    addText,
    updateText,
    removeText,
    activeTool,
  } = useEditorStore();

  const [leftPage, rightPage] = getSpreadPages(currentPage);
  const editOriginalTextRef = useRef("");

  const leaveEditing = useCallback(() => {
    const id = editingTextId;
    if (id) {
      transformerRef.current?.nodes([]);
      const currentText = useEditorStore.getState().texts.find((t) => t.id === id);
      if (currentText) {
        selectText(id);
        transformerRef.current?.getLayer()?.batchDraw();
      }
    }
    setEditingTextId(null);
  }, [editingTextId, selectText]);

  const handleTextEditSave = useCallback(
    (value: string) => {
      const id = editingTextId;
      if (id) {
        const trimmed = value.trim();
        if (trimmed) {
          updateText(id, { text: trimmed });
        }
      }
      leaveEditing();
    },
    [editingTextId, updateText, leaveEditing]
  );

  const handleTextEditCancel = useCallback(() => {
    const id = editingTextId;
    if (id) {
      const original = editOriginalTextRef.current;
      if (original) {
        updateText(id, { text: original });
      }
    }
    leaveEditing();
  }, [editingTextId, updateText, leaveEditing]);

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

  const pageForX = useCallback(
    (x: number) => {
      if (x < pageWidth) return { pageIndex: leftPage, adjustedX: x };
      return { pageIndex: rightPage, adjustedX: x - rightPageX };
    },
    [leftPage, rightPage, pageWidth, rightPageX]
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target !== e.target.getStage()) return;

      if (editingTextId) {
        handleTextEditSave(
          useEditorStore.getState().texts.find((t) => t.id === editingTextId)?.text ?? ""
        );
        return;
      }

      if (activeTool === "text") {
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        const { pageIndex, adjustedX } = pageForX(pos.x);

        addText({
          pageIndex,
          x: adjustedX,
          y: pos.y,
          rotation: 0,
          text: "Escribe aquí",
          fontSize: 24,
          fontFamily: "Inter, sans-serif",
          fontStyle: "normal",
          fill: "#333333",
          align: "left",
        });
      } else {
        transformerRef.current?.nodes([]);
        selectPhoto(null);
        selectText(null);
      }
    },
    [activeTool, editingTextId, pageForX, addText, selectPhoto, selectText, handleTextEditSave]
  );

  const handleTextClick = useCallback(
    (textId: string) => {
      if (editingTextId === textId) return;

      if (selectedTextId === textId) {
        const text = texts.find((t) => t.id === textId);
        if (text) {
          editOriginalTextRef.current = text.text;
          transformerRef.current?.nodes([]);
          setEditingTextId(textId);
        }
      } else {
        selectText(textId);
      }
    },
    [editingTextId, selectedTextId, texts, selectText]
  );

  const handleTextDblClick = useCallback(
    (textId: string) => {
      selectText(textId);
      const text = texts.find((t) => t.id === textId);
      if (text) {
        editOriginalTextRef.current = text.text;
        transformerRef.current?.nodes([]);
        setEditingTextId(textId);
      }
    },
    [selectText, texts]
  );

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

      const { pageIndex, adjustedX } = pageForX(pos.x);

      try {
        const rawData = e.evt.dataTransfer?.getData("application/json");
        if (!rawData) return;
        const photoData: PhotoPlacement = JSON.parse(rawData);
        addPhotoToCanvas({
          ...photoData,
          pageIndex,
          x: adjustedX,
          y: pos.y,
        });
      } catch {
        return;
      }
    },
    [addPhotoToCanvas, pageForX]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useEditorStore.getState();

      if (editingTextId) {
        if (e.key === "Escape") {
          e.preventDefault();
          handleTextEditCancel();
        }
        return;
      }

      if (state.selectedTextId) {
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          transformerRef.current?.nodes([]);
          state.removeText(state.selectedTextId);
        }
        if (e.key === "Enter") {
          e.preventDefault();
          const text = state.texts.find((t) => t.id === state.selectedTextId);
          if (text) {
            editOriginalTextRef.current = text.text;
            transformerRef.current?.nodes([]);
            setEditingTextId(state.selectedTextId);
          }
        }
      }

      if (e.key === "Escape") {
        transformerRef.current?.nodes([]);
        state.selectText(null);
        state.selectPhoto(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingTextId, handleTextEditCancel]);

  const editingTextPlacement = editingTextId
    ? texts.find((t) => t.id === editingTextId) ?? null
    : null;

  const editPanelPos = (() => {
    if (!editingTextPlacement || !containerRef.current) return null;
    const stageEl = containerRef.current.querySelector(".konvajs-content");
    if (!stageEl) return null;
    const rect = stageEl.getBoundingClientRect();
    const eff = baseScale * scale;
    return {
      left: rect.left + editingTextPlacement.x * eff,
      top: Math.max(0, rect.top + editingTextPlacement.y * eff - 140),
    };
  })();

  const spreadPhotos = photos.filter(
    (p) => p.pageIndex === leftPage || p.pageIndex === rightPage
  );

  const spreadTexts = texts.filter(
    (t) => t.pageIndex === leftPage || t.pageIndex === rightPage
  );

  return (
    <div ref={containerRef} className="flex items-center justify-center overflow-auto bg-neutral-200 min-w-0 flex-1 relative">
      {ready && (
        <>
        <Stage
          ref={stageRef}
          width={stageSize.w}
          height={stageSize.h}
          scaleX={baseScale * scale}
          scaleY={baseScale * scale}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleStageClick}
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

            {spreadTexts.map((text) => (
              <TextLayer
                key={text.id}
                textPlacement={text}
                isSelected={text.id === selectedTextId}
                isEditing={text.id === editingTextId}
                onSelect={() => handleTextClick(text.id)}
                onDragEnd={(x, y) => updateText(text.id, { x, y })}
                onTransformEnd={(x, y, width, _height, _sx, _sy, rotation) =>
                  updateText(text.id, { x, y, width, rotation })
                }
                onDblClick={() => handleTextDblClick(text.id)}
                transformerRef={transformerRef}
              />
            ))}

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

        {editingTextPlacement && editPanelPos && (
          <div
            className="absolute z-40"
            style={{ left: `${editPanelPos.left}px`, top: `${editPanelPos.top}px` }}
          >
            <TextEditPanel
              textPlacement={editingTextPlacement}
              onSave={handleTextEditSave}
              onCancel={handleTextEditCancel}
            />
          </div>
        )}
        </>
      )}
    </div>
  );
}
