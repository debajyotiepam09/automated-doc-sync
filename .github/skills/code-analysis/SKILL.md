---
name: code-analysis
description: "Static code analysis for the Automated Documentation Sync pipeline: review Node.js CommonJS modules against standards; identify security (path traversal, secret leaks), idempotency, error handling, and maintainability issues. Use when: reviewing code before commit, conducting design review, or auditing PRs."
argument-hint: "Specify the file(s) to analyze (e.g. 'src/syncEngine.js' or 'src/wikiRepo.js')"
---

# Code Analysis Skill — Automated Documentation Sync

## Analysis Dimensions

Run checks across four dimensions for every analysis:

### 1. Standards Compliance

**Frontend (React)**:
- Functional components only — no class components
- State managed via `useState` / `useReducer` / custom hooks
- No direct DOM manipulation — use refs only when unavoidable
- API calls through `src/services/api.js` only — no inline fetch
- CSS via CSS Modules — no inline styles except dynamic values

**Backend (Express)**:
- `'use strict'` at top of every file
- Input validated via `server/middleware/validate.js` before controller logic
- Error responses through `server/middleware/errorHandler.js`
- API response shape: `{ success: boolean, data?: any, message?: string }`
- No raw SQL — all data access through `server/database/db.js`

**General**:
- ES modules on frontend, CommonJS on backend — no mixing
- No hardcoded secrets or tokens
- No `console.log` left in production paths

### 2. Security (OWASP Top 10)

| ID | Check |
|----|-------|
| A01 | Broken Access Control — no unauthenticated writes that should be protected |
| A02 | Cryptographic Failures — no sensitive data in plain text |
| A03 | Injection — sanitize all user inputs; no eval/Function constructor |
| A05 | Security Misconfiguration — CORS not wildcard in prod |
| A06 | Vulnerable Components — flag deprecated packages |
| A07 | Identification Failures — phone/patient data handled carefully |

### 3. Performance

- React: unnecessary re-renders (missing `useMemo`/`useCallback` on stable references)
- `useEffect` dependency arrays — missing or overly broad deps
- Large component trees lacking code-splitting
- Express: missing response caching for static data

### 4. Maintainability

- Component responsibility (single responsibility principle)
- Prop drilling depth > 2 levels (suggest lifting state or context)
- Duplicated logic that should be a custom hook or utility

## Output Format

Return a structured findings table:

```
## Code Analysis: <filename>

### Summary
<1–2 sentence overall assessment>

### Findings

| # | Severity | Dimension | Line | Finding | Recommendation |
|---|----------|-----------|------|---------|----------------|
| 1 | 🔴 Critical | Security | 42 | ... | ... |
| 2 | 🟠 High | Standards | 18 | ... | ... |
| 3 | 🟡 Medium | Performance | 67 | ... | ... |
| 4 | 🔵 Low | Maintainability | 91 | ... | ... |

### Verdict
[ ] Approved  [ ] Approved with minor changes  [ ] Requires changes
```

Severity scale: 🔴 Critical → 🟠 High → 🟡 Medium → 🔵 Low → ✅ Pass
