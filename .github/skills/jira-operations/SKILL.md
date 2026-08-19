---
name: jira-operations
description: "Jira operations for the BAA project: fetch issues from any project (BAA or external like EPMCDMETST); create sub-tasks and bugs; update status; link issues; fetch sprint backlog; transition tickets through the workflow. Use when: reading an external Jira ticket to gather requirements, logging a bug, updating Jira ticket status, querying sprint items, adding sub-tasks to a story, or linking Jira issues to GitLab MRs."
argument-hint: "Describe the Jira operation (e.g. 'fetch EPMCDMETST-41548' or 'update BAA-101 to In Progress')"
---

# Jira Operations Skill

## Project Context

- **Project key**: `BAA`
- **External projects accepted**: any (e.g. `EPMCDMETST`, `EPMC`, etc.)
- **Epic**: `BAA-EPIC-01` — Enhanced Appointment Management Dashboard
- **Current Sprint**: Sprint 1
- **Status workflow**: `To Do` → `In Progress` → `In Review` → `Done`
- **Story point scale**: Fibonacci (1, 2, 3, 5, 8, 13)
- **Issue types**: Story, Task, Sub-task, Bug
- **Jira base URL**: `https://jiraeu.epam.com`

## Procedures

### 0. Fetch an Issue from Any Project (including external)

Use `jira_get_issue` with the full ticket ID (e.g. `EPMCDMETST-41548`).

Extract these fields from the response:
| Field | Use for |
|-------|---------|
| `summary` | Story title |
| `description` | Background / context |
| `acceptance criteria` (if present) | Starting point for Gherkin |
| `priority` | Map to BAA priority |
| `labels` / `components` | Identify affected layers |

After fetching, note the source URL:
```
https://jiraeu.epam.com/browse/<TICKET-ID>
```

Record this URL in the `requirements.md` **Source** field.

### 2. Create a Sub-task

- `issuetype`: `Sub-task`
- `parent`: parent story ID (e.g. `BAA-101`)
- `summary`: action verb + component (e.g. "Add range=upcoming param to GET /api/appointments")

### 3. Create a Bug

- `issuetype`: `Bug`
- Fields: `summary`, `description` (Steps to Reproduce, Expected, Actual), `priority`

### 4. Transition a Ticket

Use the transition tool with the target status name. Map:
- Start work → `In Progress`
- Submit for review → `In Review`
- Merge & close → `Done`

### 5. Fetch Sprint Backlog

Query: `project = BAA AND sprint = "Sprint 1" ORDER BY priority DESC`

### 6. Link Jira ↔ GitLab MR

After raising an MR, add a remote link to the Jira issue:
- `url`: MR URL
- `title`: MR title following `[BAA-XXX] type: description`
- `relationship`: `implemented by`

## Output Format

When creating or updating issues always confirm:
- Issue key (e.g. `BAA-102`)
- Direct URL (`https://jiraeu.epam.com/browse/BAA-102`)
- Summary of fields set
