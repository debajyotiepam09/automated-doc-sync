const fs = require("node:fs/promises");
const yaml = require("js-yaml");

function normalizeLineEndings(text) {
  return text.replace(/\r\n/g, "\n");
}

async function readTextFile(filePath, maxFileSizeBytes) {
  const stats = await fs.stat(filePath);
  if (stats.size > maxFileSizeBytes) {
    throw new Error(`File exceeds size limit: ${filePath}`);
  }

  const raw = await fs.readFile(filePath, "utf8");
  return normalizeLineEndings(raw);
}

function renderOpenApiMarkdown(spec, sourcePath) {
  const info = spec.info || {};
  const title = info.title || sourcePath;
  const version = info.version || "unknown";
  const paths = spec.paths || {};

  const lines = [];
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`Source: ${sourcePath}`);
  lines.push("");
  lines.push(`Version: ${version}`);
  lines.push("");

  const pathNames = Object.keys(paths);
  if (pathNames.length === 0) {
    lines.push("No paths found in specification.");
    return lines.join("\n");
  }

  lines.push("## Endpoints");
  lines.push("");
  lines.push("| Method | Path | Summary |");
  lines.push("|---|---|---|");

  for (const apiPath of pathNames) {
    const operations = paths[apiPath] || {};
    for (const method of Object.keys(operations)) {
      const op = operations[method] || {};
      const summary = (op.summary || "").replace(/\|/g, "\\|");
      lines.push(`| ${method.toUpperCase()} | ${apiPath} | ${summary} |`);
    }
  }

  return lines.join("\n");
}

function parseSpec(text, sourcePath) {
  if (sourcePath.toLowerCase().endsWith(".json")) {
    return JSON.parse(text);
  }

  return yaml.load(text);
}

async function renderDocument({ sourcePath, absolutePath, docType, maxFileSizeBytes }) {
  const text = await readTextFile(absolutePath, maxFileSizeBytes);

  if (docType === "readme") {
    return text;
  }

  if (docType === "openapi") {
    const spec = parseSpec(text, sourcePath);
    return renderOpenApiMarkdown(spec, sourcePath);
  }

  throw new Error(`Unsupported docType: ${docType}`);
}

module.exports = {
  renderDocument
};
