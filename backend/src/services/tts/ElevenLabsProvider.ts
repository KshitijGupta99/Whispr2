import axios from "axios";

import type { ITTSProvider, TTSOptions, Voice } from "./ITTSProvider";

const SAMPLE = "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";
const BASE = "https://api.elevenlabs.io/v1";

/** Map app voice ids to ElevenLabs voice ids (override via env JSON). */
const DEFAULT_VOICE_MAP: Record<string, string> = {
  emma: "21m00Tcm4TlvDq8ikWAM",
  liam: "pNInz6obpgDQGcFmaJgB",
  sophia: "EXAVITQu4vr4xnSDxMaL",
  aria: "MF3mGyEYCl7XYWbV9V6O",
  james: "VR6AewLTigWG4xSOukaG",
};

function voiceMap(): Record<string, string> {
  const raw = process.env.ELEVENLABS_VOICE_MAP;
  if (!raw) return DEFAULT_VOICE_MAP;
  try {
    return { ...DEFAULT_VOICE_MAP, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_VOICE_MAP;
  }
}

/**
 * ElevenLabs text-to-speech adapter.
 */
export class ElevenLabsProvider implements ITTSProvider {
  constructor(private readonly apiKey: string) {}

  private elevenVoiceId(voiceId: string): string {
    return voiceMap()[voiceId.toLowerCase()] ?? voiceId;
  }

  async synthesize(text: string, voiceId: string, _options?: TTSOptions): Promise<Buffer> {
    if (!this.apiKey) {
      return Buffer.from(text.slice(0, 80));
    }
    const voice = this.elevenVoiceId(voiceId);
    const res = await axios.post(
      `${BASE}/text-to-speech/${voice}`,
      {
        text: text.slice(0, 5000),
        model_id: process.env.ELEVENLABS_MODEL ?? "eleven_multilingual_v2",
      },
      {
        headers: {
          "xi-api-key": this.apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "arraybuffer",
        timeout: 120_000,
      },
    );
    return Buffer.from(res.data);
  }

  async listVoices(): Promise<Voice[]> {
    if (!this.apiKey) return [];
    const res = await axios.get<{ voices?: Array<{ voice_id: string; name: string }> }>(
      `${BASE}/voices`,
      { headers: { "xi-api-key": this.apiKey }, timeout: 15_000 },
    );
    return (res.data.voices ?? []).slice(0, 20).map((v) => ({
      id: v.voice_id,
      name: v.name,
      description: "ElevenLabs voice",
    }));
  }

  async previewVoice(voiceId: string, sampleText: string): Promise<Buffer> {
    if (!this.apiKey) {
      const res = await fetch(SAMPLE);
      return Buffer.from(await res.arrayBuffer());
    }
    return this.synthesize(sampleText.trim() || "Whispr preview line.", voiceId);
  }
}
