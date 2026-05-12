import { colors } from "@/constants/colors";
import { ReactNode } from "react";
import { View } from "react-native";

interface InputCardProps {
  children: ReactNode;
}

/**
 * Soft surface container for large text inputs on the create screen.
 */
export function InputCard({ children }: InputCardProps) {
  return (
    <View
      className="flex-1 rounded-[28px] bg-surface p-4"
      style={{
        borderWidth: 0.8,
        borderColor: colors.border,
        shadowColor: "#00000014",
        shadowOpacity: 0.05,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      }}
    >
      {children}
    </View>
  );
}
