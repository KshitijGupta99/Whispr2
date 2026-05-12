import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Loads and controls a single remote audio asset.
 */
export function useAudioPlayer(uri: string | null) {
  const sound = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!uri) return;
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
      const { sound: s } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        (status) => {
          if (!status.isLoaded) return;
          setPositionMillis(status.positionMillis ?? 0);
          setDurationMillis(status.durationMillis ?? 0);
          setIsPlaying(status.isPlaying);
        },
      );
      if (cancelled) {
        await s.unloadAsync();
        return;
      }
      sound.current = s;
    })();
    return () => {
      cancelled = true;
      sound.current?.unloadAsync();
      sound.current = null;
    };
  }, [uri]);

  const toggle = useCallback(async () => {
    const s = sound.current;
    if (!s) return;
    const st = await s.getStatusAsync();
    if (!st.isLoaded) return;
    if (st.isPlaying) await s.pauseAsync();
    else await s.playAsync();
  }, []);

  const seek = useCallback(async (ratio: number) => {
    const s = sound.current;
    if (!s) return;
    const st = await s.getStatusAsync();
    if (!st.isLoaded || !st.durationMillis) return;
    await s.setPositionAsync(Math.max(0, Math.min(1, ratio)) * st.durationMillis);
  }, []);

  return {
    isPlaying,
    positionMillis,
    durationMillis,
    toggle,
    seek,
  };
}
