export interface Voice {
  id: string;
  name: string;
  description: string;
  recommended?: boolean;
}

export interface TTSOptions {
  speed?: number;
  format?: "mp3" | "wav";
}

/**
 * Strategy interface for interchangeable TTS vendors.
 */
export interface ITTSProvider {
  synthesize(text: string, voiceId: string, options?: TTSOptions): Promise<Buffer>;
  listVoices(): Promise<Voice[]>;
  previewVoice(voiceId: string, sampleText: string): Promise<Buffer>;
}
