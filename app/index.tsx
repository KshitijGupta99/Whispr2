import { GradientOrb } from "@/components/ui/GradientOrb";
import { GoogleAuthSection } from "@/components/splash/GoogleAuthSection";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/(tabs)/create");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <GradientOrb size={200} />
      <Text
        className="mt-10 text-[28px] text-textPrimary"
        style={{ fontFamily: fonts.heading }}
      >
        Whispr
      </Text>
      <Text
        className="mt-3 max-w-[260px] text-center text-[16px] text-textSecondary"
        style={{ fontFamily: fonts.body }}
      >
        Turn your manuscript into an audiobook with just a few taps.
      </Text>
      <View className="mt-10 w-full items-center">
        <GoogleAuthSection />
      </View>
    </View>
  );
}
