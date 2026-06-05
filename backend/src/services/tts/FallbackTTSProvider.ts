import type { ITTSProvider, TTSOptions, Voice } from "./ITTSProvider";

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/**
 * Tries the primary TTS provider first and falls back to the secondary provider if it fails.
 */
export class FallbackTTSProvider implements ITTSProvider {
  constructor(
    private readonly primary: ITTSProvider,
    private readonly secondary: ITTSProvider,
    private readonly primaryName: string,
    private readonly secondaryName: string,
  ) {}

  async synthesize(text: string, voiceId: string, options?: TTSOptions): Promise<Buffer> {
    try {
      return await this.primary.synthesize(text, voiceId, options);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[TTS fallback] ${this.primaryName} synthesize failed, falling back to ${this.secondaryName}: ${errorMessage(err)}`);
      return this.secondary.synthesize(text, voiceId, options);
    }
  }

  async listVoices(): Promise<Voice[]> {
    try {
      const voices = await this.primary.listVoices();
      if (voices.length) return voices;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[TTS fallback] ${this.primaryName} listVoices failed, falling back to ${this.secondaryName}: ${errorMessage(err)}`);
    }
    return this.secondary.listVoices();
  }

  async previewVoice(voiceId: string, sampleText: string): Promise<Buffer> {
    try {
      return await this.primary.previewVoice(voiceId, sampleText);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[TTS fallback] ${this.primaryName} previewVoice failed, falling back to ${this.secondaryName}: ${errorMessage(err)}`);
      return this.secondary.previewVoice(voiceId, sampleText);
    }
  }
}
