import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { fonts } from "@/constants/fonts";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import { Alert, Text, View } from "react-native";

/**
 * Dev sign-in when no Google web client id is configured.
 */
export function DevAuthSection() {
  const router = useRouter();
  const signInWithGoogleMock = useAuthStore((s) => s.signInWithGoogleMock);

  return (
    <View className="w-full max-w-md">
      <PrimaryButton
        label="Continue (dev sign-in)"
        onPress={async () => {
          try {
            await signInWithGoogleMock();
            router.replace("/(tabs)/create");
          } catch (e) {
            Alert.alert("Sign-in", e instanceof Error ? e.message : "Failed");
          }
        }}
      />
      <Text className="mt-3 text-center text-[12px] text-textMuted" style={{ fontFamily: fonts.caption }}>
        Set EXPO_PUBLIC_GOOGLE_CLIENT_ID to enable real Google OAuth.
      </Text>
    </View>
  );
}
