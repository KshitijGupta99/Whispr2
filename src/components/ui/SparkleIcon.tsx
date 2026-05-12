import { colors } from "@/constants/colors";
import Svg, { Defs, LinearGradient, Polygon, Stop } from "react-native-svg";

interface SparkleIconProps {
  size?: number;
}

/**
 * Four-point star mark used in headers and inside the orb.
 */
export function SparkleIcon({ size = 32 }: SparkleIconProps) {
  const half = size / 2;
  const points = `${half},0 ${size},${half} ${half},${size} 0,${half}`;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id="sparkle" x1="0" y1="0" x2={size} y2={size}>
          <Stop offset="0" stopColor={colors.gradientStart} />
          <Stop offset="0.5" stopColor={colors.gradientMid} />
          <Stop offset="1" stopColor={colors.gradientEnd} />
        </LinearGradient>
      </Defs>
      <Polygon points={points} fill="url(#sparkle)" />
    </Svg>
  );
}
