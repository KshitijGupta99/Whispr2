import * as SecureStore from "expo-secure-store";

import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type { AuthUser } from "@/services/auth/authTypes";

const TOKEN_KEY = "whispr_jwt";
const REFRESH_KEY = "whispr_refresh";

/**
 * Persists the session tokens in the device secure store.
 */
export async function persistTokens(access: string, refresh?: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, access);
  if (refresh) await SecureStore.setItemAsync(REFRESH_KEY, refresh);
}

/**
 * Reads the stored access token, if any.
 */
export async function readAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Clears stored credentials.
 */
export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

export interface GoogleExchangePayload {
  idToken: string;
}

export interface GoogleExchangeResponse {
  token: string;
  refreshToken?: string;
  user: AuthUser;
}

/**
 * Exchanges a Google ID token for a Whispr JWT via the backend.
 */
export async function exchangeGoogleToken(
  payload: GoogleExchangePayload,
): Promise<GoogleExchangeResponse> {
  const { data } = await apiClient.post<GoogleExchangeResponse>(endpoints.authGoogle, payload);
  return data;
}

/**
 * Refreshes the JWT using the stored refresh token.
 */
export async function refreshSession(): Promise<GoogleExchangeResponse | null> {
  const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!refresh) return null;
  const { data } = await apiClient.post<GoogleExchangeResponse>(endpoints.authRefresh, {
    refreshToken: refresh,
  });
  return data;
}
