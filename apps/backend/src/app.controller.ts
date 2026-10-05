import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { VideoJobDto } from './video-job.dto';
import { DbService } from './db.service';
import { VideoJobsService } from './video-jobs.service';
import { AssetsService } from './assets.service';
import { MicrofeSession } from './microfe-session';

@Controller()
export class AppController {
  constructor(
    private db: DbService,
    private jobs: VideoJobsService,
    private assets: AssetsService,
    private session: MicrofeSession,
  ) {}

  @Get('/health') health() {
    return { status: 'ok', service: 'media-generation' };
  }

  @Get('/ready') async ready() {
    await this.db.ready();
    return { status: 'ready' };
  }

  @Get('/session/me') async me(@Req() request: { headers: Record<string, string | string[] | undefined> }) {
    return this.session.require(request);
  }

  @Get('/video-jobs') async list(
    @Req() request: { headers: Record<string, string | string[] | undefined> },
    @Query('limit') limit?: string,
  ) {
    await this.session.require(request);
    return this.jobs.list(Number(limit ?? 50));
  }

  @Post('/video-jobs') async create(
    @Req() request: { headers: Record<string, string | string[] | undefined> },
    @Body() dto: VideoJobDto,
  ) {
    await this.session.require(request);
    return this.jobs.create(dto);
  }

  @Get('/video-jobs/:id') async get(
    @Req() request: { headers: Record<string, string | string[] | undefined> },
    @Param('id') id: string,
  ) {
    await this.session.require(request);
    return this.jobs.get(id);
  }

  @Post('/video-jobs/:id/retry') async retry(
    @Req() request: { headers: Record<string, string | string[] | undefined> },
    @Param('id') id: string,
  ) {
    await this.session.require(request);
    return this.jobs.retry(id);
  }

  @Get('/assets') async assetsList(
    @Req() request: { headers: Record<string, string | string[] | undefined> },
    @Query('limit') limit?: string,
  ) {
    await this.session.require(request);
    return this.assets.list(Number(limit ?? 50));
  }
}
