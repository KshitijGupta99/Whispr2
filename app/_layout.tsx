import "../global.css";

import {
  DMSans_400Regular,
  DMSans_500Medium,
} from "@expo-google-fonts/dm-sans";
import {
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { colors } from "@/constants/colors";
import { useAuthRefreshOnForeground } from "@/hooks/useAuthRefreshOnForeground";
import { useAuthStore } from "@/store/useAuthStore";

/** Must not throw — otherwise native splash never dismisses. */
void SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);

  /** Non-blocking: never gate navigation on this (load can hang on some devices). */
  useFonts({
    Nunito_700Bold,
    Nunito_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useAuthRefreshOnForeground();

  /** Dismiss native splash as soon as JS is running — do not wait on fonts. */
  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: "slide_from_right",
          }}
        />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
