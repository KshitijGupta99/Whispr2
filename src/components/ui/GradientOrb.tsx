import { SparkleIcon } from "@/components/ui/SparkleIcon";
import { colors } from "@/constants/colors";
import { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);

interface GradientOrbProps {
  size?: number;
  variant?: "splash" | "generating";
}

/**
 * Animated brand orb with concentric gradient rings.
 */
export function GradientOrb({ size = 220, variant = "splash" }: GradientOrbProps) {
  const pulse = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.04, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  useEffect(() => {
    if (variant === "generating") {
      rotate.value = withRepeat(
        withTiming(360, { duration: 14000, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      rotate.value = 0;
    }
  }, [rotate, variant]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }, { rotate: `${rotate.value}deg` }],
  }));

  const stroke = 3;
  const c = size / 2;

  return (
    <AnimatedView
      style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="go" x1="0" y1="0" x2={size} y2={size}>
            <Stop offset="0" stopColor={colors.gradientStart} />
            <Stop offset="0.5" stopColor={colors.gradientMid} />
            <Stop offset="1" stopColor={colors.gradientEnd} />
          </LinearGradient>
        </Defs>
        <Circle cx={c} cy={c} r={c - stroke} stroke="url(#go)" strokeWidth={stroke} fill="none" />
        <Circle cx={c} cy={c} r={c * 0.72} stroke="url(#go)" strokeWidth={stroke} fill="none" opacity={0.85} />
        <Circle cx={c} cy={c} r={c * 0.48} stroke="url(#go)" strokeWidth={stroke} fill="none" opacity={0.7} />
      </Svg>
      <View style={{ position: "absolute" }}>
        <SparkleIcon size={Math.round(size * 0.18)} />
      </View>
    </AnimatedView>
  );
}
