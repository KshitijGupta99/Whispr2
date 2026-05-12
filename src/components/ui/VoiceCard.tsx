import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import type { Voice } from "@/services/voice/voiceTypes";
import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Polygon, Stop } from "react-native-svg";

interface VoiceCardProps {
  voice: Voice;
  selected: boolean;
  previewing: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

/**
 * Selectable narrator row with gradient-accent preview control.
 */
export function VoiceCard({ voice, selected, previewing, onSelect, onPreview }: VoiceCardProps) {
  const gid = `vr-${voice.id}`;
  return (
    <Pressable
      onPress={() => {
        void Haptics.selectionAsync();
        onSelect();
      }}
      className="mb-2 rounded-2xl border bg-surface px-4 py-3.5"
      style={{
        borderColor: selected ? colors.accent : colors.border,
        borderWidth: selected ? 1.5 : 1,
      }}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1">
          <Text className="text-[20px] text-textPrimary" style={{ fontFamily: fonts.subheading }}>
            {voice.name}
            {voice.recommended ? (
              <Text style={{ color: colors.recommended, fontFamily: fonts.body }}>
                {" "}
                (recommended)
              </Text>
            ) : null}
          </Text>
          <Text className="mt-0.5 text-[14px] text-textSecondary" style={{ fontFamily: fonts.body }}>
            {voice.description}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Preview voice"
          onPress={(e) => {
            e.stopPropagation?.();
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPreview();
          }}
          hitSlop={8}
        >
          <View style={{ width: 52, height: 52, alignItems: "center", justifyContent: "center" }}>
            <Svg width={52} height={52} style={{ position: "absolute" }}>
              <Defs>
                <LinearGradient id={gid} x1="0" y1="0" x2="52" y2="52">
                  <Stop offset="0" stopColor={colors.gradientStart} />
                  <Stop offset="0.5" stopColor={colors.gradientMid} />
                  <Stop offset="1" stopColor={colors.gradientEnd} />
                </LinearGradient>
              </Defs>
              <Circle
                cx={26}
                cy={26}
                r={22}
                stroke={previewing ? `url(#${gid})` : colors.voiceRing}
                strokeWidth={previewing ? 3 : 2}
                fill={colors.surface}
              />
            </Svg>
            <Svg width={14} height={16} viewBox="0 0 14 16">
              <Defs>
                <LinearGradient id={`${gid}-p`} x1="0" y1="0" x2="14" y2="16">
                  <Stop offset="0" stopColor={colors.gradientStart} />
                  <Stop offset="1" stopColor={colors.gradientEnd} />
                </LinearGradient>
              </Defs>
              <Polygon points="0,0 14,8 0,16" fill={`url(#${gid}-p)`} />
            </Svg>
          </View>
        </Pressable>
      </View>
    </Pressable>
  );
}
