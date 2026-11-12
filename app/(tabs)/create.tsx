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
    <View className="flex-1 bg-background px-5 pt-10">
      <View className="absolute -left-24 top-[-40] h-64 w-64 rounded-full bg-gradientStart/10" />
      <View className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-gradientEnd/10" />
      <TopBar />
      <View className="w-full max-w-[420px] flex-1 self-center">
        <InputCard>
          <View className="mb-5 rounded-[28px] bg-background px-4 py-5">
            <View className="mb-3 flex-row items-center justify-between">
              <View className="rounded-full bg-accent/10 px-3 py-1.5">
                <Text className="text-[11px] uppercase tracking-[0.18em] text-accent" style={{ fontFamily: fonts.bodyMedium }}>
                  Create
                </Text>
              </View>
              <SparkleIcon size={24} />
            </View>
            <Text
              className="text-[24px] leading-[30px] text-textPrimary"
              style={{ fontFamily: fonts.heading }}
            >
              What would you like to turn into a story?
            </Text>
            <Text className="mt-2 text-[14px] leading-[20px] text-textSecondary" style={{ fontFamily: fonts.body }}>
              Paste text, record a voice memo, or upload a document. We&apos;ll turn it into a narrated audiobook.
            </Text>
          </View>

          <TextInput
            className="min-h-[250px] flex-1 rounded-[28px] border border-border bg-surface px-4 py-4 text-[16px] text-textPrimary"
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

          <View className="mb-4 flex-row gap-3">
            <Pressable
              className="flex-1 rounded-[24px] border border-border bg-background px-4 py-5"
              onPress={() => {
                void Haptics.selectionAsync();
                setRecOpen(true);
              }}
            >
              <Text className="text-[22px]">🎙</Text>
              <Text className="mt-2 text-[16px] text-textPrimary" style={{ fontFamily: fonts.bodyMedium }}>
                Voice memo
              </Text>
              <Text className="mt-1 text-[13px] text-textSecondary" style={{ fontFamily: fonts.body }}>
                Record and transcribe
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 rounded-[24px] border border-border bg-background px-4 py-5"
              onPress={() => {
                void Haptics.selectionAsync();
                setUpOpen(true);
              }}
            >
              <Text className="text-[22px]">📤</Text>
              <Text className="mt-2 text-[16px] text-textPrimary" style={{ fontFamily: fonts.bodyMedium }}>
                Upload file
              </Text>
              <Text className="mt-1 text-[13px] text-textSecondary" style={{ fontFamily: fonts.body }}>
                PDF, DOCX, or audio
              </Text>
            </Pressable>
          </View>

          <View className="rounded-[24px] bg-background px-4 py-4">
            <Text className="text-[13px] uppercase tracking-[0.16em] text-textSecondary" style={{ fontFamily: fonts.bodyMedium }}>
              Prompt ideas
            </Text>
            <Text className="mt-2 text-[13px] text-textSecondary" style={{ fontFamily: fonts.body }}>
              Try: &quot;Turn my wedding speech into an audiobook&quot;
            </Text>
            <Text className="mt-1 text-[13px] text-textSecondary" style={{ fontFamily: fonts.body }}>
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
