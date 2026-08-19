const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { buildSyncPlan } = require("../src/syncPlanner");
const { executeSyncPlan } = require("../src/syncEngine");

async function makeTempDirs() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "doc-sync-"));
  const workspaceDir = path.join(root, "workspace");
  const wikiDir = path.join(root, "wiki");
  await fs.mkdir(workspaceDir, { recursive: true });
  await fs.mkdir(wikiDir, { recursive: true });
  return { root, workspaceDir, wikiDir };
}

test("buildSyncPlan creates deprecate and upsert operations for rename", () => {
  const plan = buildSyncPlan([
    {
      status: "renamed",
      path: "docs/new/openapi.yaml",
      previousPath: "docs/old/openapi.yaml",
      docType: "openapi"
    }
  ]);

  assert.equal(plan.length, 2);
  assert.equal(plan[0].type, "deprecate");
  assert.equal(plan[1].type, "upsert");
});

test("executeSyncPlan creates a new wiki page when none exists", async () => {
  const { root, workspaceDir, wikiDir } = await makeTempDirs();
  await fs.writeFile(path.join(workspaceDir, "README.md"), "# Title\n", "utf8");

  const summary = await executeSyncPlan({
    plan: [{ type: "upsert", pagePath: "Home", sourcePath: "README.md", docType: "readme" }],
    workspaceDir,
    wikiDir,
    maxFileSizeBytes: 1024,
    maxConcurrency: 1,
    reportPath: path.join(root, "artifacts", "doc-sync-report.json")
  });

  assert.equal(summary.pagesCreatedOrUpdated, 1);
  const written = await fs.readFile(path.join(wikiDir, "Home.md"), "utf8");
  assert.match(written, /# Title/);
});

test("executeSyncPlan updates an existing page when content changed", async () => {
  const { root, workspaceDir, wikiDir } = await makeTempDirs();
  await fs.writeFile(path.join(workspaceDir, "README.md"), "# New Title\n", "utf8");
  await fs.writeFile(
    path.join(wikiDir, "Home.md"),
    "<!-- doc-sync-hash:deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef -->\n\n# Old Title\n",
    "utf8"
  );

  const summary = await executeSyncPlan({
    plan: [{ type: "upsert", pagePath: "Home", sourcePath: "README.md", docType: "readme" }],
    workspaceDir,
    wikiDir,
    maxFileSizeBytes: 1024,
    maxConcurrency: 1,
    reportPath: path.join(root, "artifacts", "doc-sync-report.json")
  });

  assert.equal(summary.pagesCreatedOrUpdated, 1);
  const written = await fs.readFile(path.join(wikiDir, "Home.md"), "utf8");
  assert.match(written, /# New Title/);
});

test("executeSyncPlan marks unchanged pages as skipped", async () => {
  const { root, workspaceDir, wikiDir } = await makeTempDirs();
  await fs.writeFile(path.join(workspaceDir, "README.md"), "# Title\n", "utf8");

  const plan = [{ type: "upsert", pagePath: "Home", sourcePath: "README.md", docType: "readme" }];
  const reportPath = path.join(root, "artifacts", "doc-sync-report.json");

  await executeSyncPlan({ plan, workspaceDir, wikiDir, maxFileSizeBytes: 1024, maxConcurrency: 1, reportPath });
  const summary = await executeSyncPlan({ plan, workspaceDir, wikiDir, maxFileSizeBytes: 1024, maxConcurrency: 1, reportPath });

  assert.equal(summary.pagesSkipped, 1);
  assert.equal(summary.pagesCreatedOrUpdated, 0);
});

test("executeSyncPlan writes deprecated content for removed sources", async () => {
  const { root, workspaceDir, wikiDir } = await makeTempDirs();

  const summary = await executeSyncPlan({
    plan: [{ type: "deprecate", pagePath: "API/legacy", sourcePath: "docs/legacy.yaml", docType: "openapi" }],
    workspaceDir,
    wikiDir,
    maxFileSizeBytes: 1024,
    maxConcurrency: 1,
    reportPath: path.join(root, "artifacts", "doc-sync-report.json")
  });

  assert.equal(summary.pagesCreatedOrUpdated, 1);
  const written = await fs.readFile(path.join(wikiDir, "API/legacy.md"), "utf8");
  assert.match(written, /\[DEPRECATED\]/);
});

test("executeSyncPlan rejects source paths that escape the workspace", async () => {
  const { root, workspaceDir, wikiDir } = await makeTempDirs();

  const summary = await executeSyncPlan({
    plan: [{ type: "upsert", pagePath: "Home", sourcePath: "../../etc/passwd", docType: "readme" }],
    workspaceDir,
    wikiDir,
    maxFileSizeBytes: 1024,
    maxConcurrency: 1,
    reportPath: path.join(root, "artifacts", "doc-sync-report.json")
  });

  assert.equal(summary.pagesFailed, 1);
  assert.match(summary.results[0].errorMessage, /escapes root directory/);
});
