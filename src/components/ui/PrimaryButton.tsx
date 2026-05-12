import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";

import { fonts } from "@/constants/fonts";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Primary pill CTA matching the Whispr design system.
 */
export function PrimaryButton({ label, onPress, disabled }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      className="h-[52px] w-full items-center justify-center rounded-full bg-primary active:opacity-90"
      style={{
        opacity: disabled ? 0.5 : 1,
        shadowColor: "#4F6EF7",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <Text
        className="text-center text-[16px] text-primaryText"
        style={{ fontFamily: fonts.bodyMedium }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
