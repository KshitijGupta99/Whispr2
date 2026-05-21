import { voicePreviewUrl } from "@/services/api/client";
import { Audio } from "expo-av";
import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";

/**
 * Plays short remote preview clips for the voice catalog.
 */
export function useVoicePreview() {
  const sound = useRef<Audio.Sound | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const stop = useCallback(async () => {
    if (sound.current) {
      await sound.current.stopAsync();
      await sound.current.unloadAsync();
      sound.current = null;
    }
    setActiveId(null);
    setPlaying(false);
  }, []);

  const toggle = useCallback(
    async (voiceId: string) => {
      if (activeId === voiceId && playing) {
        await stop();
        return;
      }
      await stop();
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
      const uri = voicePreviewUrl(voiceId);
      try {
        const { sound: s } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
        sound.current = s;
        setActiveId(voiceId);
        setPlaying(true);
        s.setOnPlaybackStatusUpdate((st) => {
          if (st.isLoaded && !st.isPlaying) {
            setPlaying(false);
          }
        });
      } catch {
        setActiveId(null);
        setPlaying(false);
        Alert.alert(
          "Preview unavailable",
          "The app could not reach your API for audio. Use your computer's LAN IP in EXPO_PUBLIC_API_URL, run the backend with npm run dev, and allow the port in your firewall.",
        );
      }
    },
    [activeId, playing, stop],
  );

  return { activeId, playing, toggle, stop };
}
