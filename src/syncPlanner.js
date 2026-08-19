const { mapSourceToWikiPage } = require("./wikiMapper");

function buildSyncPlan(changes) {
  const plan = [];

  for (const change of changes) {
    if (change.status === "renamed" && change.previousPath) {
      const oldPage = mapSourceToWikiPage(change.previousPath, change.docType);
      plan.push({
        type: "deprecate",
        pagePath: oldPage,
        sourcePath: change.previousPath,
        docType: change.docType,
        reason: "source-renamed"
      });
    }

    if (change.status === "removed") {
      const pagePath = mapSourceToWikiPage(change.path, change.docType);
      plan.push({
        type: "deprecate",
        pagePath,
        sourcePath: change.path,
        docType: change.docType,
        reason: "source-removed"
      });
      continue;
    }

    const pagePath = mapSourceToWikiPage(change.path, change.docType);
    plan.push({
      type: "upsert",
      pagePath,
      sourcePath: change.path,
      docType: change.docType,
      reason: "source-changed"
    });
  }

  return dedupePlan(plan);
}

function dedupePlan(plan) {
  const byKey = new Map();

  for (const item of plan) {
    const key = `${item.type}:${item.pagePath}`;
    byKey.set(key, item);
  }

  return [...byKey.values()];
}

module.exports = {
  buildSyncPlan
};
