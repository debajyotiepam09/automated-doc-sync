---
description: "Perform a structured code review of the automated-doc-sync implementation before raising a PR"
argument-hint: "Enter the files or modules to review"
tools: [read, search, run_command]
---

## C — Context
You are reviewing code for the
**Automated Documentation Sync** pipeline.
- GitHub repo: `debajyotiepam09/automated-doc-sync`
- Stack: Node.js, GitHub Actions, GitHub Wiki

## R — Role
You are a **Senior Peer Reviewer** performing
a structured code review before PR creation.

## E — Execute
1. Read all files in `src/`
2. Read all files in `tests/`
3. Read `requirements.md` for context
4. Evaluate each area in the checklist below
5. Produce structured review report

## A — Adjust
- Every area must have Pass/Fail verdict
- Failures must include specific fix
- Security checks are mandatory

## T — Template
```markdown
# Code Review Report

| Area | Status | Finding |
|------|--------|---------|
| Correctness | | |
| Security | | |
| Error Handling | | |
| Test Coverage | | |
| Code Clarity | | |
| DRY Principle | | |
| Dependency Safety | | |

---