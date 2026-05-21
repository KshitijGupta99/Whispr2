import type { ITTSProvider, TTSOptions, Voice } from "./ITTSProvider";

const SPEECH_URL = "https://api.openai.com/v1/audio/speech";
const SAMPLE = "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

/** Map app voice ids to OpenAI TTS voice names. */
const VOICE_MAP: Record<string, string> = {
  emma: "nova",
  liam: "echo",
  sophia: "shimmer",
  aria: "fable",
  james: "onyx",
};

const MAX_INPUT = 4000;

function openAiVoice(voiceId: string): string {
  return VOICE_MAP[voiceId.toLowerCase()] ?? "alloy";
}

/**
 * OpenAI TTS (speech API). Chunks long text and concatenates MP3 buffers.
 */
export class OpenAITTSProvider implements ITTSProvider {
  constructor(private readonly apiKey: string) {}

  private async speechChunk(text: string, voice: string): Promise<Buffer> {
    const res = await fetch(SPEECH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL ?? "tts-1",
        voice,
        input: text,
        response_format: "mp3",
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI TTS: ${res.status} ${err.slice(0, 200)}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }

  async synthesize(text: string, voiceId: string, _options?: TTSOptions): Promise<Buffer> {
    if (!this.apiKey) {
      return Buffer.from(text.slice(0, 80));
    }
    const voice = openAiVoice(voiceId);
    const chunks: Buffer[] = [];
    for (let i = 0; i < text.length; i += MAX_INPUT) {
      const slice = text.slice(i, i + MAX_INPUT);
      if (!slice.trim()) continue;
      chunks.push(await this.speechChunk(slice, voice));
    }
    if (!chunks.length) return Buffer.alloc(0);
    return Buffer.concat(chunks);
  }

  async listVoices(): Promise<Voice[]> {
    return [];
  }

  async previewVoice(voiceId: string, sampleText: string): Promise<Buffer> {
    if (!this.apiKey) {
      const res = await fetch(SAMPLE);
      return Buffer.from(await res.arrayBuffer());
    }
    const line = sampleText.trim() || "Whispr preview line.";
    return this.speechChunk(line.slice(0, MAX_INPUT), openAiVoice(voiceId));
  }
}
