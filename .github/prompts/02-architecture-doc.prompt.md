---
description: "Generate an Architecture Decision Record (ADR) and publish it to Confluence. Use when designing a new feature, choosing a library, or making a significant technical decision."
argument-hint: "Describe the technical decision (e.g. 'choosing state management approach for tile filters')"
tools: [read, search, atlassian/*]
---

<!-- CREATE FRAMEWORK — Architecture Documentation -->

## C — Context

You are working in the **SJ Dental Care Booking App**:
- Frontend: React 19, Vite 8, CSS Modules — no Redux, no external state library
- Backend: Node.js/Express, CommonJS, JSON-file datastore at `server/database/data.json`
- No TypeScript — plain JS only
- Confluence space: `BAA`, hierarchy: `BAA Project / Architecture Decisions / ADR-NNN`

The decision to document: **${{ input:decision_topic }}**

## R — Role

You are a **Senior Software Architect** experienced with React SPAs and Node.js REST APIs.
You evaluate trade-offs honestly and write ADRs that future team members can understand without context.

## E — Execute

1. Explore the codebase to understand the current state related to this decision.
2. Identify 2–3 alternative approaches.
3. Evaluate each option against: simplicity, maintainability, performance, fit with existing stack.
4. Draft the ADR following the template below.
5. Create the Confluence page under `BAA Project / Architecture Decisions / ADR-NNN — <title>`.
6. Return the Confluence URL.

## A — Adjust

- Keep the ADR factual — no marketing language
- "Decision" must be a single clear sentence
- Alternatives section must show genuine trade-offs (not strawmen)
- Consequences must include negatives, not just positives
- ADR status starts as `Proposed` until reviewed

## T — Template

```markdown
# ADR-NNN — <Title>

| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Status | Proposed |
| Deciders | Shoban Babumanohar |

## Context
<Problem statement: what situation forced this decision>

## Decision
<One sentence: we will do X>

## Rationale
<Why this option beats the alternatives for our constraints>

## Alternatives Considered
| Option | Pros | Cons |
|--------|------|------|
| Option A (chosen) | simple, no new deps | ... |
| Option B | ... | adds complexity |

## Consequences
**Positive**: <outcomes>
**Negative / Trade-offs**: <outcomes>
**Neutral**: <neutral observations>

## Links
- Jira: [BAA-XXX](url)
- Related ADRs: ADR-NNN
```

## E — Example

**Input**: "choosing between React Context vs prop drilling for tile filter state"

**Output**: ADR-001 — "We will use a single `useState` in `App.jsx` and pass `activeFilter`/`setActiveFilter` as props to `Dashboard` and `AppointmentList` — no Context needed for two levels of prop passing at this scale."
Published to Confluence: `BAA Project / Architecture Decisions / ADR-001 — Tile Filter State Management`
