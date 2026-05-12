import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type PlaybackSpeed = 0.75 | 1 | 1.25 | 1.5 | 2;

interface PlayerPersistSlice {
  positionsByChapter: Record<string, number>;
  setChapterPosition: (chapterId: string, seconds: number) => void;
}

interface PlayerState extends PlayerPersistSlice {
  activeAudiobookId: string | null;
  activeChapterId: string | null;
  speed: PlaybackSpeed;
  sleepMinutes: number | null;
  setActive: (audiobookId: string | null, chapterId: string | null) => void;
  setSpeed: (s: PlaybackSpeed) => void;
  setSleepTimer: (minutes: number | null) => void;
}

const storage = createJSONStorage(() => AsyncStorage);

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      activeAudiobookId: null,
      activeChapterId: null,
      speed: 1,
      sleepMinutes: null,
      positionsByChapter: {},
      setActive: (activeAudiobookId, activeChapterId) =>
        set({ activeAudiobookId, activeChapterId }),
      setSpeed: (speed) => set({ speed }),
      setSleepTimer: (sleepMinutes) => set({ sleepMinutes }),
      setChapterPosition: (chapterId, seconds) =>
        set({
          positionsByChapter: { ...get().positionsByChapter, [chapterId]: seconds },
        }),
    }),
    {
      name: "whispr-player",
      partialize: (s) => ({
        positionsByChapter: s.positionsByChapter,
        speed: s.speed,
      }),
      storage,
    },
  ),
);
