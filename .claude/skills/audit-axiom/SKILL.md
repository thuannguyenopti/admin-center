---
name: audit-axiom
description: "Reviews component files for Axiom design system violations and optionally auto-fixes them. Use whenever the user wants to check a file or all branch changes for compliance issues: wrong spacing tokens, hex colors, direct Tabler icon imports, invalid icon names from @optimizely/axiom-icons, raw HTML, missing Field wrappers, incorrect Input sizes, hardcoded borderRadius/boxShadow, or wrong dark-mode selectors. Also checks Opal-specific rules for files in app/opal/. Triggers: 'audit axiom', 'check compliance', 'fix axiom violations', '/audit-axiom', 'are there any axiom issues in...', 'check this file for violations'."
---

# Audit Axiom

Reviews an existing component file for Axiom design system violations and optionally fixes them.

**Usage:** `/audit-axiom` (will ask for inputs)

---

## Step 0 — Collect inputs

Use `AskUserQuestion` to ask:
1. **File to check** — path to the component (e.g. `app/components/MyCard.tsx`), "current" to check all files changed on this branch, or a product area (e.g. `opal`, `cms`, `cmp`) to check all files under `app/<area>/`
2. **Action if violations found** — fix automatically, or just report
3. **Update icons?** *(only ask if action is "fix")* — should icon-related violations (invalid icon names, `@tabler/icons-react` direct imports) be included in the auto-fix? Capture as `FIX_ICONS` (yes/no).

---

## Pre-flight — Version detection + load live spec

First, determine the project's Axiom version by reading `package.json`:

```bash
node -p "require('./package.json').dependencies['@optiaxiom/react']"
```

- Version starts with `3.` → `VERSION = "v3"` for the **whole project** (every product area: cms, cmp, opal, connect-platform, fe-hosting, etc.). Use `mcp__axiom_v3__*` tools.
- Version starts with `1.` or `2.` → V2 project. Decide per file:
  - File path starts with `app/opal/` → that file is V3 (`mcp__axiom_v3__*`)
  - Otherwise → V2 (`mcp__axiom__*`)
  - If the run mixes both, do two passes — one per version.

Always track **`IS_OPAL_FILE`** separately (true when the file path starts with `app/opal/`). This is what gates Section C's Opal-specific rules — independent of `VERSION`. A V3 file under `app/cms/` is V3 but NOT an Opal file.

**A — Valid color tokens** (live from MCP):
- V2: Call `mcp__axiom__get_tokens` → `VALID_TOKENS`
- V3: Call `mcp__axiom_v3__get_tokens` → `VALID_TOKENS`

**B — Valid component props** (live from MCP):
Scan the files for Axiom component names (e.g. `Button`, `Input`, `Badge`, `Text`, `Box`).
- V2: Call `mcp__axiom__get_component` for each → `COMPONENT_SPECS`
- V3: Call `mcp__axiom_v3__get_component` for each → `COMPONENT_SPECS`

**C — Valid icon names** (live from installed packages):
- For V2 files (`VERSION = "v2"` and not Opal):
  ```bash
  node -e "const m = require('./node_modules/@optimizely/axiom-icons/dist/index.js'); console.log(Object.keys(m).filter(k => k.startsWith('Icon')).join('\n'));"
  ```
  → `VALID_ICONS`
- For V3 files (`VERSION = "v3"`, or Opal files in a V2 project):
  ```bash
  node -e "const v3 = require('./node_modules/@optiaxiom/icons'); const v2 = require('./node_modules/@optimizely/axiom-icons/dist/index.js'); const all = new Set([...Object.keys(v3), ...Object.keys(v2)].filter(k => k.startsWith('Icon'))); console.log([...all].join('\n'));"
  ```
  → `VALID_ICONS` (V3 package preferred; V2 acts as fallback for icons not yet in V3)

**D — Opal context** (only when `IS_OPAL_FILE = true` for any target file):
Read `OPAL_DESIGN_SYSTEM.md` → capture as `OPAL_CONTEXT`.

**E — Layout flags** (only when `VERSION = "v3"`, and only for files that are `page.tsx`):
Read `app/layout.tsx`. For each target `page.tsx` file, derive its route (e.g. `app/opal/artifacts/page.tsx` → `/opal/artifacts`) and look up whether that route's nav entry has `customLayout: true` or `hidePageHeader: true`.

Capture as `LAYOUT_FLAGS` — a map of file path → flags, e.g.:
```
{
  "app/opal/artifacts/page.tsx": { hidePageHeader: true },
  "app/opal/agents/page.tsx":    { customLayout: true },
  "app/cms/content/page.tsx":    {}
}
```
Pages not found in the nav structure default to `{}` (no flags — template renders the title).

---

## Agent 1 — Compliance Reviewer

If the user said "current", run:
```
git diff main --name-only | grep -E '\.(tsx|ts)$'
```
to get the list of changed files. If a product area was given (e.g. `opal`), use `app/<area>/`. Otherwise use the provided path.

For each file, spawn a sub-agent with the `Agent` tool — pass `model: "haiku"` (this is a fixed-checklist review with structured JSON output; Haiku is sufficient and ~10× cheaper than the default):

> Read this file: `FILE_PATH`
>
> Review it for Axiom design system violations. Use the live spec data below — do not rely on guesses or memory.
>
> **Axiom version:** `VERSION` (v2 or v3)
> **Valid tokens:** `VALID_TOKENS`
> **Component specs:** `COMPONENT_SPECS`
> **Valid icons:** `VALID_ICONS`
> `[if VERSION = "v3"]` **Opal context:** `OPAL_CONTEXT`
> `[if VERSION = "v3" and file is page.tsx]` **Layout flags for this file:** `LAYOUT_FLAGS[FILE_PATH]` (e.g. `{ hidePageHeader: true }` or `{}`)
>
> **Section A — Live spec checks** (use `VALID_TOKENS`, `COMPONENT_SPECS`, `VALID_ICONS`):
> 1. Hex or rgb colors — check every `color`, `bg`, `borderColor` prop value against `VALID_TOKENS`. Flag any value not in the list.
> 2. Invalid enum prop values — check `appearance`, `colorScheme`, `size`, `rounded`, `shadow`, and other enum props on every Axiom component against `COMPONENT_SPECS`. Flag anything not in the spec.
> 3. Invalid icon names — check every `Icon*` import against `VALID_ICONS`. Flag any not in the list and suggest the closest match.
>
> **Section B — Structural pattern checklist** (fixed rules, always apply):
> 4. `@tabler/icons-react` imported directly (must use `@optimizely/axiom-icons`)
> 5. Arbitrary spacing — e.g. `p="17"`, `gap="11"`, `mt="28"` (allowed: 0,2,4,6,8,10,12,16,20,24,32,40,48,56,64,80)
> 6. `size="sm"` on Input or SearchInput (only md, lg, xl)
> 7. Raw HTML elements (`div`, `span`, `p`, `button`, `input`, `label`) used as product UI
> 8. Manual `<Text>` or `<label>` beside an input instead of `<Field label="...">`
> 9. `style={{ borderRadius }}` or `style={{ boxShadow }}`
> 10. `@media (prefers-color-scheme: dark)` (must use `[data-theme="dark"]`)
> 11. `<Text>` nested inside another `<Text>` without `asChild` — use `asChild` on the outer `Text` when it wraps inline children
> 12. *(V3 only)* Inline `style={{ fontFamily }}` or a `fontFamily` prop overriding the V3 font stack. V3 typography is inherited via `globals.css [data-brand="v3"]` — never set it inline. Body/UI text = Die Grotesk B; headings (h1–h6) = Nudge SemiNormal.
> 13. *(V3 only)* `--ax-colors-fg-default-inverse` overridden to a dark value in a component or local CSS. This token controls tooltip text color (must stay light/white on dark tooltip backgrounds). Primary button dark text is handled by `--v3iotm`, not this token.
> 14. *(V3 only, page.tsx files only)* Page title — use the provided `LAYOUT_FLAGS` for this file:
>     - If `customLayout: true` or `hidePageHeader: true` → the page owns its title. Flag any `<Text fontSize="...">`, inline `style={{ fontSize }}`, or raw `<h1>` used as the page title. The correct form is `<Heading level="1">`.
>     - If no flags (empty `{}`) → the template auto-renders the title. Flag any `<Heading level="1">` that appears to be a duplicate page title.
>
> **Section C — Opal-specific checks** (only when `IS_OPAL_FILE = true` / file path starts with `app/opal/`. A V3 file under `app/cms/`, `app/cmp/`, etc. is NOT an Opal file — skip Section C for it):
> Use `OPAL_CONTEXT` for the rules below:
> 13. Gradient colors — Opal gradients must use CSS custom properties (`--opal-gradient-*`), never `bg.*` Axiom tokens
> 14. Action Cards — must import from `@optiaxiom/proteus`, never recreated with raw HTML or Axiom primitives
> 15. OpalOrb — must use `/opal-orb.png` asset, never recreated with CSS or SVG
> 16. Loading states — must reuse an existing `OpalLoader` component, never new `@keyframes` animations
> 17. Opal UI patterns (ActivityStream, PromptInput, OutputIsland, etc.) — check against patterns in `OPAL_CONTEXT`
>
> Respond with ONLY JSON:
> `{"pass": true, "violations": []}` or `{"pass": false, "violations": [{"line": 12, "rule": "...", "code": "..."}]}`

---

## Agent 2 — Fixer (only if violations found and user chose "fix")

For each file that failed, spawn a sub-agent with the `Agent` tool — pass `model: "sonnet"` (mechanical code edits, no design judgement needed):

> Fix all Axiom compliance violations in this file.
>
> **File:** `FILE_PATH`
> **Axiom version:** `VERSION`
> **Valid tokens:** `VALID_TOKENS`
> **Component specs:** `COMPONENT_SPECS`
> `[if VERSION = "v3"]` **Opal context:** `OPAL_CONTEXT`
> **Violations:**
> `VIOLATIONS`
>
> Read the file, fix every violation listed **except** icon-related violations (rules 3 and 4) if `FIX_ICONS = no` — skip those and leave them as-is.
> Do not change anything beyond what's needed to fix the violations.

---

## Output

Print a compliance report:

```
✓ app/components/Foo.tsx — PASS  [Axiom V2]
✗ app/opal/Bar.tsx — 3 violations  [Axiom V3 + Opal]
  • Line 12: @tabler/icons-react import
  • Line 34: p="17" (not a valid spacing token)
  • Line 56: Opal gradient using bg.* token instead of CSS custom property
```

If fixes were applied, confirm which files were updated.
