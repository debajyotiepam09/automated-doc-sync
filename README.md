# Automated Documentation Sync

An Agentic SDLC pipeline that automatically syncs README.md 
and Swagger/OpenAPI documentation to GitHub Wiki whenever 
a Pull Request is merged into main.

## How It Works
1. PR is merged into main
2. GitHub Actions workflow triggers
3. Changed README and Swagger files are detected
4. Files are synced to GitHub Wiki automatically

## Setup
1. Enable GitHub Wiki on your repository
2. Add DOC_SYNC_TOKEN to GitHub Secrets
3. Merge a PR with README.md or Swagger changes

## Tech Stack
- Node.js
- @octokit/rest
- GitHub Actions
- GitHub Wiki

## Running Tests
npm test

## Project Structure
- src/ — Core sync pipeline modules
- tests/ — Unit and integration tests
- .github/agents/ — Copilot agent definitions
- .github/prompts/ — Reusable Copilot prompts
- .github/skills/ — Copilot skill definitions
- .github/workflows/ — GitHub Actions workflow