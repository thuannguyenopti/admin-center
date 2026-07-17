---
name: audit-axiom
description: "Reviews component files for Axiom V3 design system violations and optionally auto-fixes them. Use whenever the user wants to check a file or all branch changes for compliance issues: wrong spacing tokens, hex colors, direct Tabler icon imports, invalid icon names from @optiaxiom/icons, raw HTML, missing Field wrappers, incorrect Input sizes, hardcoded borderRadius/boxShadow, or wrong dark-mode selectors. Also checks V3-specific rules from FIGMA_LIBRARY_V3.md. Triggers: 'audit axiom', 'check compliance', 'fix axiom violations', '/audit-axiom', 'are there any axiom issues in...', 'check this file for violations'."
---

# Audit Axiom

Reviews component files for Axiom V3 design system violations and optionally fixes them.

**Usage:** `/audit-axiom` (will ask for inputs)

---

## Step 0 — Collect inputs

Use `AskUserQuestion` to ask:
1. **File to check** — path to the component (e.g. `app/opal/tools/page.tsx`), "current" to check all files changed on this branch, or a product area (e.g. `opal`, `cms`, `cmp`) to check all files under `app/<area>/`
2. **Action if violations found** — fix automatically, or just report
3. **Update icons?** *(only ask if action is "fix")* — should icon-related violations (invalid icon names, `@tabler/icons-react` direct imports) be included in the auto-fix? Capture as `FIX_ICONS` (yes/no).

---

## Pre-flight — Load live spec

All files use Axiom V3 (`@optiaxiom/react`, `@optiaxiom/icons`).

**A — Valid color tokens** (live from MCP):
Call `mcp__axiom_v3__get_tokens` → `VALID_TOKENS`

**B — Valid component props** (live from MCP):
Scan the files for Axiom component names (e.g. `Button`, `Input`, `Badge`, `Text`, `Box`).
Call `mcp__axiom_v3__get_component` for each → `COMPONENT_SPECS`

**C — Valid icon names** (live from installed package):
```bash
node -e "const m = require('./node_modules/@optiaxiom/icons/dist/cjs/index.js'); console.log(Object.keys(m).filter(k => k.startsWith('Icon')).join('\n'));"
```
Capture as `VALID_ICONS`.

**D — V3 design context:**
Read `.claude/FIGMA_LIBRARY_V3.md` → capture as `V3_CONTEXT`.

**E — Layout flags** (only for `page.tsx` files):
Read `app/opal/navigation.tsx`. For each target `page.tsx`, look up whether its route has `customLayout: true` or `hidePageHeader: true`.

Capture as `LAYOUT_FLAGS` — a map of file path → flags, e.g.:
```
{
  "app/opal/artifacts/page.tsx": { hidePageHeader: true },
  "app/opal/agents/page.tsx":    { customLayout: true },
  "app/opal/connectors/page.tsx": { hidePageHeader: true }
}
```
Files not found in the nav structure default to `{}`.

---

## Agent 1 — Compliance Reviewer

If the user said "current", run:
```
git diff main --name-only | grep -E '\.(tsx|ts)$'
```
to get the list of changed files. If a product area was given (e.g. `opal`), use `app/<area>/`. Otherwise use the provided path.

For each file, spawn a sub-agent with:

> Read this file: `FILE_PATH`
>
> Review it for Axiom V3 design system violations. Use the live spec data below — do not rely on guesses or memory.
>
> **Valid tokens:** `VALID_TOKENS`
> **Component specs:** `COMPONENT_SPECS`
> **Valid icons:** `VALID_ICONS`
> **V3 context:** `V3_CONTEXT`
> **Layout flags for this file:** `LAYOUT_FLAGS[FILE_PATH]` (e.g. `{ hidePageHeader: true }` or `{}`)
>
> **Section A — Live spec checks** (use `VALID_TOKENS`, `COMPONENT_SPECS`, `VALID_ICONS`):
> 1. Hex or rgb colors — check every `color`, `bg`, `borderColor` prop value against `VALID_TOKENS`. Flag any value not in the list.
> 2. Invalid enum prop values — check `appearance`, `colorScheme`, `size`, `rounded`, `shadow`, and other enum props on every Axiom component against `COMPONENT_SPECS`. Flag anything not in the spec.
> 3. Invalid icon names — check every `Icon*` import against `VALID_ICONS`. Flag any not in the list and suggest the closest match.
>
> **Section B — Structural pattern checklist** (fixed rules, always apply):
> 4. `@tabler/icons-react` imported directly (must use `@optiaxiom/icons`)
> 5. Arbitrary spacing — e.g. `p="17"`, `gap="11"`, `mt="28"` (allowed: 0,2,4,6,8,10,12,16,20,24,32,40,48,56,64,80)
> 6. `size="sm"` on Input or SearchInput (only md, lg, xl)
> 7. Raw HTML elements (`div`, `span`, `p`, `button`, `input`, `label`) used as product UI
> 8. Manual `<Text>` or `<label>` beside an input instead of `<Field label="...">`
> 9. `style={{ borderRadius }}` or `style={{ boxShadow }}`
> 10. `@media (prefers-color-scheme: dark)` (must use `[data-theme="dark"]`)
> 11. `<Text>` nested inside another `<Text>` without `asChild`
> 12. Inline `style={{ fontFamily }}` or a `fontFamily` prop overriding the V3 font stack. V3 typography is inherited via `globals.css` — never set inline. Body/UI text = Die Grotesk B; headings (h1–h6) = Nudge SemiNormal.
> 13. `--ax-colors-fg-default-inverse` overridden to a dark value. This token controls tooltip text color (must stay light/white). Primary button dark text is handled by `--v3iotm`, not this token.
> 14. *(page.tsx files only)* Page title — use `LAYOUT_FLAGS` for this file:
>     - If `customLayout: true` or `hidePageHeader: true` → the page owns its title. Flag `<Text fontSize="...">`, `style={{ fontSize }}`, or raw `<h1>`. Correct form is `<Heading level="1">`.
>     - If no flags (`{}`) → template auto-renders the title. Flag any `<Heading level="1">` that appears to duplicate it.
>
> **Section C — V3 design system checks** (use `V3_CONTEXT`):
> 15. Gradient colors — must use `--opal-gradient-*` CSS custom properties, never `bg.*` Axiom tokens
> 16. Action Cards — must import from `@optiaxiom/proteus`, never recreated with raw HTML or Axiom primitives
> 17. OpalOrb / Opal avatar — must use `/fd-avatar-opal.png`, never recreated with CSS or SVG
> 18. Loading states — must reuse an existing `OpalLoader` component, never new `@keyframes` animations
> 19. UI patterns (ActivityStream, PromptInput, OutputIsland, etc.) — check against patterns in `V3_CONTEXT`
>
> Respond with ONLY JSON:
> `{"pass": true, "violations": []}` or `{"pass": false, "violations": [{"line": 12, "rule": "...", "code": "..."}]}`

---

## Agent 2 — Fixer (only if violations found and user chose "fix")

For each file that failed, spawn a sub-agent with:

> Fix all Axiom V3 compliance violations in this file.
>
> **File:** `FILE_PATH`
> **Valid tokens:** `VALID_TOKENS`
> **Component specs:** `COMPONENT_SPECS`
> **V3 context:** `V3_CONTEXT`
> **Violations:**
> `VIOLATIONS`
>
> Read the file, fix every violation listed **except** icon-related violations (rules 3 and 4) if `FIX_ICONS = no` — skip those and leave them as-is.
> Do not change anything beyond what's needed to fix the violations.

---

## Output

Print a compliance report:

```
✓ app/opal/tools/components/ConnectorTile.tsx — PASS
✗ app/opal/tools/page.tsx — 2 violations
  • Line 34: p="17" (not a valid spacing token)
  • Line 56: gradient using bg.* token instead of --opal-gradient-* CSS property
```

If fixes were applied, confirm which files were updated.
