const path = require("node:path");

function normalizePath(sourcePath) {
  return sourcePath.replace(/\\/g, "/");
}

function sanitizeSegment(input) {
  return input
    .replace(/[^a-zA-Z0-9/_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function mapReadmeToWikiPage(sourcePath) {
  const normalized = normalizePath(sourcePath);

  if (normalized.toLowerCase() === "readme.md") {
    return "Home";
  }

  const directory = path.posix.dirname(normalized);
  return `${sanitizeSegment(directory)}/README`;
}

function mapOpenApiToWikiPage(sourcePath) {
  const normalized = normalizePath(sourcePath);
  const withoutExt = normalized.replace(/\.(json|yaml|yml)$/i, "");
  return `API/${sanitizeSegment(withoutExt)}`;
}

function mapSourceToWikiPage(sourcePath, docType) {
  if (docType === "readme") {
    return mapReadmeToWikiPage(sourcePath);
  }

  if (docType === "openapi") {
    return mapOpenApiToWikiPage(sourcePath);
  }

  throw new Error(`Unsupported docType for mapping: ${docType}`);
}

module.exports = {
  mapSourceToWikiPage
};
