import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { AudiobookDto, GenerationStatusDto } from "@/services/audiobook/audiobookTypes";

export interface CreateAudiobookPayload {
  text: string;
  voiceId: string;
  title?: string;
}

export interface CreateAudiobookResponse {
  id: string;
  status: string;
}

/**
 * Submits manuscript text and starts generation on the server.
 */
export async function createAudiobookJob(
  payload: CreateAudiobookPayload,
): Promise<CreateAudiobookResponse> {
  const { data } = await apiClient.post<CreateAudiobookResponse>(
    `${endpoints.audiobooks}/create`,
    payload,
  );
  return data;
}

/**
 * Polls generation progress for a given audiobook id.
 */
export async function fetchGenerationStatus(id: string): Promise<GenerationStatusDto> {
  const { data } = await apiClient.get<GenerationStatusDto>(endpoints.audiobookStatus(id));
  return data;
}

/**
 * Loads a completed audiobook with chapter metadata.
 */
export async function fetchAudiobook(id: string): Promise<AudiobookDto> {
  const { data } = await apiClient.get<AudiobookDto>(endpoints.audiobook(id));
  return data;
}

/**
 * Lists audiobooks for the authenticated user.
 */
export async function listAudiobooks(): Promise<AudiobookDto[]> {
  const { data } = await apiClient.get<AudiobookDto[]>(endpoints.audiobooks);
  return data;
}

/**
 * Deletes an audiobook by id.
 */
export async function deleteAudiobook(id: string): Promise<void> {
  await apiClient.delete(endpoints.audiobook(id));
}
