const DEFAULT_MAX_FILE_SIZE_BYTES = 1024 * 1024;

function parseRepository(repository) {
  if (!repository || !repository.includes("/")) {
    throw new Error("GITHUB_REPOSITORY must be in owner/repo format");
  }

  const [owner, repo] = repository.split("/");
  return { owner, repo };
}

function loadConfig(env = process.env) {
  const token = env.DOC_SYNC_TOKEN;
  if (!token) {
    throw new Error("DOC_SYNC_TOKEN is required");
  }

  const { owner, repo } = parseRepository(env.GITHUB_REPOSITORY);

  const base = env.BASE_SHA;
  if (!base) {
    throw new Error(
      "BASE_SHA is required to compute an incremental diff. For manual runs, provide the base_sha workflow input."
    );
  }

  const head = env.HEAD_SHA || env.GITHUB_SHA;
  if (!head) {
    throw new Error("HEAD_SHA or GITHUB_SHA is required");
  }

  return {
    token,
    owner,
    repo,
    base,
    head,
    maxFileSizeBytes: Number(env.DOC_SYNC_MAX_FILE_SIZE_BYTES || DEFAULT_MAX_FILE_SIZE_BYTES),
    concurrency: Number(env.DOC_SYNC_CONCURRENCY || 3),
    retryMaxAttempts: Number(env.DOC_SYNC_RETRY_MAX_ATTEMPTS || 3),
    reportPath: env.DOC_SYNC_REPORT_PATH || "artifacts/doc-sync-report.json"
  };
}

module.exports = {
  loadConfig
};
