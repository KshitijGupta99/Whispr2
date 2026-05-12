import type { ChapterDto } from "@/services/audiobook/audiobookTypes";

/**
 * Finds a chapter in an audiobook payload by id.
 */
export function findChapterById(chapters: ChapterDto[], chapterId: string): ChapterDto | null {
  return chapters.find((c) => c.id === chapterId) ?? null;
}
