---
name: test-generation
description: "Test generation for the SJ Dental Care booking app: write Jest unit tests for React components and Express controllers; generate BDD Gherkin test cases from acceptance criteria; write Playwright E2E automation scripts (TypeScript) targeting localhost:5000 with self-healing selectors. Use when: adding unit tests to a new component, converting Jira acceptance criteria to test cases, writing Playwright automation for an E2E scenario, or improving test coverage for an existing module."
argument-hint: "Describe what to test (e.g. 'unit tests for Dashboard.jsx' or 'Playwright script for ACS-02 tile click filter')"
---

# Test Generation Skill

## Testing Stack

| Layer | Tool | Language | Location | Run Command |
|-------|------|----------|----------|-------------|
| Unit (frontend) | Vitest + React Testing Library | JavaScript | `src/__tests__/` | `npm test -- --run` |
| Unit (backend) | Jest | JavaScript | `server/__tests__/` | `cd server && npm test` |
| E2E | Playwright | **TypeScript** | `tests/` | `npx playwright test` |

**Base URL**: `http://localhost:5000`  
**API Base**: `http://localhost:3001/api`

---

## Automation Feasibility Classification

Before writing any test, classify each ACS item. Mark **Automate? = No** if ANY condition below is true:

| # | Non-automatable Condition | Example |
|---|--------------------------|---------|
| 1 | Requires physical hardware / peripheral | Card reader, biometric scanner |
| 2 | Requires subjective human judgement | Visual design sign-off, UX review |
| 3 | Depends on live third-party with no sandbox | Real SMS gateway, live payment |
| 4 | Requires regulatory sign-off or wet signature | DPO consent review |
| 5 | Outcome is non-deterministic and cannot be mocked | Unseeded random algorithm |
| 6 | Requires cross-browser visual comparison (no pixel-diff tool) | "Looks right on IE11" |

All non-automatable cases go into `manual-test-cases.md`.

---

## Unit Test Rules

- Use `vi.resetAllMocks()` (not `clearAllMocks`) in `beforeEach` — prevents mock bleed
- Every mock must have an **explicit return value** — bare `vi.fn()` without `.mockResolvedValue()` is forbidden
- Default mock return values in `beforeEach`; override per-test only when needed
- **Mandatory coverage per file**: happy path · loading/pending state · error state · empty-data state
- Backend controllers: always inject `next` and verify `next(error)` is called on throws
- Full patterns → `/generate-unit-tests` prompt

---

## Playwright / E2E Rules

- All E2E files: `.spec.ts` (TypeScript)
- **Selector priority**: `getByRole` → `getByLabel` → `getByText` → `getByTestId` → CSS (last resort)
- Every locator uses `resilientLocator` with ≥ 2 fallback strategies → `tests/helpers/resilientLocator.ts`
- `waitForLoadState('networkidle')` before assertions on API-driven content
- `expect(locator).toBeVisible()` — never `.toBeTruthy()`
- Each `test()` is independent — no shared mutable state
- Every `test.describe` includes at least one negative test
- Failure hook captures screenshot + appends to `tests/failure-log.json` → `tests/global-setup.ts`
- Full patterns + helper code → `/write-automation-script` prompt

---

## Manual Test Cases Rules

- Non-automatable cases documented in `manual-test-cases.md` at project root
- Each entry: ACS ref · priority · reason · preconditions · step table · pass/fail criteria · evidence note
- After execution: attach screenshot/evidence to Jira ticket
- Full format template → `/create-test-cases` prompt

---

## Prompt Reference

| Task | Use Prompt |
|------|-----------|
| BDD Gherkin + feasibility classification | `/create-test-cases` |
| Unit tests (frontend + backend) | `/generate-unit-tests` |
| Playwright E2E + self-healing | `/write-automation-script` |
