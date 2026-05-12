import type { Request, Response } from "express";

import * as audiobook from "../services/audiobook.service";

/**
 * Accepts manuscript text and enqueues generation.
 */
export function createAudiobook(req: Request, res: Response) {
  const userId = (req as Request & { userId?: string }).userId ?? "anon";
  const { text, voiceId, title } = req.body as { text?: string; voiceId?: string; title?: string };
  if (!text || !voiceId) {
    res.status(400).json({ message: "text and voiceId are required" });
    return;
  }
  const id = audiobook.createBook(userId, { text, voiceId, title });
  res.json({ id, status: "PROCESSING" });
}

/**
 * Polls generation progress for a job.
 */
export function getStatus(req: Request, res: Response) {
  const row = audiobook.statusBook(req.params.id);
  if (!row) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  res.json(row);
}

/**
 * Returns audiobook detail including chapters.
 */
export function getAudiobook(req: Request, res: Response) {
  const row = audiobook.getBook(req.params.id);
  if (!row) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  res.json(row);
}

/**
 * Lists audiobooks for the authenticated user.
 */
export function listAudiobooks(req: Request, res: Response) {
  const userId = (req as Request & { userId?: string }).userId ?? "anon";
  res.json(audiobook.listBooks(userId));
}

/**
 * Deletes an audiobook owned by the user.
 */
export function deleteAudiobook(req: Request, res: Response) {
  const userId = (req as Request & { userId?: string }).userId ?? "anon";
  const ok = audiobook.deleteBook(userId, req.params.id);
  if (!ok) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  res.status(204).send();
}
