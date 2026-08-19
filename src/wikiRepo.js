const fs = require("node:fs/promises");
const { execFile } = require("node:child_process");

function run(command, args, options) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { ...options, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}

async function git(args, cwd, execFn = run) {
  return execFn("git", args, { cwd });
}

function buildAuthenticatedUrl({ owner, repo, token }) {
  return `https://x-access-token:${encodeURIComponent(token)}@github.com/${owner}/${repo}.wiki.git`;
}

function isEmptyRepositoryError(error) {
  const message = String(error.stderr || error.message || "");
  return /repository not found|remote hung up|does not appear to be a git repository/i.test(message);
}

// GitHub Wiki has no REST/GraphQL API. Sync is done via git, which means the
// PAT is embedded in the remote URL passed to the git process. Git sometimes
// echoes the remote URL back in clone/push error messages, so we scrub the
// raw token out of any error surfaced from a git command before it can reach
// logs or the run summary artifact.
function redactToken(error, token) {
  if (!token) {
    return error;
  }

  for (const field of ["message", "stderr", "stdout", "cmd"]) {
    if (typeof error[field] === "string") {
      error[field] = error[field].split(token).join("[REDACTED]");
    }
  }

  return error;
}

async function getCurrentBranch(dir, execFn) {
  const { stdout } = await git(["rev-parse", "--abbrev-ref", "HEAD"], dir, execFn);
  return stdout.trim();
}

async function prepareWikiCheckout({ owner, repo, token, workDir, execFn = run }) {
  const url = buildAuthenticatedUrl({ owner, repo, token });
  await fs.mkdir(workDir, { recursive: true });

  let branch = "master";

  try {
    await git(["clone", "--depth", "1", url, "."], workDir, execFn);
    branch = await getCurrentBranch(workDir, execFn);
  } catch (error) {
    const sanitized = redactToken(error, token);

    if (!isEmptyRepositoryError(sanitized)) {
      throw sanitized;
    }

    // Brand-new wikis have no commits yet, so cloning fails. Initialize a
    // fresh local repo instead and point it at the wiki remote.
    await git(["init", "-b", branch], workDir, execFn);
    await git(["remote", "add", "origin", url], workDir, execFn);
  }

  await git(["config", "user.email", "doc-sync-bot@users.noreply.github.com"], workDir, execFn);
  await git(["config", "user.name", "doc-sync-bot"], workDir, execFn);

  return { dir: workDir, branch };
}

async function hasPendingChanges(dir, execFn = run) {
  const { stdout } = await git(["status", "--porcelain"], dir, execFn);
  return stdout.trim().length > 0;
}

async function commitAndPush({ dir, message, branch, token, execFn = run }) {
  await git(["add", "-A"], dir, execFn);

  const changed = await hasPendingChanges(dir, execFn);
  if (!changed) {
    return { pushed: false };
  }

  await git(["commit", "-m", message], dir, execFn);

  try {
    await git(["push", "origin", `HEAD:${branch}`], dir, execFn);
  } catch (error) {
    throw redactToken(error, token);
  }

  return { pushed: true };
}

module.exports = {
  prepareWikiCheckout,
  commitAndPush,
  hasPendingChanges
};
