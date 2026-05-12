import type { TTSRequest } from "@/services/tts/ttsTypes";

/**
 * Client-side hook into TTS jobs; full synthesis runs on the backend.
 */
export async function requestClientTtsPreview(_req: TTSRequest): Promise<void> {
  // Reserved for streaming previews from a future edge endpoint.
}
