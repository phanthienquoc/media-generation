import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DbService } from './db.service';
import { VideoJobsService } from './video-jobs.service';
import { VeoService } from './veo.service';
import { WorkerService } from './worker.service';
import { AssetsService } from './assets.service';
import { MediaAdminMiddleware } from './media-admin.middleware';

@Module({imports:[ConfigModule.forRoot({isGlobal:true})],controllers:[AppController],providers:[DbService,VideoJobsService,VeoService,WorkerService,AssetsService]})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) { consumer.apply(MediaAdminMiddleware).forRoutes('*'); }
}
