---
name: figma-builder
description: "**Preferred** code→Figma workflow for Axiom Play. Converts an app page into a Figma design using real Axiom library component instances (live component nodes, not drawn shapes). Use when the user asks to build a Figma from a page, translate code to Figma, create a Figma screen from an app route or file, or produce a component-backed design handoff. Triggers: 'build a Figma for...', 'create a Figma design from...', '/figma-builder', 'translate this page to Figma using real components'. Use `figma-generate-page` instead only for static visual specs, design handoffs, or pages with heavy custom UI that the Axiom library doesn't cover."
---

# Figma Builder

Creates a Figma screen from an Axiom Play page using real Axiom library component instances.

---

## Step 0 — Collect inputs

Auto-detect what you can, ask for the rest.

**Axiom version** — read the installed package first; only ask if it fails:
```bash
node -p "require('./node_modules/@optiaxiom/react/package.json').version"
```
- Starts with `3.` → V3
- Starts with `1.` or `2.` → V2

If the user is on a worktree where the package isn't installed, ask: V2 or V3?

Then use `AskUserQuestion` for the remaining inputs:
1. **Source** — running page URL (e.g. `http://localhost:3000/opal`), app route (e.g. `/opal`), or file path (e.g. `app/opal/page.tsx`). If URL, the dev server must be running.
2. **Figma destination** — a Figma file URL to add a new page to, or `"new"` to create a fresh file.

---

## References

Load only what the task needs — these files exist outside the skill body to keep this prompt small:

- **`references/detailed-workflow.md`** — full Agent 2 prompt: prerequisites, component-key rules, "never approximate" list, color tokens, Dialog/Modal rules, and Steps 1–8 of the build (capture → file open → wrapper → sections → images → audit → fidelity check → final report). **Read this before spawning Agent 2.**
- **`.claude/FIGMA_LIBRARY_V2.md`** — canonical V2 component keys (fileKey `JYy51au6YaA4QZKpQy1ZRg`), light + dark color tokens, typography, spacing, icons, plus the Opal-specific component keys.
- **`.claude/FIGMA_LIBRARY_V3.md`** — canonical V3 foundation tokens and component keys (library fileKey `qs72V79n1s9wYOcZ1TzBwM`).

---

## Agent 1 — Page Scanner

Spawn a sub-agent with the `Agent` tool — pass `model: "sonnet"` (codebase scanning + UI inventory extraction). Fill in `SOURCE`:

> Scan this source and extract a complete UI inventory.
>
> **Source:** `SOURCE`
>
> - File path: read directly + follow imports into `app/components/`
> - Page URL (`http://...`): extract path → `app/[path]/page.tsx`, follow imports
> - App route (`/...`): map to `app/[route]/page.tsx`, follow imports
>
> **⚠️ ALWAYS also read `app/components/template.tsx` and `app/layout.tsx`** — these define the full page shell: top navigation bar, left sidebar icons, secondary nav panel, and overall layout structure. Every page is rendered inside this shell. Include all shell components in the inventory.
>
> Extract:
> - Every `@optiaxiom/react` component with all props and values
> - Layout: flex/grid direction, gap, padding, alignment, nesting
> - Spacing tokens (e.g. `p="16"`, `gap="8"`)
> - Color tokens (e.g. `color="fg.secondary"`)
> - Typography: fontWeight, fontSize, as-element overrides
> - Text content: labels, headings, placeholders
> - Icons from `@optimizely/axiom-icons`
> - Custom inline styles (hex colors, px values not from tokens)
>
> Return a **Page Inventory**:
> ```
> ## Layout
> [top-level structure]
>
> ## Components
> - Button: appearance="subtle" size="sm" icon=IconPlus — "Add"
> - Textarea: placeholder="Ask Opal" — in OpalInput
> [etc.]
>
> ## Spacing & Colors
> [gap/padding values, color tokens used]
>
> ## Custom Styles
> [any hardcoded hex/px not from tokens]
>
> ## Has Images
> yes/no — img tags, background images, avatar src URLs
> ```

Capture the output as `PAGE_INVENTORY`.

---

## Agent 2 — Figma Builder

**Before spawning Agent 2, read `references/detailed-workflow.md` and the relevant library file (`.claude/FIGMA_LIBRARY_V2.md` for V2 or `.claude/FIGMA_LIBRARY_V3.md` for V3).** That gives you the full build steps, component keys, and reference patterns the agent needs.

Spawn a sub-agent with the `Agent` tool — pass `model: "sonnet"` (Plugin API calls and design synthesis). Fill in `PAGE_INVENTORY`, `SOURCE_URL`, `FIGMA_DESTINATION`, `AXIOM_VERSION`:

> Build a Figma screen for this Axiom Play page using real library component instances.
>
> **Page inventory:** `PAGE_INVENTORY`
> **Source URL:** `SOURCE_URL`
> **Figma destination:** `FIGMA_DESTINATION`
> **Axiom version:** `AXIOM_VERSION`
>
> **Before doing anything else, read these reference files:**
> 1. `.claude/skills/figma-builder/references/detailed-workflow.md` — your full workflow, including Mandatory Prerequisites, component keys, "never approximate" rules, Dialog/Modal layout spec, and Steps 1–8 of the build.
> 2. `.claude/FIGMA_LIBRARY_V2.md` (V2) or `.claude/FIGMA_LIBRARY_V3.md` (V3) — canonical component keys, color tokens, typography, spacing, and icons. Use these instead of memorized values.
>
> Then follow the workflow in `detailed-workflow.md` end-to-end. Don't skip the pre-delivery audit (Step 6) or the visual fidelity comparison (Step 7) — they catch the issues that the inventory misses.

---

## Output

```
✓ Scanned: [source]
✓ Library: Axiom V2 — JYy51au6YaA4QZKpQy1ZRg  (or V3 — qs72V79n1s9wYOcZ1TzBwM)
✓ Real instances: N
✓ Approximated: M
✓ Audit: PASS (or list issues)
✓ Frame: https://figma.com/design/...

[screenshot]
```
