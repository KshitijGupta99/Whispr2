import { mkdir, writeFile, rm } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

/**
 * Persists chapter MP3 files on disk under uploads/audiobooks/{bookId}/.
 */
export class StorageService {
  private bookDir(bookId: string): string {
    return path.join(UPLOAD_ROOT, "audiobooks", bookId);
  }

  async ensureBookDir(bookId: string): Promise<void> {
    await mkdir(this.bookDir(bookId), { recursive: true });
  }

  async saveChapterAudio(bookId: string, chapterId: string, body: Buffer): Promise<string> {
    await this.ensureBookDir(bookId);
    const filename = `${chapterId}.mp3`;
    const absolute = path.join(this.bookDir(bookId), filename);
    await writeFile(absolute, body);
    return `/media/audiobooks/${bookId}/${filename}`;
  }

  async deleteBookAssets(bookId: string): Promise<void> {
    await rm(this.bookDir(bookId), { recursive: true, force: true });
  }

  resolveAbsolute(mediaPath: string): string | null {
    if (!mediaPath.startsWith("/media/audiobooks/")) return null;
    const rel = mediaPath.replace(/^\/media\//, "");
    return path.join(UPLOAD_ROOT, rel);
  }
}

export const storageService = new StorageService();
