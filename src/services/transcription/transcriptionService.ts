import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { TranscriptionResult } from "@/services/transcription/transcriptionTypes";

/**
 * Uploads recorded audio and returns transcribed text.
 */
export async function transcribeAudio(formData: FormData): Promise<TranscriptionResult> {
  const { data } = await apiClient.post<TranscriptionResult>(endpoints.transcriptionAudio, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
