import mammoth from "mammoth";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;

/**
 * Extracts plain text from uploaded PDF or Word documents.
 */
export class DocumentExtractService {
  async extract(buffer: Buffer, mime: string, filename: string): Promise<string> {
    const lower = filename.toLowerCase();

    if (mime === "application/pdf" || lower.endsWith(".pdf")) {
      const data = await pdfParse(buffer);
      const text = data.text?.trim();
      if (!text) throw new Error("PDF contained no extractable text");
      return text;
    }

    if (
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      lower.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value?.trim();
      if (!text) throw new Error("DOCX contained no extractable text");
      return text;
    }

    if (mime === "application/msword" || lower.endsWith(".doc")) {
      throw new Error("Legacy .doc files are not supported. Save as .docx or .txt");
    }

    throw new Error(`Unsupported document type: ${mime || filename}`);
  }
}

export const documentExtractService = new DocumentExtractService();
