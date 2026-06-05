import { defaultTtsProvider, providerKeys } from "../../config/providers";
import { ElevenLabsProvider } from "./ElevenLabsProvider";
import { FallbackTTSProvider } from "./FallbackTTSProvider";
import type { ITTSProvider } from "./ITTSProvider";
import { OpenAITTSProvider } from "./OpenAITTSProvider";

/**
 * Selects TTS: explicit `openai`, else ElevenLabs when key present, else OpenAI when key present, else stub ElevenLabs.
 */
export class TTSProviderFactory {
  static create(): ITTSProvider {
    const elevenLabs = providerKeys.elevenlabs ? new ElevenLabsProvider(providerKeys.elevenlabs) : null;
    const openAi = providerKeys.openai ? new OpenAITTSProvider(providerKeys.openai) : null;

    if (defaultTtsProvider === "openai") {
      if (openAi && elevenLabs) return new FallbackTTSProvider(openAi, elevenLabs, "OpenAI", "ElevenLabs");
      if (openAi) return openAi;
      if (elevenLabs) return elevenLabs;
      return new ElevenLabsProvider("");
    }

    if (defaultTtsProvider === "elevenlabs") {
      if (elevenLabs && openAi) return new FallbackTTSProvider(elevenLabs, openAi, "ElevenLabs", "OpenAI");
      if (elevenLabs) return elevenLabs;
      if (openAi) return openAi;
      return new ElevenLabsProvider("");
    }

    if (elevenLabs && openAi) return new FallbackTTSProvider(elevenLabs, openAi, "ElevenLabs", "OpenAI");
    if (openAi) return openAi;
    return elevenLabs ?? new ElevenLabsProvider("");
  }
}
