import { create } from "zustand";

import { config } from "@/constants/config";
import { endpoints } from "@/services/api/endpoints";
import * as authService from "@/services/auth/authService";
import type { AuthUser } from "@/services/auth/authTypes";
import type { GoogleExchangeResponse } from "@/services/auth/authService";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hydrate: () => Promise<void>;
  signInWithGoogleMock: () => Promise<void>;
  signInWithGoogleToken: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (user: AuthUser, token: string, refresh?: string) => Promise<void>;
}

function parseJwtSub(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
    const json = atob(padded);
    const data = JSON.parse(json) as { sub?: string };
    return data.sub ?? null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  hydrate: async () => {
    try {
      const token = await authService.readAccessToken();
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      const sub = parseJwtSub(token);
      set({
        token,
        isAuthenticated: true,
        isLoading: false,
        user: sub ? { id: sub, email: "", name: "Listener" } : null,
      });
    } catch {
      set({ isLoading: false, isAuthenticated: false, token: null, user: null });
    }
  },

  setSession: async (user, token, refresh) => {
    await authService.persistTokens(token, refresh);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  /** Dev-friendly path: requests a real JWT from `/api/auth/google`. */
  signInWithGoogleMock: async () => {
    const res = await fetch(`${config.apiUrl}${endpoints.authGoogle}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "" }),
    });
    if (!res.ok) {
      throw new Error("Could not reach the Whispr API. Start the backend on port 3000.");
    }
    const data = (await res.json()) as GoogleExchangeResponse;
    await authService.persistTokens(data.token, data.refreshToken);
    set({
      user: data.user,
      token: data.token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  signInWithGoogleToken: async (idToken) => {
    const exchange = await authService.exchangeGoogleToken({ idToken });
    await authService.persistTokens(exchange.token, exchange.refreshToken);
    set({
      user: exchange.user,
      token: exchange.token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  signOut: async () => {
    await authService.clearTokens();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
