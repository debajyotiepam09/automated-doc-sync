# Automated Documentation Sync — Project Instructions

## Project Overview

**Project**: Automated Documentation Sync Pipeline  
**GitHub repo**: `github.com/<owner>/<repo>`  
**Purpose**: Automatically sync README.md and Swagger/OpenAPI specs to GitHub Wiki on PR merge  
**Scope**: Incremental sync only; README + OpenAPI/Swagger sources only  

## Tech Stack

| Component | Technology |
|-----------|------------|\n| Runtime | Node.js 18+, CommonJS |\n| Package Manager | npm |\n| CI/CD | GitHub Actions |\n| Wiki Sync | Git transport (no REST API) |\n| Testing | Jest (unit), Node.js CLI validation |\n| Linting | ESLint |

## Project Structure Conventions

- All modules live in `src/` (Node.js CommonJS)
- Utilities: `retry.js`, `secretMask.js`, `config.js`
- Sync logic: `changeDetector.js`, `syncPlanner.js`, `syncEngine.js`
- Wiki integration: `wikiMapper.js`, `wikiRepo.js`
- Transformers: `markdownTransformer.js`
- Orchestration: `index.js`
- Tests in `tests/` (Jest, CommonJS)
- GitHub Actions workflows in `.github/workflows/`

##**Language**: JavaScript (CommonJS, no TypeScript)
- **Every file starts with**: `'use strict';`
- **No external npm packages** without documented ADR
- **Path safety**: No writes outside workspace or wiki root; validate `path.join()` results
- **Secret handling**: All tokens/passwords redacted in logs via `secretMask` utility
- **Idempotency**: Sync engine preserves hash markers in markdown; operations are idempotent
- **Error classification**: Transient vs permanent; bounded exponential backoff retry
- **Logging**: No `console.log` in production paths; use structured logging with secret masking
- No direct DOM manipulation in React — always use state and refs
- API responHub Conventions

- Branch naming: `feature/<description>`, `fix/<description>` (no ticket prefix)
- Commit message: `[SYNC] <type>: <description>` (types: feat, fix, test, docs, refactor, chore)
- PR title: `[SYNC] <type>: <description>`
- Target branch: `main`
- CI jobs: `test` (run first) → `sync` (run second); concurrency lock enabled

## GitHub Actions Workflow Conventions

- Workflow file: `.github/workflows/doc-sync.yml`
- Primary trigger: merged PR to `main` (automatic sync)
- Manual trigger: `workflow_dispatch` with `base_sha` and optional `head_sha`
- Job order: `test` job must complete before `sync` job
- Concurrency lock: MUST remain enabled to prevent race conditions
- Only read `DOC_SYNC_TOKEN` from GitHub Secrets; never hardcode

## Security & Stability Guardrails

- **Never commit secrets**: No tokens, passwords, or API keys in code
- **Path traversal protection**: Reject any path that tries to escape root
- **Token handling**: Only use environment variables; redact in all logs
- **Idempotency markers**: Use hash markers in markdown to track synced content
- **Error boundaries**: Classify failures; retry only transient errors (bounded)
- **Workflow integrity**: Preserve job order and concurrency lock; no manual overridesge Title>`
- All architecture decisions recorded as Architecture Decision Records (ADRs)
- Test plans and test results documented per sprint
