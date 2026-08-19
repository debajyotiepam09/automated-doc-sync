---
name: gitlab-operations
description: "GitLab operations for the booking-app repo: create feature/fix branches following BAA naming conventions; open Merge Requests with correct title format; check CI/CD pipeline status; fetch open MRs; add MR comments; approve MRs; protect branches. Use when: starting a new ticket, raising a PR, checking build status, reviewing pipeline failures, or managing branches for the BAA project."
argument-hint: "Describe the GitLab operation (e.g. 'create branch for BAA-101' or 'open MR for feature/BAA-101-interactive-tiles')"
---

# GitLab Operations Skill

## Repo Context

- **Remote**: `git.epam.com/shoban_babumanohar/booking-app`
- **Default branch**: `main`
- **MR approvals required**: 1
- **CI/CD**: GitLab CI/CD pipelines

## Branch Naming

| Type | Pattern |
|------|---------|
| Feature | `feature/BAA-<ticket>-<short-description>` |
| Bug fix | `fix/BAA-<ticket>-<short-description>` |
| Chore | `chore/BAA-<ticket>-<short-description>` |

Short description: lowercase, hyphen-separated, max 5 words.

## Commit Message Format

```
[BAA-<ticket>] <type>: <description>
```
Types: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`

## Procedures

### 1. Create a Branch

Use the `gitlab` MCP tool:
- `project`: `shoban_babumanohar/booking-app`
- `branch`: follow naming convention above
- `ref`: `main`

Confirm: branch URL, base commit SHA.

### 2. Open a Merge Request

Fields:
- `source_branch`: feature branch
- `target_branch`: `main`
- `title`: `[BAA-<ticket>] <type>: <description>` (max 72 chars)
- `description`: use the MR template below
- `labels`: matching issue type (feature, bug, test)
- `assignee`: current user

**MR Description Template**:
```markdown
## Summary
<What this MR does in 2–3 sentences>

## Jira Ticket
[BAA-XXX](https://your-org.atlassian.net/browse/BAA-XXX)

## Changes
- [ ] <change 1>
- [ ] <change 2>

## Testing
- [ ] Unit tests pass
- [ ] Playwright E2E tests pass
- [ ] Manual smoke test performed

## Screenshots (if UI change)
<attach or describe>
```

### 3. Check Pipeline Status

Query pipelines for a branch or MR and report:
- Overall status (passed / failed / running)
- Failed job names and log excerpts

### 4. Add MR Comment / Suggest Changes

Use the notes API to post inline or general review comments.

### 5. Approve / Merge an MR

Only approve after:
- CI pipeline is green
- At least 1 approval (check existing approvals first)
- All discussion threads resolved

## Output Format

Always return:
- MR/branch URL
- Key IDs (MR iid, branch name)
- Action performed and result
