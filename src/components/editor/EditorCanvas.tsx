"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Group,
  Image as KonvaImage,
} from "react-konva";
import Konva from "konva";
import { v4 as uuid } from "uuid";
import { useEditorStore } from "@/stores/editorStore";
import { PhotoLayer } from "./PhotoLayer";
import { TextLayer } from "./TextLayer";
import { StickerLayer } from "./StickerLayer";
import { TextEditPanel } from "./TextEditPanel";
import { BackgroundLayer } from "./BackgroundLayer";
import { GridOverlay } from "./GridOverlay";
import { CanvasToolbar } from "./CanvasToolbar";
import { getStickerById } from "@/types/sticker";
import {
  getSpreadPages,
  getSpreadCanvasWidth,
  SPREAD_GAP_PX,
  stepZoom,
} from "@/lib/editor/canvasConfig";
import type { PhotoPlacement, TemplateSlot } from "@/types/editor";
import { mmToPx } from "@/lib/editor/coordinateMapper";
import { withSupabaseAssetApiKey } from "@/lib/supabase/assetUrl";
import { TEMPLATE_BLEED_MM } from "@/lib/editor/templateCatalog";
import {
  findAvailableSlot,
  findSnapSlot,
  getPhotoPlacementForSlot,
  isPhotoInSlot,
} from "@/lib/editor/templateSlots";

/** Sangrado (rebase) en px a 300 dpi. */
const BLEED_PX = mmToPx(TEMPLATE_BLEED_MM);

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

  const bleedPx = BLEED_PX;
  const mediaWidth = pageWidth + bleedPx * 2;
  const mediaHeight = pageHeight + bleedPx * 2;
  const canvasWidth = getSpreadCanvasWidth(mediaWidth);
  const rightPageX = mediaWidth + SPREAD_GAP_PX;

  const [ready, setReady] = useState(false);
  const [stageSize, setStageSize] = useState({ w: canvasWidth, h: mediaHeight });
  const [baseScale, setBaseScale] = useState(1);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [activeSlot, setActiveSlot] = useState<{
    pageIndex: number;
    slotIndex: number;
  } | null>(null);
  const [dragPreviewPhoto, setDragPreviewPhoto] = useState<PhotoPlacement | null>(null);
  const [dragPreviewImage, setDragPreviewImage] = useState<HTMLImageElement | null>(null);
  const [slotIconImage, setSlotIconImage] = useState<HTMLImageElement | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, left: 0, top: 0 });

  const {
    currentPage,
    setCurrentPage,
    photos,
    selectedPhotoId,
    selectPhoto,
    clearSelection,
    updatePhotoPlacement,
    addPhotoToCanvas,
    removePhoto,
    pageBackgrounds,
    templates,
    texts,
    selectedTextId,
    selectText,
    addText,
    updateText,
    removeText,
    stickers,
    selectedStickerId,
    selectSticker,
    addSticker,
    updateSticker,
    removeSticker,
    activeStickerId,
    activeTool,
    gridConfig,
    previewMode,
  } = useEditorStore();

  const [leftPage, rightPage] = getSpreadPages(currentPage);
  const effectivePan = activeTool === "pan" || spaceHeld;
  const editOriginalTextRef = useRef("");

  useEffect(() => {
    const image = new window.Image();
    image.src = "/icons/images-plus.svg";
    image.onload = () => setSlotIconImage(image);
  }, []);

  useEffect(() => {
    if (!dragPreviewPhoto?.lowResUrl) {
      setDragPreviewImage(null);
      return;
    }

    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = withSupabaseAssetApiKey(dragPreviewPhoto.lowResUrl);
    image.onload = () => setDragPreviewImage(image);
    return () => {
      image.onload = null;
    };
  }, [dragPreviewPhoto?.lowResUrl]);

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
    const bs = Math.min(cw / canvasWidth, ch / mediaHeight);
    const clampedBs = Math.max(0.05, Math.round(bs * 10000) / 10000);
    setBaseScale(clampedBs);
    setStageSize({ w: Math.round(canvasWidth * clampedBs), h: Math.round(mediaHeight * clampedBs) });
    didFit.current = true;
    setReady(true);
  }, [canvasWidth, mediaHeight]);

  const zoomAtPoint = useCallback(
    (clientX: number, clientY: number, direction: -1 | 1) => {
      const stage = stageRef.current;
      const scrollContainer = scrollRef.current;
      if (!stage || !scrollContainer) return;

      const currentZoom = useEditorStore.getState().zoom;
      const nextZoom = stepZoom(currentZoom, direction);
      if (nextZoom === currentZoom) return;

      const rect = stage.container().getBoundingClientRect();
      const effectiveScale = baseScale * currentZoom;
      const pointX = (clientX - rect.left) / effectiveScale;
      const pointY = (clientY - rect.top) / effectiveScale;

      useEditorStore.getState().setZoom(nextZoom);
      window.requestAnimationFrame(() => {
        const nextRect = stage.container().getBoundingClientRect();
        scrollContainer.scrollLeft +=
          pointX * baseScale * nextZoom - (clientX - nextRect.left);
        scrollContainer.scrollTop +=
          pointY * baseScale * nextZoom - (clientY - nextRect.top);
      });
    },
    [baseScale]
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const direction = e.deltaY > 0 ? -1 : 1;
        zoomAtPoint(e.clientX, e.clientY, direction);
      }
    };

    stage.container().addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      stage.container()?.removeEventListener("wheel", handleWheel);
    };
  }, [zoomAtPoint]);

  const startPan = useCallback((clientX: number, clientY: number) => {
    const el = scrollRef.current;
    if (!el) return;
    isPanningRef.current = true;
    setIsPanning(true);
    panStartRef.current = {
      x: clientX,
      y: clientY,
      left: el.scrollLeft,
      top: el.scrollTop,
    };
  }, []);

  useEffect(() => {
    if (!isPanning) return;
    const handleMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return;
      const el = scrollRef.current;
      if (!el) return;
      el.scrollLeft = panStartRef.current.left - (e.clientX - panStartRef.current.x);
      el.scrollTop = panStartRef.current.top - (e.clientY - panStartRef.current.y);
    };
    const handleUp = () => {
      isPanningRef.current = false;
      setIsPanning(false);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isPanning]);

  useEffect(() => {
    if (activeTool !== "zoom" && activeTool !== "pan") return;
    transformerRef.current?.nodes([]);
    clearSelection();
  }, [activeTool, clearSelection]);

  const handleScrollMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.button === 1) {
      e.preventDefault();
      startPan(e.clientX, e.clientY);
    } else if (e.button === 0 && (activeTool === "pan" || spaceHeld)) {
      e.preventDefault();
      startPan(e.clientX, e.clientY);
    }
  };

  const pageForX = useCallback(
    (x: number) => {
      const localX = x - bleedPx;
      if (localX < pageWidth) return { pageIndex: leftPage, adjustedX: localX };
      return { pageIndex: rightPage, adjustedX: localX - rightPageX };
    },
    [leftPage, rightPage, pageWidth, rightPageX, bleedPx]
  );

  const handlePageSelect = useCallback(
    (pageIndex: number) => {
      if (activeTool !== "select") return;
      transformerRef.current?.nodes([]);
      clearSelection();
      setCurrentPage(pageIndex);
    },
    [activeTool, clearSelection, setCurrentPage]
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target !== e.target.getStage()) return;

      if (activeTool === "pan" || spaceHeld) return;

      if (editingTextId) {
        handleTextEditSave(
          useEditorStore.getState().texts.find((t) => t.id === editingTextId)?.text ?? ""
        );
        return;
      }

      // Zoom tool: click = zoom in, shift+click = zoom out
      if (activeTool === "zoom") {
        zoomAtPoint(
          e.evt.clientX,
          e.evt.clientY,
          e.evt.shiftKey ? -1 : 1
        );
        return;
      }

      if (activeTool === "sticker") {
        const def = getStickerById(activeStickerId ?? undefined);
        if (!def) return;

        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        const { pageIndex, adjustedX } = pageForX(pos.x);

        const img = new window.Image();
        img.src = def.imagePath;
        img.onload = () => {
          const max = 200;
          const ratio = Math.min(max / img.naturalWidth, max / img.naturalHeight);
          addSticker({
            stickerId: def.id,
            pageIndex,
            x: adjustedX,
            y: pos.y - BLEED_PX,
            width: Math.round(img.naturalWidth * ratio),
            height: Math.round(img.naturalHeight * ratio),
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            zIndex: useEditorStore.getState().stickers.length,
          });
        };
        return;
      }

      if (activeTool === "text") {
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;

        const { pageIndex, adjustedX } = pageForX(pos.x);

        addText({
          pageIndex,
          x: adjustedX,
          y: pos.y - BLEED_PX,
          rotation: 0,
          text: "Escribe aquí",
          fontSize: 200,
          fontFamily: "Inter, sans-serif",
          fontStyle: "normal",
          fill: "#333333",
          align: "left",
        });
      } else {
        transformerRef.current?.nodes([]);
        selectPhoto(null);
        selectText(null);
        selectSticker(null);
      }
    },
    [
      activeTool,
      editingTextId,
      pageForX,
      addText,
      addSticker,
      activeStickerId,
      selectPhoto,
      selectText,
      selectSticker,
      handleTextEditSave,
      spaceHeld,
      zoomAtPoint,
    ]
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

  const readDraggedPhoto = useCallback((event: DragEvent) => {
    const rawData =
      event.dataTransfer?.getData("application/json") ||
      event.dataTransfer?.getData("text/plain");
    if (!rawData) return null;

    try {
      return JSON.parse(rawData) as PhotoPlacement;
    } catch {
      return null;
    }
  }, []);

  const getSlotAtPosition = useCallback(
    (position: { x: number; y: number }) => {
      const localX = position.x - bleedPx;
      const localY = position.y - bleedPx;
      const pageIndex = localX < pageWidth ? leftPage : rightPage;
      const pageX = localX < pageWidth ? localX : localX - rightPageX;
      const template = templates[pageIndex];

      const slotIndex = template
        ? template.slots.findIndex(
            (slot) =>
              pageX >= slot.x &&
              pageX <= slot.x + slot.w &&
              localY >= slot.y &&
              localY <= slot.y + slot.h
          )
        : -1;
      if (slotIndex >= 0) {
        return { pageIndex, slotIndex };
      }

      // Cross-gutter span slots (panorama) live on the left page but cover the
      // whole spread: match them using the spread coordinate.
      const leftTemplate = templates[leftPage];
      if (leftTemplate) {
        const spanIndex = leftTemplate.slots.findIndex(
          (slot) =>
            slot.span === "spread" &&
            localX >= slot.x &&
            localX <= slot.x + slot.w &&
            localY >= slot.y &&
            localY <= slot.y + slot.h
        );
        if (spanIndex >= 0) {
          return { pageIndex: leftPage, slotIndex: spanIndex };
        }
      }

      return null;
    },
    [leftPage, pageWidth, rightPage, rightPageX, templates, bleedPx]
  );

  const clearSlotPreview = useCallback(() => {
    setActiveSlot(null);
    setDragPreviewPhoto(null);
  }, []);

  const handleCanvasDragOver = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (previewMode) return;
      if (activeTool !== "select") return;

      const stage = stageRef.current;
      if (!stage) return;
      const types = Array.from(event.dataTransfer?.types ?? []);
      if (!types.includes("application/json") && !types.includes("text/plain")) {
        clearSlotPreview();
        return;
      }

      const rect = stage.container().getBoundingClientRect();
      const effectiveScale = baseScale * scale;
      const position = {
        x: (event.clientX - rect.left) / effectiveScale,
        y: (event.clientY - rect.top) / effectiveScale,
      };
      const target = position ? getSlotAtPosition(position) : null;
      if (!target) {
        clearSlotPreview();
        return;
      }

      setActiveSlot(target);
      setDragPreviewPhoto(readDraggedPhoto(event));
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    },
    [
      activeTool,
      baseScale,
      clearSlotPreview,
      getSlotAtPosition,
      previewMode,
      readDraggedPhoto,
      scale,
    ]
  );

  const placePhotoInSlot = useCallback(
    (photo: PhotoPlacement, pageIndex: number, slotIndex: number) => {
      const template = templates[pageIndex];
      const slot = template?.slots[slotIndex];
      if (!slot) return;

      const occupied = photos.some(
        (otherPhoto) =>
          otherPhoto.id !== photo.id &&
          otherPhoto.pageIndex === pageIndex &&
          isPhotoInSlot(otherPhoto, slot, slotIndex)
      );

      const placement = {
        ...getPhotoPlacementForSlot(photo, slot),
        pageIndex,
        inLibrary: false,
        slotIndex,
      };
      const isLibraryPhoto = photo.inLibrary === true;
      const existingPhoto = photos.some((existing) => existing.id === photo.id);
      const occupiedPhoto = photos.find(
        (existing) =>
          !existing.inLibrary &&
          existing.id !== photo.id &&
          existing.pageIndex === pageIndex &&
          isPhotoInSlot(existing, slot, slotIndex)
      );

      if (occupied && occupiedPhoto) {
        removePhoto(occupiedPhoto.id);
      }

      if (isLibraryPhoto) {
        // Place a COPY on the canvas and keep the library entry, so the same
        // photo can be reused in other slots/pages.
        addPhotoToCanvas({ ...photo, ...placement, id: uuid() });
      } else if (existingPhoto) {
        updatePhotoPlacement(photo.id, placement);
      } else {
        addPhotoToCanvas({ ...photo, ...placement });
      }

      setCurrentPage(pageIndex);
      clearSlotPreview();
    },
    [
      addPhotoToCanvas,
      clearSlotPreview,
      photos,
      removePhoto,
      setCurrentPage,
      templates,
      updatePhotoPlacement,
    ]
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      clearSlotPreview();
    if (previewMode) return;
    if (activeTool === "zoom" || activeTool === "pan") return;

      const stage = stageRef.current;
      if (!stage) return;

      stage.setPointersPositions(event);

      stage.container().style.cursor = "";

      const rect = stage.container().getBoundingClientRect();
      const effectiveScale = baseScale * scale;
      const pos = {
        x: (event.clientX - rect.left) / effectiveScale,
        y: (event.clientY - rect.top) / effectiveScale,
      };
      if (!pos) return;

      const { pageIndex, adjustedX } = pageForX(pos.x);

      try {
        const stickerData = event.dataTransfer?.getData("application/x-photobook-sticker");
        if (stickerData) {
          const { stickerId } = JSON.parse(stickerData) as { stickerId?: string };
          const def = getStickerById(stickerId);
          if (!def) return;

          const img = new window.Image();
          img.src = def.imagePath;
          img.onload = () => {
            const max = 200;
            const ratio = Math.min(max / img.naturalWidth, max / img.naturalHeight);
            addSticker({
              stickerId: def.id,
              pageIndex,
              x: adjustedX,
              y: pos.y - BLEED_PX,
              width: Math.round(img.naturalWidth * ratio),
              height: Math.round(img.naturalHeight * ratio),
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              zIndex: useEditorStore.getState().stickers.length,
            });
          };
          return;
        }

        const rawData =
          event.dataTransfer?.getData("application/json") ||
          event.dataTransfer?.getData("text/plain");
        if (!rawData) return;
        const photoData: PhotoPlacement = JSON.parse(rawData);
        const target = getSlotAtPosition(pos);
        if (target) {
          placePhotoInSlot(photoData, target.pageIndex, target.slotIndex);
        } else if (photos.some((photo) => photo.id === photoData.id)) {
          updatePhotoPlacement(photoData.id, {
            pageIndex,
            x: adjustedX,
            y: pos.y - BLEED_PX,
            inLibrary: false,
            slotIndex: undefined,
          });
          clearSlotPreview();
        } else {
          addPhotoToCanvas({
            ...photoData,
            pageIndex,
            x: adjustedX,
            y: pos.y - BLEED_PX,
            inLibrary: false,
            slotIndex: undefined,
          });
          clearSlotPreview();
        }
      } catch {
        clearSlotPreview();
        return;
      }
    },
    [
      activeTool,
      addPhotoToCanvas,
      addSticker,
      baseScale,
      clearSlotPreview,
      getSlotAtPosition,
      pageForX,
      photos,
      placePhotoInSlot,
      previewMode,
      scale,
      updatePhotoPlacement,
    ]
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

      const target = e.target;
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, button, a[href], [contenteditable="true"], [role="textbox"]')
      ) {
        return;
      }

      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === "v" || e.key === "V") {
          e.preventDefault();
          state.setActiveTool("select");
        } else if (e.key === "h" || e.key === "H") {
          e.preventDefault();
          state.setActiveTool("pan");
        } else if (e.key === "z" || e.key === "Z") {
          e.preventDefault();
          state.setActiveTool("zoom");
        }
      }

      if (e.code === "Space") {
        if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
        e.preventDefault();
        setSpaceHeld(true);
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

      if (state.selectedPhotoId) {
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          transformerRef.current?.nodes([]);
          state.removePhoto(state.selectedPhotoId);
        }
      }

      if (state.selectedStickerId) {
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          transformerRef.current?.nodes([]);
          state.removeSticker(state.selectedStickerId);
        }
      }

      if (e.key === "Escape") {
        transformerRef.current?.nodes([]);
        state.selectText(null);
        state.selectPhoto(null);
        state.selectSticker(null);
        if (state.activeTool === "zoom" || state.activeTool === "pan") {
          state.setActiveTool("select");
        }
      }

    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingTextId, handleTextEditCancel]);

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceHeld(false);
    };
    const handleBlur = () => setSpaceHeld(false);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    const handleDragEnd = () => clearSlotPreview();
    window.addEventListener("dragend", handleDragEnd);
    window.addEventListener("drop", handleDragEnd);
    return () => {
      window.removeEventListener("dragend", handleDragEnd);
      window.removeEventListener("drop", handleDragEnd);
    };
  }, [clearSlotPreview]);

  useEffect(() => {
    if (!ready) return;
    const stage = stageRef.current;
    if (!stage) return;
    const container = stage.container();
    container.addEventListener("dragover", handleCanvasDragOver);
    container.addEventListener("drop", handleDrop);
    return () => {
      container.removeEventListener("dragover", handleCanvasDragOver);
      container.removeEventListener("drop", handleDrop);
    };
  }, [handleCanvasDragOver, handleDrop, ready]);

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
    (p) =>
      !p.inLibrary &&
      (p.pageIndex === leftPage || p.pageIndex === rightPage)
  );

  const spreadTexts = texts.filter(
    (t) => t.pageIndex === leftPage || t.pageIndex === rightPage
  );

  const spreadStickers = stickers.filter(
    (s) => s.pageIndex === leftPage || s.pageIndex === rightPage
  );

  const renderSlotPlaceholder = (
    slot: TemplateSlot,
    pageIndex: number,
    xOffset: number,
    key: string,
    slotIndex: number
  ) => {
    const occupied = photos.some(
      (photo) =>
        !photo.inLibrary &&
        photo.pageIndex === pageIndex &&
        isPhotoInSlot(photo, slot, slotIndex)
    );
    const isActive =
      activeSlot?.pageIndex === pageIndex && activeSlot.slotIndex === slotIndex;
    const isDropTarget = activeTool === "select" && !effectivePan;

    const iconSize = Math.min(180, Math.max(110, Math.min(slot.w, slot.h) * 0.55));
    const iconWidth = iconSize;
    const iconHeight = iconSize * (448 / 576);
    const iconX = slot.x + xOffset + (slot.w - iconWidth) / 2;
    const iconY = slot.y + (slot.h - iconHeight) / 2;
    const previewCrop = dragPreviewImage
      ? (() => {
          const sourceRatio = dragPreviewImage.naturalWidth / dragPreviewImage.naturalHeight;
          const slotRatio = slot.w / slot.h;
          if (sourceRatio > slotRatio) {
            const cropWidth = dragPreviewImage.naturalHeight * slotRatio;
            return {
              x: (dragPreviewImage.naturalWidth - cropWidth) / 2,
              y: 0,
              width: cropWidth,
              height: dragPreviewImage.naturalHeight,
            };
          }
          const cropHeight = dragPreviewImage.naturalWidth / slotRatio;
          return {
            x: 0,
            y: (dragPreviewImage.naturalHeight - cropHeight) / 2,
            width: dragPreviewImage.naturalWidth,
            height: cropHeight,
          };
        })()
      : undefined;
    const showPreview = Boolean(isActive && dragPreviewPhoto && previewCrop);

    return (
      <Group
        key={key}
        listening={isDropTarget}
        onClick={() => handlePageSelect(pageIndex)}
        onTap={() => handlePageSelect(pageIndex)}
      >
        <Rect
          x={slot.x + xOffset}
          y={slot.y}
          width={slot.w}
          height={slot.h}
          fill={isActive ? "rgba(37,99,235,0.2)" : "rgba(107,114,128,0.16)"}
          stroke={isActive ? "#2563eb" : "rgba(75,85,99,0.55)"}
          strokeWidth={isActive ? 5 : 2}
          dash={[10, 6]}
          perfectDrawEnabled={false}
          listening={false}
        />
        {showPreview && dragPreviewImage && previewCrop && (
          <KonvaImage
            x={slot.x + xOffset}
            y={slot.y}
            width={slot.w}
            height={slot.h}
            image={dragPreviewImage}
            crop={previewCrop}
            opacity={0.82}
            listening={false}
          />
        )}
        {!occupied && !showPreview && slotIconImage && (
          <KonvaImage
            x={iconX}
            y={iconY}
            width={iconWidth}
            height={iconHeight}
            image={slotIconImage}
            listening={false}
          />
        )}
      </Group>
    );
  };

  return (
    <div
      ref={containerRef}
      className="min-w-0 min-h-0 flex-1 relative"
      style={{
        cursor: isPanning
          ? "grabbing"
          : effectivePan
            ? "grab"
            : activeTool === "zoom"
              ? "zoom-in"
              : undefined,
      }}
    >
      {/* Scroll container — absolute so it never pushes the flex siblings */}
      <div
        ref={scrollRef}
        onMouseDown={handleScrollMouseDown}
        className="absolute inset-0 overflow-auto bg-neutral-200 select-none"
      >
        {/* Keep the left edge reachable when the canvas is wider than the viewport. */}
        <div
          className="flex items-center"
          style={{
            minWidth: "100%",
            minHeight: "100%",
            padding: 32,
            boxSizing: "border-box",
          }}
        >
        {ready && (
          <Stage
            ref={stageRef}
            width={Math.round(stageSize.w * scale)}
            height={Math.round(stageSize.h * scale)}
            scaleX={baseScale * scale}
            scaleY={baseScale * scale}
            onClick={previewMode ? undefined : handleStageClick}
            className="shadow-2xl shrink-0"
            style={{ background: "rgb(229, 229, 229)" }}
          >
            <Layer x={bleedPx} y={bleedPx} listening={!previewMode}>
              <Rect
                x={0}
                y={0}
                width={pageWidth}
                height={pageHeight}
                fill="rgba(0,0,0,0.001)"
                listening={activeTool === "select"}
                onClick={() => handlePageSelect(leftPage)}
                onTap={() => handlePageSelect(leftPage)}
              />
              <Rect
                x={rightPageX}
                y={0}
                width={pageWidth}
                height={pageHeight}
                fill="rgba(0,0,0,0.001)"
                listening={activeTool === "select"}
                onClick={() => handlePageSelect(rightPage)}
                onTap={() => handlePageSelect(rightPage)}
              />
              <BackgroundLayer
                width={mediaWidth}
                height={mediaHeight}
                x={-bleedPx}
                y={-bleedPx}
                background={pageBackgrounds[leftPage]}
              />
              {!previewMode && (
                <>
                  <Rect
                    x={0}
                    y={0}
                    width={pageWidth}
                    height={pageHeight}
                    stroke={currentPage === leftPage ? "#2563eb" : "rgba(107,114,128,0.25)"}
                    strokeWidth={currentPage === leftPage ? 8 : 3}
                    listening={false}
                    perfectDrawEnabled={false}
                  />
                  {templates[leftPage]?.slots.map((slot, i) =>
                    renderSlotPlaceholder(slot, leftPage, 0, `slot-left-${i}`, i)
                  )}
                </>
              )}
              <BackgroundLayer
                width={mediaWidth}
                height={mediaHeight}
                x={rightPageX - bleedPx}
                y={-bleedPx}
                background={pageBackgrounds[rightPage]}
              />
              {!previewMode && (
                <>
                  <Rect
                    x={rightPageX}
                    y={0}
                    width={pageWidth}
                    height={pageHeight}
                    stroke={currentPage === rightPage ? "#2563eb" : "rgba(107,114,128,0.25)"}
                    strokeWidth={currentPage === rightPage ? 8 : 3}
                    listening={false}
                    perfectDrawEnabled={false}
                  />
                  {templates[rightPage]?.slots.map((slot, i) =>
                    renderSlotPlaceholder(slot, rightPage, rightPageX, `slot-right-${i}`, i)
                  )}
                </>
              )}
            </Layer>

            <Layer
              x={bleedPx}
              y={bleedPx}
              listening={!previewMode && !effectivePan && activeTool !== "zoom"}
            >
              {spreadPhotos.map((photo) => (
                <PhotoLayer
                  key={photo.id}
                  photo={photo}
                  isSelected={!previewMode && photo.id === selectedPhotoId}
                  onSelect={() => selectPhoto(photo.id)}
                  xOffset={photo.pageIndex === rightPage ? rightPageX : 0}
                  slot={
                    photo.slotIndex !== undefined
                      ? templates[photo.pageIndex]?.slots[photo.slotIndex]
                      : templates[photo.pageIndex]?.slots.find((slot, slotIndex) =>
                          isPhotoInSlot(photo, slot, slotIndex)
                        )
                  }
                  onDragEnd={(x, y) => {
                    const slot = findSnapSlot(
                      photos,
                      photo,
                      x,
                      y,
                      templates[photo.pageIndex]
                    );
                    updatePhotoPlacement(
                      photo.id,
                      slot ? getPhotoPlacementForSlot(photo, slot) : { x, y }
                    );
                  }}
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
                  isSelected={!previewMode && text.id === selectedTextId}
                  isEditing={!previewMode && text.id === editingTextId}
                  onSelect={() => handleTextClick(text.id)}
                  onDragEnd={(x, y) => updateText(text.id, { x, y })}
                  onTransformEnd={(x, y, _width, _height, scaleX, _scaleY, rotation) => {
                    const newFontSize = Math.max(8, Math.min(200, Math.round(text.fontSize * scaleX)));
                    updateText(text.id, { x, y, fontSize: newFontSize, width: undefined, rotation });
                  }}
                  onDblClick={() => handleTextDblClick(text.id)}
                  transformerRef={transformerRef}
                />
              ))}

              {spreadStickers.map((sticker) => (
                <StickerLayer
                  key={sticker.id}
                  sticker={sticker}
                  isSelected={!previewMode && sticker.id === selectedStickerId}
                  onSelect={() => selectSticker(sticker.id)}
                  onDragEnd={(x, y) => updateSticker(sticker.id, { x, y })}
                  onTransformEnd={(x, y, scaleX, scaleY, rotation) =>
                    updateSticker(sticker.id, { x, y, scaleX, scaleY, rotation })
                  }
                  transformerRef={transformerRef}
                />
              ))}

              <Transformer
                ref={transformerRef}
                visible={!previewMode && activeTool !== "zoom" && activeTool !== "pan"}
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

            {/* ── Grid overlay (guides + bleed) on top of the photos ─── */}
            {!previewMode && (
              <Layer listening={false} x={bleedPx} y={bleedPx}>
                <GridOverlay
                  pageWidth={pageWidth}
                  pageHeight={pageHeight}
                  gridConfig={gridConfig}
                  rightPageX={rightPageX}
                  bleedPx={bleedPx}
                />
              </Layer>
            )}
          </Stage>
        )}
        </div>
      </div>

      {/* ── Fixed overlays (stay in place regardless of scroll/zoom) ── */}
      {ready && !previewMode && editingTextPlacement && editPanelPos && (
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

      {ready && !previewMode && <CanvasToolbar />}
    </div>
  );
}
