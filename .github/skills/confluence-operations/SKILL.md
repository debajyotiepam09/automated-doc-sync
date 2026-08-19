---
name: confluence-operations
description: "Confluence documentation operations for the BAA project space: create and update pages for sprint docs, architecture decisions (ADRs), design specs, test plans, and sprint retrospectives. Use when: documenting architecture, writing an ADR, creating a sprint test plan, publishing a design review outcome, or updating existing Confluence pages in the BAA space."
argument-hint: "Describe the Confluence operation (e.g. 'create ADR for tile filter architecture' or 'update Sprint 1 test plan')"
---

# Confluence Operations Skill

## Space Context

- **Space key**: `BAA`
- **Page hierarchy**: `BAA Project` / `Sprint 1` / `<Page Title>`
- **ADR location**: `BAA Project` / `Architecture Decisions` / `ADR-NNN — <title>`

## Page Templates

### Architecture Decision Record (ADR)

```markdown
# ADR-NNN — <Title>

| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Status | Proposed / Accepted / Deprecated |
| Deciders | <names> |

## Context
<What problem or question prompted this decision>

## Decision
<What was decided>

## Rationale
<Why this option was chosen over alternatives>

## Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Option A | | |
| Option B | | |

## Consequences
<Positive and negative outcomes>

## Links
- Jira: BAA-XXX
```

### Sprint Test Plan

```markdown
# Sprint 1 — Test Plan

## Scope
- Stories covered: BAA-XXX, BAA-YYY

## Test Strategy
| Level | Tool | Coverage Target |
|-------|------|----------------|
| Unit | Jest | 80%+ |
| E2E | Playwright | All ACS scenarios |

## Test Cases
| ID | Scenario | Priority | Status |
|----|----------|----------|--------|
| TC-01 | | High | Not Run |

## Entry / Exit Criteria
**Entry**: feature branch merged to main, CI green  
**Exit**: all High/Medium test cases passed, no P1 bugs open
```

### Design Review Notes

```markdown
# Design Review — <Feature Name>

**Date**: YYYY-MM-DD  
**Participants**: <names>  
**Jira Story**: BAA-XXX

## Design Summary
<Brief description of the design being reviewed>

## Review Outcomes
| Item | Status | Owner | Due |
|------|--------|-------|-----|
| | Approved / Change Required | | |

## Open Questions
- [ ] <question>

## Decision
[ ] Approved  [ ] Approved with changes  [ ] Requires re-review
```

## Procedures

### 1. Create a New Page

Use the `atlassian` MCP tool (Confluence create page):
- `space_key`: `BAA`
- `parent_title`: appropriate parent page
- `title`: descriptive title matching templates above
- `body`: formatted Confluence storage or wiki markup

### 2. Update an Existing Page

Fetch current page version first, then update with incremented version number.

### 3. Search for Pages

Query: `space = BAA AND title ~ "<search term>"`

## Output Format

Always return:
- Page title
- Confluence URL
- Space / parent path
- Action performed (created / updated)
