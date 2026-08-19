const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { renderDocument } = require("./markdownTransformer");
const { maskSecrets } = require("./secretMask");

// NOTE: this pattern must stay consistent with the format written by
// decorateWithHash below (writer and reader of the same marker).
const HASH_PATTERN = /^<!-- doc-sync-hash:[a-f0-9]{64} -->\n\n?/i;

function hashContent(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

function decorateWithHash(content) {
  const hash = hashContent(content);
  return {
    hash,
    content: `<!-- doc-sync-hash:${hash} -->\n\n${content}`
  };
}

function stripHash(content) {
  return content.replace(HASH_PATTERN, "");
}

function resolveWithinRoot(rootDir, relativePath) {
  const normalizedRoot = path.resolve(rootDir);
  const resolved = path.resolve(normalizedRoot, relativePath);

  if (resolved !== normalizedRoot && !resolved.startsWith(normalizedRoot + path.sep)) {
    throw new Error(`Resolved path escapes root directory: ${relativePath}`);
  }

  return resolved;
}

async function readExistingPage(wikiDir, pagePath) {
  const filePath = resolveWithinRoot(wikiDir, `${pagePath}.md`);

  try {
    const content = await fs.readFile(filePath, "utf8");
    return { exists: true, content, filePath };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { exists: false, content: "", filePath };
    }

    throw error;
  }
}

async function writePage(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

function buildDeprecatedContent(pagePath, sourcePath) {
  return [
    "# [DEPRECATED]",
    "",
    `This page is deprecated because source file was removed or renamed: ${sourcePath}`,
    "",
    `Page: ${pagePath}`,
    `Updated: ${new Date().toISOString()}`
  ].join("\n");
}

async function ensureDirectory(reportPath) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
}

async function runWithConcurrency(items, workerCount, taskFn) {
  const workers = [];
  const queue = [...items];

  for (let i = 0; i < workerCount; i += 1) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const item = queue.shift();
          if (!item) {
            return;
          }

          await taskFn(item);
        }
      })()
    );
  }

  await Promise.all(workers);
}

async function executeSyncPlan({
  plan,
  workspaceDir,
  wikiDir,
  maxFileSizeBytes,
  maxConcurrency,
  reportPath
}) {
  const results = [];

  await runWithConcurrency(plan, maxConcurrency, async (operation) => {
    const start = Date.now();

    try {
      const existing = await readExistingPage(wikiDir, operation.pagePath);

      if (operation.type === "deprecate") {
        const deprecated = decorateWithHash(
          buildDeprecatedContent(operation.pagePath, operation.sourcePath)
        );
        const previous = existing.exists ? stripHash(existing.content) : null;

        if (previous !== null && hashContent(previous) === deprecated.hash) {
          results.push({
            pagePath: operation.pagePath,
            operation: operation.type,
            status: "skipped",
            reason: "content-unchanged",
            durationMs: Date.now() - start
          });
          return;
        }

        await writePage(existing.filePath, deprecated.content);
        results.push({
          pagePath: operation.pagePath,
          operation: operation.type,
          status: "success",
          durationMs: Date.now() - start
        });

        return;
      }

      const sourceAbsolutePath = resolveWithinRoot(workspaceDir, operation.sourcePath);
      const rendered = await renderDocument({
        sourcePath: operation.sourcePath,
        absolutePath: sourceAbsolutePath,
        docType: operation.docType,
        maxFileSizeBytes
      });
      const prepared = decorateWithHash(rendered);

      if (existing.exists) {
        const previous = stripHash(existing.content);
        if (hashContent(previous) === prepared.hash) {
          results.push({
            pagePath: operation.pagePath,
            operation: operation.type,
            status: "skipped",
            reason: "content-unchanged",
            durationMs: Date.now() - start
          });
          return;
        }
      }

      await writePage(existing.filePath, prepared.content);
      results.push({
        pagePath: operation.pagePath,
        operation: operation.type,
        status: "success",
        durationMs: Date.now() - start
      });
    } catch (error) {
      results.push({
        pagePath: operation.pagePath,
        operation: operation.type,
        status: "failed",
        errorCode: error.status || error.code || "UNKNOWN",
        errorMessage: maskSecrets(String(error.message || error)),
        durationMs: Date.now() - start
      });
    }
  });

  const summary = {
    pagesPlanned: plan.length,
    pagesCreatedOrUpdated: results.filter((item) => item.status === "success").length,
    pagesSkipped: results.filter((item) => item.status === "skipped").length,
    pagesFailed: results.filter((item) => item.status === "failed").length,
    results
  };

  await ensureDirectory(reportPath);
  await fs.writeFile(reportPath, JSON.stringify(summary, null, 2), "utf8");

  return summary;
}

module.exports = {
  executeSyncPlan
};
