import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
// ensure env from backend/.env is loaded when running script directly
dotenv.config({ path: path.join(process.cwd(), "backend/.env") });
import { storageService } from "../services/StorageService";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  // Ensure local SQLite is used for script runs when DATABASE_URL is not available
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("postgresql")) {
    process.env.DATABASE_URL = "file:./prisma/dev.db";
  }

  // Import services after setting DATABASE_URL so Prisma picks up correct datasource
  const { createBook, statusBook, getBook } = await import("../services/audiobook.service");

  const userId = "script-test-user";
  const longParagraph = `Once upon a time, in a land far away, there was a storyteller who loved to tell long, winding tales. `;
  const manuscript = longParagraph.repeat(200); // long text
  console.log("Creating book job...");
  const id = await createBook(userId, { text: manuscript, voiceId: "emma", title: "Scripted Test" });
  console.log("Job created:", id);

  const start = Date.now();
  const timeout = 1000 * 60 * 10; // 10 minutes
  while (Date.now() - start < timeout) {
    const st = await statusBook(id, userId);
    if (!st) {
      console.error("No status returned");
      break;
    }
    console.log(`Status: ${st.status} progress=${st.progress} step="${st.currentStep}" chapters=${st.chaptersReady}/${st.totalChapters}`);
    if (st.status === "READY" || st.status === "FAILED") break;
    await sleep(3000);
  }

  const details = await getBook(id, userId);
  if (!details) {
    console.error("Failed to fetch book details");
    process.exit(2);
  }
  console.log(`Final status: ${details.status}, chapters: ${details.chapters.length}`);

  for (const ch of details.chapters) {
    console.log(`Chapter ${ch.index}: ${ch.title} -> ${ch.audioUrl} (${ch.duration}s)`);
    const abs = storageService.resolveAbsolute(ch.audioUrl);
    if (abs) {
      try {
        const st = await fs.stat(abs);
        console.log(`  file: ${abs} size=${st.size}`);
      } catch (e) {
        console.warn(`  file not found: ${abs}`);
      }
    }
  }
}

void run();
