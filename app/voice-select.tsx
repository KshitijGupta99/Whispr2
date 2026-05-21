import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SparkleIcon } from "@/components/ui/SparkleIcon";
import { VoiceCard } from "@/components/ui/VoiceCard";
import { DEFAULT_VOICES } from "@/constants/voices";
import { fonts } from "@/constants/fonts";
import { useVoicePreview } from "@/hooks/useVoicePreview";
import { createAudiobookJob } from "@/services/audiobook/audiobookService";
import { fetchVoices } from "@/services/voice/voiceService";
import type { Voice } from "@/services/voice/voiceTypes";
import { useCreationStore } from "@/store/useCreationStore";
import { deriveTitle } from "@/utils/deriveTitle";
import { useVoiceStore } from "@/store/useVoiceStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function VoiceSelectScreen() {
  const router = useRouter();
  const manuscript = useCreationStore((s) => s.manuscriptText);
  const selected = useVoiceStore((s) => s.selectedVoice);
  const setSelected = useVoiceStore((s) => s.setSelectedVoice);
  const { activeId, playing, toggle, stop } = useVoicePreview();

  const { data: voices, isLoading } = useQuery({
    queryKey: ["voices"],
    queryFn: fetchVoices,
    initialData: DEFAULT_VOICES,
    retry: 1,
  });

  const createMut = useMutation({
    onMutate: async () => {
      await stop();
    },
    mutationFn: async () => {
      const voice = useVoiceStore.getState().selectedVoice;
      if (!voice) throw new Error("Pick a voice");
      const text = useCreationStore.getState().manuscriptText;
      return createAudiobookJob({
        text,
        voiceId: voice.id,
        title: deriveTitle(text),
      });
    },
    onSuccess: (res) => {
      const voice = useVoiceStore.getState().selectedVoice;
      router.replace({
        pathname: "/generating",
        params: { id: res.id, voice: voice?.id ?? "" },
      });
    },
    onError: (e) => {
      Alert.alert("Could not start", e instanceof Error ? e.message : "Error");
    },
  });

  const list: Voice[] = voices?.length ? voices : DEFAULT_VOICES;

  return (
    <View className="flex-1 items-center bg-background px-5 pt-10">
      <View className="w-full max-w-[420px] flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 110 }}>
        <View className="items-center">
          <SparkleIcon size={24} />
          <Text
            className="mt-4 text-center text-[22px] leading-[28px] text-textPrimary"
            style={{ fontFamily: fonts.heading }}
          >
            Choose voice for your podcast
          </Text>
        </View>
        <View className="mt-4 rounded-3xl border border-border bg-surface p-4">
          <Text
            className="text-[15px] leading-7 text-textPrimary"
            style={{ fontFamily: fonts.body }}
            numberOfLines={7}
          >
            {manuscript.slice(0, 220)}
            {manuscript.length > 220 ? "…" : ""}
          </Text>
        </View>
        <View className="my-6 h-px bg-border" />
        <Text className="mb-3 text-[18px] text-textPrimary" style={{ fontFamily: fonts.subheading }}>
          Choose voice
        </Text>
        {isLoading ? (
          <ActivityIndicator />
        ) : null}
        {list.map((v) => (
          <VoiceCard
            key={v.id}
            voice={v}
            selected={selected?.id === v.id}
            previewing={activeId === v.id && playing}
            onSelect={() => setSelected(v)}
            onPreview={() => {
              void toggle(v.id);
            }}
          />
        ))}
      </ScrollView>
      <View className="absolute bottom-6 left-0 right-0">
        <PrimaryButton
          label="Generate audiobook →"
          disabled={!selected}
          onPress={() => createMut.mutate()}
        />
      </View>
      </View>
    </View>
  );
}
