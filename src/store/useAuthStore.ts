import { create } from "zustand";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import * as authService from "@/services/auth/authService";
import type { AuthUser } from "@/services/auth/authTypes";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hydrate: () => Promise<void>;
  signInWithGoogleNative: () => Promise<AuthUser | null>;
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

  signInWithGoogleNative: async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    } catch (error) {
      console.error("Play Services check failed:", error);
      throw new Error("Google Play Services not available or outdated. Please update Google Play Services.");
    }

    const response = await GoogleSignin.signIn();
    if (response.type !== "success") {
      console.error("GoogleSignin.signIn() returned non-success:", response);
      const errorMsg = response.type === "cancelled" ? "Sign-in cancelled" : `Sign-in failed: ${response.type}`;
      throw new Error(errorMsg);
    }

    const idToken = response.data.idToken;
    if (!idToken) {
      throw new Error("Google Sign-In did not return an ID token.");
    }

    const exchange = await authService.exchangeGoogleToken({ idToken });
    await authService.persistTokens(exchange.token, exchange.refreshToken);
    set({
      user: exchange.user,
      token: exchange.token,
      isAuthenticated: true,
      isLoading: false,
    });
    return exchange.user;
  },

  signOut: async () => {
    await authService.clearTokens();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
