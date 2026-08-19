const test = require("node:test");
const assert = require("node:assert/strict");

const { detectChangedDocs } = require("../src/changeDetector");

test("detectChangedDocs filters README and OpenAPI files", async () => {
  const octokit = {
    repos: {
      compareCommitsWithBasehead: async () => ({
        data: {
          files: [
            { status: "modified", filename: "README.md" },
            { status: "added", filename: "services/payments/openapi.yaml" },
            { status: "modified", filename: "src/index.js" },
            { status: "removed", filename: "docs/swagger.json" }
          ]
        }
      })
    }
  };

  const changes = await detectChangedDocs({
    octokit,
    owner: "acme",
    repo: "repo",
    base: "abc",
    head: "def"
  });

  assert.equal(changes.length, 3);
  assert.deepEqual(changes.map((item) => item.docType), ["readme", "openapi", "openapi"]);
});

test("detectChangedDocs handles renamed supported files", async () => {
  const octokit = {
    repos: {
      compareCommitsWithBasehead: async () => ({
        data: {
          files: [
            {
              status: "renamed",
              filename: "docs/new/openapi.yaml",
              previous_filename: "docs/old/swagger.yaml"
            }
          ]
        }
      })
    }
  };

  const changes = await detectChangedDocs({
    octokit,
    owner: "acme",
    repo: "repo",
    base: "abc",
    head: "def"
  });

  assert.equal(changes.length, 1);
  assert.equal(changes[0].status, "renamed");
  assert.equal(changes[0].previousPath, "docs/old/swagger.yaml");
  assert.equal(changes[0].docType, "openapi");
});
