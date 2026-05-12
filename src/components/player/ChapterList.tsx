import { fonts } from "@/constants/fonts";
import { ChapterRow } from "@/components/ui/ChapterRow";
import type { ChapterDto } from "@/services/audiobook/audiobookTypes";
import { FlatList, Text, View } from "react-native";

interface ChapterListProps {
  chapters: ChapterDto[];
  currentId: string;
}

/**
 * Scrollable list of upcoming chapters with mini waveforms.
 */
export function ChapterList({ chapters, currentId }: ChapterListProps) {
  const next = chapters.filter((c) => c.id !== currentId);

  return (
    <View className="mt-5 flex-1">
      <Text className="mb-2 text-[18px] text-textPrimary" style={{ fontFamily: fonts.subheading }}>
        Next chapters
      </Text>
      <FlatList
        data={next}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChapterRow title={item.title} durationSeconds={item.duration} seed={item.id} />
        )}
      />
    </View>
  );
}
