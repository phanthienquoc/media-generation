import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DbService {
  readonly client: SupabaseClient;
  readonly bucket: string;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    this.client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    this.bucket = process.env.MEDIA_STORAGE_BUCKET ?? 'media-generation';
  }

  async ready() {
    const { error } = await this.client.from('video_generation_jobs').select('id').limit(1);
    if (error) throw new Error(error.message);
  }
}
