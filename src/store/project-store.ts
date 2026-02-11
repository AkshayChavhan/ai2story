import { create } from "zustand";
import type { StoryProject, StoryScene, ProcessingStatus } from "@/types";

/**
 * Zustand store for managing the active project state.
 * Handles the current project being edited and its processing status.
 */

interface ProjectState {
  // Current project
  currentProject: StoryProject | null;
  scenes: StoryScene[];

  // Processing state
  isProcessing: boolean;
  processingStatus: ProcessingStatus | null;

  // Actions
  setCurrentProject: (project: StoryProject | null) => void;
  setScenes: (scenes: StoryScene[]) => void;
  updateScene: (sceneId: string, updates: Partial<StoryScene>) => void;
  addScene: (scene: StoryScene) => void;
  removeScene: (sceneId: string) => void;
  reorderScenes: (fromIndex: number, toIndex: number) => void;
  setProcessing: (status: boolean) => void;
  setProcessingStatus: (status: ProcessingStatus | null) => void;
  reset: () => void;
}

const initialState = {
  currentProject: null,
  scenes: [],
  isProcessing: false,
  processingStatus: null,
};

export const useProjectStore = create<ProjectState>((set) => ({
  ...initialState,

  setCurrentProject: (project) => set({ currentProject: project }),

  setScenes: (scenes) => set({ scenes }),

  updateScene: (sceneId, updates) =>
    set((state) => ({
      scenes: state.scenes.map((scene) =>
        scene.id === sceneId ? { ...scene, ...updates } : scene
      ),
    })),

  addScene: (scene) =>
    set((state) => ({
      scenes: [...state.scenes, scene],
    })),

  removeScene: (sceneId) =>
    set((state) => ({
      scenes: state.scenes.filter((scene) => scene.id !== sceneId),
    })),

  reorderScenes: (fromIndex, toIndex) =>
    set((state) => {
      const newScenes = [...state.scenes];
      const [moved] = newScenes.splice(fromIndex, 1);
      newScenes.splice(toIndex, 0, moved);
      // Re-assign order numbers
      return {
        scenes: newScenes.map((scene, idx) => ({ ...scene, order: idx + 1 })),
      };
    }),

  setProcessing: (isProcessing) => set({ isProcessing }),

  setProcessingStatus: (processingStatus) => set({ processingStatus }),

  reset: () => set(initialState),
}));
