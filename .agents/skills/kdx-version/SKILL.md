---
name: kdx-version
description: Version management — tag releases, update CHANGELOG.md, and track project milestones. Activates when the user declares a new version, asks to bump version, close a milestone, or tag a release.
---

# Version Management

When the user declares a new version (e.g., "we're at v0.2.0", "bump to v0.2.0", "close this as v0.2.0", "new version", "release", "tag this"):

## Steps

### 1. Gather context
- Run `git tag -l --sort=-v:refname` to see existing tags
- Run `git log --oneline $(git describe --tags --abbrev=0)..HEAD` to see commits since last tag
- Read `CHANGELOG.md` to understand the current version history

### 2. Draft the changelog entry
- Ask the user what the version summary is (one-line description of the milestone)
- Review all commits since the last tag
- Write the new entry at the top of the version list in `CHANGELOG.md`
- Follow the existing format: version header, bold summary, sections for what changed
- Include a "Next milestone" line if the user mentions what comes next

### 3. Create the git tag
- Stage and commit the CHANGELOG.md update: `chore(release): v{X.Y.Z}`
- Create an annotated tag: `git tag -a vX.Y.Z -m "description"`
- Do NOT push unless the user explicitly asks

### 4. Update comparison links
- Update the comparison links at the bottom of CHANGELOG.md

### 5. Confirm
- Show the user: new tag, changelog entry summary, and commit hash
- Remind them to `git push --tags` when ready

## Rules
- CHANGELOG.md is the SSOT for version history
- Always use annotated tags (`git tag -a`), never lightweight
- Version format: `vMAJOR.MINOR.PATCH`
- Never skip a version — if user says "v0.3.0" but last was v0.1.1, confirm intent
- Dates use ISO 8601 (YYYY-MM-DD)
