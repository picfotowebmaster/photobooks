"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { BackgroundPanel } from "./BackgroundPanel";
import { StickerPicker } from "./StickerPicker";
import { GridPanel } from "./GridPanel";
import { TextStylePanel } from "./TextStylePanel";
import { TemplatePanel } from "./TemplatePanel";
import { getStickerById } from "@/types/sticker";
import { getSpreadPages } from "@/lib/editor/canvasConfig";
import type { StickerPlacement } from "@/types/editor";
import { toast } from "sonner";

interface EditorDrawerProps {
  pageWidth: number;
  pageHeight: number;
  projectId: string;
  format: string;
}

const PANEL_TITLES: Record<string, string> = {
  background: "Fondo",
  sticker: "Stickers",
  grid: "Retícula",
  templates: "Plantillas",
  textStyle: "Estilo de texto",
};

export function EditorDrawer({ pageWidth, pageHeight, projectId, format }: EditorDrawerProps) {
  const activePanel = useEditorStore((s) => s.activePanel);
  const setActivePanel = useEditorStore((s) => s.setActivePanel);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const selectedTextId = useEditorStore((s) => s.selectedTextId);
  const texts = useEditorStore((s) => s.texts);
  const updateText = useEditorStore((s) => s.updateText);
  const removeText = useEditorStore((s) => s.removeText);
  const activeStickerId = useEditorStore((s) => s.activeStickerId);
  const setActiveStickerId = useEditorStore((s) => s.setActiveStickerId);
  const currentPage = useEditorStore((s) => s.currentPage);
  const stickers = useEditorStore((s) => s.stickers);
  const addSticker = useEditorStore((s) => s.addSticker);

  const overlayRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setActivePanel(null);
    setActiveTool("select");
  };

  const addStickerFromPicker = (stickerId: string) => {
    setActiveStickerId(stickerId);
    const definition = getStickerById(stickerId);
    if (!definition) return;

    const image = new window.Image();
    image.src = definition.imagePath;
    image.onload = () => {
      const max = 200;
      const ratio = Math.min(max / image.naturalWidth, max / image.naturalHeight);
      const [leftPage, rightPage] = getSpreadPages(currentPage);
      const pageIndex = currentPage === leftPage || currentPage === rightPage
        ? currentPage
        : leftPage;
      const width = Math.round(image.naturalWidth * ratio);
      const height = Math.round(image.naturalHeight * ratio);

      const placement: Omit<StickerPlacement, "id"> = {
        stickerId: definition.id,
        pageIndex,
        x: Math.round((pageWidth - width) / 2),
        y: Math.round((pageHeight - height) / 2),
        width,
        height,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        zIndex: stickers.length,
      };
      setActiveStickerId(stickerId);
      addSticker(placement);
    };
    image.onerror = () => {
      toast.error(`No se pudo cargar el sticker “${definition.name}”. Intenta de nuevo.`);
    };
  };

  useEffect(() => {
    if (!activePanel) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePanel]);

  if (!activePanel) return null;

  const selectedTextPlacement = selectedTextId
    ? texts.find((t) => t.id === selectedTextId) ?? null
    : null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] pointer-events-none"
      />

      <aside className="pointer-events-auto absolute right-0 top-0 h-full w-80 bg-white shadow-2xl flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <h2 className="text-sm font-semibold text-neutral-900">
            {PANEL_TITLES[activePanel] ?? activePanel}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="text-neutral-400 hover:text-neutral-600 text-xl leading-none"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {activePanel === "background" && <BackgroundPanel />}
          {activePanel === "sticker" && (
            <StickerPicker
              selectedId={activeStickerId}
              onSelect={addStickerFromPicker}
            />
          )}
          {activePanel === "grid" && <GridPanel />}
          {activePanel === "textStyle" && selectedTextPlacement && (
            <TextStylePanel
              textPlacement={selectedTextPlacement}
              onUpdate={(data) => updateText(selectedTextPlacement.id, data)}
              onDelete={() => removeText(selectedTextPlacement.id)}
            />
          )}
          {activePanel === "templates" && (
            <TemplatePanel projectId={projectId} format={format} />
          )}
        </div>
      </aside>
    </div>
  );
}
