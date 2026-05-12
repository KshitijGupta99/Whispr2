import { create } from "zustand";

import type { Voice } from "@/services/voice/voiceTypes";

interface VoiceState {
  selectedVoice: Voice | null;
  setSelectedVoice: (v: Voice | null) => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  selectedVoice: null,
  setSelectedVoice: (selectedVoice) => set({ selectedVoice }),
}));
