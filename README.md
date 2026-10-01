# media-generation

NestJS async video generation service for FE Algorithm Daily using Gemini/Veo 3.1 and private Supabase Storage.

## Workspace

The repository follows the TCE Nx application pattern:

- `apps/frontend` — Next.js frontend application
- `apps/backend` — NestJS API/worker boundary
- root `package.json` — workspace scripts and shared toolchain
- `nx.json` — project target defaults

The frontend is provider-neutral and talks to the NestJS API under `/v1`. Gemini/Veo and Supabase service-role credentials remain backend-only.

## API

- `POST /v1/video-jobs`
- `GET /v1/video-jobs/:id`
- `POST /v1/video-jobs/:id/retry`
- `GET /v1/health`
- `GET /v1/ready`

## Supabase

Use the existing project `gtqovpusfyyvxpeezxlo`. Do not create a second media project.

Existing media tables include:

- `video_generation_jobs`
- `video_generation_assets`
- `media_generation_jobs`
- `media_generation_assets`
- `media_generation_prompts`
- `media_generation_usage`

Runtime secrets stay outside source control. Apply committed Supabase migrations before enabling workers.

## Production CI/CD

The application repository owns FE/BE images and application runtime secrets. `platform-infra` owns Kubernetes workload/infrastructure only.

Production builds publish immutable FE and BE images and dispatch `media-release-requested` to `platform-infra` for paired GitOps promotion.
