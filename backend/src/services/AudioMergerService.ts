/**
 * Placeholder for ffmpeg-based stitching between chapter buffers.
 */
export class AudioMergerService {
  async merge(_buffers: Buffer[]): Promise<Buffer> {
    return Buffer.concat(_buffers);
  }
}
