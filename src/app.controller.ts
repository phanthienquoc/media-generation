import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VideoJobDto } from './video-job.dto';
import { DbService } from './db.service';
import { VideoJobsService } from './video-jobs.service';

@Controller()
export class AppController {
  constructor(private db: DbService, private jobs: VideoJobsService) {}

  @Get('/health')
  health() { return { status: 'ok', service: 'media-generation' }; }

  @Get('/ready')
  async ready() { await this.db.ready(); return { status: 'ready' }; }

  @Post('/video-jobs')
  create(@Body() dto: VideoJobDto) { return this.jobs.create(dto); }

  @Get('/video-jobs/:id')
  get(@Param('id') id: string) { return this.jobs.get(id); }

  @Post('/video-jobs/:id/retry')
  retry(@Param('id') id: string) { return this.jobs.retry(id); }
}
