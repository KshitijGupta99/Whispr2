import { create } from "zustand";

interface CreationState {
  manuscriptText: string;
  setManuscriptText: (t: string) => void;
  reset: () => void;
}

export const useCreationStore = create<CreationState>((set) => ({
  manuscriptText: "",
  setManuscriptText: (manuscriptText) => set({ manuscriptText }),
  reset: () => set({ manuscriptText: "" }),
}));
