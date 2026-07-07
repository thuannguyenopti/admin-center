---
name: push-dev
description: "Pre-push workflow: shows branch status, asks whether to run audit-axiom and whether to create a PR, then pushes. Use whenever the user is ready to push work — whether just pushing the branch or pushing and opening a pull request. Triggers: 'push this', 'push dev', 'create a PR', '/push-dev', 'submit for review', 'open a pull request', 'ship this branch', 'ready to push'."
---

# Push Dev

Pre-push workflow: branch status → optional audit → push → optional PR.

**Usage:** `/push-dev`

---

## Step 1 — Branch status

Run these in parallel:
```bash
git status --short
git log origin/main..HEAD --oneline 2>/dev/null || git log --oneline -5
gh pr view --json number,title,url,state 2>/dev/null || echo "NO_PR"
```

Capture:
- `UNCOMMITTED` — any unstaged/staged changes (`git status --short` output)
- `COMMITS_AHEAD` — commits not yet on remote
- `EXISTING_PR` — open PR number + URL if one exists, otherwise null
- `BRANCH` — current branch name (`git branch --show-current`)

---

## Step 2 — Ask

Use `AskUserQuestion` to ask all three at once:

**Q1 — Run audit-axiom first?**
Header: `Audit`
- Yes — run /audit-axiom on changed files before pushing
- No — skip audit, push as-is

**Q2 — Create a PR?**
Header: `PR`
- Yes — push and open a new PR  *(if EXISTING_PR exists, label this "Push to existing PR #N" as the first option instead)*
- Push only — no PR

**Q3 — PR title** *(only ask if Q2 is "yes / new PR")*
Header: `PR title`
Free text — short description of what this implements (becomes the PR title and squash commit message).

Capture: `RUN_AUDIT`, `CREATE_PR`, `PR_TITLE`.

---

## Step 3 — Audit (skip if RUN_AUDIT = no)

Invoke `/audit-axiom` on the changed files:
```bash
git diff origin/main --name-only 2>/dev/null | grep -E '\.(tsx|ts)$'
```

Pass those files as the target. If audit returns any violations → **stop**. Report:
```
✗ Push blocked — fix these violations first:
  <violations list>
Run /audit-axiom with "fix automatically" to resolve.
```

---

## Step 4 — Push

```bash
git push origin BRANCH
```

If there are uncommitted changes (`UNCOMMITTED` is non-empty), ask the user whether to stash them or commit them first before pushing.

---

## Step 5 — Create PR (skip if CREATE_PR = no)

If an open PR already exists, skip creation and just print the existing PR URL.

Otherwise:
```bash
gh pr create --title "PR_TITLE" --body "$(cat <<'EOF'
## Summary
BRANCH push — PR_TITLE

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Output

```
✓ Pushed: BRANCH
✓ PR created: https://github.com/episerver/axiom-play/pull/NNN   ← only if PR was created
  or
✓ Existing PR: https://...                                        ← only if PR already existed
```

Audit skipped / passed line:
```
✓ Audit passed   ← if ran and passed
— Audit skipped  ← if skipped
```
