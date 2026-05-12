/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
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
        border: "#ECEEF5",
        inputBorder: "#E2E5F0",
        recommended: "#7B8FF7",
      },
      fontFamily: {
        heading: ["Nunito_700Bold"],
        subheading: ["Nunito_600SemiBold"],
        body: ["DMSans_400Regular"],
        bodyMedium: ["DMSans_500Medium"],
        caption: ["DMSans_400Regular"],
      },
    },
  },
  plugins: [],
};
