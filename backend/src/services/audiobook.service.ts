import { randomBytes } from "crypto";

import { ChapterSplitterService } from "./ChapterSplitterService";

const DEMO_AUDIO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

export type AudiobookStatus = "PROCESSING" | "READY" | "FAILED";

export interface ChapterRecord {
  id: string;
  index: number;
  title: string;
  audioUrl: string;
  duration: number;
  waveformData: number[];
}

interface InternalBook {
  id: string;
  userId: string;
  title: string;
  voiceId: string;
  text: string;
  status: AudiobookStatus;
  duration: number | null;
  chapters: ChapterRecord[];
  createdAt: string;
  progress: number;
  currentStep: string;
  chaptersReady: number;
  totalChapters: number;
}

const store = new Map<string, InternalBook>();
const splitter = new ChapterSplitterService();

function wf(): number[] {
  return Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.12);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Starts a new audiobook generation job for the given user.
 */
export function createBook(
  userId: string,
  payload: { text: string; voiceId: string; title?: string },
): string {
  const id = `ab_${randomBytes(6).toString("hex")}`;
  const book: InternalBook = {
    id,
    userId,
    title: payload.title ?? "Your Story",
    voiceId: payload.voiceId,
    text: payload.text,
    status: "PROCESSING",
    duration: null,
    chapters: [],
    createdAt: new Date().toISOString(),
    progress: 5,
    currentStep: "Selecting perfect voice settings...",
    chaptersReady: 0,
    totalChapters: 0,
  };
  store.set(id, book);
  void runPipeline(id);
  return id;
}

async function runPipeline(id: string) {
  const steps = [
    "Selecting perfect voice settings...",
    "Analyzing chapter structure...",
    "Synthesizing Chapter 1...",
    "Synthesizing Chapter 2...",
    "Finalizing your audiobook...",
  ];
  try {
    for (let i = 0; i < steps.length; i++) {
      await delay(700);
      const cur = store.get(id);
      if (!cur || cur.status !== "PROCESSING") return;
      cur.currentStep = steps[i] ?? steps[steps.length - 1];
      cur.progress = Math.round(((i + 1) / steps.length) * 90);
    }
    const cur = store.get(id);
    if (!cur) return;
    const parts = splitter.split(cur.text);
    const chapters: ChapterRecord[] = parts.map((p, idx) => ({
      id: `ch_${id}_${idx}`,
      index: idx + 1,
      title: p.title,
      audioUrl: DEMO_AUDIO,
      duration: 10 + idx * 2,
      waveformData: wf(),
    }));
    cur.chapters = chapters;
    cur.chaptersReady = chapters.length;
    cur.totalChapters = chapters.length;
    cur.duration = chapters.reduce((a, c) => a + c.duration, 0);
    cur.progress = 100;
    cur.status = "READY";
    cur.currentStep = "Complete";
  } catch {
    const failed = store.get(id);
    if (failed) failed.status = "FAILED";
  }
}

/**
 * Returns polling payload while a job is running.
 */
export function statusBook(id: string) {
  const b = store.get(id);
  if (!b) return null;
  return {
    status: b.status,
    progress: b.progress,
    currentStep: b.currentStep,
    chaptersReady: b.chaptersReady,
    totalChapters: b.totalChapters || Math.max(1, b.chapters.length),
    voiceId: b.voiceId,
  };
}

/**
 * Public audiobook detail for clients.
 */
export function getBook(id: string) {
  const b = store.get(id);
  if (!b) return null;
  return {
    id: b.id,
    title: b.title,
    voiceId: b.voiceId,
    status: b.status,
    duration: b.duration,
    chapters: b.chapters,
    createdAt: b.createdAt,
  };
}

/**
 * Lists audiobooks for a user (in-memory dev store).
 */
export function listBooks(userId: string) {
  return [...store.values()]
    .filter((b) => b.userId === userId)
    .map((b) => getBook(b.id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
}

/**
 * Deletes an audiobook if owned by the user.
 */
export function deleteBook(userId: string, id: string) {
  const b = store.get(id);
  if (!b || b.userId !== userId) return false;
  store.delete(id);
  return true;
}
