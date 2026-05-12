export const colors = {
  background: "#F2F3F7",
  surface: "#FFFFFF",
  primary: "#4F6EF7",
  primaryText: "#FFFFFF",
  textPrimary: "#1A1A2E",
  textSecondary: "#8A8FA8",
  textMuted: "#C4C7D6",
  accent: "#7B8FF7",
  gradientStart: "#E8845C",
  gradientMid: "#C97AB2",
  gradientEnd: "#7B8FF7",
  voiceRing: "rgba(123,143,247,0.25)",
  border: "#ECEEF5",
  inputBorder: "#E2E5F0",
  recommended: "#7B8FF7",
} as const;

export type ColorKey = keyof typeof colors;
