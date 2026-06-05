/**
 * Placeholder for ffmpeg-based stitching between chapter buffers.
 */
export class AudioMergerService {
  async merge(buffers: Buffer[]): Promise<Buffer> {
    if (!buffers || buffers.length === 0) return Buffer.alloc(0);
    if (buffers.length === 1) return buffers[0];

    const tmp = require("os").tmpdir();
    const path = require("path");
    const fs = require("fs/promises");
    const { spawnSync } = require("child_process");

    // Try to use ffmpeg to merge with a short crossfade between tracks.
    try {
      const files: string[] = [];
      for (let i = 0; i < buffers.length; i++) {
        const p = path.join(tmp, `whispr_merge_${Date.now()}_${i}.mp3`);
        await fs.writeFile(p, buffers[i]);
        files.push(p);
      }

      // If ffmpeg is not present, spawnSync will error; handle below.
      // We'll iteratively merge pairwise applying a 0.5s crossfade.
      let current = files[0];
      for (let i = 1; i < files.length; i++) {
        const next = files[i];
        const out = path.join(tmp, `whispr_merge_out_${Date.now()}_${i}.mp3`);
        // Build ffmpeg command to crossfade current and next into out
        // - Use acrossfade filter for mp3
        const args = [
          "-y",
          "-i",
          current,
          "-i",
          next,
          "-filter_complex",
          "[0:a][1:a]acrossfade=d=0.5:c1=tri:c2=tri",
          "-c:a",
          "libmp3lame",
          "-q:a",
          "4",
          out,
        ];
        const res = spawnSync("ffmpeg", args, { stdio: "inherit" });
        if (res.error || res.status !== 0) {
          throw new Error("ffmpeg merge failed");
        }
        // cleanup previous intermediate
        try {
          if (current.startsWith(tmp)) await fs.unlink(current).catch(() => {});
        } catch {}
        current = out;
      }

      const merged = await fs.readFile(current);
      // cleanup
      for (const f of files.concat([current])) {
        if (f && f.startsWith(tmp)) await fs.unlink(f).catch(() => {});
      }
      return Buffer.from(merged);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[AudioMergerService] ffmpeg merge failed, falling back to concat:", e?.message ?? e);
      return Buffer.concat(buffers);
    }
  }
}
