/**
 * Maps unknown errors to a user-facing string.
 */
export function toUserMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong. Please try again.";
}
