import { InputCard } from "@/components/ui/InputCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { RecordingModal } from "@/components/modals/RecordingModal";
import { UploadModal } from "@/components/modals/UploadModal";
import { SparkleIcon } from "@/components/ui/SparkleIcon";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { transcribeAudio } from "@/services/transcription/transcriptionService";
import { useCreationStore } from "@/store/useCreationStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import TopBar from "@/components/ui/TopBar";

export default function CreateScreen() {
  const router = useRouter();
  const text = useCreationStore((s) => s.manuscriptText);
  const setText = useCreationStore((s) => s.setManuscriptText);
  const [recOpen, setRecOpen] = useState(false);
  const [upOpen, setUpOpen] = useState(false);

  return (
    <View className="flex-1 items-center bg-background px-5 pt-10">
      <TopBar />
      <View className="w-full max-w-[420px] flex-1">
        <InputCard>
        <View className="mb-4 items-center">
          <SparkleIcon size={24} />
          <Text
            className="mt-4 text-center text-[22px] leading-[28px] text-textPrimary"
            style={{ fontFamily: fonts.heading }}
          >
            What would you like to make today?
          </Text>
        </View>
        <TextInput
          className="min-h-[240px] flex-1 rounded-3xl border border-border px-4 py-4 text-[16px] text-textPrimary"
          style={{ fontFamily: fonts.body, textAlignVertical: "top" }}
          multiline
          placeholder="Describe your story book or text..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
        />
        <View className="mb-4 mt-4">
          <PrimaryButton
            label="Let's create storybook →"
            disabled={!text.trim()}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/voice-select");
            }}
          />
        </View>
        <View className="mb-4 flex-row justify-center gap-3">
          <Pressable
            className="flex-1 items-center rounded-2xl bg-background py-5"
            onPress={() => {
              void Haptics.selectionAsync();
              setRecOpen(true);
            }}
          >
            <Text className="text-[22px]">🎙</Text>
            <Text className="mt-2 text-[16px] text-textSecondary" style={{ fontFamily: fonts.body }}>
              Voice
            </Text>
          </Pressable>
          <Pressable
            className="flex-1 items-center rounded-2xl bg-background py-5"
            onPress={() => {
              void Haptics.selectionAsync();
              setUpOpen(true);
            }}
          >
            <Text className="text-[22px]">📤</Text>
            <Text className="mt-2 text-[16px] text-textSecondary" style={{ fontFamily: fonts.body }}>
              Upload
            </Text>
          </Pressable>
        </View>
        <View className="mt-1">
          <Text
            className="text-center text-[13px] text-textSecondary italic"
            style={{ fontFamily: fonts.body }}
          >
            Try: &quot;Turn my wedding speech into an audiobook&quot;
          </Text>
          <Text
            className="mt-1 text-center text-[13px] text-textSecondary italic"
            style={{ fontFamily: fonts.body }}
          >
            {`Or: "I wrote a children's story I'd like narrated"`}
          </Text>
        </View>
      </InputCard>
      </View>
      <RecordingModal
        visible={recOpen}
        onClose={() => setRecOpen(false)}
        onComplete={async (uri) => {
          try {
            const form = new FormData();
            form.append("file", { uri, name: "memo.m4a", type: "audio/m4a" } as unknown as Blob);
            const res = await transcribeAudio(form);
            setText(res.text);
          } catch (e) {
            Alert.alert("Transcription", e instanceof Error ? e.message : "Failed");
          }
        }}
      />
      <UploadModal
        visible={upOpen}
        onClose={() => setUpOpen(false)}
        onTextLoaded={setText}
      />
    </View>
  );
}
