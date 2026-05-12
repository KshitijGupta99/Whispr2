import type { ITTSProvider, TTSOptions, Voice } from "./ITTSProvider";

const SAMPLE = "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

/**
 * ElevenLabs adapter (stubbed — returns a shared sample buffer in dev).
 */
export class ElevenLabsProvider implements ITTSProvider {
  constructor(private readonly apiKey: string) {}

  async synthesize(text: string, _voiceId: string, _options?: TTSOptions): Promise<Buffer> {
    if (!this.apiKey) {
      return Buffer.from(text.slice(0, 80));
    }
    return Buffer.from("elevenlabs-audio-stub");
  }

  async listVoices(): Promise<Voice[]> {
    return [];
  }

  async previewVoice(_voiceId: string, _sampleText: string): Promise<Buffer> {
    const res = await fetch(SAMPLE);
    return Buffer.from(await res.arrayBuffer());
  }
}
