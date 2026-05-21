/**
 * Builds a public media path clients resolve with API host + optional JWT query.
 */
export function chapterMediaPath(bookId: string, chapterId: string): string {
  return `/media/audiobooks/${bookId}/${chapterId}.mp3`;
}
