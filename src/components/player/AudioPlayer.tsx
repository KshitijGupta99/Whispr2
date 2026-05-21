import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { PlaybackWaveform } from "@/components/player/PlaybackWaveform";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import type { ChapterDto } from "@/services/audiobook/audiobookTypes";
import type { PlaybackSpeed } from "@/store/usePlayerStore";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Polygon, Stop } from "react-native-svg";
import { formatDuration } from "@/utils/timeFormatter";

interface AudioPlayerProps {
  chapter: ChapterDto;
  speed?: PlaybackSpeed;
  initialPositionSeconds?: number;
  onPositionChange?: (chapterId: string, seconds: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
  sleepMinutes?: number | null;
}

/**
 * Full-width player controls with waveform and skip actions.
 */
export function AudioPlayer({
  chapter,
  speed = 1,
  initialPositionSeconds = 0,
  onPositionChange,
  onPrev,
  onNext,
  sleepMinutes = null,
}: AudioPlayerProps) {
  const { isPlaying, positionMillis, durationMillis, toggle, pause } = useAudioPlayer(chapter.audioUrl, {
    chapterId: chapter.id,
    speed,
    initialPositionSeconds,
    onPositionChange,
  });
  const progress = durationMillis ? positionMillis / durationMillis : 0;
  const gid = `player-main-${chapter.id}`;

  useEffect(() => {
    if (!sleepMinutes) return;
    const t = setTimeout(() => {
      void pause();
    }, sleepMinutes * 60_000);
    return () => clearTimeout(t);
  }, [sleepMinutes, pause, chapter.id]);

  return (
    <View className="rounded-3xl bg-surface px-4 pb-5 pt-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[28px] text-textPrimary" style={{ fontFamily: fonts.subheading }}>
          {chapter.title}
        </Text>
      </View>
      <PlaybackWaveform data={chapter.waveformData} progress={progress} />
      <View className="mt-2 flex-row justify-between">
        <Text className="text-[13px] text-textSecondary" style={{ fontFamily: fonts.caption }}>
          {formatDuration(positionMillis / 1000)}
        </Text>
        <Text className="text-[13px] text-textSecondary" style={{ fontFamily: fonts.caption }}>
          {formatDuration(durationMillis / 1000)}
        </Text>
      </View>
      <View className="mt-3 flex-row items-center justify-center gap-12">
        <Pressable
          accessibilityLabel="Previous chapter"
          onPress={() => {
            void Haptics.selectionAsync();
            onPrev?.();
          }}
        >
          <Text className="text-[20px] text-accent">⏮</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            void toggle();
          }}
          className="h-16 w-16 items-center justify-center"
        >
          <Svg width={64} height={64} viewBox="0 0 64 64">
            <Defs>
              <LinearGradient id={gid} x1="0" y1="0" x2="64" y2="64">
                <Stop offset="0" stopColor={colors.gradientStart} />
                <Stop offset="0.55" stopColor={colors.gradientMid} />
                <Stop offset="1" stopColor={colors.gradientEnd} />
              </LinearGradient>
            </Defs>
            <Circle cx={32} cy={32} r={22} fill={colors.surface} />
            <Circle cx={32} cy={32} r={22} stroke={`url(#${gid})`} strokeWidth={4} fill="none" />
            {isPlaying ? (
              <>
                <Circle cx={29} cy={32} r={4} fill={colors.accent} />
                <Circle cx={35} cy={32} r={4} fill={colors.accent} />
              </>
            ) : (
              <Polygon points="29,24 42,32 29,40" fill={colors.accent} />
            )}
          </Svg>
        </Pressable>
        <Pressable
          accessibilityLabel="Next chapter"
          onPress={() => {
            void Haptics.selectionAsync();
            onNext?.();
          }}
        >
          <Text className="text-[20px] text-accent">⏭</Text>
        </Pressable>
      </View>
    </View>
  );
}
