import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { fonts } from "@/constants/fonts";

export function TopBar() {
  const signOut = useAuthStore((s) => s.signOut);
  const router = useRouter();

  const onSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <View className="w-full flex-row justify-end px-2 py-2">
      <Pressable onPress={onSignOut} className="px-3 py-1">
        <Text className="text-[15px] text-textSecondary" style={{ fontFamily: fonts.body }}>
          Log out
        </Text>
      </Pressable>
    </View>
  );
}

export default TopBar;
