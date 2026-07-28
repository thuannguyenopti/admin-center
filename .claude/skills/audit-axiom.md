---
name: audit-axiom
description: "Reviews component files for Axiom V3 design system violations and optionally auto-fixes them. Use whenever the user wants to check a file or all branch changes for compliance issues: wrong spacing tokens, hex colors, direct Tabler icon imports, invalid icon names from @optiaxiom/icons, raw HTML, missing Field wrappers, incorrect Input sizes, hardcoded borderRadius/boxShadow, or wrong dark-mode selectors. Also checks Opal-specific rules for files in app/opal/. Triggers: 'audit axiom', 'check compliance', 'fix axiom violations', '/audit-axiom', 'are there any axiom issues in...', 'check this file for violations'."
---

# Audit Axiom

Reviews an existing component file for Axiom V3 design system violations and optionally fixes them.

**Usage:** `/audit-axiom` (will ask for inputs)

---

## Step 0 — Collect inputs

Use `AskUserQuestion` to ask:
1. **File to check** — path to the component (e.g. `app/components/MyCard.tsx`), "current" to check all files changed on this branch, or a product area (e.g. `opal`, `cms`, `cmp`) to check all files under `app/<area>/`
2. **Action if violations found** — fix automatically, or just report
3. **Update icons?** *(only ask if action is "fix")* — should icon-related violations (invalid icon names, `@tabler/icons-react` direct imports) be included in the auto-fix? Capture as `FIX_ICONS` (yes/no).

---

## Pre-flight — Load live spec

Always uses Axiom V3 (`mcp__axiom_v3__*` tools).

**A — Valid color tokens** (live from MCP):
Call `mcp__axiom_v3__get_tokens` → `VALID_TOKENS`

**B — Valid component props** (live from MCP):
Scan the files for Axiom component names (e.g. `Button`, `Input`, `Badge`, `Text`, `Box`).
Call `mcp__axiom_v3__get_component` for each → `COMPONENT_SPECS`

**C — Valid icon names** (live from installed package):
```bash
node -e "const m = require('./node_modules/@optiaxiom/icons/dist/index.js'); console.log(Object.keys(m).filter(k => k.startsWith('Icon')).join('\n'));"
```
Capture as `VALID_ICONS`.

**D — Opal context** (for files in `app/opal/`):
Read `OPAL_DESIGN_SYSTEM.md` → capture as `OPAL_CONTEXT`.

**E — Layout flags** (for files that are `page.tsx`):
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

For each file, spawn a sub-agent with:

> Read this file: `FILE_PATH`
>
> Review it for Axiom V3 design system violations. Use the live spec data below — do not rely on guesses or memory.
>
> **Valid tokens:** `VALID_TOKENS`
> **Component specs:** `COMPONENT_SPECS`
> **Valid icons:** `VALID_ICONS`
> `[if file is in app/opal/]` **Opal context:** `OPAL_CONTEXT`
> `[if file is page.tsx]` **Layout flags for this file:** `LAYOUT_FLAGS[FILE_PATH]` (e.g. `{ hidePageHeader: true }` or `{}`)
>
> **Section A — Live spec checks** (use `VALID_TOKENS`, `COMPONENT_SPECS`, `VALID_ICONS`):
> 1. Hex or rgb colors — check BOTH Axiom props (`color=`, `bg=`, `borderColor=`) AND inline `style={{ color, background, backgroundColor, borderColor }}` values against `VALID_TOKENS`. Flag any literal hex (`#abc`), rgb(), or hsl() value not in the list. **Do not skip inline styles — this is a common source of missed violations on header text and backgrounds.** Do NOT flag `var(--ax-colors-*)` references in inline styles — those are valid Axiom CSS custom properties, not hardcoded colors.
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
> 11. `<Text>` nested inside another `<Text>` without `asChild` — use `asChild` on the outer `Text` when it wraps inline children
> 12. Icon color inside `Button appearance="primary"` — icons passed to the `icon` prop of a primary Button must NOT have an explicit `color`, `style={{ color }}`, or color class. The button CSS sets icon color to white automatically; overriding it causes a nude/muted tone. Flag any `<IconX style={{ color: ... }}>` or `color="..."` on icons inside primary Buttons, and remove the explicit color entirely when fixing.
> 13. Inline `style={{ fontFamily }}` or a `fontFamily` prop overriding the V3 font stack. V3 typography is inherited via `globals.css [data-brand="v3"]` — never set it inline. Body/UI text = Die Grotesk B; headings (h1–h6) = Nudge SemiNormal.
> 14. `--ax-colors-fg-default-inverse` overridden to a dark value in a component or local CSS. This token controls tooltip text color (must stay light/white on dark tooltip backgrounds). Primary button dark text is handled by `--v3iotm`, not this token.
> 15. *(page.tsx files only)* Page title — use the provided `LAYOUT_FLAGS` for this file:
>     - If `customLayout: true` or `hidePageHeader: true` → the page owns its title. Flag any `<Text fontSize="...">`, inline `style={{ fontSize }}`, or raw `<h1>` used as the page title. The correct form is `<Heading level="1">`.
>     - If no flags (empty `{}`) → the template auto-renders the title. Flag any `<Heading level="1">` that appears to be a duplicate page title.
>
> **Section C — Opal-specific checks** (only for files in `app/opal/`):
> Use `OPAL_CONTEXT` for the rules below:
> 15. Gradient colors — Opal gradients must use CSS custom properties (`--opal-gradient-*`), never `bg.*` Axiom tokens
> 16. Action Cards — must import from `@optiaxiom/proteus`, never recreated with raw HTML or Axiom primitives
> 17. Loading states — must reuse an existing `OpalLoader` component, never new `@keyframes` animations
> 18. Opal UI patterns (ActivityStream, PromptInput, OutputIsland, etc.) — check against patterns in `OPAL_CONTEXT`
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
> `[if file is in app/opal/]` **Opal context:** `OPAL_CONTEXT`
> **Violations:**
> `VIOLATIONS`
>
> Read the file, fix every violation listed **except** icon-related violations (rules 3 and 4) if `FIX_ICONS = no` — skip those and leave them as-is.
> Do not change anything beyond what's needed to fix the violations.

---

## Output

Print a compliance report:

```
✓ app/components/Foo.tsx — PASS
✗ app/opal/Bar.tsx — 3 violations  [+ Opal checks]
  • Line 12: @tabler/icons-react import
  • Line 34: p="17" (not a valid spacing token)
  • Line 56: Opal gradient using bg.* token instead of CSS custom property
```

If fixes were applied, confirm which files were updated.
