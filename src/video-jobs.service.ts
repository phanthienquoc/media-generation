import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from './db.service';
import { VideoJobDto } from './video-job.dto';

@Injectable()
export class VideoJobsService {
  constructor(private db: DbService) {}

  async create(dto: VideoJobDto) {
    const { data, error } = await this.db.client.from('video_generation_jobs').insert({
      prompt: dto.prompt,
      model: dto.model ?? process.env.VEO_MODEL ?? 'veo-3.1-fast-generate-preview',
      aspect_ratio: dto.aspectRatio ?? '16:9',
      resolution: dto.resolution ?? '720p',
      max_attempts: dto.attempts ?? 3,
      status: 'QUEUED',
    }).select('*').single();
    if (error) throw new Error(error.message);
    return data;
  }

  async get(id: string) {
    const { data, error } = await this.db.client.from('video_generation_jobs')
      .select('*,video_generation_assets(*)').eq('id', id).single();
    if (error || !data) throw new NotFoundException('Video job not found');

    const ttl = Number(process.env.MEDIA_SIGNED_URL_TTL_SECONDS ?? 3600);
    const assets = await Promise.all((data.video_generation_assets ?? []).map(async (asset: any) => {
      const signed = await this.db.client.storage.from(this.db.bucket).createSignedUrl(asset.storage_path, ttl);
      if (signed.error) throw new Error(signed.error.message);
      return { ...asset, signed_url: signed.data.signedUrl };
    }));
    return { ...data, video_generation_assets: assets };
  }

  async retry(id: string) {
    const { data, error } = await this.db.client.rpc('retry_video_generation_job', { job_id: id });
    if (error) throw new Error(error.message);
    const result = data?.[0];
    if (!result) throw new NotFoundException('Video job not found');
    if (result.was_retryable !== true) throw new ConflictException('Only FAILED jobs can be retried');
    return this.get(id);
  }

  async claim() {
    const { data, error } = await this.db.client.rpc('claim_video_generation_job');
    if (error) throw new Error(error.message);
    return data?.[0] ?? null;
  }

  async patch(id: string, value: Record<string, unknown>) {
    const { error } = await this.db.client.from('video_generation_jobs').update({ ...value, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(error.message);
  }
}
