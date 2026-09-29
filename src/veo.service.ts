import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { mkdtemp,readFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
@Injectable()
export class VeoService {
 private ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
 async generate(job:any){let op:any=await this.ai.models.generateVideos({model:job.model,prompt:job.prompt,config:{aspectRatio:job.aspect_ratio,resolution:job.resolution}});const dir=await mkdtemp(join(tmpdir(),'veo-')),file=join(dir,'video.mp4');try{while(!op.done){await new Promise(r=>setTimeout(r,Number(process.env.VEO_POLL_MS??10000)));op=await this.ai.operations.getVideosOperation({operation:op});}const video=op.response?.generatedVideos?.[0]?.video;if(!video)throw new Error('Veo completed without generated video');await this.ai.files.download({file:video,downloadPath:file});return {bytes:await readFile(file),operationName:String(op.name??op.operation?.name??'')};}finally{await rm(dir,{recursive:true,force:true});}}
}
