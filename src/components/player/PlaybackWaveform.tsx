import { colors } from "@/constants/colors";
import { WaveformBar } from "@/components/ui/WaveformBar";
import { useState } from "react";
import { LayoutChangeEvent, View } from "react-native";

interface PlaybackWaveformProps {
  data: number[];
  progress: number;
  height?: number;
}

/**
 * Large playback waveform with a simple position indicator.
 */
export function PlaybackWaveform({ data, progress, height = 96 }: PlaybackWaveformProps) {
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const left = width > 0 ? Math.max(0, Math.min(width - 2, progress * width)) : 0;

  return (
    <View onLayout={onLayout}>
      <WaveformBar data={data} progress={progress} height={height} />
      {width > 0 ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: colors.textPrimary,
            opacity: 0.35,
            left,
          }}
        />
      ) : null}
    </View>
  );
}
