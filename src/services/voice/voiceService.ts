import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { Voice } from "@/services/voice/voiceTypes";

/**
 * Fetches the catalog of AI narrators from the API.
 */
export async function fetchVoices(): Promise<Voice[]> {
  const { data } = await apiClient.get<Voice[]>(endpoints.voices);
  return data;
}
