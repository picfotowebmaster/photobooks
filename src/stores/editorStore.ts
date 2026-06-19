import { create } from "zustand";
import type { PhotoPlacement, EditorTool, PageTemplate } from "@/types/editor";

interface EditorState {
  currentPage: number;
  totalPages: number;
  photos: PhotoPlacement[];
  selectedPhotoId: string | null;
  activeTool: EditorTool;
  zoom: number;
  templates: Record<number, PageTemplate>;
  pageBackgrounds: Record<number, string>;

  setCurrentPage: (page: number) => void;
  setTotalPages: (count: number) => void;
  selectPhoto: (id: string | null) => void;
  setActiveTool: (tool: EditorTool) => void;
  setZoom: (zoom: number) => void;
  addPhotoToCanvas: (photo: PhotoPlacement) => void;
  updatePhotoPlacement: (id: string, data: Partial<PhotoPlacement>) => void;
  removePhoto: (id: string) => void;
  setPageTemplate: (page: number, template: PageTemplate) => void;
  setPageBackground: (page: number, color: string) => void;
  resetEditor: () => void;
}

const initialState = {
  currentPage: 0,
  totalPages: 10,
  photos: [],
  selectedPhotoId: null,
  activeTool: "select" as EditorTool,
  zoom: 1,
  templates: {},
  pageBackgrounds: {},
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  setCurrentPage: (page) => set({ currentPage: page }),

  setTotalPages: (count) => {
    const even = Math.max(2, count % 2 === 0 ? count : count + 1);
    const clamped = Math.min(40, Math.max(10, even));
    set({ totalPages: clamped });
  },

  selectPhoto: (id) => set({ selectedPhotoId: id }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setZoom: (zoom) => set({ zoom }),

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

  setPageBackground: (page, color) =>
    set((s) => ({ pageBackgrounds: { ...s.pageBackgrounds, [page]: color } })),

  resetEditor: () => set(initialState),
}));
