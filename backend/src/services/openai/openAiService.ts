/**
 * OpenAI REST helpers (Whisper, Chat, used by transcription + chapter split).
 */

const OPENAI_BASE = "https://api.openai.com/v1";

function apiKey(): string {
  return process.env.OPENAI_API_KEY ?? "";
}

async function openAiJson<T>(path: string, body: unknown): Promise<T> {
  const key = apiKey();
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  const res = await fetch(`${OPENAI_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI ${path} failed: ${res.status} ${err.slice(0, 400)}`);
  }
  return (await res.json()) as T;
}

/**
 * Transcribes audio with Whisper.
 */
export async function transcribeWithWhisper(
  file: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const key = apiKey();
  if (!key) throw new Error("OPENAI_API_KEY is not set");

  const blob = new Blob([new Uint8Array(file)], { type: mimeType || "application/octet-stream" });
  const form = new FormData();
  form.append("file", blob, filename || "audio.m4a");
  form.append("model", process.env.OPENAI_TRANSCRIBE_MODEL ?? "whisper-1");

  const res = await fetch(`${OPENAI_BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Whisper failed: ${res.status} ${err.slice(0, 400)}`);
  }
  const data = (await res.json()) as { text?: string };
  const text = typeof data.text === "string" ? data.text.trim() : "";
  if (!text) throw new Error("Whisper returned empty text");
  return text;
}

export interface ChapterPart {
  title: string;
  content: string;
}

/**
 * Uses GPT to split manuscript into titled chapters (JSON). Falls back to caller on throw.
 */
export async function splitChaptersWithGpt(fullText: string): Promise<ChapterPart[]> {
  const model = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
  const trimmed = fullText.trim().slice(0, 120_000);
  if (!trimmed) return [{ title: "Chapter 1", content: "Empty manuscript." }];

  const data = await openAiJson<{
    choices?: Array<{ message?: { content?: string } }>;
  }>("/chat/completions", {
    model,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You split book manuscripts into storybook-style audiobook chapters. Return strict JSON: {\"chapters\":[{\"title\":\"string\",\"content\":\"string\"}]}. " +
          "Use 1 chapter if under ~400 words; 3–12 chapters for longer works. Titles must be evocative (not just 'Chapter 1'). Preserve original wording in content. Never invent plot.",
      },
      {
        role: "user",
        content: trimmed,
      },
    ],
  });

  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("No GPT content");
  let json = raw.trim();
  if (json.startsWith("```")) {
    json = json.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  }
  const parsed = JSON.parse(json) as { chapters?: ChapterPart[] };
  const chapters = Array.isArray(parsed.chapters) ? parsed.chapters : [];
  const cleaned = chapters
    .map((c) => ({
      title: String(c.title ?? "Chapter").trim().slice(0, 120),
      content: String(c.content ?? "").trim(),
    }))
    .filter((c) => c.content.length > 0);
  if (!cleaned.length) throw new Error("GPT returned no chapters");
  return cleaned.slice(0, 24);
}
