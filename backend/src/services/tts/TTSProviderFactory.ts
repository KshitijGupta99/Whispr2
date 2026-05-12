import { defaultTtsProvider, providerKeys } from "../../config/providers";
import { ElevenLabsProvider } from "./ElevenLabsProvider";
import type { ITTSProvider } from "./ITTSProvider";
import { OpenAITTSProvider } from "./OpenAITTSProvider";

/**
 * Selects a TTS implementation based on `DEFAULT_TTS_PROVIDER`.
 */
export class TTSProviderFactory {
  static create(): ITTSProvider {
    if (defaultTtsProvider === "openai") {
      return new OpenAITTSProvider(providerKeys.openai);
    }
    return new ElevenLabsProvider(providerKeys.elevenlabs);
  }
}
