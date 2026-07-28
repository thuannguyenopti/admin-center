---
name: build-dev
description: "Orchestrates a Figma-to-code pipeline: fetches the design (from a Figma URL or screenshot), scans the codebase for reusable components, adapts or generates a compliant Axiom component, previews it in the browser, then waits for user approval before writing the file. Use whenever the user wants to build a new UI component from a Figma design or screenshot, translate a frame into code, or produce a production-ready Axiom component. Triggers: 'build this component', 'implement this Figma design', '/build-dev', 'generate a component from this Figma URL', 'turn this frame into code', 'code up the X component from Figma'."
---

# Build Dev

Orchestrates 3 sub-agents to produce a compliant Axiom component — reusing existing code where possible, generating only when necessary. Includes a browser preview and explicit user approval before writing the final file.

**Usage:** `/build-dev` (will ask for inputs)

---

## Step 0 — Collect inputs

Use `AskUserQuestion` to ask:
1. **Design source** — Figma URL (right-click a frame → Copy link) OR a screenshot. If the user uploads/pastes a screenshot, Agent 1 will skip the Figma MCP fetch and analyze the screenshot directly.
2. **Output path** — where to save (e.g. `app/components/MyCard.tsx`), or "skip" to print to terminal only

---

## Pre-flight — Version detection + load live Axiom spec

Determine Axiom version from the output path:
- If output path is under `app/opal/` → `VERSION = "v3"`, use `mcp__axiom_v3__*` tools
- Otherwise → `VERSION = "v2"`, use `mcp__axiom__*` tools

**A — Valid tokens:**
- V2: `mcp__axiom__get_tokens` → `VALID_TOKENS`
- V3: `mcp__axiom_v3__get_tokens` → `VALID_TOKENS`

**B — Component specs:**
- V2: `mcp__axiom__search_components` then `mcp__axiom__get_component` for likely components (at minimum: `Button`, `Box`, `Text`, `Input`, `Badge`, `Card`, `Select`, `Switch`, `Tabs`) → `COMPONENT_SPECS`
- V3: `mcp__axiom_v3__search_components` then `mcp__axiom_v3__get_component` for the same set → `COMPONENT_SPECS`

**C — Opal context** (only when `VERSION = "v3"`):
Read `OPAL_DESIGN_SYSTEM.md` → capture as `OPAL_CONTEXT`.

**D — Layout flags** (only when `VERSION = "v3"` and output path is a `page.tsx`):
Read `app/layout.tsx`. Derive the route from the output path (e.g. `app/opal/artifacts/page.tsx` → `/opal/artifacts`) and look up whether that route's nav entry has `customLayout: true` or `hidePageHeader: true`.

Capture as `PAGE_LAYOUT_FLAGS` (e.g. `{ hidePageHeader: true }` or `{}`). If the route isn't found in the nav, default to `{}`.

These will be passed into Agents 2 and 3 so prop validation is always against the live spec.

---

## Agent 1 — Design Fetcher + Codebase Scanner

**If design source is a Figma URL**, spawn a sub-agent with this prompt (fill in `FIGMA_URL`, `VERSION`, `OPAL_CONTEXT` if applicable):

> Do two things:
>
> **Part A — Fetch the design**
> Use the figma MCP `get_design_context` with `FIGMA_URL` to get the full design: layout, spacing, colors, component hierarchy, and visual structure.
> Then use the Axiom MCP `search_components` and `get_component` for each distinct UI element in the design to get the correct Axiom building blocks and their props.
> (Use `mcp__axiom_v3__*` if `VERSION = "v3"`, otherwise `mcp__axiom__*`.)
>
> `[if VERSION = "v3"]` Also check `OPAL_CONTEXT` — if the design uses Opal-specific patterns (ActivityStream, PromptInput, OutputIsland, Action Cards, OpalOrb, gradients), note them explicitly in the mapping.
>
> **Part B — Scan the codebase for existing components**
> Search `app/` for existing React components that match or closely resemble what the Figma design shows.
> Use Glob and Grep to search by:
> - Visual pattern (e.g. card layout, form with fields, data table, modal)
> - Relevant keywords from the design (e.g. "campaign", "asset", "metric", "opal", "agent")
> - Shared Axiom components likely to be in the target (e.g. `Card`, `DataTable`, `Dialog`)
>
> For each candidate found, read enough of it to assess fit.
>
> **Return a structured report:**
>
> ```
> ## Design Summary
> [layout, key elements, spacing, colors]
>
> ## Axiom Component Mapping
> [element → Axiom component + key props]
>
> ## Opal-specific Elements (if any)
> [element → Opal component or pattern from OPAL_CONTEXT]
>
> ## Existing Component Matches
> REUSE: [file path] — [reason it matches, what needs adapting]
> or
> NONE — no suitable existing component found
> ```

**If design source is a screenshot**, spawn a sub-agent with this prompt (fill in `VERSION`, `OPAL_CONTEXT` if applicable):

> Do two things:
>
> **Part A — Analyze the screenshot**
> Describe the layout, key UI elements, spacing, colors, component hierarchy, and visual structure visible in the screenshot.
> Then use the Axiom MCP `search_components` and `get_component` for each distinct UI element to get the correct Axiom building blocks and their props.
> (Use `mcp__axiom_v3__*` if `VERSION = "v3"`, otherwise `mcp__axiom__*`.)
>
> `[if VERSION = "v3"]` Also check `OPAL_CONTEXT` — if the screenshot shows Opal-specific patterns, note them explicitly in the mapping.
>
> **Part B — Scan the codebase for existing components** (same as Figma path above)
>
> **Return the same structured report format.**

Capture the full output as `SCAN_RESULT`.

---

## Agent 2 — Adapter or Generator

Parse `SCAN_RESULT` to determine the path:

**If `SCAN_RESULT` contains `REUSE:`** → spawn a sub-agent with:

> Adapt this existing component to match the Figma design.
>
> **Existing component:** `REUSE_PATH`
> Read the file first, then modify it to match the design.
>
> **Axiom version:** `VERSION`
> **Design context:** `SCAN_RESULT`
> **Valid tokens (from live Axiom MCP):** `VALID_TOKENS`
> **Component specs (from live Axiom MCP):** `COMPONENT_SPECS`
> `[if VERSION = "v3"]` **Opal context:** `OPAL_CONTEXT`
>
> Adapt the minimum necessary — do not rewrite what already works. Keep the same file structure and existing logic. Only change what the design requires.
>
> **Live spec (from MCP — use these for token/prop values):**
> - Color tokens: use only values from `VALID_TOKENS`
> - Enum props (appearance, colorScheme, size, rounded, shadow, etc.): use only values from `COMPONENT_SPECS`
>
> **Structural checklist (always apply):**
> - All UI from `@optiaxiom/react` — no raw HTML when an Axiom component exists
> - Icons ONLY from `@optimizely/axiom-icons` — never `@tabler/icons-react` directly
> - Spacing tokens only: `"0" "2" "4" "6" "8" "10" "12" "16" "20" "24" "32" "40" "48" "56" "64" "80"`
> - Inputs wrapped in `<Field label="...">` — no manual `<Text>` labels
> - `rounded` and `shadow` props — never `style={{ borderRadius, boxShadow }}`
> - Dark mode via `[data-theme="dark"]` only — never `@media (prefers-color-scheme: dark)`
> - No `<Text>` nested inside `<Text>` without `asChild` on the outer
>
> `[if VERSION = "v3"]` **V3 typography (inherited — do not set inline):**
> - Body/UI text = Die Grotesk B; headings h1–h6 = Nudge SemiNormal. Both are applied via `globals.css [data-brand="v3"]`.
> - Never add `style={{ fontFamily }}` or a `fontFamily` prop — it overrides the inherited stack.
> - Tab underlines: use `style={{ borderBottomColor: "var(--ax-colors-fg-default)" }}` (dark charcoal). Never `--ax-colors-border-focus` (that is the focus ring / teal).
> - Tab text: selected = `color="fg.default"` `fontWeight="500"`; unselected = `color="fg.tertiary"` `fontWeight="400"`.
> - Never override `--ax-colors-fg-default-inverse` to dark — that breaks tooltip text. Primary button dark text is handled by `--v3iotm`.
>
> `[if VERSION = "v3"]` **Opal checklist (additional):**
> - Gradient colors → CSS custom properties (`--opal-gradient-*`), never `bg.*` tokens
> - Action Cards → import from `@optiaxiom/proteus`, not custom HTML
> - OpalOrb → use `/opal-orb.png`, not CSS/SVG recreation
> - Loading states → reuse existing `OpalLoader` components
> - Opal UI patterns → follow `OPAL_CONTEXT` for ActivityStream, PromptInput, OutputIsland, etc.
>
> Output the full updated TSX. No markdown fences. Start with imports.

**If `SCAN_RESULT` contains `NONE`** → spawn a sub-agent with:

> Generate a complete React/TypeScript component from scratch based on this design context:
>
> **Axiom version:** `VERSION`
> **Design context:** `SCAN_RESULT`
> **Valid tokens (from live Axiom MCP):** `VALID_TOKENS`
> **Component specs (from live Axiom MCP):** `COMPONENT_SPECS`
> `[if VERSION = "v3"]` **Opal context:** `OPAL_CONTEXT`
>
> **Live spec (from MCP — use these for token/prop values):**
> - Color tokens: use only values from `VALID_TOKENS`
> - Enum props (appearance, colorScheme, size, rounded, shadow, etc.): use only values from `COMPONENT_SPECS`
>
> **Structural checklist (always apply):**
> - All UI from `@optiaxiom/react` — no raw HTML when an Axiom component exists
> - Icons ONLY from `@optimizely/axiom-icons` — never `@tabler/icons-react` directly
> - Spacing tokens only: `"0" "2" "4" "6" "8" "10" "12" "16" "20" "24" "32" "40" "48" "56" "64" "80"`
> - Inputs wrapped in `<Field label="...">` — no manual `<Text>` labels
> - `rounded` and `shadow` props — never `style={{ borderRadius, boxShadow }}`
> - Dark mode via `[data-theme="dark"]` only — never `@media (prefers-color-scheme: dark)`
> - No `<Text>` nested inside `<Text>` without `asChild` on the outer
>
> `[if VERSION = "v3"]` **V3 typography (inherited — do not set inline):**
> - Body/UI text = Die Grotesk B; headings h1–h6 = Nudge SemiNormal. Both are applied via `globals.css [data-brand="v3"]`.
> - Never add `style={{ fontFamily }}` or a `fontFamily` prop — it overrides the inherited stack.
> - Tab underlines: use `style={{ borderBottomColor: "var(--ax-colors-fg-default)" }}` (dark charcoal). Never `--ax-colors-border-focus` (that is the focus ring / teal).
> - Tab text: selected = `color="fg.default"` `fontWeight="500"`; unselected = `color="fg.tertiary"` `fontWeight="400"`.
> - Never override `--ax-colors-fg-default-inverse` to dark — that breaks tooltip text. Primary button dark text is handled by `--v3iotm`.
>
> `[if VERSION = "v3"]` **Opal checklist (additional):**
> - Gradient colors → CSS custom properties (`--opal-gradient-*`), never `bg.*` tokens
> - Action Cards → import from `@optiaxiom/proteus`, not custom HTML
> - OpalOrb → use `/opal-orb.png`, not CSS/SVG recreation
> - Loading states → reuse existing `OpalLoader` components
> - Opal UI patterns → follow `OPAL_CONTEXT` for ActivityStream, PromptInput, OutputIsland, etc.
> - Prefer Opal-specific components from `OPAL_CONTEXT` over generic Axiom primitives for chat/AI UI
>
> Output the full TSX. No markdown fences. Start with imports.

Capture the sub-agent output as `COMPONENT_CODE`.

---

## Agent 3 — Compliance Reviewer

Spawn a sub-agent with this prompt (fill in `COMPONENT_CODE`):

> Review this React/TSX component for Axiom design system compliance.
>
> ```tsx
> COMPONENT_CODE
> ```
>
> **Axiom version:** `VERSION`
> **Valid tokens (from live Axiom MCP):** `VALID_TOKENS`
> **Component specs (from live Axiom MCP):** `COMPONENT_SPECS`
> `[if VERSION = "v3"]` **Opal context:** `OPAL_CONTEXT`
>
> **Section A — Live spec checks** (use `VALID_TOKENS` and `COMPONENT_SPECS`):
> 1. Hex or rgb colors — check every `color`, `bg`, `borderColor` prop value against `VALID_TOKENS`
> 2. Invalid enum prop values — check `appearance`, `colorScheme`, `size`, `rounded`, `shadow`, and other enum props on every Axiom component against `COMPONENT_SPECS`
>
> **Section B — Structural pattern checklist** (fixed rules, always apply):
> 3. `@tabler/icons-react` imported directly (must use `@optimizely/axiom-icons`)
> 4. Arbitrary spacing — e.g. `p="17"`, `gap="11"` (allowed: 0,2,4,6,8,10,12,16,20,24,32,40,48,56,64,80)
> 5. `size="sm"` on Input or SearchInput
> 6. Raw HTML elements used as product UI
> 7. Manual `<Text>` or `<label>` beside an input instead of `<Field label="...">`
> 8. `style={{ borderRadius }}` or `style={{ boxShadow }}`
> 9. `@media (prefers-color-scheme: dark)` (must use `[data-theme="dark"]`)
> 10. `<Text>` nested inside another `<Text>` without `asChild`
> 11. *(V3 only, page.tsx only)* Page title — use `PAGE_LAYOUT_FLAGS`:
>     - If `customLayout: true` or `hidePageHeader: true` → render the page title as `<Heading level="1">`. Never `<Text fontSize="...">`, inline `style={{ fontSize }}`, or raw `<h1>`.
>     - If no flags (`{}`) → do NOT render a `<Heading level="1">` page title; the template auto-generates it.
>
> **Section C — Opal-specific checks** (only when `VERSION = "v3"`):
> Use `OPAL_CONTEXT`:
> 11. Gradient colors — must use `--opal-gradient-*` CSS custom properties, never `bg.*` tokens
> 12. Action Cards — must import from `@optiaxiom/proteus`, never raw HTML
> 13. OpalOrb — must use `/opal-orb.png`, never CSS/SVG recreation
> 14. Loading states — must reuse `OpalLoader` components, never new `@keyframes`
> 15. Opal UI patterns — check against `OPAL_CONTEXT` for ActivityStream, PromptInput, OutputIsland
>
> Respond with ONLY JSON:
> `{"pass": true, "violations": []}` or `{"pass": false, "violations": ["...", ...]}`

---

## Fix Loop

If `"pass": false`, re-run **Agent 2** (same mode — adapt or generate) appending:

> The previous version had these violations — fix all of them:
> - VIOLATION_1
> - VIOLATION_2

Then re-run **Agent 3**. Repeat up to **2 times**. After 2 failures, output the last version and list remaining violations for manual fixing.

---

## Step 4 — Preview

Once the component passes compliance review:

1. **Write to a temp path** — use `OUTPUT_PATH` if provided, otherwise write to `app/components/_preview_build_dev.tsx`.
2. **Start the dev server** — invoke the `preview-dev` skill (or `mcp__Claude_Preview__preview_start` if already running). Navigate to the route that renders the component, or the nearest page that imports it.
3. **Screenshot** — use `mcp__Claude_Preview__preview_screenshot` to capture the rendered result.
4. **Show the screenshot** and summarize: what rendered correctly vs. the design, and any obvious layout or styling gaps.

---

## Step 5 — Review gate

Use `AskUserQuestion` with these options:

- **"Looks good — save it"** → confirm the file is written to `OUTPUT_PATH` and report done
- **"Make changes"** → ask what to fix, re-run Agent 2 with the feedback appended, re-run Agent 3, update the preview, return to this gate
- **"Discard"** → delete the temp file and exit without writing

**Do NOT push, commit, or open a PR.** That is the user's responsibility after review.

---

## Output

Report:
- **Mode**: adapted existing (`REUSE_PATH`) or generated new
- **Axiom version**: V2 or V3 + Opal
- **Axiom components used**
- **Review result**: passed first try / passed after N fix(es) / failed with remaining violations
- **Preview**: screenshot shown; user approved / requested changes / discarded
