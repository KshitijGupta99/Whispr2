/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
  const iosIdPart = webClientId.replace(/\.apps\.googleusercontent\.com$/i, "");
  const iosUrlScheme = iosIdPart ? `com.googleusercontent.apps.${iosIdPart}` : undefined;

  const googleSignInPlugin = iosUrlScheme
    ? ["@react-native-google-signin/google-signin", { iosUrlScheme }]
    : "@react-native-google-signin/google-signin";

  return {
    ...config,
    name: "Whispr",
    slug: "whispr",
    scheme: "whispr",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.whispr",
    },
    android: {
      usesCleartextTraffic: true,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.anonymous.whispr",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-web-browser",
      "expo-font",
      "expo-dev-client",
      googleSignInPlugin,
    ],
    extra: {
      ...config?.extra,
      googleWebClientId: webClientId,
      googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "",
    },
  };
};
