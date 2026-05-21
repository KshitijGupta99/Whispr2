import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

function isLikelyAndroidEmulator(): boolean {
  if (Platform.OS !== "android") return false;
  const c = Platform.constants as {
    Fingerprint?: string;
    Model?: string;
    Brand?: string;
  };
  const blob = `${c.Model ?? ""} ${c.Fingerprint ?? ""} ${c.Brand ?? ""}`;
  return /sdk_gphone|google_sdk|generic_x86|generic_x86_64|emu64a|Emulator/i.test(blob);
}

/**
 * In dev, the machine running Metro is almost always the machine running the API.
 * Uses the same host as the JS bundle (avoids stale 192.168.* in .env).
 */
function apiUrlFromMetroHost(): string | null {
  if (!__DEV__) return null;

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    try {
      const withProto = hostUri.includes("://") ? hostUri : `http://${hostUri}`;
      const u = new URL(withProto);
      if (u.hostname) return `http://${u.hostname}:3000/api`;
    } catch {
      /* fall through */
    }
  }

  const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
  if (!scriptURL) return null;
  const m = scriptURL.match(/\/\/([^/:?]+)/);
  if (!m?.[1]) return null;
  let host = m[1];
  if (
    Platform.OS === "android" &&
    isLikelyAndroidEmulator() &&
    (host === "localhost" || host === "127.0.0.1")
  ) {
    host = "10.0.2.2";
  }
  return `http://${host}:3000/api`;
}

/** True when the URL points at a typical home/LAN dev server (not a public staging URL). */
function isProbablyLocalDevApiUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const h = new URL(url).hostname;
    if (h === "localhost" || h === "127.0.0.1" || h === "10.0.2.2") return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
    if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
    return false;
  } catch {
    return false;
  }
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/**
 * 127.0.0.1 in .env points at the phone itself, not your PC — use Metro's LAN host instead.
 */
function shouldPreferMetroOverExplicit(explicit: string | undefined, metroUrl: string | null): boolean {
  if (!__DEV__ || !explicit || !metroUrl) return false;
  try {
    return isLoopbackHost(new URL(explicit).hostname);
  } catch {
    return false;
  }
}

function resolveRawApiUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl;
  const metroUrl = apiUrlFromMetroHost();
  const useEnvOnly =
    process.env.EXPO_PUBLIC_API_USE_ENV_ONLY === "1" ||
    process.env.EXPO_PUBLIC_API_USE_ENV_ONLY === "true";

  if (shouldPreferMetroOverExplicit(explicit, metroUrl)) {
    return metroUrl!;
  }

  if (useEnvOnly) {
    return explicit ?? metroUrl ?? "http://localhost:3000/api";
  }

  if (__DEV__ && metroUrl && (!explicit || isProbablyLocalDevApiUrl(explicit))) {
    return metroUrl;
  }

  return explicit ?? metroUrl ?? "http://localhost:3000/api";
}

const rawApiUrl = resolveRawApiUrl();

/** Private LAN-style hosts that the Android emulator must not use to reach the host PC (use 10.0.2.2 instead). */
function isEmulatorRewriteHost(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;
  const [a, b] = parts;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

/**
 * Android emulator: map localhost → 10.0.2.2 (host loopback).
 * LAN IPs on emulator → 10.0.2.2 unless EXPO_PUBLIC_API_SKIP_EMULATOR_HOST=1.
 */
function normalizeApiUrlForDevice(url: string): string {
  if (Platform.OS !== "android") return url;
  try {
    const parsed = new URL(url);
    // Only emulators need 10.0.2.2. Physical devices use 127.0.0.1 with `adb reverse tcp:3000 tcp:3000`.
    if (
      isLikelyAndroidEmulator() &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    ) {
      parsed.hostname = "10.0.2.2";
      return parsed.href.replace(/\/$/, "");
    }
    const skipEmu =
      process.env.EXPO_PUBLIC_API_SKIP_EMULATOR_HOST === "1" ||
      process.env.EXPO_PUBLIC_API_SKIP_EMULATOR_HOST === "true";
    if (!skipEmu && isLikelyAndroidEmulator() && isEmulatorRewriteHost(parsed.hostname)) {
      parsed.hostname = "10.0.2.2";
      return parsed.href.replace(/\/$/, "");
    }
  } catch {
    /* keep raw */
  }
  return url;
}

export const config = {
  apiUrl: normalizeApiUrlForDevice(rawApiUrl),
  /** Web OAuth client ID used by native Google Sign-In. */
  googleWebClientId:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ??
    extra.googleWebClientId ??
    extra.googleClientId ??
    "",
  googleAndroidClientId:
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? extra.googleAndroidClientId ?? "",
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? extra.googleIosClientId ?? "",
  /** Short public sample used when backend preview is unavailable */
  fallbackPreviewUrl:
    "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
  scheme: "whispr",
} as const;
