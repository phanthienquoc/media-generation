# media-generation

NestJS async video generation service for FE Algorithm Daily using Gemini/Veo 3.1 and private Supabase Storage.

Endpoints: POST /v1/video-jobs, GET /v1/video-jobs/:id, POST /v1/video-jobs/:id/retry, GET /v1/health, GET /v1/ready.

Runtime secrets stay outside source control. Apply the Supabase migration from the platform project before enabling the worker.

API contract: failed jobs can be retried; completed assets are returned through time-limited signed storage URLs.

## Production CI/CD

The `master` image job publishes an immutable Git-SHA image to the public GHCR package and dispatches `image-published` to `platform-infra` for GitOps promotion and VPS reconciliation.

Configure this GitHub Actions secret in the `media-generation` repository:

- `PLATFORM_INFRA_DISPATCH_TOKEN`: a least-privilege GitHub token authorized to dispatch repository events to `phanthienquoc/platform-infra`.

Runtime media credentials remain Kubernetes secrets and are checked by the platform runtime-secret-readiness workflow.
