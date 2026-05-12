import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? "http://localhost:3000/api",
  googleClientId:
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? extra.googleClientId ?? "",
  /** Short public sample used when backend preview is unavailable */
  fallbackPreviewUrl:
    "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
  scheme: "whispr",
} as const;
