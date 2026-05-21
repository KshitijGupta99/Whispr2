import { defaultTtsProvider, providerKeys } from "../../config/providers";
import { ElevenLabsProvider } from "./ElevenLabsProvider";
import type { ITTSProvider } from "./ITTSProvider";
import { OpenAITTSProvider } from "./OpenAITTSProvider";

/**
 * Selects TTS: explicit `openai`, else ElevenLabs when key present, else OpenAI when key present, else stub ElevenLabs.
 */
export class TTSProviderFactory {
  static create(): ITTSProvider {
    if (defaultTtsProvider === "openai" && providerKeys.openai) {
      return new OpenAITTSProvider(providerKeys.openai);
    }
    if (defaultTtsProvider === "elevenlabs" && providerKeys.elevenlabs) {
      return new ElevenLabsProvider(providerKeys.elevenlabs);
    }
    if (providerKeys.openai) {
      return new OpenAITTSProvider(providerKeys.openai);
    }
    return new ElevenLabsProvider(providerKeys.elevenlabs);
  }
}
