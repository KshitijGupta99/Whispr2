import type { Request, Response } from "express";

/**
 * Accepts raw audio and returns placeholder transcription text.
 */
export function transcribeAudio(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "file field required" });
    return;
  }
  res.json({
    text: `[Demo transcription] Received ${file.size} bytes. Replace with Whisper output in production.`,
  });
}
