# Architecture: Automated Documentation Sync

## 1. Overview
This system syncs repository documentation changes to GitHub Wiki after validated merges.
It focuses on reliability, idempotency, and security while keeping operational complexity low.

Primary sources:
- README.md files
- Swagger/OpenAPI specs

Primary destination:
- GitHub Wiki pages

---

## 2. Goals and Non-Goals

### Goals
- Sync changed documentation to Wiki with deterministic mapping.
- Avoid duplicate or conflicting writes under concurrent merges.
- Provide strong auditability for what changed, where, and why.
- Fail safely with retry and resumable behavior.

### Non-Goals
- Real-time sync on every commit.
- Rich Wiki formatting customization beyond normalized Markdown output.
- Bidirectional sync from Wiki back to repository.

---

## 3. Assumptions and Constraints
- Default sync trigger is merge into main branch.
- Branch protections are enabled for main.
- Repository has permission to write to Wiki.
- OpenAPI files may require conversion to Markdown before publication.

---

## 4. High-Level Components

### 4.1 GitHub Actions Workflow
- File: .github/workflows/doc-sync.yml
- Responsibility:
	- Trigger on merge to main.
	- Run tests before sync.
	- Enforce workflow concurrency lock to prevent overlapping sync runs.

### 4.2 Entry Point
- File: src/index.js
- Responsibility:
	- Pre-flight checks (Wiki access, token availability, config validation).
	- Orchestrate planner and sync engine.
	- Aggregate final run status.

### 4.3 Change Detector
- File: src/changeDetector.js
- Responsibility:
	- Use Octokit Compare API to fetch changed files.
	- Classify file actions: added, modified, removed, renamed.
	- Filter eligible docs based on include/exclude rules.

### 4.4 Sync Planner
- Responsibility:
	- Convert file changes into a deterministic sync plan.
	- Map source files to canonical Wiki page paths.
	- Decide operation per page: create, update, deprecate, skip.

### 4.5 Sync Engine
- File: src/syncEngine.js, src/wikiRepo.js
- Responsibility:
	- Render pages idempotently (create/update/deprecate) as local files inside a wiki git checkout, with bounded parallelism.
	- Mark deleted-source pages as [DEPRECATED].
	- Convert Swagger/OpenAPI to Markdown before publish.
	- Commit and push the wiki checkout once per run, using a retry policy with exponential backoff and jitter for transient git/network failures.
	- GitHub Wiki has no REST/GraphQL API, so all wiki reads/writes go through git against the `{repo}.wiki.git` remote rather than Octokit content endpoints.

### 4.6 State and Audit Output
- Responsibility:
	- Emit per-page result records (operation, status, reason, duration).
	- Store run summary artifact in workflow.
	- Provide reconciliation counts: planned, applied, skipped, failed.

### 4.7 Secret and Credential Management
- Responsibility:
	- Use GitHub Secrets for token injection.
	- Scope token to minimum write permissions required.
	- Enforce token rotation and expiration policy.

---

## 5. Technology Stack
- Runtime: Node.js / JavaScript
- CI/CD: GitHub Actions
- GitHub API client: @octokit/rest (change detection via Compare API, wiki-enabled preflight check)
- Wiki sync transport: git CLI against the repository's `.wiki.git` remote
- Authentication: GitHub Secrets (fine-grained PAT)
- Destination: GitHub Wiki

---

## 6. End-to-End Data Flow
1. Merge is completed into main.
2. Workflow starts and acquires concurrency lock.
3. Test job runs; sync job proceeds only on success.
4. Pre-flight checks validate credentials, permissions, and Wiki reachability.
5. Change detector retrieves changed files from compare API.
6. Planner builds deterministic operations for affected Wiki pages.
7. Sync engine executes operations with retries and bounded concurrency.
8. Results are aggregated into run summary and workflow status.

---

## 7. Idempotency, Concurrency, and Consistency
- Each source file maps to exactly one canonical Wiki page path.
- Sync operations are content-aware:
	- Skip update when rendered content hash is unchanged.
	- Update only when source-derived content changed.
- Workflow-level concurrency lock prevents overlapping sync runs on the same target branch.
- Partial failures are isolated at page-operation level; successful pages are not rolled back.

---

## 8. Security Architecture

### 8.1 Access Control
- Use least-privilege fine-grained PAT with only required repository/wiki write access.
- Keep token only in GitHub Secrets; never in code or logs.

### 8.2 Input Validation
- Validate OpenAPI schema before conversion.
- Enforce max file size and allowed file patterns.
- Run secret scanning on transformed content before publish.

### 8.3 Safe Failure Behavior
- Fail closed on pre-flight permission failures.
- Redact sensitive values from logs and error surfaces.

---

## 9. Scalability and Performance
- Use bounded concurrency for API calls (configurable worker count).
- Batch planning before execution to avoid repeated file-system/API work.
- Apply retry budget and backoff for API rate limits and transient 5xx errors.
- Support manual backfill trigger for large historical updates.

---

## 10. Reliability and Error Handling
- All external API interactions use try/catch with typed error classification.
- Retry only transient failures (rate limits, network timeouts, 5xx).
- Surface permanent failures with actionable codes (auth, permission, validation).
- Produce non-zero workflow exit code when one or more critical operations fail.

---

## 11. Observability
- Structured logs with correlation fields: runId, commitSha, pagePath, operation.
- Metrics from run summary:
	- pagesPlanned
	- pagesUpdated
	- pagesCreated
	- pagesDeprecated
	- pagesSkipped
	- pagesFailed
- Artifact output includes failure details for re-run targeting.

---

## 12. Test Strategy
- Unit tests:
	- change detection filtering and classification
	- page mapping and planner decisions
	- sync operation behavior and retries
- Integration tests:
	- mock Octokit responses for compare and wiki write flows
	- validate deprecate behavior on deleted files
- Pipeline gate:
	- tests must pass before sync job executes

---

## 13. Folder Structure
automated-doc-sync/
├── .github/workflows/doc-sync.yml
├── src/
│   ├── index.js
│   ├── changeDetector.js
│   └── syncEngine.js
├── tests/
│   ├── changeDetector.test.js
│   └── syncEngine.test.js
├── requirements.md
├── architecture.md
└── package.json

---

## 14. Design Decisions Incorporated
- Change detector uses Octokit Compare API.
- Sync engine supports page create and update.
- API calls include explicit error handling.
- Swagger/OpenAPI is transformed to Markdown before Wiki sync.
- Deleted source files result in [DEPRECATED] tag on Wiki page.
- Workflow includes concurrency lock.
- Test job runs before sync job.
- Entry point performs pre-flight Wiki access check.