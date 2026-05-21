import { GradientOrb } from "@/components/ui/GradientOrb";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { useGenerationStatus } from "@/hooks/useGenerationStatus";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const FALLBACK_STEPS = [
  "Selecting perfect voice settings...",
  "Analyzing chapter structure...",
  "Synthesizing Chapter 1...",
  "Synthesizing Chapter 2...",
  "Finalizing your audiobook...",
];

export default function GeneratingScreen() {
  const router = useRouter();
  const { id, voice } = useLocalSearchParams<{ id: string; voice: string }>();
  const { data, isError, refetch, isFetching } = useGenerationStatus(id ?? null, Boolean(id));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1600);
    return () => clearInterval(t);
  }, []);

  const label = useMemo(() => {
    if (data?.currentStep) return data.currentStep;
    return FALLBACK_STEPS[tick % FALLBACK_STEPS.length];
  }, [data?.currentStep, tick]);

  useEffect(() => {
    if (data?.status === "READY" && id) {
      router.replace(`/player/${id}`);
    }
  }, [data?.status, id, router]);

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-textSecondary" style={{ fontFamily: fonts.body }}>
          Missing job id. Go back and try again.
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-4 text-center text-[16px] text-textPrimary" style={{ fontFamily: fonts.subheading }}>
          Generation hit a snag
        </Text>
        <PrimaryButton label="Try again" onPress={() => void refetch()} />
      </View>
    );
  }

  if (data?.status === "FAILED") {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-4 text-center text-[16px] text-textPrimary" style={{ fontFamily: fonts.subheading }}>
          Something went wrong while synthesizing.
        </Text>
        {data.errorMessage ? (
          <Text className="mb-6 text-center text-[14px] text-textSecondary" style={{ fontFamily: fonts.body }}>
            {data.errorMessage}
          </Text>
        ) : null}
        <PrimaryButton label="Try again" onPress={() => router.replace("/voice-select")} />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <View className="w-full max-w-[420px] items-center rounded-[30px] bg-surface px-8 py-12">
      <GradientOrb size={220} variant="generating" />
      <Text
        className="mt-8 text-center text-[28px] leading-[34px] text-textPrimary"
        style={{ fontFamily: fonts.heading }}
      >
        {`We're giving your story a voice...`}
      </Text>
      <Animated.View key={label} entering={FadeIn.duration(400)} exiting={FadeOut.duration(200)}>
        <Text
          className="mt-4 min-h-[48px] text-center text-[16px] leading-[22px] text-textSecondary"
          style={{ fontFamily: fonts.body }}
        >
          {label}
        </Text>
      </Animated.View>
      <Text className="mt-6 rounded-full bg-background px-5 py-2 text-[14px] text-accent" style={{ fontFamily: fonts.body }}>
        Using {voice ?? "emma"} voice
      </Text>
      {isFetching ? (
        <ActivityIndicator className="mt-8" color={colors.primary} />
      ) : null}
      </View>
    </View>
  );
}
