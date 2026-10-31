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
  ["dispatch uses the central Media release contract", workflow.includes("media-release-requested") && workflow.includes('app\\":\\"media-generation') && workflow.includes('release\\":\\"$TAG')],
  ["release waits for Platform Infra promotion workflow scheduling", workflow.includes("Verify platform-infra release workflow") && workflow.includes('event=repository_dispatch') && workflow.includes('GitOps Image Promotion')],
];

for (const [label, passed] of checks) {
  assert.ok(passed, `Media release contract violation: ${label}`);
  console.log(`PASS ${label}`);
}
