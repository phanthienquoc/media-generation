import { Injectable, OnModuleInit } from '@nestjs/common';
import { DbService } from './db.service';
import { VeoService } from './veo.service';
import { VideoJobsService } from './video-jobs.service';

@Injectable()
export class WorkerService implements OnModuleInit {
  constructor(
    private jobs: VideoJobsService,
    private db: DbService,
    private veo: VeoService,
  ) {}

  onModuleInit() {
    if (process.env.WORKER_ENABLED === 'true') void this.loop();
  }

  private async loop() {
    for (;;) {
      try {
        const job = await this.jobs.claim();
        if (!job) {
          await new Promise((resolve) =>
            setTimeout(resolve, Number(process.env.WORKER_POLL_MS ?? 3000)),
          );
          continue;
        }

        const attempt = Number(job.attempt_count ?? 0) + 1;
        await this.jobs.patch(job.id, {
          status: 'PROCESSING',
          attempt_count: attempt,
          started_at: new Date().toISOString(),
          provider_operation: null,
        });

        try {
          const output = await this.veo.generate(job);
          const storagePath = `jobs/${job.id}/video.mp4`;
          const upload = await this.db.client.storage
            .from(this.db.bucket)
            .upload(storagePath, output.bytes, {
              contentType: 'video/mp4',
              upsert: true,
            });

          if (upload.error) throw new Error(upload.error.message);

          const insert = await this.db.client
            .from('video_generation_assets')
            .upsert({
              job_id: job.id,
              storage_path: storagePath,
              mime_type: 'video/mp4',
              byte_size: output.bytes.byteLength,
              provider_operation: output.operationName,
            }, { onConflict: 'job_id,storage_path' });

          if (insert.error) throw new Error(insert.error.message);

          await this.jobs.patch(job.id, {
            status: 'READY',
            completed_at: new Date().toISOString(),
            error_message: null,
            provider_operation: output.operationName,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const final = attempt >= Number(job.max_attempts ?? 3);

          await this.jobs.patch(job.id, {
            status: final ? 'FAILED' : 'QUEUED',
            error_message: message,
            completed_at: final ? new Date().toISOString() : null,
          });
        }
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }
}
