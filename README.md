# media-generation

NestJS async video generation service for FE Algorithm Daily using Gemini/Veo 3.1 and private Supabase Storage.

Endpoints: POST /v1/video-jobs, GET /v1/video-jobs/:id, POST /v1/video-jobs/:id/retry, GET /v1/health, GET /v1/ready.

Runtime secrets stay outside source control. Apply the Supabase migration from the platform project before enabling the worker.
