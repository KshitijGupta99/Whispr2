import { GhostButton } from "@/components/ui/GhostButton";
import { config } from "@/constants/config";
import { fonts } from "@/constants/fonts";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

function GoogleAuthButton() {
  const router = useRouter();
  const signInWithGoogleNative = useAuthStore((s) => s.signInWithGoogleNative);
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    try {
      setLoading(true);
      const user = await signInWithGoogleNative();
      if (user) {
        router.replace("/(tabs)/create");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to sign in";
      console.error("Google sign-in error:", errorMsg);
      
      // Provide helpful troubleshooting hints
      let helpText = errorMsg;
      if (errorMsg.toLowerCase().includes("network")) {
        helpText += "\n\nTroubleshooting:\n• Check device internet connection\n• Verify device time is correct (Settings → Date & time)\n• Ensure Google Play Services is up to date";
      } else if (errorMsg.toLowerCase().includes("play services")) {
        helpText += "\n\nPlease update Google Play Services from Play Store.";
      }
      
      Alert.alert("Google sign-in failed", helpText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-full max-w-md gap-3">
      <GhostButton
        label="Continue with Google"
        onPress={() => {
          void handlePress();
        }}
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
        Uses native Google Sign-In on Android dev builds.
      </Text>
    </View>
  );
}

export function GoogleAuthSection() {
  if (!config.googleWebClientId) {
    return (
      <View className="w-full max-w-md gap-3">
        <Text className="text-center text-[13px] leading-5 text-textSecondary" style={{ fontFamily: fonts.caption }}>
          Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env, then rebuild the app.
        </Text>
      </View>
    );
  }

  return <GoogleAuthButton />;
}
