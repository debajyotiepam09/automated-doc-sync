const test = require("node:test");
const assert = require("node:assert/strict");

const { commitAndPush } = require("../src/wikiRepo");

function createFakeExec(scriptedResponses) {
  const calls = [];
  const execFn = async (command, args) => {
    calls.push(args.join(" "));
    const response = scriptedResponses[args[0]];

    if (response instanceof Error) {
      throw response;
    }

    return response || { stdout: "", stderr: "" };
  };
  execFn.calls = calls;
  return execFn;
}

test("commitAndPush skips push when there are no pending changes", async () => {
  const execFn = createFakeExec({
    add: { stdout: "", stderr: "" },
    status: { stdout: "", stderr: "" }
  });

  const result = await commitAndPush({ dir: "/tmp/fake", message: "docs: sync", branch: "master", execFn });

  assert.equal(result.pushed, false);
  assert.ok(!execFn.calls.some((call) => call.startsWith("push")));
});

test("commitAndPush commits and pushes when files changed", async () => {
  const execFn = createFakeExec({
    add: { stdout: "", stderr: "" },
    status: { stdout: " M Home.md\n", stderr: "" },
    commit: { stdout: "", stderr: "" },
    push: { stdout: "", stderr: "" }
  });

  const result = await commitAndPush({ dir: "/tmp/fake", message: "docs: sync", branch: "master", execFn });

  assert.equal(result.pushed, true);
  assert.ok(execFn.calls.some((call) => call.startsWith("push origin HEAD:master")));
});

test("commitAndPush redacts the PAT from push error output", async () => {
  const token = "secret-token-123456789012345";
  const execFn = async (command, args) => {
    if (args[0] === "add" || args[0] === "commit") {
      return { stdout: "", stderr: "" };
    }

    if (args[0] === "status") {
      return { stdout: " M Home.md\n", stderr: "" };
    }

    if (args[0] === "push") {
      const error = new Error(
        `fatal: unable to access 'https://x-access-token:${token}@github.com/acme/repo.wiki.git/'`
      );
      error.stderr = error.message;
      throw error;
    }

    throw new Error(`unexpected git command: ${args.join(" ")}`);
  };

  await assert.rejects(
    commitAndPush({ dir: "/tmp/fake", message: "docs: sync", branch: "master", token, execFn }),
    (error) => {
      assert.ok(!error.message.includes(token), "token should be redacted from error message");
      assert.ok(error.message.includes("[REDACTED]"));
      return true;
    }
  );
});
