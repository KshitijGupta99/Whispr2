import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { fonts } from "@/constants/fonts";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { extractDocument, transcribeAudio } from "@/services/transcription/transcriptionService";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, Text, View } from "react-native";

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onTextLoaded: (text: string) => void;
}

function isAudioMime(mime: string | undefined): boolean {
  return Boolean(mime?.startsWith("audio/"));
}

function isDocumentMime(mime: string | undefined): boolean {
  if (!mime) return false;
  return (
    mime === "application/pdf" ||
    mime === "application/msword" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

/**
 * Document picker for text files, office docs, and audio (Whisper via API).
 */
export function UploadModal({ visible, onClose, onTextLoaded }: UploadModalProps) {
  const { pick, error, clearError } = useDocumentPicker();
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("Working…");

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
        <View className="rounded-t-3xl bg-surface p-6">
          <Text className="mb-4 text-center text-[18px] text-textPrimary" style={{ fontFamily: fonts.subheading }}>
            Upload manuscript
          </Text>
          {error ? (
            <Text className="mb-4 text-center text-[14px] text-red-500" style={{ fontFamily: fonts.body }}>
              {error}
            </Text>
          ) : null}
          {busy ? (
            <View className="mb-6 items-center py-4">
              <ActivityIndicator />
              <Text className="mt-3 text-center text-[13px] text-textSecondary" style={{ fontFamily: fonts.body }}>
                {busyLabel}
              </Text>
            </View>
          ) : null}
          <PrimaryButton
            label="Choose file"
            disabled={busy}
            onPress={async () => {
              clearError();
              const file = await pick();
              if (!file) return;
              if (file.mime === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
                const text = await FileSystem.readAsStringAsync(file.uri);
                onTextLoaded(text);
                onClose();
                return;
              }
              if (isAudioMime(file.mime)) {
                setBusyLabel("Transcribing audio…");
                setBusy(true);
                try {
                  const form = new FormData();
                  form.append("file", {
                    uri: file.uri,
                    name: file.name || "upload.m4a",
                    type: file.mime || "audio/m4a",
                  } as unknown as Blob);
                  const res = await transcribeAudio(form);
                  onTextLoaded(res.text);
                  onClose();
                } catch (e) {
                  Alert.alert("Transcription", e instanceof Error ? e.message : "Failed");
                } finally {
                  setBusy(false);
                }
                return;
              }
              if (isDocumentMime(file.mime)) {
                setBusyLabel("Extracting text…");
                setBusy(true);
                try {
                  const form = new FormData();
                  form.append("file", {
                    uri: file.uri,
                    name: file.name || "document.pdf",
                    type: file.mime || "application/pdf",
                  } as unknown as Blob);
                  const res = await extractDocument(form);
                  onTextLoaded(res.text);
                  onClose();
                } catch (e) {
                  Alert.alert("Import", e instanceof Error ? e.message : "Failed");
                } finally {
                  setBusy(false);
                }
                return;
              }
              Alert.alert("Unsupported file", "Use .txt, .pdf, .docx, or an audio file.");
            }}
          />
          <Pressable className="mt-4 py-2" onPress={onClose} disabled={busy}>
            <Text className="text-center text-[15px] text-textSecondary" style={{ fontFamily: fonts.body }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
