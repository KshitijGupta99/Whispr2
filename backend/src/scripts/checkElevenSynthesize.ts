import dotenv from "dotenv";
import path from "path";
import axios from "axios";
import fs from "fs/promises";

dotenv.config({ path: path.join(process.cwd(), "backend/.env") });

async function run() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    console.error("No ELEVENLABS_API_KEY in backend/.env");
    process.exit(2);
  }
  const voice = "21m00Tcm4TlvDq8ikWAM"; // mapped 'emma'
  try {
    const res = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      { text: "Hello from ElevenLabs test.", model_id: process.env.ELEVENLABS_MODEL ?? "eleven_multilingual_v2" },
      { headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" }, responseType: "arraybuffer", timeout: 15000 },
    );
    const out = path.join(process.cwd(), "eleven-test.mp3");
    await fs.writeFile(out, Buffer.from(res.data));
    const st = await fs.stat(out);
    console.log("wrote", out, "size", st.size);
  } catch (e) {
    console.error("error:", e instanceof Error ? e.message : e);
    if (e?.response) {
      console.error("response status:", e.response?.status);
      console.error("response body:", typeof e.response?.data === "string" ? e.response.data : JSON.stringify(e.response?.data));
    }
    process.exit(2);
  }
}

void run();
