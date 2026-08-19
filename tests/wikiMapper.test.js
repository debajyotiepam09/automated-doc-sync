const test = require("node:test");
const assert = require("node:assert/strict");

const { mapSourceToWikiPage } = require("../src/wikiMapper");

test("maps root README to Home", () => {
  assert.equal(mapSourceToWikiPage("README.md", "readme"), "Home");
});

test("maps nested README to a namespaced page", () => {
  assert.equal(mapSourceToWikiPage("services/payments/README.md", "readme"), "services/payments/README");
});

test("maps OpenAPI spec to the API namespace", () => {
  assert.equal(mapSourceToWikiPage("docs/openapi.yaml", "openapi"), "API/docs/openapi");
});

test("throws for unsupported docType", () => {
  assert.throws(() => mapSourceToWikiPage("README.md", "other"), /Unsupported docType/);
});
