const path = require("node:path");

const DOC_STATUS = {
  added: "added",
  modified: "modified",
  removed: "removed",
  renamed: "renamed"
};

function isReadme(filePath) {
  return path.basename(filePath).toLowerCase() === "readme.md";
}

function isOpenApiPath(filePath) {
  const lower = filePath.toLowerCase();
  const ext = path.extname(lower);
  const validExt = ext === ".json" || ext === ".yaml" || ext === ".yml";
  if (!validExt) {
    return false;
  }

  return lower.includes("openapi") || lower.includes("swagger");
}

function getDocType(filePath) {
  if (isReadme(filePath)) {
    return "readme";
  }

  if (isOpenApiPath(filePath)) {
    return "openapi";
  }

  return null;
}

function isSupportedStatus(status) {
  return status in DOC_STATUS;
}

async function detectChangedDocs({ octokit, owner, repo, base, head }) {
  if (!base || !head) {
    throw new Error("base and head commit SHAs are required to detect changes");
  }

  const response = await octokit.repos.compareCommitsWithBasehead({
    owner,
    repo,
    basehead: `${base}...${head}`
  });

  const files = response.data.files || [];
  const results = [];

  for (const file of files) {
    if (!isSupportedStatus(file.status)) {
      continue;
    }

    const currentType = getDocType(file.filename);
    const previousType = file.previous_filename ? getDocType(file.previous_filename) : null;

    if (!currentType && !previousType) {
      continue;
    }

    results.push({
      status: file.status,
      path: file.filename,
      previousPath: file.previous_filename || null,
      docType: currentType || previousType
    });
  }

  return results;
}

module.exports = {
  detectChangedDocs,
  getDocType
};
