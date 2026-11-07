import { api } from "@/lib/axios";
import { Tutorial } from "@/lib/tutorials/drive";
import { create } from "zustand";

interface TutorialState {
  tutorials: Tutorial[];
  isLoading: boolean;
  fetchTutorials: () => Promise<void>;
}

export const useTutorialStore = create<TutorialState>((set) => ({
  tutorials: [],
  isLoading: false,
  fetchTutorials: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<Tutorial[]>("/tutorial", {
        skip401Redirect: true,
      });
      set({ tutorials: data, isLoading: false });
    } catch (error) {
      console.error("Error cargando tutoriales:", error);
      set({ isLoading: false });
    }
  },
}));
