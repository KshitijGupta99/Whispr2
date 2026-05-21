import { AudioPlayer } from "@/components/player/AudioPlayer";
import { ChapterList } from "@/components/player/ChapterList";
import { GhostButton } from "@/components/ui/GhostButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { fetchAudiobook } from "@/services/audiobook/audiobookService";
import { findChapterById } from "@/services/audiobook/chapterService";
import type { ChapterDto } from "@/services/audiobook/audiobookTypes";
import { usePlayerStore } from "@/store/usePlayerStore";
import { formatDurationHuman } from "@/utils/timeFormatter";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setSleepTimer = usePlayerStore((s) => s.setSleepTimer);
  const sleepMinutes = usePlayerStore((s) => s.sleepMinutes);
  const speed = usePlayerStore((s) => s.speed);
  const setSpeed = usePlayerStore((s) => s.setSpeed);
  const positionsByChapter = usePlayerStore((s) => s.positionsByChapter);
  const setChapterPosition = usePlayerStore((s) => s.setChapterPosition);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["audiobook", id],
    queryFn: () => fetchAudiobook(id!),
    enabled: Boolean(id),
  });

  const chapters = data?.chapters ?? [];
  const [chapterId, setChapterId] = useState<string | null>(null);

  const current: ChapterDto | null = useMemo(() => {
    if (!chapters.length) return null;
    if (chapterId) {
      return findChapterById(chapters, chapterId) ?? chapters[0];
    }
    return chapters[0];
  }, [chapterId, chapters]);

  const onPositionChange = useCallback(
    (chId: string, seconds: number) => {
      setChapterPosition(chId, seconds);
    },
    [setChapterPosition],
  );

  if (isLoading || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-4 text-center text-textSecondary" style={{ fontFamily: fonts.body }}>
          {error instanceof Error ? error.message : "Failed to load audiobook"}
        </Text>
        <PrimaryButton label="Retry" onPress={() => void refetch()} />
      </View>
    );
  }

  if (data.status !== "READY") {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-4 text-center text-textPrimary" style={{ fontFamily: fonts.subheading }}>
          {data.status === "FAILED" ? "This audiobook failed to generate." : "Still processing…"}
        </Text>
        {data.errorMessage ? (
          <Text className="mb-4 text-center text-[14px] text-textSecondary" style={{ fontFamily: fonts.body }}>
            {data.errorMessage}
          </Text>
        ) : null}
        <PrimaryButton
          label={data.status === "FAILED" ? "Create again" : "View progress"}
          onPress={() => {
            if (data.status === "FAILED") router.replace("/(tabs)/create");
            else router.replace({ pathname: "/generating", params: { id: data.id, voice: data.voiceId } });
          }}
        />
      </View>
    );
  }

  const totalSec = data.duration ?? chapters.reduce((a, c) => a + c.duration, 0);
  const idx = current ? chapters.findIndex((c) => c.id === current.id) + 1 : 0;

  const openSleepMenu = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Off", "15 min", "30 min", "60 min", "Cancel"],
          cancelButtonIndex: 4,
        },
        (i) => {
          if (i === 0) setSleepTimer(null);
          if (i === 1) setSleepTimer(15);
          if (i === 2) setSleepTimer(30);
          if (i === 3) setSleepTimer(60);
        },
      );
    } else {
      Alert.alert("Sleep timer", undefined, [
        { text: "Off", onPress: () => setSleepTimer(null) },
        { text: "15m", onPress: () => setSleepTimer(15) },
        { text: "30m", onPress: () => setSleepTimer(30) },
        { text: "60m", onPress: () => setSleepTimer(60) },
        { text: "Close", style: "cancel" },
      ]);
    }
  };

  const cycleSpeed = () => {
    const order = [0.75, 1, 1.25, 1.5, 2] as const;
    const i = order.indexOf(speed as (typeof order)[number]);
    const next = order[(i + 1) % order.length];
    setSpeed(next);
    void Haptics.selectionAsync();
  };

  return (
    <View className="flex-1 items-center bg-background px-5 pt-10">
      <View className="w-full max-w-[420px] flex-1 rounded-[30px] bg-surface p-4">
        <Text className="text-center text-[30px] text-textPrimary" style={{ fontFamily: fonts.heading }}>
          {data.title}
        </Text>
        <Text className="mt-1 text-center text-[14px] text-textSecondary" style={{ fontFamily: fonts.body }}>
          {formatDurationHuman(totalSec)} · {chapters.length} chapters
          {sleepMinutes ? ` · sleep ${sleepMinutes}m` : ""}
        </Text>
        {current ? (
          <View className="mt-5">
            <View className="mb-2 flex-row items-start justify-between">
              <Text className="max-w-[70%] text-[18px] text-textPrimary" style={{ fontFamily: fonts.subheading }}>
                {current.title}
              </Text>
              <Text className="text-[13px] text-textSecondary" style={{ fontFamily: fonts.body }}>
                Chapter {idx} of {chapters.length}
              </Text>
            </View>
            <AudioPlayer
              key={current.id}
              chapter={current}
              speed={speed}
              sleepMinutes={sleepMinutes}
              initialPositionSeconds={positionsByChapter[current.id] ?? 0}
              onPositionChange={onPositionChange}
              onPrev={() => {
                const i = chapters.findIndex((c) => c.id === current.id);
                if (i > 0) setChapterId(chapters[i - 1].id);
              }}
              onNext={() => {
                const i = chapters.findIndex((c) => c.id === current.id);
                if (i < chapters.length - 1) setChapterId(chapters[i + 1].id);
              }}
            />
          </View>
        ) : null}
        <View className="min-h-[120px] flex-1">
          <ChapterList
            chapters={chapters}
            currentId={current?.id ?? ""}
            onSelectChapter={(cid) => setChapterId(cid)}
          />
        </View>
        <View className="mt-4 gap-3 border-t border-border pt-4">
          <View className="flex-row items-center justify-between">
            <Pressable accessibilityLabel="More options" onPress={openSleepMenu}>
              <Text className="text-[22px]">⋯</Text>
            </Pressable>
            <Pressable onPress={cycleSpeed}>
              <Text className="text-[16px] text-accent" style={{ fontFamily: fonts.bodyMedium }}>
                {speed}x
              </Text>
            </Pressable>
          </View>
          <GhostButton label="Share →" onPress={() => Alert.alert("Share", `whispr://player/${id}`)} />
          <PrimaryButton
            label="Create new →"
            onPress={() => {
              router.replace("/(tabs)/create");
            }}
          />
        </View>
      </View>
    </View>
  );
}
