# Skill: GitHub Operations

## Purpose
Perform GitHub operations for the automated-doc-sync pipeline.

## Operations
- Create Pull Requests via GitHub CLI
- Manage branches
- Check workflow status
- Manage GitHub Wiki pages

## Usage
```bash
# Create PR
gh pr create --title "..." --body "..." --base main

# Check workflow status
gh run list

# View PR status
gh pr status
Authentication
Uses DOC_SYNC_TOKEN from GitHub Secrets
Never hardcode tokens

---
