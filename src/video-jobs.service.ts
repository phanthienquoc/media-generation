import { Injectable,NotFoundException } from '@nestjs/common';
import { DbService } from './db.service';
import { VideoJobDto } from './video-job.dto';
@Injectable()
export class VideoJobsService {
 constructor(private db:DbService){}
 async create(dto:VideoJobDto){const {data,error}=await this.db.client.from('video_generation_jobs').insert({prompt:dto.prompt,model:dto.model??process.env.VEO_MODEL??'veo-3.1-fast-generate-preview',aspect_ratio:dto.aspectRatio??'16:9',resolution:dto.resolution??'720p',max_attempts:dto.attempts??3,status:'QUEUED'}).select('*').single();if(error)throw new Error(error.message);return data;}
 async get(id:string){const {data,error}=await this.db.client.from('video_generation_jobs').select('*,video_generation_assets(*)').eq('id',id).single();if(error||!data)throw new NotFoundException('Video job not found');return data;}
 async claim(){const {data,error}=await this.db.client.rpc('claim_video_generation_job');if(error)throw new Error(error.message);return data?.[0]??null;}
 async patch(id:string,v:Record<string,unknown>){const {error}=await this.db.client.from('video_generation_jobs').update(v).eq('id',id);if(error)throw new Error(error.message);}
}
