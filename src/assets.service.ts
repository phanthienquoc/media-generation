import { Injectable } from '@nestjs/common';
import { DbService } from './db.service';
@Injectable()
export class AssetsService { constructor(private db: DbService) {} async list(limit=50){const {data,error}=await this.db.client.from('video_generation_assets').select('*').order('created_at',{ascending:false}).limit(Math.min(Math.max(limit,1),100));if(error)throw new Error(error.message);const ttl=Number(process.env.MEDIA_SIGNED_URL_TTL_SECONDS??3600);return Promise.all((data??[]).map(async a=>{const signed=await this.db.client.storage.from(this.db.bucket).createSignedUrl(a.storage_path,ttl);return {...a,signed_url:signed.data?.signedUrl??null};}));} }
