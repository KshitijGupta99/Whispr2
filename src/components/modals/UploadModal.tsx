import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { fonts } from "@/constants/fonts";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import * as FileSystem from "expo-file-system";
import { Modal, Pressable, Text, View } from "react-native";

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onTextLoaded: (text: string) => void;
}

/**
 * Document picker focused on lightweight text ingestion.
 */
export function UploadModal({ visible, onClose, onTextLoaded }: UploadModalProps) {
  const { pick, error, clearError } = useDocumentPicker();

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
          <PrimaryButton
            label="Choose file"
            onPress={async () => {
              clearError();
              const file = await pick();
              if (!file) return;
              if (file.mime === "text/plain") {
                const text = await FileSystem.readAsStringAsync(file.uri);
                onTextLoaded(text);
                onClose();
                return;
              }
              onTextLoaded(`[Imported: ${file.name}] — binary formats are transcribed on the server in production.`);
              onClose();
            }}
          />
          <Pressable className="mt-4 py-2" onPress={onClose}>
            <Text className="text-center text-[15px] text-textSecondary" style={{ fontFamily: fonts.body }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
