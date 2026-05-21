import { fonts } from "@/constants/fonts";
import { ChapterRow } from "@/components/ui/ChapterRow";
import type { ChapterDto } from "@/services/audiobook/audiobookTypes";
import { FlatList, Text, View } from "react-native";

interface ChapterListProps {
  chapters: ChapterDto[];
  currentId: string;
  onSelectChapter?: (id: string) => void;
}

/**
 * Scrollable list of chapters with tap-to-play.
 */
export function ChapterList({ chapters, currentId, onSelectChapter }: ChapterListProps) {
  return (
    <View className="mt-5 flex-1">
      <Text className="mb-2 text-[18px] text-textPrimary" style={{ fontFamily: fonts.subheading }}>
        Chapters
      </Text>
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChapterRow
            title={item.title}
            durationSeconds={item.duration}
            seed={item.id}
            active={item.id === currentId}
            onPress={onSelectChapter ? () => onSelectChapter(item.id) : undefined}
          />
        )}
      />
    </View>
  );
}
