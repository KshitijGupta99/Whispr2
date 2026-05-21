export const endpoints = {
  authGoogle: "/auth/google",
  authRefresh: "/auth/refresh",
  audiobooks: "/audiobooks",
  audiobook: (id: string) => `/audiobooks/${id}`,
  audiobookStatus: (id: string) => `/audiobooks/${id}/status`,
  voices: "/voices",
  voicePreview: (id: string) => `/voices/${id}/preview`,
  transcriptionAudio: "/transcription/audio",
  transcriptionExtract: "/transcription/extract",
} as const;
