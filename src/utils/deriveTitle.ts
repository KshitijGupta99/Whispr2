/**
 * Picks a short library title from the first line of the manuscript.
 */
export function deriveTitle(text: string): string {
  const line = text.trim().split(/\n/)[0]?.trim() ?? "";
  if (!line) return "Your Story";
  if (line.length <= 60) return line;
  return `${line.slice(0, 57)}…`;
}
