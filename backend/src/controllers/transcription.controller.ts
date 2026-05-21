import type { Request, Response } from "express";

import { documentExtractService } from "../services/DocumentExtractService";
import { transcribeWithWhisper } from "../services/openai/openAiService";

/**
 * Accepts raw audio (multipart `file`) and returns Whisper transcription.
 */
export async function transcribeAudio(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "file field required" });
    return;
  }
  if (!process.env.OPENAI_API_KEY) {
    res.json({
      text: `[Demo] Received ${file.size} bytes. Add OPENAI_API_KEY to backend/.env for Whisper transcription.`,
    });
    return;
  }
  try {
    const text = await transcribeWithWhisper(
      file.buffer,
      file.originalname || "recording.m4a",
      file.mimetype || "application/octet-stream",
    );
    res.json({ text });
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Transcription failed" });
  }
}

/**
 * Extracts text from PDF or DOCX uploads.
 */
export async function extractDocument(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "file field required" });
    return;
  }
  try {
    const text = await documentExtractService.extract(
      file.buffer,
      file.mimetype || "",
      file.originalname || "document",
    );
    res.json({ text });
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Extraction failed" });
  }
}
