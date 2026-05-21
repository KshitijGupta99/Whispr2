import type { Request, Response } from "express";
import { createReadStream, existsSync } from "fs";

import { prisma } from "../lib/prisma";
import { storageService } from "../services/StorageService";

/**
 * Streams a chapter MP3 after JWT auth (header or ?token= for expo-av).
 */
export async function streamChapterAudio(req: Request, res: Response) {
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { audiobookId, chapterId } = req.params;
  if (!audiobookId || !chapterId) {
    res.status(400).json({ message: "Invalid path" });
    return;
  }

  const book = await prisma.audiobook.findFirst({
    where: { id: audiobookId, userId },
    include: { chapters: true },
  });
  if (!book) {
    res.status(404).json({ message: "Not found" });
    return;
  }

  const chapter = book.chapters.find((c) => c.id === chapterId);
  if (!chapter) {
    res.status(404).json({ message: "Chapter not found" });
    return;
  }

  if (chapter.audioUrl.startsWith("http")) {
    res.redirect(chapter.audioUrl);
    return;
  }

  const absolute = storageService.resolveAbsolute(chapter.audioUrl);
  if (!absolute || !existsSync(absolute)) {
    res.status(404).json({ message: "Audio file missing" });
    return;
  }

  res.setHeader("Content-Type", "audio/mpeg");
  createReadStream(absolute).pipe(res);
}
