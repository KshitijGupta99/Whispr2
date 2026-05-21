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
    if (process.env.OPENAI_API_KEY) {
      try {
        return await splitChaptersWithGpt(text);
      } catch {
        // fall through
      }
    }
    return splitHeuristic(text);
  }
}
