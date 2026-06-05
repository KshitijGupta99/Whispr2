import { splitChaptersWithGpt } from "./openai/openAiService";

export interface ChapterPart {
  title: string;
  content: string;
}

/**
 * Heuristic split when OpenAI is unavailable or fails.
 */
function splitHeuristic(text: string): ChapterPart[] {
  const parts = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 1) {
    return [{ title: "Chapter 1", content: text.trim() || "Untitled story" }];
  }
  return parts.slice(0, 12).map((content, i) => ({
    title: `Chapter ${i + 1}`,
    content,
  }));
}

/**
 * Splits manuscript into chapters (GPT when OPENAI_API_KEY is set, else heuristics).
 */
export class ChapterSplitterService {
  async split(text: string): Promise<ChapterPart[]> {
    let parts: ChapterPart[];
    if (process.env.OPENAI_API_KEY) {
      try {
        parts = await splitChaptersWithGpt(text);
      } catch {
        parts = splitHeuristic(text);
      }
    } else {
      parts = splitHeuristic(text);
    }

    // Ensure chapters are not too small. Aim for ~30s per chapter. We approximate
    // 30s by character count (approx 12-15 chars/sec). Use a conservative threshold.
    const MIN_CHARS = 450; // ~30s of spoken text
    const merged: ChapterPart[] = [];
    for (let i = 0; i < parts.length; i++) {
      let cur = parts[i];
      // Merge following parts until current is large enough or no more parts
      while (cur.content.length < MIN_CHARS && i + 1 < parts.length) {
        const next = parts[i + 1];
        cur = { title: cur.title, content: `${cur.content}\n\n${next.content}` };
        i++;
      }
      merged.push(cur);
      // Cap number of chapters to 20 to avoid runaway splits
      if (merged.length >= 20) break;
    }

    // If everything merged into one very long chapter, ensure we still split if extremely long
    const MAX_CHARS = 50_000;
    const final: ChapterPart[] = [];
    for (const p of merged) {
      if (p.content.length <= MAX_CHARS) {
        final.push(p);
        continue;
      }
      // Break large chapters into multiple balanced parts
      let start = 0;
      let partIdx = 0;
      while (start < p.content.length) {
        const slice = p.content.slice(start, start + MAX_CHARS);
        final.push({ title: `${p.title} (part ${++partIdx})`, content: slice.trim() });
        start += MAX_CHARS;
      }
    }

    return final;
  }
}
