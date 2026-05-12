import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import * as authService from "@/services/auth/authService";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Attempts a silent token refresh whenever the app returns to the foreground.
 */
export function useAuthRefreshOnForeground() {
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (next) => {
      if (appState.current.match(/inactive|background/) && next === "active" && token) {
        try {
          const refreshed = await authService.refreshSession();
          if (refreshed) {
            await setSession(refreshed.user, refreshed.token, refreshed.refreshToken);
          }
        } catch {
          // ignore — user keeps existing token until it expires server-side
        }
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [setSession, token]);
}
