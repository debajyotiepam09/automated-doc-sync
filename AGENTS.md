# AGENTS.md

## Project
Automated Documentation Sync pipeline.

This repository syncs changed README and Swagger/OpenAPI files from the source repository to GitHub Wiki after PR merge to `main`.

## Scope
- In scope:
  - Incremental sync only for changed docs.
  - README and OpenAPI/Swagger source types.
  - GitHub Actions-based CI pipeline.
- Out of scope:
  - Full repo re-sync on every run.
  - Slack/email notifications.
  - Non-Node.js implementation.

## Workflow Rules
- Primary trigger: merged PRs to `main`.
- Manual trigger: `workflow_dispatch` with `base_sha` and optional `head_sha`.
- CI job order:
  1. `test`
  2. `sync`
- Concurrency lock must remain enabled in workflow.

## Coding Standards
- Language: Node.js (CommonJS).
- Keep modules focused and single-purpose.
- Prefer explicit errors over silent no-op behavior.
- Preserve idempotency behavior:
  - add hash marker
  - skip unchanged content
- Keep path handling safe:
  - do not allow writes outside workspace/wiki root.

## Security Guardrails
- Never hardcode tokens.
- Only use `DOC_SYNC_TOKEN` from GitHub Secrets.
- Redact sensitive strings in all logs and artifacts.
- Keep least-privilege job permissions in workflows.
- Keep dependency audit in CI.

## Wiki Sync Rules
- Do not attempt Wiki REST content APIs.
- Use git transport against `{owner}/{repo}.wiki.git`.
- For empty wiki repos, initialize local git repo and push first commit.
- Commit once per run when there are changes.

## Error Handling Rules
- Classify transient vs permanent failures.
- Retry only transient failures with bounded exponential backoff.
- Fail closed on missing required inputs (`DOC_SYNC_TOKEN`, `BASE_SHA`, `HEAD_SHA`/`GITHUB_SHA`).
- Return non-zero exit code if any critical sync operation fails.

## Testing Expectations
- Minimum checks before merge:
  - `npm test` passes.
  - Sync planner behavior covered (rename/remove/upsert).
  - Sync engine behavior covered (create/update/skip/deprecate).
  - Config validation covered.
  - Path traversal protections covered.
- Add tests for any behavior change, bug fix, or security patch.

## Review Checklist
- Requirements alignment with `requirements.md`.
- Architecture alignment with `architecture.md` and `design-review.md`.
- No secret leakage in logs/artifacts.
- Workflow remains deterministic and dependency-ordered.
- New changes do not break incremental sync semantics.

## Maintainer Notes
- Keep this file updated when architecture or workflow contracts change.
- If introducing new automation, document triggers, inputs, and failure modes here.
