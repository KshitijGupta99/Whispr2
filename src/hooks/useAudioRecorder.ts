import { Audio } from "expo-av";
import { useCallback, useState } from "react";

/**
 * Starts and stops a short voice memo capture using Expo AV.
 */
export function useAudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [uri, setUri] = useState<string | null>(null);

  const start = useCallback(async () => {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) throw new Error("Microphone permission is required to record.");
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const { recording: rec } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    setRecording(rec);
    setUri(null);
  }, []);

  const stop = useCallback(async () => {
    if (!recording) return null;
    await recording.stopAndUnloadAsync();
    const u = recording.getURI();
    setRecording(null);
    setUri(u);
    return u;
  }, [recording]);

  return { recording, uri, start, stop };
}
