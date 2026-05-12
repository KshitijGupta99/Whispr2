import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";

import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";

interface GhostButtonProps {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
}

/**
 * Outlined secondary action used for share / alternate flows.
 */
export function GhostButton({ label, onPress, icon }: GhostButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      className="h-[52px] w-full flex-row items-center justify-center gap-2 rounded-full border border-inputBorder bg-surface"
      style={{ borderColor: colors.inputBorder }}
    >
      {icon}
      <Text className="text-[15px] text-textPrimary" style={{ fontFamily: fonts.bodyMedium }}>
        {label}
      </Text>
    </Pressable>
  );
}
