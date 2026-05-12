import { GhostButton } from "@/components/ui/GhostButton";
import { config } from "@/constants/config";
import { fonts } from "@/constants/fonts";
import { useAuthStore } from "@/store/useAuthStore";
import { useIdTokenAuthRequest } from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

/**
 * Google OAuth entry using an ID token exchange with the Whispr API.
 */
export function GoogleAuthSection() {
  const router = useRouter();
  const signInWithGoogleToken = useAuthStore((s) => s.signInWithGoogleToken);

  const [request, response, promptAsync] = useIdTokenAuthRequest({
    webClientId: config.googleClientId,
  });

  useEffect(() => {
    if (response?.type === "success" && response.params.id_token) {
      void signInWithGoogleToken(response.params.id_token).then(() => {
        router.replace("/(tabs)/create");
      });
    }
  }, [response, router, signInWithGoogleToken]);

  return (
    <View className="w-full max-w-md gap-3">
      <GhostButton
        label="Continue with Google"
        onPress={() => {
          void promptAsync();
        }}
        icon={<Text className="text-[18px]">G</Text>}
      />
      {!request ? (
        <Text className="text-center text-[12px] text-textMuted" style={{ fontFamily: fonts.caption }}>
          Preparing Google sign-in…
        </Text>
      ) : null}
    </View>
  );
}
