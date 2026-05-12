import axios, { AxiosError } from "axios";

import { config } from "@/constants/config";
import { endpoints } from "@/services/api/endpoints";
import type { ApiErrorBody } from "@/services/api/types";

/**
 * Shared Axios instance for all Whispr API calls.
 */
export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 60_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((req) => {
  // Lazy require avoids circular imports with the auth store.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuthStore } = require("@/store/useAuthStore") as typeof import("@/store/useAuthStore");
  const token = useAuthStore.getState().token;
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorBody>) => {
    const message = error.response?.data?.message ?? error.message ?? "Request failed";
    return Promise.reject(new Error(message));
  },
);

/**
 * Builds an absolute URL for streaming a voice preview clip (token as query for AV).
 */
export function voicePreviewUrl(voiceId: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuthStore } = require("@/store/useAuthStore") as typeof import("@/store/useAuthStore");
  const token = useAuthStore.getState().token;
  const base = `${config.apiUrl}${endpoints.voicePreview(voiceId)}`;
  if (!token) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}token=${encodeURIComponent(token)}`;
}
