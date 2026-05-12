import { useMemo } from "react";

/**
 * Builds deterministic pseudo-waveform bars for UI placeholders.
 */
export function useWaveform(seed: string, bars = 48): number[] {
  return useMemo(() => {
    const out: number[] = [];
    let h = 0;
    for (let i = 0; i < seed.length; i += 1) h = (h + seed.charCodeAt(i) * (i + 1)) % 997;
    for (let i = 0; i < bars; i += 1) {
      h = (h * 31 + i) % 997;
      out.push(0.15 + (h % 85) / 100);
    }
    return out;
  }, [seed, bars]);
}
