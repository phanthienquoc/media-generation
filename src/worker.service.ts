import { Injectable,OnModuleInit } from '@nestjs/common';
import { DbService } from './db.service';
import { VeoService } from './veo.service';
import { VideoJobsService } from './video-jobs.service';
@Injectable()
export class WorkerService implements OnModuleInit {
 constructor(private jobs:VideoJobsService,private db:DbService,private veo:VeoService){}
 onModuleInit(){if(process.env.WORKER_ENABLED!=='false')void this.loop();}
 private async loop(){for(;;){try{const j=await this.jobs.claim();if(!j){await new Promise(r=>setTimeout(r,Number(process.env.WORKER_POLL_MS??3000)));continue;}const attempt=Number(j.attempt_count??0)+1;await this.jobs.patch(j.id,{status:'PROCESSING',attempt_count:attempt,started_at:new Date().toISOString()});try{const out=await this.veo.generate(j);const path=`jobs/${j.id}/video.mp4`;const up=await this.db.client.storage.from(this.db.bucket).upload(path,out.bytes,{contentType:'video/mp4',upsert:true});if(up.error)throw new Error(up.error.message);const ins=await this.db.client.from('video_generation_assets').insert({job_id:j.id,storage_path:path,mime_type:'video/mp4',byte_size:out.bytes.byteLength,provider_operation:out.operationName});if(ins.error)throw new Error(ins.error.message);await this.jobs.patch(j.id,{status:'READY',completed_at:new Date().toISOString(),error_message:null});}catch(e){const msg=e instanceof Error?e.message:String(e);const final=attempt>=Number(j.max_attempts??3);await this.jobs.patch(j.id,{status:final?'FAILED':'QUEUED',error_message:msg,completed_at:final?new Date().toISOString():null});}}catch{await new Promise(r=>setTimeout(r,3000));}}}
}
