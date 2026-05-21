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
    let message = error.response?.data?.message ?? error.message ?? "Request failed";
    if (!error.response && /network error/i.test(String(error.message))) {
      const base = config.apiUrl;
      const onLoopback = /127\.0\.0\.1|localhost/i.test(base);
      message = [
        "Cannot reach the API.",
        `Trying: ${base}`,
        onLoopback
          ? "• Your app is using 127.0.0.1 — that is the phone, not your PC. Remove EXPO_PUBLIC_API_USE_ENV_ONLY from .env, restart Expo, and use the same Wi‑Fi as your PC."
          : "• Run: npm run api (port 3000). Phone and PC must be on the same Wi‑Fi (turn off mobile data / LTE).",
        "• Or USB: adb reverse tcp:3000 tcp:3000, then EXPO_PUBLIC_API_URL=http://127.0.0.1:3000/api and EXPO_PUBLIC_API_USE_ENV_ONLY=1",
        "• Set EXPO_PUBLIC_API_URL=http://YOUR_PC_LAN_IP:3000/api if auto-detect fails (ipconfig → IPv4).",
      ].join("\n");
    }
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
