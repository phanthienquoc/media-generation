import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const workflow = readFileSync(".github/workflows/wf-03-media-production-deploy.yml", "utf8");

const checks = [
  ["package version is stable semver", /^\d+\.\d+\.\d+$/.test(pkg.version)],
  ["production push release is master-only", /push:\s*\n\s+branches:\s*\n\s+- master/.test(workflow)],
  ["workflow and documentation-only changes are ignored", /paths-ignore:[\s\S]*?- '\.github\/\*\*'[\s\S]*?- 'docs\/\*\*'[\s\S]*?- '\*\*\/\*\.md'/.test(workflow)],
  ["contract-test-only changes do not trigger a production release", workflow.includes("- 'scripts/validate-media-release-contract.mjs'")],
  ["manual release is explicit", /^\s+workflow_dispatch:\s*$/m.test(workflow)],
  ["release tag uses the full source SHA", workflow.includes('SHA="$GITHUB_SHA"') && workflow.includes('[[ "$SHA" =~ ^[0-9a-f]{40}$ ]]') && workflow.includes('IMAGE_TAG="prod-v${VERSION}-${SHA}"')],
  ["invalid semver is rejected before image builds", workflow.includes("package.json version must be stable semver (x.y.z)")],
  ["frontend and backend artifacts are paired", workflow.includes("name: media-frontend-image") && workflow.includes("name: media-backend-image") && workflow.includes("pattern: media-*-image")],
  ["both images are published to their canonical GHCR packages", workflow.includes('FRONTEND_IMAGE="ghcr.io/phanthienquoc/media-generation/frontend:$TAG"') && workflow.includes('BACKEND_IMAGE="ghcr.io/phanthienquoc/media-generation/backend:$TAG"') && workflow.includes('docker push "$FRONTEND_IMAGE"') && workflow.includes('docker push "$BACKEND_IMAGE"')],
  ["dispatch uses the paired Media digest event", workflow.includes("media-images-published") && workflow.includes('frontend_digest') && workflow.includes('backend_digest') && workflow.includes('event_type:"media-images-published"')],
  ["published Media images are registry-verified for ARM64 before dispatch", workflow.indexOf("Verify immutable registry digests and ARM64 manifests") < workflow.indexOf("Notify platform-infra") && workflow.includes("docker buildx imagetools inspect") && workflow.includes("Platform: linux/arm64")],
  ["Media dispatch payload validates source commit, release, paired digests and publisher provenance", workflow.includes('SOURCE_RUN_ID="$GITHUB_RUN_ID"') && workflow.includes('SOURCE_WORKFLOW_PATH=".github/workflows/wf-03-media-production-deploy.yml"') && workflow.includes('SOURCE_EVENT="$GITHUB_EVENT_NAME"') && workflow.includes('SOURCE_HEAD_SHA="$GITHUB_SHA"') && workflow.includes('[[ "$SOURCE_EVENT" == "push" || "$SOURCE_EVENT" == "workflow_dispatch" ]]') && workflow.includes('[[ "$TAG" =~ ^prod-v[0-9]+[.][0-9]+[.][0-9]+-${SOURCE_HEAD_SHA}$ ]]') && workflow.includes('--arg source_run_id "$SOURCE_RUN_ID"') && workflow.includes('--arg source_workflow_path "$SOURCE_WORKFLOW_PATH"') && workflow.includes('--arg source_event "$SOURCE_EVENT"') && workflow.includes('--arg source_head_sha "$SOURCE_HEAD_SHA"') && workflow.includes('client_payload.source_run_id') && workflow.includes('client_payload.source_workflow_path') && workflow.includes('client_payload.source_event') && workflow.includes('client_payload.source_head_sha') && workflow.includes('jq -e') && workflow.includes('client_payload.frontend_digest') && workflow.includes('client_payload.backend_digest')],
  ["release verification correlates to the exact Media GitOps run", workflow.includes("Verify platform-infra release workflow") && workflow.includes('event=repository_dispatch') && workflow.includes('--arg release "$RELEASE"') && workflow.includes('display_title == ("GitOps Image Promotion — media-generation / " + $release)') && !workflow.includes('select(.name | startswith("GitOps Image Promotion"))')],
];

  ["release actions are pinned to verified Node24 SHAs", ["uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1","uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2","uses: actions/download-artifact@9000827ccba6bdab643e8b6fd33ac0654aef8333 # v8.0.2","uses: docker/login-action@81c6f93d4bc991e510b342a00b419b3bb4efc5c6 # v4.7.0","uses: docker/setup-buildx-action@f87e5991a6d7451dcb8d9637bfbc97413f497069 # v4.4.1"].every(pin => workflow.includes(pin))],
  ["CI setup-node is pinned to Node24", "uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0".length > 0 && readFileSync(".github/workflows/ci.yml", "utf8").includes("uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0")],

for (const [label, passed] of checks) {
  assert.ok(passed, `Media release contract violation: ${label}`);
  console.log(`PASS ${label}`);
}
