/**
 * Placeholder for S3 / Supabase uploads.
 */
export class StorageService {
  async putObject(_key: string, _body: Buffer): Promise<string> {
    return "https://example.com/object";
  }
}
