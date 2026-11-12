import { fonts } from "@/constants/fonts";
import { WaveformBar } from "@/components/ui/WaveformBar";
import { useWaveform } from "@/hooks/useWaveform";
import { Pressable, Text, View } from "react-native";

interface ChapterRowProps {
  index: number;
  title: string;
  durationSeconds: number;
  seed: string;
  active?: boolean;
  onPress?: () => void;
}

/**
 * Compact chapter row with grey mini waveform bars.
 */
export function ChapterRow({ title, durationSeconds, seed, active, onPress }: ChapterRowProps) {
  const data = useWaveform(seed, 32);
  const m = Math.floor(durationSeconds / 60);
  const s = durationSeconds % 60;

  return (
    <Pressable
      className={`mb-3 overflow-hidden rounded-3xl border px-4 py-3 ${active ? "border-accent/60 bg-accent/10" : "border-border bg-surface"}`}
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="mb-3 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <View className="mb-1 flex-row items-center gap-2">
            <View className="rounded-full bg-accent/10 px-2.5 py-1">
              <Text className="text-[11px] uppercase tracking-[0.18em] text-accent" style={{ fontFamily: fonts.bodyMedium }}>
                Chapter {index}
              </Text>
            </View>
            {active ? (
              <View className="rounded-full bg-accent px-2.5 py-1">
                <Text className="text-[11px] uppercase tracking-[0.18em] text-white" style={{ fontFamily: fonts.bodyMedium }}>
                  Playing
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="text-[17px] text-textPrimary" style={{ fontFamily: fonts.subheading }} numberOfLines={2}>
          {title}
        </Text>
        </View>
        <View className="rounded-full bg-background px-3 py-1.5">
          <Text className="text-[12px] text-textSecondary" style={{ fontFamily: fonts.bodyMedium }}>
          {m}:{s.toString().padStart(2, "0")}
        </Text>
        </View>
      </View>
      <View className="h-10 overflow-hidden rounded-2xl bg-background/70 px-1 py-1">
        <WaveformBar data={data} progress={0} height={34} muted />
      </View>
    </Pressable>
  );
}
