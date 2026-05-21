import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { deleteAudiobook, listAudiobooks } from "@/services/audiobook/audiobookService";
import type { AudiobookDto } from "@/services/audiobook/audiobookTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

function statusLabel(status: AudiobookDto["status"]): string {
  if (status === "READY") return "Ready";
  if (status === "FAILED") return "Failed";
  return "Processing";
}

export default function LibraryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["audiobooks"],
    queryFn: listAudiobooks,
  });

  const removeMut = useMutation({
    mutationFn: deleteAudiobook,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["audiobooks"] }),
  });

  const onPressItem = (item: AudiobookDto) => {
    if (item.status === "READY") {
      router.push(`/player/${item.id}`);
      return;
    }
    if (item.status === "PROCESSING") {
      router.push({ pathname: "/generating", params: { id: item.id, voice: item.voiceId } });
      return;
    }
    Alert.alert(
      "Generation failed",
      item.errorMessage ?? "Something went wrong while creating this audiobook.",
      [
        { text: "Dismiss", style: "cancel" },
        { text: "Create again", onPress: () => router.push("/(tabs)/create") },
      ],
    );
  };

  const confirmDelete = (item: AudiobookDto) => {
    Alert.alert("Delete audiobook", `Remove "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeMut.mutate(item.id),
      },
    ]);
  };

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
            onPress={() => onPressItem(item)}
            onLongPress={() => confirmDelete(item)}
          >
            <Text className="text-[16px] text-textPrimary" style={{ fontFamily: fonts.subheading }}>
              {item.title}
            </Text>
            <Text className="mt-1 text-[13px] text-textSecondary" style={{ fontFamily: fonts.body }}>
              {statusLabel(item.status)} · {item.chapters.length} chapters
            </Text>
            {item.status === "FAILED" && item.errorMessage ? (
              <Text className="mt-1 text-[12px] text-red-500" style={{ fontFamily: fonts.body }} numberOfLines={2}>
                {item.errorMessage}
              </Text>
            ) : null}
          </Pressable>
        )}
      />
    </View>
  );
}
