const ACCEPTED_MIME = new Set([
  "text/plain",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_BYTES = 5 * 1024 * 1024;

export interface FileValidationResult {
  ok: boolean;
  message?: string;
}

/**
 * Validates picked document type and size for manuscript import.
 */
export function validateManuscriptFile(mime: string | undefined, size: number): FileValidationResult {
  if (size > MAX_BYTES) {
    return { ok: false, message: "File is too large (max 5MB for this preview build)." };
  }
  if (!mime || !ACCEPTED_MIME.has(mime)) {
    return {
      ok: false,
      message: "Unsupported format. Try .txt, .pdf, or .doc/.docx.",
    };
  }
  return { ok: true };
}
