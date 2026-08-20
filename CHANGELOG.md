# Changelog

## [0.1.0] - 2026-08-20

### Added
- Incremental documentation sync pipeline for `README.md` and Swagger/OpenAPI specs
- `src/changeDetector.js` — Octokit Compare API integration with README and OpenAPI file classification
- `src/syncPlanner.js` — deterministic sync plan builder (upsert / deprecate / skip) with rename support
- `src/syncEngine.js` — idempotent wiki page executor with content-hash skip, bounded concurrency, and path-traversal protection
- `src/markdownTransformer.js` — Markdown renderer and Swagger/OpenAPI-to-Markdown converter
- `src/wikiMapper.js` — canonical source-to-wiki page path mapping
- `src/wikiRepo.js` — git transport layer for wiki checkout, commit, and push with PAT redaction
- `src/retry.js` — bounded exponential backoff with jitter for transient failures
- `src/secretMask.js` — runtime secret redaction for all log and error output
- `src/config.js` — strict environment variable loader with fail-closed validation
- `src/index.js` — orchestration entry point with pre-flight checks and non-zero exit on failure
- `.github/workflows/doc-sync.yml` — GitHub Actions workflow with test → sync job chain, concurrency lock, and artifact upload
- 20 unit tests across `changeDetector`, `syncEngine`, `config`, `wikiMapper`, and `wikiRepo`
- Full SDLC documentation: `requirements.md`, `architecture.md`, `design-review.md`, `impl-plan.md`
- `AGENTS.md` with Copilot agent definitions, workflow rules, and maintainer notes

### Security
- PAT redacted from all log output and git error messages via `secretMask`
- Path traversal protection enforced in `resolveWithinRoot` with test coverage
- Secrets injected via GitHub Secrets only — never hardcoded or logged

### Architecture
- Wiki sync uses git transport against `.wiki.git` remote (no REST API dependency)
- Workflow concurrency lock prevents overlapping sync runs on the same branch
- Idempotency via SHA-256 content-hash markers embedded in wiki page headers