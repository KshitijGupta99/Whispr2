export interface ParsedChapter {
  title: string;
  content: string;
  index: number;
}

const HEADER = /^(chapter|part|section)\s+(\d+|[ivxlcdm]+)\b/i;

/**
 * Heuristic chapter splitter used when offline or before server enrichment.
 */
export function splitTextIntoChapters(text: string): ParsedChapter[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const lines = normalized.split("\n");
  const chapters: ParsedChapter[] = [];
  let title = "Chapter 1";
  let body: string[] = [];

  const flush = () => {
    const content = body.join("\n").trim();
    if (!content) return;
    chapters.push({
      index: chapters.length + 1,
      title,
      content,
    });
    body = [];
  };

  for (const line of lines) {
    const t = line.trim();
    if (HEADER.test(t) && body.length) {
      flush();
      title = t;
    } else {
      body.push(line);
    }
  }
  flush();

  return chapters.length
    ? chapters
    : [{ index: 1, title: "Chapter 1", content: normalized }];
}
