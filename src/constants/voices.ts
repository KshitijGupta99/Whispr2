import type { Voice } from "@/services/voice/voiceTypes";

export const DEFAULT_VOICES: Voice[] = [
  {
    id: "emma",
    name: "Emma",
    description: "Warm, engaging storyteller",
    recommended: true,
  },
  {
    id: "liam",
    name: "Liam",
    description: "Charismatic and versatile actor",
  },
  {
    id: "sophia",
    name: "Sophia",
    description: "Dynamic and expressive performer",
  },
  {
    id: "aria",
    name: "Aria",
    description: "Clear and authoritative narrator",
  },
  {
    id: "james",
    name: "James",
    description: "Deep, resonant broadcaster",
  },
];
