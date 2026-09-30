import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

@Injectable()
export class VeoService {
  private ai?: GoogleGenAI;

  private client(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY is required for video generation');
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  async generate(job: any) {
    const ai = this.client();
    let operation: any = await ai.models.generateVideos({
      model: job.model,
      prompt: job.prompt,
      config: {
        aspectRatio: job.aspect_ratio,
        resolution: job.resolution,
      },
    });

    const dir = await mkdtemp(join(tmpdir(), 'veo-'));
    const file = join(dir, 'video.mp4');

    try {
      while (!operation.done) {
        await new Promise((resolve) =>
          setTimeout(resolve, Number(process.env.VEO_POLL_MS ?? 10000)),
        );
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const video = operation.response?.generatedVideos?.[0]?.video;
      if (!video) throw new Error('Veo completed without generated video');

      await ai.files.download({ file: video, downloadPath: file });
      return {
        bytes: await readFile(file),
        operationName: String(operation.name ?? operation.operation?.name ?? ''),
      };
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
}
