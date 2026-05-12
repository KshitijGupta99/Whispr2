/**
 * Splits long text into coarse chapter chunks for the demo pipeline.
 */
export class ChapterSplitterService {
  split(text: string): { title: string; content: string }[] {
    const parts = text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length <= 1) {
      return [{ title: "Chapter 1", content: text.trim() || "Untitled story" }];
    }
    return parts.slice(0, 6).map((content, i) => ({
      title: `Chapter ${i + 1}`,
      content,
    }));
  }
}
