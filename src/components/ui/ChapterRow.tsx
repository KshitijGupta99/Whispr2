import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { WaveformBar } from "@/components/ui/WaveformBar";
import { useWaveform } from "@/hooks/useWaveform";
import { Text, View } from "react-native";

interface ChapterRowProps {
  title: string;
  durationSeconds: number;
  seed: string;
}

/**
 * Compact chapter row with grey mini waveform bars.
 */
export function ChapterRow({ title, durationSeconds, seed }: ChapterRowProps) {
  const data = useWaveform(seed, 32);
  const m = Math.floor(durationSeconds / 60);
  const s = durationSeconds % 60;

  return (
    <View className="mb-3 rounded-2xl bg-background px-3 py-2.5">
      <View className="flex-1">
        <Text className="text-[17px] text-textPrimary" style={{ fontFamily: fonts.subheading }}>
          {title}
        </Text>
        <Text className="mt-1 text-[12px] text-accent" style={{ fontFamily: fonts.body }}>
          {m}:{s.toString().padStart(2, "0")}
        </Text>
        <View className="absolute right-0 top-1 h-8 w-20">
          <WaveformBar data={data} progress={0} height={30} muted />
        </View>
      </View>
    </View>
  );
}
