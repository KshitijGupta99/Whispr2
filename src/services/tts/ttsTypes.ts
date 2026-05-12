export interface TTSOptions {
  speed?: number;
  format?: "mp3" | "wav";
}

export interface TTSRequest {
  text: string;
  voiceId: string;
  options?: TTSOptions;
}
