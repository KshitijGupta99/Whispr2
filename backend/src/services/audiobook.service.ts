import { Status } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { chapterMediaPath } from "../utils/mediaUrl";
import { ChapterSplitterService } from "./ChapterSplitterService";
import { storageService } from "./StorageService";
import { TTSProviderFactory } from "./tts/TTSProviderFactory";

const DEMO_AUDIO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

const splitter = new ChapterSplitterService();

function waveformFromSeed(seed: string): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Array.from({ length: 80 }, (_, i) => {
    const x = Math.sin((h + i) * 0.17) * 0.5 + 0.5;
    return 0.15 + x * 0.75;
  });
}

function estimateDurationSeconds(audioBytes: number): number {
  return Math.max(3, Math.min(7200, Math.floor(audioBytes / 10_000)));
}

function parseWaveform(raw: string): number[] {
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map(Number).filter((n) => !Number.isNaN(n)) : waveformFromSeed(raw);
  } catch {
    return waveformFromSeed(raw);
  }
}

function serializeChapter(c: {
  id: string;
  index: number;
  title: string;
  audioUrl: string;
  duration: number;
  waveformData: string;
}) {
  return {
    id: c.id,
    index: c.index,
    title: c.title,
    audioUrl: c.audioUrl,
    duration: c.duration,
    waveformData: parseWaveform(c.waveformData),
  };
}

async function updateProgress(
  id: string,
  patch: Partial<{
    progress: number;
    currentStep: string;
    chaptersReady: number;
    totalChapters: number;
    status: Status;
    errorMessage: string | null;
    duration: number | null;
  }>,
) {
  await prisma.audiobook.update({
    where: { id },
    data: patch,
  });
}

async function runPipeline(id: string) {
  const tts = TTSProviderFactory.create();
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] Starting pipeline for audiobook ${id} using ${tts.constructor.name}`);
  try {
    const book = await prisma.audiobook.findUnique({ where: { id } });
    if (!book || book.status !== Status.PROCESSING) return;

    await updateProgress(id, {
      currentStep: "Analyzing chapter structure...",
      progress: 15,
    });

    const parts = await splitter.split(book.manuscript);
    await updateProgress(id, { totalChapters: parts.length, chaptersReady: 0 });

    let totalDuration = 0;

    const MAX_RETRIES = 2;
    const RETRY_DELAY_MS = 800;
    const MIN_SECONDS = 30;

    for (let idx = 0; idx < parts.length; idx++) {
      let p = parts[idx];
      if (!p) continue;

      const cur = await prisma.audiobook.findUnique({ where: { id } });
      if (!cur || cur.status !== Status.PROCESSING) return;

      await updateProgress(id, {
        currentStep: `Synthesizing Chapter ${idx + 1} of ${parts.length}...`,
        progress: Math.min(88, 20 + Math.round(((idx + 0.5) / Math.max(parts.length, 1)) * 68)),
      });

      // Try synthesizing before creating DB chapter row so we can merge small chapters
      let synthesizedBuf: Buffer | null = null;
      let attempts = 0;
      let usedParts = 1; // how many original parts this chapter consumed
      let chapterTitle = p.title;
      let contentToSynthesize = p.content;

      while (attempts <= MAX_RETRIES) {
        try {
          synthesizedBuf = await tts.synthesize(contentToSynthesize, cur.voiceId, { format: "mp3" });
          break;
        } catch (e) {
          attempts++;
          // eslint-disable-next-line no-console
          console.warn(`[${new Date().toISOString()}] TTS attempt ${attempts} failed for audiobook ${id} chapter ${idx + 1}:`, e instanceof Error ? e.message : e);
          if (attempts > MAX_RETRIES) break;
          // small delay before retry
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }

      // If we got a buffer but it's shorter than minimum seconds, try merging with next part
      if (synthesizedBuf && estimateDurationSeconds(synthesizedBuf.length) < MIN_SECONDS && idx + 1 < parts.length) {
        const next = parts[idx + 1];
        // merge and retry once
        contentToSynthesize = `${contentToSynthesize}\n\n${next.content}`;
        chapterTitle = chapterTitle;
        usedParts = 2;
        try {
          synthesizedBuf = await tts.synthesize(contentToSynthesize, cur.voiceId, { format: "mp3" });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(`[${new Date().toISOString()}] TTS merge retry failed for audiobook ${id} chapter ${idx + 1}:`, e instanceof Error ? e.message : e);
        }
      }

      // Create chapter DB row now (use demo audio by default)
      let audioUrl = DEMO_AUDIO;
      let duration = 10 + idx * 2;

      const chapter = await prisma.chapter.create({
        data: {
          audiobookId: id,
          index: idx + 1,
          title: chapterTitle,
          audioUrl: DEMO_AUDIO,
          duration,
          waveformData: JSON.stringify(waveformFromSeed(`${id}-${idx}`)),
        },
      });

      if (synthesizedBuf && synthesizedBuf.length > 0) {
        try {
          duration = estimateDurationSeconds(synthesizedBuf.length);
          await storageService.saveChapterAudio(id, chapter.id, synthesizedBuf);
          audioUrl = chapterMediaPath(id, chapter.id);
          await prisma.chapter.update({ where: { id: chapter.id }, data: { audioUrl, duration } });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(`[${new Date().toISOString()}] Failed saving chapter audio for ${id} chapter ${idx + 1}:`, e instanceof Error ? e.stack ?? e.message : e);
        }
      } else {
        // No synthesized audio produced; leave demo and log
        // eslint-disable-next-line no-console
        console.error(`[${new Date().toISOString()}] No TTS audio for audiobook ${id} chapter ${idx + 1}; using demo audio.`);
      }

      // If we consumed the next part as well, skip it in the main loop
      if (usedParts > 1) {
        idx += usedParts - 1;
      }

      totalDuration += duration;
      await updateProgress(id, { chaptersReady: idx + 1 });
    }

    const final = await prisma.audiobook.findUnique({
      where: { id },
      include: { chapters: true },
    });
    if (!final || final.status !== Status.PROCESSING) return;

    const duration =
      final.chapters.reduce((a, c) => a + c.duration, 0) || totalDuration;

    await updateProgress(id, {
      status: Status.READY,
      progress: 100,
      currentStep: "Complete",
      duration,
      errorMessage: null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    // eslint-disable-next-line no-console
    console.error(`[${new Date().toISOString()}] Pipeline error for audiobook ${id}:`, e instanceof Error ? e.stack ?? e : e);
    await prisma.audiobook
      .update({
        where: { id },
        data: {
          status: Status.FAILED,
          errorMessage: msg,
          currentStep: "Failed",
        },
      })
      .catch(() => {});
  }
}

/**
 * Starts a new audiobook generation job for the given user.
 */
export async function createBook(
  userId: string,
  payload: { text: string; voiceId: string; title?: string },
): Promise<string> {
  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, email: `${userId}@users.whispr.app`, name: "Listener" },
    update: {},
  });

  const book = await prisma.audiobook.create({
    data: {
      userId,
      title: payload.title?.trim() || "Your Story",
      voiceId: payload.voiceId,
      manuscript: payload.text,
      status: Status.PROCESSING,
      currentStep: "Selecting perfect voice settings...",
      progress: 5,
    },
  });
  void runPipeline(book.id);
  return book.id;
}

/**
 * Returns polling payload while a job is running.
 */
export async function statusBook(id: string, userId?: string) {
  const b = await prisma.audiobook.findFirst({
    where: userId ? { id, userId } : { id },
  });
  if (!b) return null;
  return {
    status: b.status,
    progress: b.progress,
    currentStep: b.currentStep,
    chaptersReady: b.chaptersReady,
    totalChapters: b.totalChapters || 1,
    voiceId: b.voiceId,
    errorMessage: b.errorMessage ?? undefined,
  };
}

/**
 * Public audiobook detail for clients.
 */
export async function getBook(id: string, userId?: string) {
  const b = await prisma.audiobook.findFirst({
    where: userId ? { id, userId } : { id },
    include: { chapters: { orderBy: { index: "asc" } } },
  });
  if (!b) return null;
  return {
    id: b.id,
    title: b.title,
    voiceId: b.voiceId,
    status: b.status,
    duration: b.duration,
    chapters: b.chapters.map(serializeChapter),
    createdAt: b.createdAt.toISOString(),
    errorMessage: b.errorMessage ?? undefined,
  };
}

/**
 * Lists audiobooks for a user.
 */
export async function listBooks(userId: string) {
  const rows = await prisma.audiobook.findMany({
    where: { userId },
    include: { chapters: { orderBy: { index: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((b) => ({
    id: b.id,
    title: b.title,
    voiceId: b.voiceId,
    status: b.status,
    duration: b.duration,
    chapters: b.chapters.map(serializeChapter),
    createdAt: b.createdAt.toISOString(),
    errorMessage: b.errorMessage ?? undefined,
  }));
}

/**
 * Deletes an audiobook if owned by the user.
 */
export async function deleteBook(userId: string, id: string) {
  const b = await prisma.audiobook.findFirst({ where: { id, userId } });
  if (!b) return false;
  await storageService.deleteBookAssets(id);
  await prisma.audiobook.delete({ where: { id } });
  return true;
}
