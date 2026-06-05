import dotenv from "dotenv";
import path from "path";
import axios from "axios";

dotenv.config({ path: path.join(process.cwd(), "backend/.env") });

async function run() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    console.error("No ELEVENLABS_API_KEY in backend/.env");
    process.exit(2);
  }
  try {
    const res = await axios.get("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": key }, timeout: 15000 });
    console.log("status:", res.status);
    console.log("voices:", Array.isArray(res.data?.voices) ? res.data.voices.length : JSON.stringify(res.data).slice(0, 400));
  } catch (e) {
    console.error("error:", e instanceof Error ? e.message : e);
    if (e?.response) console.error("response status:", e.response?.status);
    process.exit(2);
  }
}

void run();
