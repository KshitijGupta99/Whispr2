/**
 * Resolved TTS provider key from the environment.
 */
export const defaultTtsProvider = (process.env.DEFAULT_TTS_PROVIDER ?? "elevenlabs").toLowerCase();

export const providerKeys = {
  elevenlabs: process.env.ELEVENLABS_API_KEY ?? "",
  openai: process.env.OPENAI_API_KEY ?? "",
};
