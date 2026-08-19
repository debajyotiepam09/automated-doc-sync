---
description: "Generate a consolidated, self-contained HTML SDLC report at docs/sdlc-report.html summarizing every phase the SDLC orchestrator executed for a BAA story."
mode: agent
---

# SDLC Final Report — HTML Generator

You are generating the **final HTML report** for an SDLC run on the SJ Dental Care Booking App.

## Goal

Produce a single self-contained HTML file at `docs/sdlc-report.html` that documents every phase of the SDLC flow that was executed for the current story.

## Inputs to Read (use whichever exist; mark missing ones as "Not Run")

| Phase | Source artifact |
|-------|----------------|
| 1. Requirements | `docs/requirements.md` |
| 2. Architecture | `docs/architecture.md` (Architecture section) |
| 3. Design Review | `docs/architecture.md` (Review section + Version History) |
| 4. Impl. Planning | `docs/impl-plan.md` |
| 5. Implementation | git changed files list, commit summaries |
| 6. Unit Testing | Jest output / coverage summary |
| 7. Test Cases | BDD `.feature` files or test-cases doc |
| 8. Automation | Playwright `.spec.ts` files under `tests/` |
| 9. Code Review | code-review findings (from review-agent output) |
| 10. Raise MR | GitLab MR URL, Jira ticket URL, CI pipeline status |

## Output Requirements

- File path: `docs/sdlc-report.html` (overwrite existing).
- Fully self-contained: inline `<style>`, no external CSS/JS/fonts/images.
- Print-friendly (A4) with `@media print` rules.
- Use semantic HTML5 (`<header>`, `<section>`, `<article>`, `<footer>`).
- Accessible: proper headings, contrast, `aria-label` on status badges.
- No inline event handlers, no `eval`, no remote URLs except Jira/GitLab/Confluence cross-links the user actually has.

## Required Sections (in order)

1. **Report Header** — Story ID, story title, sprint, epic ID, generated timestamp (ISO + local), author = "SDLC Orchestrator".
2. **Executive Summary** — short paragraph + summary table (Phase | Status | Artifact).
3. **Phase Detail Cards** — one card per phase with:
   - Status badge: ✅ Complete | ⏭️ Skipped | ❌ Failed | ⚠️ Partial | ⛔ Not Run
   - Key deliverables (bullet list)
   - Links to artifact files (relative paths)
   - Notable issues / gate-pass results
4. **Cross-Links** — Jira ticket, GitLab MR, GitLab pipeline, Confluence pages.
5. **Artifacts Index** — table of every file created/modified during the run.
6. **Footer** — generated-by line + report version.

## Style Guide

- Color palette: header `#0b5394`, success `#137333`, warning `#b06000`, danger `#a50e0e`, neutral `#5f6368`.
- Font: system stack (`-apple-system, Segoe UI, Roboto, sans-serif`).
- Max width 1100px, centered, padding 24px.
- Status badges: pill-shaped, white text, 12px font.

## HTML Skeleton (use as starting point — fill in real content)

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>SDLC Report — {STORY_ID}</title>
  <style>
    :root { --primary:#0b5394; --ok:#137333; --warn:#b06000; --bad:#a50e0e; --muted:#5f6368; }
    * { box-sizing:border-box; }
    body { font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif; margin:0; background:#f5f7fa; color:#202124; }
    .wrap { max-width:1100px; margin:0 auto; padding:24px; }
    header.top { background:var(--primary); color:#fff; padding:24px; border-radius:8px; }
    header.top h1 { margin:0 0 8px; font-size:22px; }
    .meta { font-size:13px; opacity:.9; }
    section { background:#fff; border:1px solid #e0e3e7; border-radius:8px; padding:20px; margin:16px 0; }
    h2 { margin-top:0; color:var(--primary); border-bottom:2px solid #e0e3e7; padding-bottom:8px; }
    table { width:100%; border-collapse:collapse; }
    th,td { text-align:left; padding:8px 10px; border-bottom:1px solid #eef0f3; }
    th { background:#f1f3f5; font-weight:600; }
    .badge { display:inline-block; padding:3px 10px; border-radius:999px; color:#fff; font-size:12px; font-weight:600; }
    .b-ok{background:var(--ok)} .b-warn{background:var(--warn)} .b-bad{background:var(--bad)} .b-muted{background:var(--muted)}
    .phase { border-left:4px solid var(--muted); padding-left:14px; margin:14px 0; }
    .phase.ok { border-color:var(--ok); }
    .phase.warn { border-color:var(--warn); }
    .phase.bad { border-color:var(--bad); }
    code { background:#f1f3f5; padding:1px 5px; border-radius:3px; font-size:12px; }
    a { color:var(--primary); }
    footer { text-align:center; color:var(--muted); font-size:12px; margin:24px 0; }
    @media print {
      body { background:#fff; }
      section { break-inside:avoid; border:none; }
      header.top { background:#fff; color:#000; border-bottom:3px solid #000; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header class="top">
      <h1>SDLC Report — {STORY_ID}: {STORY_TITLE}</h1>
      <div class="meta">Sprint: {SPRINT} · Epic: {EPIC_ID} · Generated: {ISO_TIMESTAMP}</div>
    </header>

    <section>
      <h2>Executive Summary</h2>
      <p>{ONE_PARAGRAPH_SUMMARY}</p>
      <table>
        <thead><tr><th>#</th><th>Phase</th><th>Status</th><th>Artifact</th></tr></thead>
        <tbody>{SUMMARY_ROWS}</tbody>
      </table>
    </section>

    <section>
      <h2>Phase Details</h2>
      {PHASE_CARDS}
    </section>

    <section>
      <h2>Cross-Links</h2>
      <ul>
        <li>Jira: <a href="{JIRA_URL}">{JIRA_KEY}</a></li>
        <li>GitLab MR: <a href="{MR_URL}">{MR_TITLE}</a></li>
        <li>Confluence: <a href="{CONF_URL}">{CONF_TITLE}</a></li>
      </ul>
    </section>

    <section>
      <h2>Artifacts Index</h2>
      <table>
        <thead><tr><th>File</th><th>Type</th><th>Phase</th></tr></thead>
        <tbody>{ARTIFACT_ROWS}</tbody>
      </table>
    </section>

    <footer>Generated by SDLC Orchestrator · Report v1.0</footer>
  </div>
</body>
</html>
```

## After Writing

1. Confirm the file exists and report its absolute path.
2. Offer to open it: "Report ready at `docs/sdlc-report.html` — open in browser?"
3. Do **not** commit the report unless the user explicitly asks.
