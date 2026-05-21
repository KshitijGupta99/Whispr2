import type { Request, Response } from "express";

import * as audiobook from "../services/audiobook.service";

/**
 * Accepts manuscript text and enqueues generation.
 */
export async function createAudiobook(req: Request, res: Response) {
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const { text, voiceId, title } = req.body as { text?: string; voiceId?: string; title?: string };
  if (!text?.trim() || !voiceId) {
    res.status(400).json({ message: "text and voiceId are required" });
    return;
  }
  const id = await audiobook.createBook(userId, { text: text.trim(), voiceId, title });
  res.json({ id, status: "PROCESSING" });
}

/**
 * Polls generation progress for a job.
 */
export async function getStatus(req: Request, res: Response) {
  const userId = (req as Request & { userId?: string }).userId;
  const row = await audiobook.statusBook(req.params.id, userId);
  if (!row) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  res.json(row);
}

/**
 * Returns audiobook detail including chapters.
 */
export async function getAudiobook(req: Request, res: Response) {
  const userId = (req as Request & { userId?: string }).userId;
  const row = await audiobook.getBook(req.params.id, userId);
  if (!row) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  res.json(row);
}

/**
 * Lists audiobooks for the authenticated user.
 */
export async function listAudiobooks(req: Request, res: Response) {
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  res.json(await audiobook.listBooks(userId));
}

/**
 * Deletes an audiobook owned by the user.
 */
export async function deleteAudiobook(req: Request, res: Response) {
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const ok = await audiobook.deleteBook(userId, req.params.id);
  if (!ok) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  res.status(204).send();
}
