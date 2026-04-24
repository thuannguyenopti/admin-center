# Push Dev

Runs compliance check → localhost preview → approval gate → PR.

**Usage:** `/push-dev`

---

## Step 0 — Collect inputs

Use `AskUserQuestion` to ask:
1. **PR title** — short description of what this implementation does
2. **Target branch** — base branch for the PR (default: `main`)

---

## Agent 1 — Compliance Gate

Spawn a sub-agent with:

> Run: `git diff main --name-only` and filter for `.tsx` and `.ts` files.
>
> For each changed file, read it and check for Axiom violations:
> 1. `@tabler/icons-react` imported directly
> 2. Arbitrary spacing values (allowed: 0,2,4,6,8,10,12,16,20,24,32,40,48,56,64)
> 3. Hex or rgb colors instead of `fg.*`, `bg.*`, `border.*` tokens
> 4. `size="sm"` on Input or SearchInput
> 5. Raw HTML elements used as product UI
> 6. Manual label beside input instead of `<Field label="...">`
> 7. `style={{ borderRadius }}` or `style={{ boxShadow }}`
> 8. `@media (prefers-color-scheme: dark)`
>
> Return:
> ```
> PASS — all files compliant
> ```
> or
> ```
> FAIL
> app/components/Foo.tsx:
>   • Line 12: description of violation
> ```

If the result is `FAIL` — **stop**. Report the violations and tell the user to fix them (or run `/audit-axiom` with auto-fix) before pushing.

---

## Step 2 — Localhost Preview

If compliance passed, start the dev server and show the implementation:

1. Run `yarn dev` in the background (or check if it's already running on port 3000).
2. Use `preview_start` to open the local preview.
3. Take a `preview_screenshot` and show it to the user.
4. Tell the user which route to navigate to in order to see the changed implementation.

---

## Step 3 — Approval Gate

Use `AskUserQuestion` to ask:

> The preview is running at http://localhost:3000. Does everything look correct?

Options:
- **Approve — push the PR** — looks good, proceed
- **Cancel — I need to make changes** — stop here, do not push

If the user cancels — **stop**. Do not push or create a PR.

---

## Agent 2 — Push & PR (only if approved)

Spawn a sub-agent with:

> 1. Run `git status` to confirm there are staged or unstaged changes.
> 2. Stage the changed files with `git add`.
> 3. Commit with message: `PR_TITLE`
> 4. Push the current branch to origin.
> 5. Create a PR using `gh pr create` with:
>    - Title: `PR_TITLE`
>    - Base: `TARGET_BRANCH`
>    - Body listing which files were added or changed, confirming Axiom compliance passed and preview approved.
>
> Return the PR URL when done.

---

## Output

On success:
```
✓ Compliance passed
✓ Preview approved
✓ PR created: https://github.com/Ben-Holme/axiom-play/pull/...
```

On compliance failure:
```
✗ Push blocked — fix these violations first:
  app/components/Bar.tsx:
    • Line 34: p="17" is not a valid spacing token
Run /check-compliance to fix automatically.
```

On preview rejection:
```
✗ Push cancelled — make your changes and run /push-dev again.
```
