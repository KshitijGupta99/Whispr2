const TEXT_MIMES = new Set([
  "text/plain",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const AUDIO_MIMES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
]);

const MAX_TEXT_BYTES = 5 * 1024 * 1024;
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

export interface FileValidationResult {
  ok: boolean;
  message?: string;
}

/**
 * Validates picked document type and size for manuscript import.
 */
export function validateManuscriptFile(mime: string | undefined, size: number): FileValidationResult {
  if (!mime) {
    return { ok: false, message: "Could not detect file type." };
  }
  if (AUDIO_MIMES.has(mime)) {
    if (size > MAX_AUDIO_BYTES) {
      return { ok: false, message: "Audio is too large (max 20MB)." };
    }
    return { ok: true };
  }
  if (size > MAX_TEXT_BYTES) {
    return { ok: false, message: "File is too large (max 5MB for documents)." };
  }
  if (!TEXT_MIMES.has(mime)) {
    return {
      ok: false,
      message: "Unsupported format. Try .txt, .pdf, .doc/.docx, or an audio file for transcription.",
    };
  }
  return { ok: true };
}
