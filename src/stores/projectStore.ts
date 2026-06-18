import { create } from "zustand";
import type { Project } from "@/types/project";

interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
  loading: boolean;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setSelectedProjectId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  selectedProjectId: null,
  loading: false,

  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((s) => ({ projects: [project, ...s.projects] })),

  updateProject: (id, data) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  removeProject: (id) =>
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      selectedProjectId:
        s.selectedProjectId === id ? null : s.selectedProjectId,
    })),

  setSelectedProjectId: (id) => set({ selectedProjectId: id }),

  setLoading: (loading) => set({ loading }),
}));
