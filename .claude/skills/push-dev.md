---
name: push-dev
description: "Runs the full pre-push workflow: Axiom compliance gate → localhost preview screenshot → user approval → commits and optionally creates a GitHub PR. Use whenever the user is ready to push an implementation — either just pushing the branch, or pushing and opening a pull request. Triggers: 'push this', 'create a PR', '/push-dev', 'submit for review', 'open a pull request', 'ship this branch', 'push only', 'just push'."
---

# Push Dev

Runs compliance check → localhost preview → approval gate → push (with optional PR).

**Usage:** `/push-dev`

---

## Step 0 — Check for existing PR + collect inputs

First, run:
```bash
gh pr view --json number,title,url,baseRefName,state 2>/dev/null
```

**If an open PR exists** (state is `OPEN`), capture `EXISTING_PR` (number, title, url, base). Then use `AskUserQuestion` to ask:
1. **Action** — offer three options:
   - `Push to existing PR #NUMBER — "TITLE"` *(pre-fill this as the recommended option)*
   - `Push only (no PR)`
   - `Push + create new PR`
2. **Commit/PR title** — short description of what this implementation does
3. **Target branch** *(only if creating a new PR)* — base branch for the PR. Options: `main` (default, recommended) or free-text for any other branch name. Do NOT offer `main-rebrand` or `v3` — those branches no longer exist.

**If no open PR exists**, use `AskUserQuestion` to ask:
1. **Action** — `push + create PR` or `push only (no PR)`
2. **Commit/PR title** — short description of what this implementation does
3. **Target branch** *(only if creating a PR)* — base branch for the PR. Options: `main` (default, recommended) or free-text for any other branch name. Do NOT offer `main-rebrand` or `v3` — those branches no longer exist.

---

## Pre-flight — Load live spec

First, get the list of changed files:
```bash
git diff TARGET_BRANCH --name-only | grep -E '\.(tsx|ts)$'
```

All files use Axiom V3 (`@optiaxiom/react`, `@optiaxiom/icons`).

**A — Valid color tokens:**
Call `mcp__axiom_v3__get_tokens` → `VALID_TOKENS`

**B — Valid component props:**
Scan the files for Axiom component names (e.g. `Button`, `Input`, `Badge`, `Text`, `Box`).
Call `mcp__axiom_v3__get_component` for each → `COMPONENT_SPECS`

**C — V3 design context:**
Read `.claude/FIGMA_LIBRARY_V3.md` → `V3_CONTEXT`

**D — Layout flags** (for changed `page.tsx` files only):
Read `app/opal/navigation.tsx`. For each changed `page.tsx`, look up whether its route has `customLayout: true` or `hidePageHeader: true`. Capture as `LAYOUT_FLAGS` (map of file path → flags, e.g. `{ hidePageHeader: true }` or `{}`).

**E — Valid icon names:**
```bash
node -e "const m = require('./node_modules/@optiaxiom/icons/dist/cjs/index.js'); console.log(Object.keys(m).filter(k => k.startsWith('Icon')).join('\n'));"
```
Capture as `VALID_ICONS`.

---

## Agent 1 — Compliance Gate

Spawn a sub-agent with:

> Working directory: the current git worktree root.
>
> **Part A — TypeScript check**
> Run `yarn tsc --noEmit 2>&1 | head -60` to catch type errors before they become runtime crashes. If it emits errors, list each one.
>
> **Part B — Pattern audit**
> For each changed `.tsx` / `.ts` file, read it and check for violations:
>
> **Valid tokens:** `VALID_TOKENS`
> **Component specs:** `COMPONENT_SPECS`
> **Valid icons:** `VALID_ICONS`
> **V3 context:** `V3_CONTEXT`
> **Layout flags (page.tsx files):** `LAYOUT_FLAGS`
>
> **Section A — Live spec checks:**
> 1. Hex or rgb colors — check every `color`, `bg`, `borderColor` prop value against `VALID_TOKENS`. Flag any value not in the list.
> 2. Invalid enum prop values — check `appearance`, `colorScheme`, `size`, `rounded`, `shadow`, and other enum props against `COMPONENT_SPECS`. Flag anything not in the spec.
> 3. Invalid icon names — check every `Icon*` import from `@optiaxiom/icons` against `VALID_ICONS`. Flag any not in the list and suggest the closest match.
>
> **Section B — Structural checklist:**
> 4. `@tabler/icons-react` imported directly (must use `@optiaxiom/icons`)
> 5. Arbitrary spacing values (allowed: 0,2,4,6,8,10,12,16,20,24,32,40,48,56,64,80)
> 6. `size="sm"` on Input or SearchInput
> 7. Raw HTML elements used as product UI
> 8. Manual label beside input instead of `<Field label="...">`
> 9. `style={{ borderRadius }}` or `style={{ boxShadow }}`
> 10. `@media (prefers-color-scheme: dark)` (must use `[data-theme="dark"]`)
> 11. `<Text>` nested inside another `<Text>` without `asChild`
> 12. Inline `style={{ fontFamily }}` overriding the V3 font stack. Typography is inherited via `globals.css` — never set inline. Body = Die Grotesk B; headings h1–h6 = Nudge SemiNormal.
> 13. `--ax-colors-fg-default-inverse` overridden to dark — breaks tooltip text readability. Primary button dark text uses `--v3iotm` instead.
> 14. *(page.tsx files only)* Page title — look up `LAYOUT_FLAGS[file_path]`:
>     - If `customLayout: true` or `hidePageHeader: true` → page must use `<Heading level="1">` for its title. Flag `<Text fontSize="...">`, inline `style={{ fontSize }}`, or raw `<h1>`.
>     - If no flags (`{}`) → template auto-renders the title; flag any `<Heading level="1">` that appears to be a duplicate page title.
>
> **Section C — V3 design system checks:**
> Use `V3_CONTEXT`:
> 15. Gradient colors — must use `--opal-gradient-*` CSS custom properties, never `bg.*` tokens
> 16. Action Cards — must import from `@optiaxiom/proteus`, never raw HTML
> 17. OpalOrb — must use `/fd-avatar-opal.png`, never CSS/SVG recreation
> 18. Loading states — must reuse `OpalLoader` components, never new `@keyframes`
> 19. UI patterns (ActivityStream, PromptInput, OutputIsland, etc.) — check against `V3_CONTEXT`
>
> **Part C — Branch structure check**
> For each changed `.tsx` file, run `git diff origin/TARGET_BRANCH -- <file>` and check whether any React component in the current file is **absent, renamed, or structurally different** on the target branch.
>
> If structural drift is detected, **stop immediately**:
> ```
> STRUCTURE MISMATCH
> app/path/to/Component.tsx:
>   • <ComponentName> on TARGET_BRANCH is missing <prop/feature> — changes to these render sites will be silently lost
> Recommendation: reconcile the two component versions before pushing, or confirm the target branch is correct.
> ```
>
> Return:
> ```
> PASS — all files compliant
> ```
> or
> ```
> FAIL
> app/opal/Foo.tsx:
>   • Line 12: description of violation
> app/opal/Bar.tsx:
>   • Line 34: description of violation
> ```

If the result is `FAIL` or `STRUCTURE MISMATCH` — **stop**. Report the issue and do not proceed with the push.

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

## Agent 2 — Push (and optionally PR) — only if approved

**If action is "push only"**, spawn a sub-agent with:

> 1. Run `git status` to confirm there are staged or unstaged changes.
> 2. Stage the changed files with `git add`.
> 3. Commit with message: `COMMIT_TITLE`
> 4. Push the current branch to origin.
>
> Return the branch name and the pushed commit SHA when done.

**If action is "push + create PR"**, spawn a sub-agent with:

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

On push-only success:
```
✓ Compliance passed
✓ Preview approved
✓ Pushed: <branch-name> — <commit SHA>
```

On push + PR success:
```
✓ Compliance passed
✓ Preview approved
✓ PR created: https://github.com/episerver/axiom-play/pull/...
```

On compliance failure:
```
✗ Push blocked — fix these violations first:
  app/opal/Bar.tsx:
    • Line 34: p="17" is not a valid spacing token
  app/opal/Baz.tsx:
    • Line 12: gradient using bg.* token instead of CSS custom property
Run /audit-axiom to fix automatically.
```

On preview rejection:
```
✗ Push cancelled — make your changes and run /push-dev again.
```
