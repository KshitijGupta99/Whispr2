import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

import { GhostButton } from "@/components/ui/GhostButton";
import { config } from "@/constants/config";
import { fonts } from "@/constants/fonts";
import { useAuthStore } from "@/store/useAuthStore";

export function GoogleAuthSection() {
  const router = useRouter();
  const signInWithGoogleNative = useAuthStore((s) => s.signInWithGoogleNative);
  const [loading, setLoading] = useState(false);

  if (!config.googleWebClientId) {
    return (
      <View className="w-full max-w-md gap-3">
        <Text className="text-center text-[13px] leading-5 text-textSecondary" style={{ fontFamily: fonts.caption }}>
          Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env, then rebuild: npm run android
        </Text>
      </View>
    );
  }

  const handlePress = async () => {
    try {
      setLoading(true);
      const user = await signInWithGoogleNative();
      if (user) router.replace("/(tabs)/create");
    } catch (error) {
      Alert.alert(
        "Google sign-in failed",
        error instanceof Error ? error.message : "Failed to sign in",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-full max-w-md gap-3">
      <GhostButton
        label="Continue with Google"
        onPress={() => void handlePress()}
        icon={<Text className="text-[18px]">G</Text>}
      />
      {loading ? (
        <View className="flex-row items-center justify-center gap-2">
          <ActivityIndicator />
          <Text className="text-center text-[12px] text-textMuted" style={{ fontFamily: fonts.caption }}>
            Signing in…
          </Text>
        </View>
      ) : null}
      <Text className="text-center text-[12px] text-textMuted" style={{ fontFamily: fonts.caption }}>
        Native Google Sign-In (development build). Do not use Expo Go — run npm run android.
      </Text>
    </View>
  );
}
