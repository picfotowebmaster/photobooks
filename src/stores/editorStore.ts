import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type {
  PhotoPlacement,
  TextPlacement,
  StickerPlacement,
  EditorTool,
  EditorPanel,
  PageTemplate,
  FontStyle,
  TextAlign,
  PageBackground,
} from "@/types/editor";
import { DEFAULT_GRID_CONFIG, type GridConfig } from "@/lib/editor/gridConfig";

interface EditorState {
  currentPage: number;
  totalPages: number;
  photos: PhotoPlacement[];
  selectedPhotoId: string | null;
  texts: TextPlacement[];
  selectedTextId: string | null;
  stickers: StickerPlacement[];
  selectedStickerId: string | null;
  activeStickerId: string | null;
  activeTool: EditorTool;
  activePanel: EditorPanel | null;
  zoom: number;
  previewMode: boolean;
  templates: Record<number, PageTemplate>;
  lastTemplate: PageTemplate | null;
  pageBackgrounds: Record<number, PageBackground>;
  gridConfig: GridConfig;

  setCurrentPage: (page: number) => void;
  setTotalPages: (count: number) => void;
  selectPhoto: (id: string | null) => void;
  selectSticker: (id: string | null) => void;
  clearSelection: () => void;
  setActiveStickerId: (id: string | null) => void;
  setActiveTool: (tool: EditorTool) => void;
  setActivePanel: (panel: EditorPanel | null) => void;
  setZoom: (zoom: number) => void;
  setPreviewMode: (enabled: boolean) => void;
  addPhotoToCanvas: (photo: PhotoPlacement) => void;
  updatePhotoPlacement: (id: string, data: Partial<PhotoPlacement>) => void;
  removePhoto: (id: string) => void;
  setPageTemplate: (page: number, template: PageTemplate) => void;
  clearPageTemplate: (page: number) => void;
  setLastTemplate: (template: PageTemplate | null) => void;
  setPageBackground: (page: number, background: PageBackground) => void;
  setPageBackgrounds: (backgrounds: Record<number, PageBackground>) => void;
  setGridConfig: (config: Partial<GridConfig>) => void;
  toggleGridVisibility: (key: 'showBleed' | 'showSafeZone' | 'showGrid' | 'showSpine') => void;
  resetEditor: () => void;

  addText: (text: Omit<TextPlacement, "id">) => void;
  updateText: (id: string, data: Partial<TextPlacement>) => void;
  removeText: (id: string) => void;
  selectText: (id: string | null) => void;

  addSticker: (sticker: Omit<StickerPlacement, "id">) => void;
  updateSticker: (id: string, data: Partial<StickerPlacement>) => void;
  removeSticker: (id: string) => void;
}

const initialState = {
  currentPage: 0,
  totalPages: 10,
  photos: [],
  selectedPhotoId: null,
  texts: [],
  selectedTextId: null,
  stickers: [],
  selectedStickerId: null,
  activeStickerId: null,
  activeTool: "select" as EditorTool,
  activePanel: null as EditorPanel | null,
  zoom: 1,
  previewMode: false,
  templates: {},
  lastTemplate: null as PageTemplate | null,
  pageBackgrounds: {},
  gridConfig: DEFAULT_GRID_CONFIG,
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  setCurrentPage: (page) => set({ currentPage: page }),

  setTotalPages: (count) => {
    const even = Math.max(2, count % 2 === 0 ? count : count + 1);
    const clamped = Math.min(40, Math.max(10, even));
    set({ totalPages: clamped });
  },

  selectPhoto: (id) =>
    set((s) => ({
      selectedPhotoId: id,
      selectedTextId: null,
      selectedStickerId: null,
      activePanel: s.activePanel === "textStyle" ? null : s.activePanel,
    })),

  selectSticker: (id) =>
    set((s) => ({
      selectedStickerId: id,
      selectedPhotoId: null,
      selectedTextId: null,
      activeTool: "select",
      activePanel: s.activePanel === "textStyle" ? null : s.activePanel,
    })),

  clearSelection: () =>
    set({ selectedPhotoId: null, selectedTextId: null, selectedStickerId: null }),

  setActiveStickerId: (id) => set({ activeStickerId: id }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setActivePanel: (panel) => set({ activePanel: panel }),

  setZoom: (zoom) => set({ zoom }),

  setPreviewMode: (previewMode) =>
    set({
      previewMode,
      ...(previewMode
        ? {
            activeTool: "select" as EditorTool,
            activePanel: null,
            selectedPhotoId: null,
            selectedTextId: null,
            selectedStickerId: null,
            activeStickerId: null,
          }
        : {}),
    }),

  addPhotoToCanvas: (photo) =>
    set((s) => ({ photos: [...s.photos, photo] })),

  updatePhotoPlacement: (id, data) =>
    set((s) => ({
      photos: s.photos.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  removePhoto: (id) =>
    set((s) => ({
      photos: s.photos.filter((p) => p.id !== id),
      selectedPhotoId: s.selectedPhotoId === id ? null : s.selectedPhotoId,
    })),

  setPageTemplate: (page, template) =>
    set((s) => ({ templates: { ...s.templates, [page]: template } })),

  clearPageTemplate: (page) =>
    set((s) => {
      const next = { ...s.templates };
      delete next[page];
      return { templates: next };
    }),

  setLastTemplate: (template) => set({ lastTemplate: template }),

  setPageBackground: (page, background) =>
    set((s) => ({ pageBackgrounds: { ...s.pageBackgrounds, [page]: background } })),

  setPageBackgrounds: (backgrounds) =>
    set((s) => ({ pageBackgrounds: { ...s.pageBackgrounds, ...backgrounds } })),

  setGridConfig: (config) =>
    set((s) => ({ gridConfig: { ...s.gridConfig, ...config } })),

  toggleGridVisibility: (key) =>
    set((s) => ({ gridConfig: { ...s.gridConfig, [key]: !s.gridConfig[key] } })),

  resetEditor: () => set(initialState),

  addText: (textData) => {
    const id = uuid();
    const placement: TextPlacement = { id, ...textData };
    set((s) => ({
      texts: [...s.texts, placement],
      selectedTextId: id,
      selectedPhotoId: null,
      activeTool: "select",
    }));
  },

  updateText: (id, data) =>
    set((s) => ({
      texts: s.texts.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),

  removeText: (id) =>
    set((s) => ({
      texts: s.texts.filter((t) => t.id !== id),
      selectedTextId: s.selectedTextId === id ? null : s.selectedTextId,
      activePanel:
        s.selectedTextId === id && s.activePanel === "textStyle" ? null : s.activePanel,
    })),

  selectText: (id) =>
    set({
      selectedTextId: id,
      selectedPhotoId: null,
      selectedStickerId: null,
      activeTool: "select",
      activePanel: id ? "textStyle" : null,
    }),

  addSticker: (stickerData) => {
    const id = uuid();
    const placement: StickerPlacement = { id, ...stickerData };
    set((s) => ({
      stickers: [...s.stickers, placement],
      selectedStickerId: id,
      selectedPhotoId: null,
      selectedTextId: null,
      activeTool: "select",
    }));
  },

  updateSticker: (id, data) =>
    set((s) => ({
      stickers: s.stickers.map((st) => (st.id === id ? { ...st, ...data } : st)),
    })),

  removeSticker: (id) =>
    set((s) => ({
      stickers: s.stickers.filter((st) => st.id !== id),
      selectedStickerId: s.selectedStickerId === id ? null : s.selectedStickerId,
    })),
}));