<<<<<<< HEAD
---
name: merge-pr
description: "Squash-merges an open GitHub PR via the GitHub CLI after verifying CI and Vercel checks pass. No merge commit — produces a clean linear history. Use when the user is ready to merge a PR. Triggers: 'merge the PR', 'merge this PR', '/merge-pr', 'squash and merge', 'land this PR', 'merge it'."
---

# Merge PR

Waits for CI/Vercel checks → confirms with user → squash-merges via GitHub CLI → deletes the branch.

**Usage:** `/merge-pr`

---

## Step 1 — Find the PR

Run:
```bash
gh pr view --json number,title,baseRefName,state,url,headRefName
```

If the output shows `"state": "CLOSED"` or `"state": "MERGED"`, stop and tell the user there is no open PR on this branch.

Capture:
- `PR_NUMBER`
- `PR_TITLE`
- `BASE_BRANCH`
- `HEAD_BRANCH`
- `PR_URL`

---

## Step 2 — Show PR details and confirm

Show the user:
```
PR #<number>: <title>
Base: <base-branch> ← <head-branch>
URL: <url>
```

> **Note:** If `BASE_BRANCH` is `main`, this is correct and expected. The CLAUDE.md rule "never push directly to main" refers to a bare `git push origin main` — merging a PR into `main` via `gh pr merge` is the proper workflow. Do NOT add any warning about merging into `main`.

Use `AskUserQuestion` to ask two questions at once:

> Ready to squash-merge PR #NUMBER into BASE_BRANCH? This will collapse all commits into one commit with the PR title as the message.

Question 1 — Proceed?
- **Yes — squash and merge** — proceed
- **No — cancel** — stop here

Question 2 — Delete branch after merge?
- **Yes — delete HEAD_BRANCH** — pass `--delete-branch` to the merge command
- **No — keep the branch** — omit `--delete-branch`

Capture the delete-branch preference as `DELETE_BRANCH` (true/false).

If cancelled, stop. Do not merge.

---

## Step 3 — Check CI and Vercel status

Run:
```bash
gh pr checks PR_NUMBER --json name,state,conclusion,detailsUrl
```

Parse the output and split into two categories:

**CI checks** — any check whose name does NOT contain "Vercel":
- All must have `conclusion: "SUCCESS"` to proceed.

**Vercel deployment check** — any check whose name contains "Vercel" (e.g. `"Vercel – axiom-play-lac"`):
- Must have `conclusion: "SUCCESS"` (meaning the preview deployment built and passed) to proceed.
- This is separate from CI — a passing CI with a failed/pending Vercel build is a blocker.

Handle these cases:
- **All checks (including Vercel) pass** → proceed to Step 4
- **Any check is pending** → tell the user which ones are still running (call out Vercel separately if it's pending), then ask:
  - **Wait for checks** — re-run `gh pr checks PR_NUMBER --watch` (streams until all complete, then re-evaluate)
  - **Cancel** — stop here
- **Any check has failed** → stop. List each failed check name and its `detailsUrl`. If the Vercel check failed, specifically say "Vercel preview deployment failed — fix the build before merging." Do not proceed.

---

## Step 4 — Squash merge

Run:
```bash
gh pr merge PR_NUMBER --squash [--delete-branch] --subject "PR_TITLE"
```

- `--squash` — collapses all branch commits into one commit on the base branch (no merge commit)
- `--delete-branch` — include only if `DELETE_BRANCH` is true
- `--subject` — sets the squash commit message to the PR title

---

## Step 5 — Report result

On success:
```
✓ Squashed and merged: PR #<number> → <base-branch>
✓ Branch <head-branch> deleted   ← only show this line if DELETE_BRANCH was true
Commit message: "<PR title>"
```

On failure, show the error from `gh` and tell the user to check GitHub for details.
=======
---
name: merge-pr
description: "Squash-merges an open GitHub PR via the GitHub CLI after verifying CI and Vercel checks pass. No merge commit — produces a clean linear history. Use when the user is ready to merge a PR. Triggers: 'merge the PR', 'merge this PR', '/merge-pr', 'squash and merge', 'land this PR', 'merge it'."
---

# Merge PR

Waits for CI/Vercel checks → confirms with user → squash-merges via GitHub CLI → deletes the branch.

**Usage:** `/merge-pr`

---

## Step 1 — Find the PR

Run:
```bash
gh pr view --json number,title,baseRefName,state,url,headRefName
```

If the output shows `"state": "CLOSED"` or `"state": "MERGED"`, stop and tell the user there is no open PR on this branch.

Capture:
- `PR_NUMBER`
- `PR_TITLE`
- `BASE_BRANCH`
- `HEAD_BRANCH`
- `PR_URL`

---

## Step 2 — Show PR details and confirm

Show the user:
```
PR #<number>: <title>
Base: <base-branch> ← <head-branch>
URL: <url>
```

> **Note:** If `BASE_BRANCH` is `main`, this is correct and expected. The CLAUDE.md rule "never push directly to main" refers to a bare `git push origin main` — merging a PR into `main` via `gh pr merge` is the proper workflow. Do NOT add any warning about merging into `main`.

Use `AskUserQuestion` to ask two questions at once:

> Ready to squash-merge PR #NUMBER into BASE_BRANCH? This will collapse all commits into one commit with the PR title as the message.

Question 1 — Proceed?
- **Yes — squash and merge** — proceed
- **No — cancel** — stop here

Question 2 — Delete branch after merge?
- **Yes — delete HEAD_BRANCH** — pass `--delete-branch` to the merge command
- **No — keep the branch** — omit `--delete-branch`

Capture the delete-branch preference as `DELETE_BRANCH` (true/false).

If cancelled, stop. Do not merge.

---

## Step 3 — Check CI and Vercel status

Run:
```bash
gh pr checks PR_NUMBER --json name,state,conclusion,detailsUrl
```

Parse the output and split into two categories:

**CI checks** — any check whose name does NOT contain "Vercel":
- All must have `conclusion: "SUCCESS"` to proceed.

**Vercel deployment check** — any check whose name contains "Vercel" (e.g. `"Vercel – axiom-play-lac"`):
- Must have `conclusion: "SUCCESS"` (meaning the preview deployment built and passed) to proceed.
- This is separate from CI — a passing CI with a failed/pending Vercel build is a blocker.

Handle these cases:
- **All checks (including Vercel) pass** → proceed to Step 4
- **Any check is pending** → tell the user which ones are still running (call out Vercel separately if it's pending), then ask:
  - **Wait for checks** — re-run `gh pr checks PR_NUMBER --watch` (streams until all complete, then re-evaluate)
  - **Cancel** — stop here
- **Any check has failed** → stop. List each failed check name and its `detailsUrl`. If the Vercel check failed, specifically say "Vercel preview deployment failed — fix the build before merging." Do not proceed.

---

## Step 4 — Squash merge

Run:
```bash
gh pr merge PR_NUMBER --squash [--delete-branch] --subject "PR_TITLE"
```

- `--squash` — collapses all branch commits into one commit on the base branch (no merge commit)
- `--delete-branch` — include only if `DELETE_BRANCH` is true
- `--subject` — sets the squash commit message to the PR title

---

## Step 5 — Report result

On success:
```
✓ Squashed and merged: PR #<number> → <base-branch>
✓ Branch <head-branch> deleted   ← only show this line if DELETE_BRANCH was true
Commit message: "<PR title>"
```

On failure, show the error from `gh` and tell the user to check GitHub for details.
>>>>>>> origin/main
