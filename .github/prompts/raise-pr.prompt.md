---
description: "Raise a GitLab Merge Request for a completed feature branch, linking it to the Jira ticket and filling in the MR description. Use when implementation and tests are done and you're ready for review."
argument-hint: "Enter the story ID and branch name (e.g. 'BAA-101 feature/BAA-101-interactive-tiles')"
tools: [read, search, gitlab/*, atlassian/*]
---

<!-- CREATE FRAMEWORK — Raise Merge Request -->

## C — Context

You are raising a Merge Request for the **SJ Dental Care Booking App**.
- Story: **${{ input:story_id }}**, Branch: **${{ input:branch_name }}**
- GitLab repo: `git.epam.com/shoban_babumanohar/booking-app`
- Target branch: `main`
- MR title format: `[BAA-XXX] <type>: <description>` (max 72 chars)
- Approval required: 1

## R — Role

You are a **Developer raising a well-documented MR** that gives reviewers all the context they need.
A good MR description saves review time and prevents approval delays.

## E — Execute

1. Fetch the story from Jira (`atlassian` MCP) to get the title, description, and acceptance criteria.
2. Read the changed files (or fetch the branch diff via `gitlab` MCP) to summarize changes.
3. Build the MR description from the template below.
4. Create the MR via `gitlab` MCP with all fields filled.
5. Add a remote link on the Jira issue pointing to the new MR.
6. Transition the Jira ticket to `In Review`.
7. Return the MR URL and Jira ticket URL.

## A — Adjust

- MR title MUST start with `[BAA-XXX]` — this is how Jira links are resolved
- Keep the summary to 2–3 sentences — reviewers should understand in 30 seconds
- Testing section must reflect tests actually written, not aspirational
- If UI changed, screenshots or description of visible change is required
- Do NOT include personal access tokens or secrets in the description

## T — Template

```markdown
## Summary
<2–3 sentences describing what this MR does and why>

## Jira Ticket
[BAA-XXX](https://your-org.atlassian.net/browse/BAA-XXX) — <Story title>

## Changes
### Frontend
- [ ] <component change 1>
- [ ] <component change 2>

### Backend
- [ ] <endpoint/controller change>

### Tests
- [ ] Jest unit tests: `src/__tests__/<Component>.test.jsx`
- [ ] Playwright E2E: `tests/<scenario>.spec.js`

## How to Test
1. `npm install && npm run dev` — start frontend on :5000
2. `cd server && npm install && node index.js` — start API on :3001
3. Navigate to `http://localhost:5000`
4. <Specific steps matching ACS scenarios>

## Screenshots (UI changes)
<Attach screenshot or describe the before/after>

## Checklist
- [ ] `npm run lint` passes
- [ ] All unit tests pass
- [ ] Playwright E2E tests pass
- [ ] No console.log left in production code
- [ ] API responses use `{ success, data?, message? }` shape
```

## E — Example

**Input**: BAA-101, feature/BAA-101-interactive-tiles

**Output**: MR created at `git.epam.com/.../merge_requests/12`
Title: `[BAA-101] feat: interactive dashboard tile filters`
Jira BAA-101 remote link added. Status transitioned to `In Review`.
