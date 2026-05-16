---
name: push-dev
description: "Runs the full pre-push workflow: Axiom compliance gate → localhost preview screenshot → user approval → commits and optionally creates a GitHub PR. Use whenever the user is ready to push an implementation — either just pushing the branch, or pushing and opening a pull request. Triggers: 'push this', 'create a PR', '/push-dev', 'submit for review', 'open a pull request', 'ship this branch', 'push only', 'just push'."
---

# Push Dev

Runs compliance check → localhost preview → approval gate → push (with optional PR).

**Usage:** `/push-dev`

---

## Step 0 — Collect inputs

Use `AskUserQuestion` to ask:
1. **Action** — `push + create PR` or `push only (no PR)`
2. **Commit/PR title** — short description of what this implementation does
3. **Target branch** *(only if creating a PR)* — base branch for the PR. **Never suggest or default to `main`** — always ask the user to specify. Using `main` as a PR base risks merge conflicts and bypasses the normal review branch flow.

---

## Pre-flight — Version detection + load live spec

First, get the list of changed files:
```bash
git diff TARGET_BRANCH --name-only | grep -E '\.(tsx|ts)$'
```

Determine Axiom version from the changed files:
- If **any changed file is under `app/opal/`** → those files use `VERSION = "v3"`
- All other files use `VERSION = "v2"`
- Run two pre-flights if both V2 and V3 files are present

**For V2 files:**
- A: `mcp__axiom__get_tokens` → `VALID_TOKENS_V2`
- B: `mcp__axiom__get_component` for each Axiom component in those files → `COMPONENT_SPECS_V2`

**For V3/Opal files:**
- A: `mcp__axiom_v3__get_tokens` → `VALID_TOKENS_V3`
- B: `mcp__axiom_v3__get_component` for each Axiom component in those files → `COMPONENT_SPECS_V3`
- C: Read `OPAL_DESIGN_SYSTEM.md` → `OPAL_CONTEXT`
- D: For any changed `page.tsx` files in the V3 set — read `app/layout.tsx` and extract `customLayout`/`hidePageHeader` flags per route. Capture as `LAYOUT_FLAGS` (map of file path → `{ customLayout?: true, hidePageHeader?: true }` or `{}`)

**Icons (all files):**
```bash
node -e "const m = require('./node_modules/@optimizely/axiom-icons/dist/index.js'); console.log(Object.keys(m).filter(k => k.startsWith('Icon')).join('\n'));"
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
> For each changed `.tsx` / `.ts` file, read it and check for violations using the correct version spec:
>
> - Files under `app/opal/` → use `VALID_TOKENS_V3`, `COMPONENT_SPECS_V3`, and apply Section C
> - All other files → use `VALID_TOKENS_V2`, `COMPONENT_SPECS_V2`, skip Section C
>
> **Valid icons (all files):** `VALID_ICONS`
> **V2 tokens:** `VALID_TOKENS_V2` | **V2 component specs:** `COMPONENT_SPECS_V2`
> **V3 tokens:** `VALID_TOKENS_V3` | **V3 component specs:** `COMPONENT_SPECS_V3`
> **Opal context:** `OPAL_CONTEXT`
> **Layout flags (V3 page.tsx files):** `LAYOUT_FLAGS`
>
> **Section A — Live spec checks:**
> 1. Hex or rgb colors — check every `color`, `bg`, `borderColor` prop value against the correct `VALID_TOKENS`. Flag any value not in the list.
> 2. Invalid enum prop values — check `appearance`, `colorScheme`, `size`, `rounded`, `shadow`, and other enum props against the correct `COMPONENT_SPECS`. Flag anything not in the spec.
> 3. Invalid icon names — check every `Icon*` import from `@optimizely/axiom-icons` against `VALID_ICONS`. Flag any not in the list and suggest the closest match.
>
> **Section B — Structural checklist (all files):**
> 4. `@tabler/icons-react` imported directly (must use `@optimizely/axiom-icons`)
> 5. Arbitrary spacing values (allowed: 0,2,4,6,8,10,12,16,20,24,32,40,48,56,64,80)
> 6. `size="sm"` on Input or SearchInput
> 7. Raw HTML elements used as product UI
> 8. Manual label beside input instead of `<Field label="...">`
> 9. `style={{ borderRadius }}` or `style={{ boxShadow }}`
> 10. `@media (prefers-color-scheme: dark)` (must use `[data-theme="dark"]`)
> 11. `<Text>` nested inside another `<Text>` without `asChild`
> 12. *(V3 only)* Inline `style={{ fontFamily }}` overriding the V3 font stack. Typography is inherited via `globals.css` — never set inline. Body = Die Grotesk B; headings h1–h6 = Nudge SemiNormal.
> 13. *(V3 only)* `--ax-colors-fg-default-inverse` overridden to dark — breaks tooltip text readability. Primary button dark text uses `--v3iotm` instead.
> 14. *(V3 only, page.tsx files only)* Page title — look up `LAYOUT_FLAGS[file_path]`:
>     - If `customLayout: true` or `hidePageHeader: true` → page must use `<Heading level="1">` for its title. Flag `<Text fontSize="...">`, inline `style={{ fontSize }}`, or raw `<h1>`.
>     - If no flags (`{}`) → template auto-renders the title; flag any `<Heading level="1">` that appears to be a duplicate page title.
>
> **Section C — Opal-specific checks (app/opal/ files only):**
> Use `OPAL_CONTEXT`:
> 12. Gradient colors — must use `--opal-gradient-*` CSS custom properties, never `bg.*` tokens
> 13. Action Cards — must import from `@optiaxiom/proteus`, never raw HTML
> 14. OpalOrb — must use `/opal-orb.png`, never CSS/SVG recreation
> 15. Loading states — must reuse `OpalLoader` components, never new `@keyframes`
> 16. Opal UI patterns — check against `OPAL_CONTEXT` for ActivityStream, PromptInput, OutputIsland
>
> **Part C — Branch structure check**
> For each changed `.tsx` file, run `git diff origin/TARGET_BRANCH -- <file>` and check whether any React component in the current file is **absent, renamed, or structurally different** on the target branch — e.g. a component that has a `cardLayout` prop and avatar overlay in the current file but is a simpler, different component on the target branch.
>
> This catches the case where work was built in one worktree/branch and is being pushed to a branch that has diverged — the diff may apply cleanly but silently drop entire render paths that don't exist on the target.
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
> app/components/Foo.tsx [V2]:
>   • Line 12: description of violation
> app/opal/Bar.tsx [V3 + Opal]:
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
  app/components/Bar.tsx [V2]:
    • Line 34: p="17" is not a valid spacing token
  app/opal/Baz.tsx [V3 + Opal]:
    • Line 12: Opal gradient using bg.* token instead of CSS custom property
Run /audit-axiom to fix automatically.
```

On preview rejection:
```
✗ Push cancelled — make your changes and run /push-dev again.
```
