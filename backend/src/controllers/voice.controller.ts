import type { Request, Response } from "express";

import { TTSProviderFactory } from "../services/tts/TTSProviderFactory";
import { VOICE_CATALOG } from "../services/voiceCatalog";

/**
 * Returns the static narrator catalog merged with any provider voices.
 */
export async function listVoices(_req: Request, res: Response) {
  const tts = TTSProviderFactory.create();
  const remote = await tts.listVoices();
  res.json(remote.length ? remote : VOICE_CATALOG);
}

/**
 * Streams a short preview clip for the requested voice id.
 */
export async function previewVoice(req: Request, res: Response) {
  const tts = TTSProviderFactory.create();
  const buf = await tts.previewVoice(req.params.id, "Whispr preview line.");
  res.setHeader("Content-Type", "audio/mpeg");
  res.send(buf);
}
