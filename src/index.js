const os = require("node:os");
const fs = require("node:fs/promises");
const path = require("node:path");
const { Octokit } = require("@octokit/rest");
const { loadConfig } = require("./config");
const { detectChangedDocs } = require("./changeDetector");
const { buildSyncPlan } = require("./syncPlanner");
const { executeSyncPlan } = require("./syncEngine");
const { prepareWikiCheckout, commitAndPush } = require("./wikiRepo");
const { withRetry } = require("./retry");
const { maskSecrets } = require("./secretMask");

async function preflightCheck(octokit, owner, repo) {
  // GitHub Wiki has no REST/GraphQL API of its own; the only reliable signal
  // available through the API is whether the feature is enabled on the repo.
  const { data } = await octokit.repos.get({ owner, repo });
  if (!data.has_wiki) {
    throw new Error(`Wiki is not enabled for ${owner}/${repo}`);
  }
}

async function run() {
  let wikiWorkDir;

  try {
    const config = loadConfig(process.env);
    const octokit = new Octokit({ auth: config.token });

    await preflightCheck(octokit, config.owner, config.repo);

    const changes = await detectChangedDocs({
      octokit,
      owner: config.owner,
      repo: config.repo,
      base: config.base,
      head: config.head
    });

    if (changes.length === 0) {
      console.log("No supported documentation changes detected.");
      return;
    }

    const plan = buildSyncPlan(changes);

    wikiWorkDir = await fs.mkdtemp(path.join(os.tmpdir(), "doc-sync-wiki-"));
    const { dir: wikiDir, branch } = await prepareWikiCheckout({
      owner: config.owner,
      repo: config.repo,
      token: config.token,
      workDir: wikiWorkDir
    });

    const summary = await executeSyncPlan({
      plan,
      workspaceDir: process.cwd(),
      wikiDir,
      maxFileSizeBytes: config.maxFileSizeBytes,
      maxConcurrency: config.concurrency,
      reportPath: config.reportPath
    });

    if (summary.pagesCreatedOrUpdated > 0) {
      await withRetry(
        () =>
          commitAndPush({
            dir: wikiDir,
            branch,
            token: config.token,
            message: `docs: sync ${summary.pagesCreatedOrUpdated} page(s) [skip ci]`
          }),
        config.retryMaxAttempts
      );
    }

    console.log(JSON.stringify(summary, null, 2));

    if (summary.pagesFailed > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    const code = error.status || error.code || "SYNC_FAILURE";
    const message = maskSecrets(String(error.message || error));
    console.error(`doc-sync failed [${code}]: ${message}`);
    process.exitCode = 1;
  } finally {
    if (wikiWorkDir) {
      await fs.rm(wikiWorkDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

if (require.main === module) {
  run();
}

module.exports = {
  run,
  preflightCheck
};
