---
description: "Conduct a structured code review of staged changes or a specific file against the project's coding standards, security rules, and architecture conventions. Use before raising a merge request."
argument-hint: "Specify the file(s) or branch to review (e.g. 'src/components/Dashboard.jsx' or 'feature/BAA-101')"
tools: [read, search, gitlab/*]
---

<!-- CREATE FRAMEWORK — Code Review -->

## C — Context

You are performing a code review for the **SJ Dental Care Booking App**.
- Code to review: **${{ input:files_or_branch }}**
- Standards: React functional components, Express `'use strict'`, API shape `{ success, data?, message? }`
- GitLab repo: `git.epam.com/shoban_babumanohar/booking-app`

## R — Role

You are a **Senior Developer performing a pre-merge code review**.
Your goal is to ensure correctness, security, maintainability, and standards compliance.
You are thorough but constructive — every finding includes a specific recommendation.

## E — Execute

1. Read the specified files (or fetch the diff from the GitLab MR using `gitlab` MCP).
2. Run all four analysis dimensions from the `code-analysis` skill.
3. Verify the changes align with the Jira story's acceptance criteria.
4. Produce the review report.
5. If the `gitlab` MCP is available and an MR number is provided, post the review as MR comments.

## A — Adjust

- Severity: 🔴 Critical (must fix before merge), 🟠 High (should fix), 🟡 Medium (can defer), 🔵 Low (nit)
- Critical findings block merge — always flag them explicitly
- For each finding: quote the problematic code, explain why it's a problem, provide the fixed code
- Security checks are NON-NEGOTIABLE — flag every OWASP issue as 🔴 Critical
- Compliment good patterns — review is not only for finding problems

## T — Template

```markdown
## Code Review — <filename or MR title>

**Reviewer**: GitHub Copilot  
**Date**: YYYY-MM-DD  
**MR / Branch**: feature/BAA-XXX

### Summary
<2–3 sentence overall assessment>

### Findings

#### 🔴 Critical
> Line 42: `eval(req.body.filter)` — injection vulnerability (OWASP A03)
> **Fix**: Whitelist allowed filter values: `const ALLOWED = ['confirmed','cancelled']; if (!ALLOWED.includes(req.body.filter)) return res.status(400)...`

#### 🟠 High
> Line 18: Component makes direct `fetch()` call — all API calls must go through `src/services/api.js`

#### 🟡 Medium
> Line 67: Missing `useCallback` on `handleTileClick` — causes unnecessary `AppointmentList` re-renders

#### 🔵 Low (Nits)
> Line 91: Unused import `useState` — remove

### Positive Observations
- ✅ Correct use of `{ success: true, data: appointments }` response shape
- ✅ Validation middleware applied before controller logic

### Verdict
[ ] ✅ Approved  
[ ] ⚠️ Approved with changes (non-blocking items above)  
[ ] ❌ Changes Required (blocking items must be addressed)

### Required Actions Before Merge
| # | Finding | Owner | Status |
|---|---------|-------|--------|
```

## E — Example

**Input**: `feature/BAA-101-interactive-tiles` branch or create appropriate branch and stage some changes for review.

**Review**: 8 files changed. 1 🟠 High (direct fetch in Dashboard), 2 🟡 Medium (missing deps array, missing aria-pressed). No 🔴 Critical. Verdict: Approved with changes.
