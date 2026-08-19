const test = require("node:test");
const assert = require("node:assert/strict");

const { loadConfig } = require("../src/config");

function baseEnv(overrides = {}) {
  return {
    DOC_SYNC_TOKEN: "token-value",
    GITHUB_REPOSITORY: "acme/repo",
    BASE_SHA: "abc123",
    HEAD_SHA: "def456",
    ...overrides
  };
}

test("loadConfig throws when token missing", () => {
  const env = baseEnv({ DOC_SYNC_TOKEN: undefined });
  assert.throws(() => loadConfig(env), /DOC_SYNC_TOKEN is required/);
});

test("loadConfig throws when repository format invalid", () => {
  const env = baseEnv({ GITHUB_REPOSITORY: "invalid" });
  assert.throws(() => loadConfig(env), /owner\/repo format/);
});

test("loadConfig throws when base sha missing instead of silently continuing", () => {
  const env = baseEnv({ BASE_SHA: undefined });
  assert.throws(() => loadConfig(env), /BASE_SHA is required/);
});

test("loadConfig throws when head sha missing", () => {
  const env = baseEnv({ HEAD_SHA: undefined, GITHUB_SHA: undefined });
  assert.throws(() => loadConfig(env), /HEAD_SHA or GITHUB_SHA is required/);
});

test("loadConfig applies sane defaults", () => {
  const config = loadConfig(baseEnv());
  assert.equal(config.owner, "acme");
  assert.equal(config.repo, "repo");
  assert.equal(config.concurrency, 3);
  assert.equal(config.retryMaxAttempts, 3);
  assert.equal(config.reportPath, "artifacts/doc-sync-report.json");
});
