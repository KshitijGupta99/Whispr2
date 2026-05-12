import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { fonts } from "@/constants/fonts";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import * as Haptics from "expo-haptics";
import { Modal, Pressable, Text, View } from "react-native";

interface RecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (uri: string) => void;
}

/**
 * Simple recorder sheet that returns a file URI when finished.
 */
export function RecordingModal({ visible, onClose, onComplete }: RecordingModalProps) {
  const { recording, start, stop } = useAudioRecorder();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
        <View className="rounded-t-3xl bg-surface p-6">
          <Text className="mb-4 text-center text-[18px] text-textPrimary" style={{ fontFamily: fonts.subheading }}>
            Record narration
          </Text>
          <Text className="mb-6 text-center text-[14px] text-textSecondary" style={{ fontFamily: fonts.body }}>
            Capture a quick voice memo — we will transcribe it on the server.
          </Text>
          <PrimaryButton
            label={recording ? "Stop recording" : "Start recording"}
            onPress={async () => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              try {
                if (!recording) await start();
                else {
                  const uri = await stop();
                  if (uri) onComplete(uri);
                  onClose();
                }
              } catch {
                // handled upstream
              }
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
