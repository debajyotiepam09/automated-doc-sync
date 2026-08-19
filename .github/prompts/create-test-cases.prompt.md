---
description: "Generate BDD Gherkin test cases from Jira acceptance criteria for a story, with automation feasibility assessment and manual-test-cases.md output. Use when writing the sprint test plan or preparing test cases before automation."
argument-hint: "Enter the Jira story ID (e.g. BAA-101)"
tools: [atlassian/*, read, edit]
---

<!-- CREATE FRAMEWORK — BDD Test Case Generation + Feasibility -->

## C — Context

You are writing a test plan for **${{ input:story_id }}** in the **SJ Dental Care Booking App**.
- Fetch the story and its acceptance criteria from Jira (`atlassian` MCP).
- App URL: `http://localhost:5000`; API: `http://localhost:3001/api`
- Test data lives in `server/database/data.json`
- Existing ACS IDs follow pattern `ACS-NN` within the story

## R — Role

You are a **QA Engineer** writing a formal test plan for a Sprint 1 story.
You ensure every acceptance criterion has at least one test case, edge cases are covered, and
every test is classified by automation feasibility before any code is written.

## E — Execute

1. Fetch story `${{ input:story_id }}` from Jira to read its acceptance criteria.
2. For each ACS scenario, write a formal Gherkin test case.
3. Add additional edge-case test cases not explicitly in the ACS.
4. Classify each test by: Priority (High/Medium/Low), Type (Functional/Negative/Edge), and **Automate? Yes/No + Reason** using the feasibility criteria below.
5. Output the complete test case table + Gherkin feature file.
6. Append all **non-automatable** test cases to `manual-test-cases.md` using the manual TC template.

## A — Adjust

- Every ACS scenario gets exactly one primary test case
- Add at least 2 negative/edge test cases per ACS group
- Use `Background` for common preconditions to avoid repetition
- All scenario titles must be unique and descriptive

### Automation Feasibility Criteria

Mark **Automate? = No** if ANY of the following is true:

| # | Condition | Example |
|---|-----------|---------|
| 1 | Requires physical hardware / peripheral | Card reader, biometric scanner |
| 2 | Requires subjective human judgement | Visual design sign-off, UX review |
| 3 | Depends on live third-party with no sandbox | Real SMS gateway, live payment |
| 4 | Requires regulatory sign-off or wet signature | DPO consent review |
| 5 | Outcome is non-deterministic and cannot be mocked | Unseeded random algorithm |
| 6 | Requires cross-browser visual comparison (no pixel-diff tool) | "Looks right on IE11" |

All other test cases should be **Automate? = Yes**.

## T — Template

```markdown
## Test Plan — BAA-XXX: <Story Title>

### Test Case Summary

| TC ID | ACS Ref | Title | Priority | Type | Automate? | Reason (if No) |
|-------|---------|-------|----------|------|-----------|----------------|
| TC-01 | ACS-01.1 | Tiles render on page load | High | Functional | Yes | — |
| TC-02 | ACS-01.2 | Tiles show placeholder while loading | Medium | Functional | Yes | — |
| TC-03 | — | Tiles show zero when no appointments exist | Medium | Edge | Yes | — |
| TC-04 | ACS-02.1 | Clicking tile highlights it and filters list | High | Functional | Yes | — |
| TC-05 | ACS-02.3 | Clicking active tile again clears filter | High | Functional | Yes | — |
| TC-06 | — | Rapid tile switching does not cause race condition | Low | Edge | No | Non-deterministic timing; requires human observation |

---

### Gherkin Feature File

\`\`\`gherkin
Feature: <Story Title>
  As a <role>
  I want <feature>
  So that <benefit>

  Background:
    Given the SJ Dental Care booking portal is open
    And the backend server is running on port 3001
    And the database contains test appointment data

  # ACS-01 Scenarios
  Scenario: TC-01 — Tiles render on page load
    Given I navigate to the dashboard
    When the page finishes loading
    Then I see four stat tiles: "Total Confirmed", "Today's Slots", "Upcoming", "Cancelled"
    And each tile displays a numeric count

  Scenario: TC-02 — Tiles show placeholder while loading
    Given the stats API has not yet responded
    When the dashboard page is loading
    Then each tile displays "—" as a placeholder

  # Edge cases
  Scenario: TC-03 — Zero state when no appointments
    Given the database has no appointments
    When I open the dashboard
    Then all stat tiles show "0"
    And no appointments appear in the list
\`\`\`

---

### Manual Test Cases (non-automatable)

> Append each block below to `manual-test-cases.md` in the project root.

\`\`\`markdown
## TC-NN — <Title>

**ACS Reference**: ACS-XX
**Priority**: High / Med / Low
**Story**: [BAA-XXX](<jira-url>)
**Reason Not Automatable**: <one-sentence explanation>

### Preconditions
- <list each precondition>

### Test Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1    | <action> | <expected outcome> |
| 2    | <action> | <expected outcome> |

### Pass / Fail Criteria
- **PASS**: <criteria>
- **FAIL**: <criteria>

### Evidence Required
> Attach screenshot / signed document to Jira ticket BAA-XXX after execution.
\`\`\`
```

## E — Example

**Input**: BAA-101

**Output**: 12 test cases spanning ACS-01 through ACS-04, plus 4 edge cases.
- Automatable: 11 → handed to `/generate-unit-tests` and `/write-automation-script`
- Manual: 1 (TC-06) → appended to `manual-test-cases.md`
- Gherkin feature file: `tests/features/BAA-101-interactive-tiles.feature`
