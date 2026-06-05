import fs from "fs";
import path from "path";
// ensure env from backend/.env is loaded when running script directly
import dotenv from "dotenv";
dotenv.config({ path: path.join(process.cwd(), "backend/.env") });
import { TTSProviderFactory } from "../services/tts/TTSProviderFactory";

async function run() {
  const tts = TTSProviderFactory.create();
  console.log(`Using provider: ${tts.constructor.name}`);
  const text = `This is a short test of the text to speech system. If you can hear this, synthesis works.`;
  try {
    const buf = await tts.synthesize(text, "emma", { format: "mp3" });
    const out = path.join(process.cwd(), "test-tts-output.mp3");
    fs.writeFileSync(out, buf);
    console.log("Wrote test audio to", out, "size", buf.length);
  } catch (e) {
    console.error("TTS test failed:", e instanceof Error ? e.stack ?? e.message : e);
    process.exitCode = 2;
  }
}

void run();
