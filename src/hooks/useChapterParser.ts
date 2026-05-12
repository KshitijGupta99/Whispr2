import { useMemo } from "react";

import { splitTextIntoChapters, type ParsedChapter } from "@/utils/textParser";

/**
 * Memoized client-side chapter segments for the current manuscript.
 */
export function useChapterParser(text: string): ParsedChapter[] {
  return useMemo(() => splitTextIntoChapters(text), [text]);
}
