# Build Dev

Orchestrates 3 sub-agents to produce a compliant Axiom component — reusing existing code where possible, generating only when necessary.

**Usage:** `/build-dev` (will ask for inputs)

---

## Step 0 — Collect inputs

Use `AskUserQuestion` to ask:
1. **Figma URL** — right-click a frame in Figma → Copy link
2. **Output path** — where to save (e.g. `app/components/MyCard.tsx`), or "skip" to print to terminal

---

## Agent 1 — Design Fetcher + Codebase Scanner

Spawn a sub-agent with this prompt (fill in `FIGMA_URL`):

> Do two things:
>
> **Part A — Fetch the design**
> Use the figma MCP `get_design_context` with `FIGMA_URL` to get the full design: layout, spacing, colors, component hierarchy, and visual structure.
> Then use the axiom MCP `search_components` and `get_component` for each distinct UI element in the design to get the correct Axiom building blocks and their props.
>
> **Part B — Scan the codebase for existing components**
> Search `app/` for existing React components that match or closely resemble what the Figma design shows.
> Use Glob and Grep to search by:
> - Visual pattern (e.g. card layout, form with fields, data table, modal)
> - Relevant keywords from the design (e.g. "campaign", "asset", "metric")
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
> ## Existing Component Matches
> REUSE: [file path] — [reason it matches, what needs adapting]
> or
> NONE — no suitable existing component found
> ```

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
> **Design context:**
> `SCAN_RESULT`
>
> Adapt the minimum necessary — do not rewrite what already works. Keep the same file structure and existing logic. Only change what the design requires.
>
> Follow all Axiom rules:
> 1. All UI from `@optiaxiom/react` — no raw HTML when an Axiom component exists
> 2. Icons ONLY from `@optimizely/axiom-icons` — never `@tabler/icons-react` directly
> 3. Spacing tokens only: `"0" "2" "4" "6" "8" "10" "12" "16" "20" "24" "32" "40" "48" "56" "64"`
> 4. Semantic color tokens: `fg.*`, `bg.*`, `border.*` — no hex values
> 5. Input sizes: `"md"`, `"lg"`, `"xl"` only — never `"sm"`
> 6. Inputs wrapped in `<Field label="...">` — no manual `<Text>` labels
> 7. `rounded` and `shadow` props — never `style={{ borderRadius, boxShadow }}`
> 8. Dark mode via `[data-theme="dark"]` only
>
> Output the full updated TSX. No markdown fences. Start with imports.

**If `SCAN_RESULT` contains `NONE`** → spawn a sub-agent with:

> Generate a complete React/TypeScript component from scratch based on this design context:
>
> `SCAN_RESULT`
>
> Follow all Axiom rules:
> 1. All UI from `@optiaxiom/react` — no raw HTML when an Axiom component exists
> 2. Icons ONLY from `@optimizely/axiom-icons` — never `@tabler/icons-react` directly
> 3. Spacing tokens only: `"0" "2" "4" "6" "8" "10" "12" "16" "20" "24" "32" "40" "48" "56" "64"`
> 4. Semantic color tokens: `fg.*`, `bg.*`, `border.*` — no hex values
> 5. Input sizes: `"md"`, `"lg"`, `"xl"` only — never `"sm"`
> 6. Inputs wrapped in `<Field label="...">` — no manual `<Text>` labels
> 7. `rounded` and `shadow` props — never `style={{ borderRadius, boxShadow }}`
> 8. Dark mode via `[data-theme="dark"]` only
>
> Output the full TSX. No markdown fences. Start with imports.

Capture the sub-agent output as `COMPONENT_CODE`.

---

## Agent 3 — Compliance Reviewer

Spawn a sub-agent with this prompt (fill in `COMPONENT_CODE`):

> Review this React/TSX component for Axiom design system compliance:
>
> ```tsx
> COMPONENT_CODE
> ```
>
> Check every rule:
> 1. `@tabler/icons-react` imported directly (must use `@optimizely/axiom-icons`)
> 2. Arbitrary spacing — e.g. `p="17"`, `gap="11"` (allowed: 0,2,4,6,8,10,12,16,20,24,32,40,48,56,64)
> 3. Hex or rgb colors (must use `fg.*`, `bg.*`, `border.*` tokens)
> 4. `size="sm"` on Input or SearchInput (only md, lg, xl)
> 5. Raw HTML elements used as product UI
> 6. Manual `<Text>` or `<label>` beside an input instead of `<Field label="...">`
> 7. `style={{ borderRadius }}` or `style={{ boxShadow }}`
> 8. `@media (prefers-color-scheme: dark)`
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

## Output

If `--out` path was given and the component passed review, write the final TSX using the Write tool.

Report:
- **Mode**: adapted existing (`REUSE_PATH`) or generated new
- **Axiom components used**
- **Review result**: passed first try / passed after N fix(es) / failed with remaining violations
