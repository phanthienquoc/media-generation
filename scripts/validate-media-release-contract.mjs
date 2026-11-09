import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const workflow = readFileSync(".github/workflows/wf-03-media-production-deploy.yml", "utf8");

const checks = [
  ["same-source publication is serialized without cancellation", workflow.includes("group: media-production-publish-${{ github.sha }}") && workflow.includes("cancel-in-progress: false")],
  ["GHCR guard and tests do not trigger a production release", workflow.includes("- 'scripts/verify-ghcr-tags-absent.sh'") && workflow.includes("- 'scripts/tests/**'")],
  ["pre-publication tag guard runs before first GHCR push", workflow.indexOf("Refuse to overwrite existing immutable GHCR release tags") < workflow.indexOf("Publish exact release images") && workflow.includes('run: bash scripts/verify-ghcr-tags-absent.sh "$REPOSITORY" "$RELEASE_TAG" "$SOURCE_SHA"')],
  ["package version is stable semver", /^\d+\.\d+\.\d+$/.test(pkg.version)],
  ["production push release is master-only", /push:\s*\n\s+branches:\s*\n\s+- master/.test(workflow)],
  ["workflow and documentation-only changes are ignored", /paths-ignore:[\s\S]*?- '\.github\/\*\*'[\s\S]*?- 'docs\/\*\*'[\s\S]*?- '\*\*\/\*\.md'/.test(workflow)],
  ["contract-test-only changes do not trigger a production release", workflow.includes("- 'scripts/validate-media-release-contract.mjs'")],
  ["manual release is explicit", /^\s+workflow_dispatch:\s*$/m.test(workflow)],
  ["release tag uses the full source SHA", workflow.includes('SHA="$GITHUB_SHA"') && workflow.includes('[[ "$SHA" =~ ^[0-9a-f]{40}$ ]]') && workflow.includes('IMAGE_TAG="prod-v${VERSION}-${SHA}"')],
  ["invalid semver is rejected before image builds", workflow.includes("package.json version must be stable semver (x.y.z)")],
  ["frontend and backend artifacts are paired", workflow.includes("name: media-frontend-image") && workflow.includes("name: media-backend-image") && workflow.includes("pattern: media-*-image")],
  ["both images are published to canonical GHCR packages", workflow.includes('FRONTEND_IMAGE="ghcr.io/phanthienquoc/media-generation/frontend:$TAG"') && workflow.includes('BACKEND_IMAGE="ghcr.io/phanthienquoc/media-generation/backend:$TAG"') && workflow.includes('docker push "$FRONTEND_IMAGE"') && workflow.includes('docker push "$BACKEND_IMAGE"')],
  ["published images are registry-verified for ARM64 before summary", workflow.indexOf("Verify immutable registry digests and ARM64 manifests") < workflow.indexOf("Write release summary") && workflow.includes("docker buildx imagetools inspect") && workflow.includes("Platform: linux/arm64")],
  ["release summary records exact immutable digests", workflow.includes("FRONTEND_DIGEST: ${{ steps.image-digests.outputs.frontend_digest }}") && workflow.includes("BACKEND_DIGEST: ${{ steps.image-digests.outputs.backend_digest }}") && workflow.includes("Platform deployment: not configured; no repository dispatch was sent")],
  ["retired Platform Infra dispatch authority is absent", !workflow.includes("PLATFORM_INFRA_DISPATCH_TOKEN") && !workflow.includes("repository_dispatch") && !workflow.includes("platform-infra") && !workflow.includes("/dispatches")],
  ["release actions are pinned to verified Node24 SHAs", ["uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1","uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2","uses: actions/download-artifact@9000827ccba6bdab643e8b6fd33ac0654aef8333 # v8.0.2","uses: docker/login-action@81c6f93d4bc991e510b342a00b419b3bb4efc5c6 # v4.7.0","uses: docker/setup-buildx-action@f87e5991a6d7451dcb8d9637bfbc97413f497069 # v4.4.1"].every(pin => workflow.includes(pin))],
  ["native ARM64 runner remains the image builder", workflow.includes("runs-on: ubuntu-24.04-arm") && workflow.includes('test "$(uname -m)" = "aarch64"')],
  ["CI setup-node is pinned to Node24", readFileSync(".github/workflows/ci.yml", "utf8").includes("uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0")],
  ["GHCR write permission is scoped to the publisher job", (() => {
    const lines = workflow.split("\n");
    const topLevelIndex = lines.indexOf("permissions:");
    const topLevelEnd = lines.findIndex((line, index) => index > topLevelIndex && line.length > 0 && !line.startsWith(" "));
    const topLevelPermissions = lines.slice(topLevelIndex + 1, topLevelEnd).join("\n").trim();
    const publisherIndex = lines.indexOf("  publish-immutable-images:");
    const publisherSection = lines.slice(publisherIndex).join("\n");
    return topLevelPermissions === "contents: read" &&
      publisherSection.includes("    permissions:\n      contents: read\n      packages: write") &&
      lines.filter(line => line.trim() === "packages: write").length === 1;
  })()],
];

for (const [label, passed] of checks) {
  assert.ok(passed, `Media release contract violation: ${label}`);
  console.log(`PASS ${label}`);
}

assert.ok(readFileSync("scripts/verify-ghcr-tags-absent.sh", "utf8").includes("manifest unknown"), "Media GHCR guard must recognize explicit missing-manifest responses.");
execFileSync("bash", ["scripts/tests/verify-ghcr-tags-absent.test.sh"], { stdio: "inherit" });
