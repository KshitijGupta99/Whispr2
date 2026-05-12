import { colors } from "@/constants/colors";
import { Canvas, Rect } from "@shopify/react-native-skia";
import { useMemo, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";

interface WaveformBarProps {
  data: number[];
  progress: number;
  height: number;
  /** When set, draws all bars with the inactive color (chapter list mini view). */
  muted?: boolean;
}

/**
 * Skia-rendered bar waveform with a played / unplayed color split.
 */
export function WaveformBar({ data, progress, height, muted }: WaveformBarProps) {
  const [width, setWidth] = useState(280);

  const bars = useMemo(() => {
    const gap = 2;
    const count = data.length;
    const barW = Math.max(2, (width - gap * (count - 1)) / count);
    return data.map((v, i) => ({
      x: i * (barW + gap),
      barW,
      h: Math.max(4, v * height),
    }));
  }, [data, height, width]);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const split = Math.max(0, Math.min(1, progress));

  return (
    <View style={{ height }} onLayout={onLayout}>
      <Canvas style={{ flex: 1, height }}>
        {bars.map((b, i) => {
          const ratio = (i + 0.5) / bars.length;
          const played = !muted && ratio <= split;
          const top = height - b.h;
          return (
            <Rect
              key={i}
              x={b.x}
              y={top}
              width={b.barW}
              height={b.h}
              color={played ? colors.gradientEnd : colors.inputBorder}
            />
          );
        })}
      </Canvas>
    </View>
  );
}
