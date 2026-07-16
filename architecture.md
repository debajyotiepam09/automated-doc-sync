# Architecture: Automated Documentation Sync

## Overview
A GitHub Actions-driven pipeline that detects changes to README.md and
Swagger/OpenAPI specs on PR merge and incrementally syncs them to GitHub Wiki
using a Node.js sync engine and the GitHub API.

---

## Components

### 1. GitHub Actions Workflow
- **File:** `.github/workflows/doc-sync.yml`
- **Responsibility:** Trigger the pipeline on PR merge to `main`

### 2. Change Detector
- **File:** `src/changeDetector.js`
- **Responsibility:** Identify which README.md and Swagger files changed in the PR

### 3. Sync Engine
- **File:** `src/syncEngine.js`
- **Responsibility:** Read changed files and push content to GitHub Wiki via API

### 4. Entry Point
- **File:** `src/index.js`
- **Responsibility:** Orchestrate Change Detector and Sync Engine

### 5. GitHub Wiki
- **Responsibility:** Host the synced documentation pages

### 6. GitHub Secrets
- **Responsibility:** Securely store and inject the PAT token at runtime

---

## Technology Stack
- **Runtime:** Node.js / JavaScript
- **CI/CD:** GitHub Actions
- **GitHub API Client:** @octokit/rest
- **Authentication:** GitHub Secrets (PAT)
- **Destination:** GitHub Wiki

---

## Data Flow
1. PR is merged into `main`
2. GitHub Actions workflow is triggered
3. Change Detector fetches the list of changed files
4. Changed README.md and Swagger files are filtered
5. Sync Engine reads each changed file
6. Sync Engine pushes content to the corresponding GitHub Wiki page
7. GitHub Actions reports pass/fail status

---

## Folder Structure
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

## Updates from Design Review

- Change Detector uses Octokit Compare API to fetch changed files
- Sync Engine handles both page creation and updates
- All API calls include try/catch error handling
- Swagger/OpenAPI files converted to Markdown before Wiki sync
- Deleted files result in [DEPRECATED] tag on Wiki page
- GitHub Actions workflow includes concurrency lock
- Test job runs before sync job in CI pipeline
- index.js includes pre-flight Wiki access check