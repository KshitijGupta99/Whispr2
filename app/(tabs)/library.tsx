import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { listAudiobooks } from "@/services/audiobook/audiobookService";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";

export default function LibraryScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["audiobooks"],
    queryFn: listAudiobooks,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-[15px] text-textSecondary" style={{ fontFamily: fonts.body }}>
          {error instanceof Error ? error.message : "Could not load library"}
        </Text>
        <View className="mt-6 w-full">
          <PrimaryButton label="Retry" onPress={() => void refetch()} />
        </View>
      </View>
    );
  }

  if (!data?.length) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-center text-[18px] text-textPrimary" style={{ fontFamily: fonts.subheading }}>
          No audiobooks yet
        </Text>
        <Text className="mt-2 text-center text-[15px] text-textSecondary" style={{ fontFamily: fonts.body }}>
          Create your first story from the Create tab.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-5 pt-14">
      <Text className="mb-4 text-[22px] text-textPrimary" style={{ fontFamily: fonts.heading }}>
        Library
      </Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            className="mb-3 rounded-2xl border border-border bg-surface p-4"
            onPress={() => {
              if (item.status === "READY") router.push(`/player/${item.id}`);
            }}
          >
            <Text className="text-[16px] text-textPrimary" style={{ fontFamily: fonts.subheading }}>
              {item.title}
            </Text>
            <Text className="mt-1 text-[13px] text-textSecondary" style={{ fontFamily: fonts.body }}>
              {item.status} · {item.chapters.length} chapters
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
