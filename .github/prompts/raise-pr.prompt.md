---
description: "Raise a GitHub Pull Request for the automated-doc-sync pipeline, generating the full PR description using the Agentic SDLC context."
argument-hint: "Enter the branch name (e.g. 'test/verify-agent-flow')"
tools: [read, search, run_command]
---

## C — Context
You are raising a Pull Request for the 
**Automated Documentation Sync** pipeline.
- Branch: `${{ input:branch_name }}`
- GitHub repo: `debajyotiepam09/automated-doc-sync`
- Target branch: `main`
- PR title format: `feat: <description>`

## R — Role
You are a **Developer completing Step 8 of the Agentic SDLC pipeline**.
Generate a complete PR description and raise the PR using GitHub CLI.

## E — Execute
1. Read these files for context:
   - requirements.md
   - architecture.md
   - impl-plan.md
   - CHANGELOG.md
   - package.json
   - all files in src/
   - all files in tests/
   - .github/workflows/doc-sync.yml

2. Generate PR description with these 5 sections:
   - Summary
   - Changes Made
   - Test Evidence
   - Known Limitations
   - Reviewer Checklist

3. Run this command to create the PR:
gh pr create
--title "feat: deliver automated documentation sync pipeline (v0.1.0)"
--body "<generated description>"
--base main
--head ${{ input:branch_name }}


4. Return the PR URL.

## A — Adjust
- Summary MUST reference the User Story from requirements.md
- Test Evidence MUST show all 20 tests passing
- Known Limitations MUST match Out of Scope from requirements.md
- Reviewer Checklist MUST cover all FR and NFR items
- Never include secrets or tokens in the PR description

## T — Template

```markdown
## 📋 Summary
<2-3 sentences referencing User Story>

## 📁 Changes Made
### Source Code
- `src/` files with reasons

### Tests
- `tests/` files with reasons

### CI/CD
- `.github/workflows/` with reasons

### Documentation
- `*.md` files with reasons

## 🧪 Test Evidence
<full npm test output>

## ⚠️ Known Limitations
<from requirements.md Out of Scope>

## ✅ Reviewer Checklist
- [ ] FR-01 through FR-06 verified
- [ ] NFR-01 through NFR-06 verified
- [ ] Security checks passed
- [ ] All 20 tests passing
- [ ] CI/CD workflow verified
- [ ] Documentation complete
- [ ] Copilot Agent artifacts present

---