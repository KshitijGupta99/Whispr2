import { Audio, type AVPlaybackStatus } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";

import type { PlaybackSpeed } from "@/store/usePlayerStore";

interface UseAudioPlayerOptions {
  chapterId?: string;
  speed?: PlaybackSpeed;
  initialPositionSeconds?: number;
  onPositionChange?: (chapterId: string, seconds: number) => void;
}

/**
 * Loads and controls a single remote audio asset with speed and resume support.
 */
export function useAudioPlayer(uri: string | null, options: UseAudioPlayerOptions = {}) {
  const { chapterId, speed = 1, initialPositionSeconds = 0, onPositionChange } = options;
  const sound = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const lastSaved = useRef(0);

  const onStatus = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      setPositionMillis(status.positionMillis ?? 0);
      setDurationMillis(status.durationMillis ?? 0);
      setIsPlaying(status.isPlaying);
      if (chapterId && onPositionChange && status.positionMillis != null) {
        const sec = Math.floor(status.positionMillis / 1000);
        if (sec !== lastSaved.current && sec % 3 === 0) {
          lastSaved.current = sec;
          onPositionChange(chapterId, sec);
        }
      }
    },
    [chapterId, onPositionChange],
  );

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
        { shouldPlay: false, rate: speed, shouldCorrectPitch: true },
        onStatus,
      );
      if (cancelled) {
        await s.unloadAsync();
        return;
      }
      if (initialPositionSeconds > 0) {
        await s.setPositionAsync(initialPositionSeconds * 1000);
      }
      sound.current = s;
    })();
    return () => {
      cancelled = true;
      if (chapterId && onPositionChange && sound.current) {
        void sound.current.getStatusAsync().then((st) => {
          if (st.isLoaded && st.positionMillis != null) {
            onPositionChange(chapterId, Math.floor(st.positionMillis / 1000));
          }
        });
      }
      void sound.current?.unloadAsync();
      sound.current = null;
    };
  }, [uri]);

  useEffect(() => {
    const s = sound.current;
    if (!s) return;
    void s.setRateAsync(speed, true);
  }, [speed]);

  const toggle = useCallback(async () => {
    const s = sound.current;
    if (!s) return;
    const st = await s.getStatusAsync();
    if (!st.isLoaded) return;
    if (st.isPlaying) await s.pauseAsync();
    else await s.playAsync();
  }, []);

  const pause = useCallback(async () => {
    const s = sound.current;
    if (!s) return;
    const st = await s.getStatusAsync();
    if (st.isLoaded && st.isPlaying) await s.pauseAsync();
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
    pause,
    seek,
  };
}
