# axiom-play — Claude Instructions

## Stack
Next.js 14 App Router · TypeScript · `@optiaxiom/react` (Axiom design system) · `@optimizely/axiom-icons`

---

## 1. Always use the Figma MCP before implementing UI

Before writing or changing any UI component, call `mcp__Figma__get_design_context` (or `mcp__Figma__get_screenshot`) to get the exact spec from the source-of-truth Figma file. Do not guess spacing, colors, typography, or layout from screenshots or memory.

- Primary Figma file: `IYw5fvSct4YErcbWc6BfBE` (Opal — Notifications)
- Extract `node-id` from any Figma URL passed by the user and call the MCP directly
- If the design context payload is too large (>100k chars), save it to a temp file with `python3` and grep for the relevant section node IDs, then call `mcp__Figma__get_screenshot` on individual nodes

**Never implement a new UI pattern without first checking what Axiom already provides for it.**

---

## 2. Always use Axiom components (`@optiaxiom/react`)

Axiom is the only approved component and token system. Rules:

### Components
- Import from `@optiaxiom/react` for all layout, typography, interactive, and feedback components
- Import icons from `@optimizely/axiom-icons` (preferred) or `@tabler/icons-react` (supplemental only)
- Use `@optiaxiom/react/unstable` for DetailsPanel, DetailsPanels — these are stable enough for production use here
- **Never** use raw HTML elements (`<div>`, `<p>`, `<button>`, `<span>`) when an Axiom component exists
- **Never** use Tailwind utility classes for layout or spacing — use Axiom `Box` props instead
- Exception: Tailwind `className` is allowed only for Axiom-gap patterns (e.g. `hover:bg-[var(--ax-colors-bg-tertiary)]`, `animate-spin`, `line-clamp-2`) when no Axiom prop covers it

### Typography
| Use case | Axiom prop |
|---|---|
| Panel/tray headers | `<Text fontSize="lg" fontWeight="500">` |
| Section labels | `<Text fontSize="md" fontWeight="600">` |
| Body / notification title (unread) | `<Text fontSize="md" fontWeight="700">` |
| Body / notification title (read) | `<Text fontSize="md" fontWeight="500">` |
| Secondary body / message | `<Text fontSize="sm" color="fg.tertiary">` |
| Timestamps, captions | `<Text fontSize="xs" color="fg.tertiary">` |
| Tab bar labels | `<Text fontSize="sm" fontWeight="600"/"400" color="fg.default"/"fg.tertiary">` |

**Never use inline `fontSize` numbers or pixel strings** (e.g. `fontSize: 13`, `fontSize: "13px"`).
**Never use numeric `fontWeight`** (e.g. `fontWeight: 600`) — always use string Axiom tokens (`"600"`, `"500"`, `"400"`).

### Color tokens
**Never use hardcoded hex or rgb values.** Always use CSS variable tokens:

| Semantic intent | Token |
|---|---|
| Error / destructive | `var(--ax-colors-fg-error)` |
| Warning | `var(--ax-colors-fg-warning)` |
| Success | `var(--ax-colors-fg-success)` |
| Accent / brand | `var(--ax-colors-fg-accent)` |
| Info | `var(--ax-colors-fg-information)` |
| Muted / tertiary | `var(--ax-colors-fg-tertiary)` |
| Default text | `var(--ax-colors-fg-default)` |
| Default background | `var(--ax-colors-bg-default)` |
| Secondary background | `var(--ax-colors-bg-secondary)` |
| Tertiary background | `var(--ax-colors-bg-tertiary)` |
| Borders | `var(--ax-colors-border-tertiary)` / `var(--ax-colors-border-secondary)` |

Or use the equivalent Axiom prop shorthand where available (e.g. `color="fg.error"`, `bg="bg.secondary"`, `borderColor="border.tertiary"`).

### Spacing
Use Axiom spacing props only: `p`, `px`, `py`, `pt`, `pb`, `pl`, `pr`, `gap`, `m`, `mx`, `my` etc.
Numeric values map to px (e.g. `p="16"` = 16px, `gap="8"` = 8px).
**Never use `style={{ padding: ... }}` or `style={{ margin: ... }}`** for standard spacing.

---

## 3. Axiom compliance check workflow

When asked to review or implement a UI component, follow this order:

1. **Figma MCP** — get design context / screenshot for the relevant node
2. **Check existing Axiom components** — visit `https://optimizely-axiom.github.io` (via `WebFetch`) if unsure whether a component exists
3. **Implement using Axiom props and tokens only**
4. **Verify in preview** — use `mcp__Claude_Preview__preview_inspect` with specific CSS properties (never rely on screenshots alone for color/font verification)
5. **Run compliance grep** — after editing, scan for violations:
   ```bash
   grep -n "#[0-9A-Fa-f]\{3,6\}\|fontSize.*[0-9]px\|fontSize:.*[0-9]\b\|fontWeight:.*[0-9][0-9][0-9]" <file>
   ```

---

## 4. Notification UI catalog (`/opal/notification-catalog`)

This page is the source-of-truth for all notification UI patterns in the codebase. When updating the actual component, **always keep the catalog in sync**:

- `NotificationDropdown.tsx` ↔ Section 2 (Notification Center) in `NotificationCatalog.tsx`
- `CompactNotificationCard` ↔ Section 3 (Notification Items)
- Any new pattern added to production must have a corresponding `<CatalogItem>` added to the catalog

---

## 5. Preview server

Dev server runs via `mcp__Claude_Preview__preview_start` — always use this, never `Bash(npm run dev)`.
After editing files while the preview is running, take a screenshot and verify before committing.
