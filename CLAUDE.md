# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start development server at http://localhost:3000 (Turbopack)
yarn build        # Production build (runs validate + bundle-sources first)
yarn preview      # Build + serve production bundle locally — mirrors Vercel exactly
yarn start        # Serve a previously built production bundle
yarn lint         # ESLint via Next.js
```

> **`yarn dev` vs `yarn preview`**: `yarn dev` uses Turbopack and may render Axiom styles differently from production. Run `yarn preview` to see exactly what Vercel will serve before pushing.

Package manager is **Yarn 4** (Corepack). Use `yarn` not `npm`. Run `corepack enable` (requires sudo) if `yarn dev` fails. To install with auth-gated registry: `yarn install:auth` (uses `.env`). Fallback without Corepack: `node_modules/.bin/next dev`.

## ⚠️ Critical: Browser Verification Is Mandatory For UI/Frontend Work

**`yarn tsc --noEmit` and `yarn build` passing does NOT mean a UI change works.** They catch type errors and bundling errors, not runtime bugs: infinite render loops, duplicate React keys, broken click handlers, crashes on a specific route or interaction path. Every one of those is invisible to typecheck/build and only shows up when the page is actually loaded and clicked through in a browser.

**Never tell the user a frontend change is "verified" or "done" based on typecheck/build alone.** If you have not actually loaded the affected page(s) in a browser and exercised the interaction paths you changed (not just the happy path — click into every new section/tab/dialog you touched), say so explicitly instead of implying it's confirmed working.

**If `mcp__Claude_Browser__preview_start` or the `claude-in-chrome`/`Control_Chrome` MCP tools fail** (this environment has a recurring `EPERM: operation not permitted, open '.../node_modules/next/dist/bin/next'` error with the sandboxed preview tool, and `Control_Chrome` may report "Chrome is not running") — do not silently give up on verification and fall back to "typecheck + build + manual code trace." Instead, drive a real headless browser directly:

```bash
# One-time setup in a scratch dir (chromium binary is usually already cached under ~/Library/Caches/ms-playwright)
mkdir -p /tmp/pw-verify && cd /tmp/pw-verify && npm init -y && npm install playwright --no-save
npx playwright install chromium   # only if the cache check below comes up empty
```

Then write a small Node script that launches Chromium, `page.goto()`s the dev server (`http://localhost:3000/...` — check `lsof -i :3000` first; a dev server may already be running), listens for `pageerror` and `console` (`type() === 'error'`) events, and actually clicks through every new/changed UI path (tabs, nested sections, dialogs) — not just the initial page load. Assert zero errors. Take a screenshot and read it back with the `Read` tool to confirm the visual result, not just the absence of console errors.

**This is not optional busywork — it is the only way to catch an entire class of bugs** (render loops from unstable callback identities in effect dependency arrays, duplicate keys from data with more variety than the code assumed, broken navigation) that a code review and a clean build will never surface. A past round of work in this repo shipped exactly such a crash (infinite "Maximum update depth exceeded" loop on a Design System tab, only caught when the user manually clicked into it) because verification stopped at "build is clean."

## ⚠️ Critical: Build Script & Webpack Rules

**NEVER add `--webpack` or `--turbopack` to the `next build` command.** Forcing either bundler mode breaks Next.js's internal CSS extraction pipeline for `transpilePackages: ["@optiaxiom/react"]`, causing all Axiom component styles (borders, fills, backgrounds) to be silently stripped from the Vercel production build. The correct build command is simply `next build` with no bundler flags.

**NEVER add custom `webpack(config)` SVG rule mutations** (pushing to `config.module.rules`, wrapping/excluding asset rules). Mutating the raw webpack rules array breaks the same CSS extraction. For SVG support:
- Dev (Turbopack): use the `turbopack.rules` block in `next.config.ts` — already configured
- Production: SVGs in `public/` are served as static assets; React SVG components in `app/cmp/assets/` use SVGR via import — no extra webpack rule needed

If Axiom component styles (button borders, input fills, etc.) are missing in production but work locally, the root cause is almost always one of the above.

## Architecture

This is a **multi-product UI prototype** built with Next.js 16 (App Router), React 19, TypeScript, and the Optimizely Axiom design system. It renders several independent product areas as a single Next.js app:

| Route prefix | Product |
|---|---|
| `/cms` | Optimizely CMS |
| `/cmp` | Content Marketing Platform |
| `/opal` | Opal AI assistant |
| `/connect-platform` | Connect Platform |
| `/fe-hosting` | Frontend Hosting |

### Navigation & Layout

**`app/layout.tsx`** is a thin shell. It imports each product's navigation module, assembles them into a `structure` object keyed by the first path segment, and passes the matching nav tree to `app/components/template.tsx`. **Do not edit `app/layout.tsx` to add or change nav items** — it is locked down via CODEOWNERS. Edit the per-product navigation file instead:

| Product | File | Export | Notes |
|---|---|---|---|
| CMS | `app/cms/navigation.tsx` | `useCmsNav()` | Hook — reads algorithm / webhook / content-type detail IDs from the path and pulls dynamic sub-nav titles from `usePersistentState` |
| CMP | `app/cmp/navigation.tsx` | `cmpNav` | Static const |
| Opal | `app/opal/navigation.tsx` | `useOpalNav()` | Hook — listens to `im-layout-change` window events for IM layout A / B / C variants |
| Connect Platform | `app/connect-platform/navigation.tsx` | `connectPlatformNav` | Static const |
| FE Hosting | `app/fe-hosting/navigation.tsx` | `feHostingNav` | Static const |
| Web Experimentation | `app/web-experimentation/navigation.tsx` | `webExperimentationNav` | Static const |

Hook vs. const: export a hook (`useXxxNav()`) only when the nav needs hooks (path-detail substitution, persistent state, window events). Static product navs stay constants.

**Per-product CSS** follows the same pattern. `app/globals.css` keeps only truly cross-cutting rules (imports, fonts, theme machinery, body resets, scrollbars, generic animations like `.appear`/`@keyframes shimmer`, template grid `.parent`/`.div1-3`, VT slide animation, modal lock). Product-specific rules live in `app/<product>/styles.css` and are pulled into the cascade via `@import` from `globals.css`:

| Product | File |
|---|---|
| CMS | `app/cms/styles.css` — `.newly-imported` highlight, `.vb-outline`/`.chevron` |
| CMP | `app/cmp/styles.css` — empty placeholder |
| Opal | `app/opal/styles.css` — `.opalGenerateButton`, `.vau-card`, `.pinned-card`, `.file-card` |
| Connect Platform | `app/connect-platform/styles.css` — empty placeholder |
| FE Hosting | `app/fe-hosting/styles.css` — empty placeholder |
| Web Experimentation | `app/web-experimentation/styles.css` — empty placeholder |

There's also a legacy `app/styles/opalStyles.css` with older Opal rules — additions can go in either Opal file, but prefer `app/opal/styles.css` for new rules so they sit with the product they belong to. **Do not edit `app/globals.css` to add product-specific CSS** — same lockdown rationale as `app/layout.tsx`. If your rule only matters for one product, put it in that product's `styles.css`.

**`app/components/template.tsx`** renders the shell: primary sidebar (`Sidebar`/`Nav`), optional secondary sidebar (VT drill-down or Content Manager sidebar), a scrollable main content area, an optional footer bar, and the Opal slide-out panel. Pages get `px="32" py="24"` padding and an auto-generated `<Heading>` page title by default.

**Never add route-specific logic to `template.tsx`** — no `path.startsWith(...)` checks, no per-page conditionals, no hardcoded product names or routes. All layout variation is driven by nav-item flags or context values (`useLayout`). If a new layout mode is needed, add a flag to the nav item and read it generically in the template.

**Nav-item layout flags** (resolved from the deepest matching nav level upward — lvl4 → lvl3 → lvl2 → top-level item):

| Flag | Effect |
|---|---|
| `customLayout: true` | Bypasses padding and page header — for full-bleed pages (e.g., Opal chat, CMS Edit) |
| `fullscreen: true` | Strips the entire shell (sidebar, GlobalBar, everything); children own the viewport at 100vh×100vw — for canvas-style builders (e.g., Workflow Builder) |
| `hideSidebar: true` | Hides primary + secondary sidebars; GlobalBar stays (e.g., Opal Studio) |
| `chromeless: true` | Hides GlobalBar and sidebars; content spans the full grid (e.g., Opal canvas mode) |
| `hidePageHeader: true` | Keeps padding but hides the auto-generated heading |
| `instantShell: true` | Disables the shell slide transition for the route |
| `hidden: true` | Item doesn't render in the sidebar — used for entries that exist only to carry layout flags for a route |
| `badge: <n>` | Shows a danger count badge on the sidebar item while it's not active |
| `opalCloseReturnTo: "<url>"` | Closing the Opal panel navigates to `?returnTo=` (or this fallback URL) |
| `query: {key: "value"}` | Restricts the item's highlight match to specific search params (e.g. `{artifacts: "1"}`) |

`highlight` may be a string or an array of path prefixes (e.g. Plan matches both `/cmp/plan-view` and `/cmp/task/`). Routes with no sidebar item still need a nav entry (with `hidden: true`) to carry their layout flags — see the bottom of `app/cmp/navigation.tsx` and `app/opal/navigation.tsx` for examples.

**Secondary sidebar drill-down (VT)** — when a nav item has nested `children` objects with a `title` and `children` array, clicking sub-items causes `VT.tsx` to slide in a sub-panel. Up to 4 levels deep (lvl2–lvl4).

### Design System

All UI must use **`@optiaxiom/react`** components. Never use raw HTML elements if an Axiom equivalent exists.

For frontend/product UI work, the agent must behave like a senior frontend product designer using Axiom V3, not like a prototype copier.

**Prototype handling rule**: screenshots, PM HTML, and vibe-coded demos are requirements input only. Extract the user need, then rebuild it with Axiom components, semantic tokens, existing repo patterns, and clean product hierarchy. Do not copy raw `button`, `input`, `select`, `textarea`, tiny CTAs, hardcoded colors, or inconsistent spacing from prototypes.

**Exception**: `app/components/vb/blocks/` uses raw HTML + Tailwind (Visual Builder renders customer website content, not product UI).


**Critical rules (all areas):**
- Spacing tokens only: `"0" "2" "4" "6" "8" "10" "12" "16" "20" "24" "32" "40" "48" "56" "64" "80"` — never arbitrary px
- Semantic color tokens: `fg.*`, `bg.*`, `border.*` — never hex values
- Border radius: `rounded` prop (not `borderRadius`); shadow: `shadow` prop (not `boxShadow`)
- `Input`/`SearchInput` only support `size="md"` (default), `"lg"`, `"xl"` — never `"sm"`
- Wrap inputs with `<Field label="...">` — never manual `<Text>` labels
- Dark mode: use `[data-theme="dark"]` selector — never `@media (prefers-color-scheme: dark)`
- Product controls: use Axiom `Button`, `Input`, `Select`, `Textarea`, `Switch`, `Tabs`, `Menu`, and `Tooltip`; raw product controls are forbidden when an Axiom equivalent exists
- Main CTAs: use `Button appearance="primary"` with `size="md"` or `size="lg"` unless matching an existing dense-toolbar pattern
- Empty ellipsis menus, decorative controls, and Settings tabs for one or two fields are not allowed

**Menus — always use `Menu` with the `options` prop, not `DropdownMenu`.** Axiom V3 has two menu components and they look similar from the outside, but they're different:

- **`Menu`** — data-driven. You pass a `MenuOption[]` array via the `options` prop, plus a `MenuTrigger` and `MenuContent`. Supports search/filter (`inputVisible`), nested sub-menus (`subOptions`, `subOptionsInputVisible`), groups with labels and separators (`group: { label, separator, hidden }`), per-item icons (`addon`), right-side detail (`detail`), danger styling (`intent: "danger"`), disabled with reason (`disabledReason`), and keyword matching (`keywords`). This is what almost every menu in the codebase should use.
- **`DropdownMenu`** — JSX-tree-driven (`DropdownMenuItem`, `DropdownMenuSub`, `DropdownMenuLabel`, `DropdownMenuSeparator`, etc.). Legacy from earlier Axiom versions. Don't introduce new usages.

When converting existing `DropdownMenu` code to `Menu`, helpers that previously rendered JSX (e.g. `<MyMenuItems />`) should export functions returning `MenuOption[]` instead — the caller spreads them into the parent `options` array. Search input inside a sub-menu uses `subOptionsInputVisible: true` + `keywords: "..."` on each sub-option; do not build manual `useState` + `Input` filtering inside menu content.

**Additional rules for `app/opal/` (Axiom V3 + Opal layer):**
- Opal gradient colors → CSS custom properties (`--opal-gradient-*`), never `bg.*` tokens
- Action Cards → must use `@optiaxiom/proteus`, never custom HTML
- OpalOrb → always use `/opal-orb.png`, never CSS/SVG recreation
- Loading states → reuse existing `OpalLoader` components in `app/opal/components/`
- See **`.claude/skills/opal-design.md`** for full Opal-specific rules (auto-loaded as a skill)

### Icons

**Icon packages differ by area:**

| Area | Package | Import example |
|------|---------|----------------|
| `app/opal/` | `@optiaxiom/icons` | `import { IconSearch } from "@optiaxiom/icons"` |
| All other areas | `@optimizely/axiom-icons` | `import { IconAgent } from "@optimizely/axiom-icons"` |

**NEVER use `@tabler/icons-react` in product UI code** — only allowed in `app/lib/axiom-icons.tsx` as a fallback shim.

- **`@optiaxiom/icons`** — the V3 icons package. Import directly in any `app/opal/` file.
- **`@optimizely/axiom-icons`** — the V2 icons package (FontAwesome Pro Light, vendor file). Also the fallback for icons not yet in `@optiaxiom/icons` (e.g. `IconAgent`, `IconSparkles`).
- **`app/lib/axiom-icons.tsx`** — a bridge shim for V2 areas that re-exports `@optimizely/axiom-icons` and provides Tabler fallbacks for missing icons. Not used in `app/opal/`.
- **`@tabler/icons-react`** — only allowed in `app/lib/axiom-icons.tsx` for fallback mappings. Never import Tabler directly in any other file.
- **CMP custom SVG icons** — in `app/cmp/assets/`, imported as React components (SVGR), use `fill="currentColor"`

**When adding a new icon in `app/opal/`**: check `@optiaxiom/icons` first. If missing, fall back to `@optimizely/axiom-icons` (not Tabler).

**Sub Agent icon placeholder** — the `Sub Agent` nav item (`app/opal/navigation.tsx`) and the agents type column (`app/opal/agents/page.tsx`) currently use `IconAgent` from `@optimizely/axiom-icons` as a temporary stand-in. The intended icon is the Material `web_traffic` icon (cursor with 3 radiating splash lines). Replace with the correct `@optiaxiom/icons` export once it is added to the package. Note: `IconSubAgent` in `@optimizely/axiom-icons` is a dashed-border box — do NOT use it for this.

**When adding a new icon outside `app/opal/`**: check `@optimizely/axiom-icons` first. If missing, add a Tabler fallback entry to `app/lib/axiom-icons.tsx`.

### Key Patterns

**`usePersistentState(key, defaultValue)`** — localStorage-backed state at `app/usePersistentState.js`. Returns `[state, setState, isHydrated]`. Always check `isHydrated` before rendering hydration-sensitive UI.

**`useLayout()`** — from `app/context/LayoutContext.tsx`. Exposes `asideContent`, `footerContent`, `hidePageHeader`, `opalPanelControls` (including `launchPrompt`), and `codePanelControls`. Use `setAsideContent` / `setFooterContent` from a page component to inject into the template's aside panel or sticky footer bar.

**`useOpalContext()`** — from `app/context/OpalContext.tsx`. Provides context-aware data (current page, selection, etc.) for the Opal AI panel.

**Providers stack**: `LayoutProvider` → `BrandToneProvider` → `PreflightProvider` → `OpalContextProvider` → `ContentManagerLayoutProvider` (CMS content only) → `FilterPanelProvider` (CMS content only).

### MCP Servers

Configured in `.mcp.json`:
- **`axiom-v3`** (`@optiaxiom/mcp@next`) — fetch Axiom component docs, valid prop values, tokens, and icon names
- **`axiom`** (`@optiaxiom/mcp`) — legacy V2 docs, still connected but prefer `axiom-v3`
- **`coda`** — Coda docs integration
- **`optimizely`** — Optimizely project data
- **`figma`** — Figma MCP (connected but no active skills use it)

### Data Visualization Colors

Use the shared data-viz palette (see `app/DATA_VISUALIZATION_COLORS.md`) for charts, legends, heatmaps. Do not use Axiom UI tokens (`bg.*`, `fg.*`) for data-encoding. Live reference: `/data-viz-colors`.

## Cross-Surface Consistency

Before building any UI pattern (row actions, dismiss controls, empty states, modals, etc.), grep the codebase for existing instances of that pattern and replicate them exactly — same components, same props, same layout. When a pattern needs to change (QA fix, redesign), search for every surface it appears on and update all of them in the same pass. Never let two placements of the same pattern diverge.

## No Monolithic Files

Before writing code, check if files you're touching are monolithic (300+ lines, multiple concerns). If so, split them first.

## TODO — known standards gaps

- **`--opal-gradient-*` variables are not defined yet.** The Opal gradient rule references CSS custom properties that don't exist in any stylesheet, so Opal gradients are currently hardcoded hex/rgba throughout `app/opal/`. Define the variables (likely in `app/opal/styles.css`) and migrate the hardcoded gradients — the canonical values live in `app/opal/components/OpalAlert.tsx` and `app/opal/agents/page.tsx:686`.
- **`@optiaxiom/proteus` is installed but never used.** The rule says Action Cards must use proteus, yet all action cards are custom recreations (`app/components/Opal/ApprovalActionCard.tsx`, `AskQuestionsActionCard.tsx`, `CommonActionCard` in `AgentAssistantPanel.tsx`). Migrate them to the proteus Action Card components.

## Git & Deployment

**Repo**: `episerver/axiom-play` | **Live**: https://axiom-play-lac.vercel.app

- **Never push directly to `main`** — always use a PR via `gh pr create`
- **Never merge locally** — merge via GitHub so CI checks run first
- Vercel auto-deploys `main` to production; preview deploys on every PR branch
- Verify build (`yarn build`) before pushing
- **Never commit secrets** — `.env`, `.env.local`, API keys, tokens, and credentials must never be staged or committed. These files are in `.gitignore` for a reason. If you spot a secret already in git history, stop and tell the user immediately.

## Efficient Batch Workflow

To minimize tokens and round-trips, always batch related changes into a single request using this format:

```
1. [FileName.tsx ~line N] description of change
2. [FileName.tsx ~line N] description of change
3. commit: "message"
```

### Execution rules
1. **Grep first** — find exact location before reading
2. **Read in sections** — use `offset`/`limit` on large files (setup/page.tsx is 2700+ lines)
3. **Group by file** — do all edits to a file before moving to the next
4. **Never re-read** a section already in context
5. **One commit** per batch covering all changed files

### Recurring UI patterns (copy-paste ready)

**Field header row** (label left, action right):
```tsx
<Box display="flex" justifyContent="space-between" alignItems="center" mb="8">
  <Text fontWeight="400" fontSize="md">Label</Text>
  <Button appearance="subtle" size="sm" icon={<IconPlus />}>Add Item</Button>
</Box>
```

**Info tooltip next to label:**
```tsx
<Tooltip delayDuration={300} content="Explanation">
  <span style={{ display: "inline-flex" }}>
    <IconCircleQuestion size={14} color="var(--ax-colors-fg-tertiary)" />
  </span>
</Tooltip>
```

**Opal orb in a button:**
```tsx
<img src="/opal-orb.png" alt="" width={13} height={13} style={{ display: "inline-block", marginRight: "4px", verticalAlign: "middle" }} />
```

**Vertical divider between inline buttons:**
```tsx
<Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0 }} />
```

**Dropdown separator:**
```tsx
<Box style={{ height: 1, background: "var(--ax-colors-border-default)", margin: "4px 12px" }} />
```

**Box inside a button label or menu trigger** — `LabelMenuButton` and similar components render children inside a `<p>`. Using `<Box>` (which renders as `<div>`) causes a React hydration error: `<p> cannot contain a nested <div>`. Axiom's `Box` does NOT support `as="span"` — the `as` prop is ignored and the element still renders as `<div>`. Use `asChild` with a native `<span>` instead:
```tsx
// WRONG — Box renders as <div> regardless of as="span"
<Box display="flex" alignItems="center" gap="8"><IconClock />All Time</Box>
<Box as="span" display="flex" alignItems="center" gap="8"><IconClock />All Time</Box>

// CORRECT — Box asChild merges its classes onto the <span>
<Box asChild display="inline-flex" alignItems="center" gap="8">
  <span><IconClock />All Time</span>
</Box>
```

**Expandable / grouped table rows** — groups rows under a collapsible header row with a chevron icon button. Requires `colSpan` prop on `<Td>` (already added to `app/components/Table.tsx`).

**Column layout**: merge checkbox + chevron into a single col 1. Spacing spec:
- Header `<Th>`: `paddingLeft: 16, paddingRight: 0`
- Col 1 `<Td>` (checkbox + chevron merged via flex): `paddingLeft: 16, paddingRight: 0, verticalAlign: "middle"`
- Gap between checkbox and chevron button: `gap="16"` on the flex container
- Content `<Td>` (colSpan remainder): `paddingLeft: 4, verticalAlign: "middle"`
- Child data rows col 1: same `paddingLeft: 16, paddingRight: 0`; content col: `paddingLeft: 8`
- Include a `<Box style={{ width: 32, height: 32, flexShrink: 0 }} />` placeholder in child row col 1 to keep content aligned with group header content

Pattern:
```tsx
// 1. State
const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
const toggleGroup = (key: string) => setCollapsedGroups(prev => {
  const next = new Set(prev);
  next.has(key) ? next.delete(key) : next.add(key);
  return next;
});

// 2. Group data
const groups = rows.reduce<Record<string, typeof rows>>((acc, r) => {
  const key = r.groupKey ?? "Other";
  (acc[key] ??= []).push(r);
  return acc;
}, {});

// 3. Thead
<Tr>
  <Th style={{ paddingLeft: 16, paddingRight: 0 }}>
    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
  </Th>
  <Th style={{ minWidth: 320, paddingLeft: 8 }}>Label</Th>
  {/* ...other columns... */}
</Tr>

// 4. Render — inside <tbody>
{Object.entries(groups).map(([groupKey, groupRows]) => {
  const isCollapsed = collapsedGroups.has(groupKey);
  return (
    <React.Fragment key={groupKey}>
      {/* Group header row — checkbox + chevron in col 1 */}
      <Tr onClick={() => toggleGroup(groupKey)} suppressActiveStyle style={{ cursor: "pointer" }}>
        <Td style={{ paddingLeft: 16, paddingRight: 0, verticalAlign: "middle" }}>
          <Box display="flex" alignItems="center" gap="16">
            <Box onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={groupRows.every(r => selectedIds.has(r.id))}
                onCheckedChange={(checked) => groupRows.forEach(r => {
                  if (checked !== selectedIds.has(r.id)) toggleSelect(r.id);
                })}
              />
            </Box>
            <Button
              appearance="subtle"
              size="sm"
              icon={isCollapsed ? <IconAngleRight /> : <IconAngleDown />}
              aria-label={isCollapsed ? "Expand" : "Collapse"}
              onClick={(e) => { e.stopPropagation(); toggleGroup(groupKey); }}
            />
          </Box>
        </Td>
        <Td colSpan={/* remaining column count */5} style={{ paddingLeft: 4, verticalAlign: "middle" }}>
          <Box display="flex" alignItems="center" gap="8">
            <IconAgent style={{ color: "var(--ax-colors-fg-tertiary)" }} />
            <Text fontSize="md" fontWeight="500" color="fg.default">{groupKey}</Text>
            <Badge variant="subtle">{groupRows.length}</Badge>
          </Box>
        </Td>
      </Tr>
      {/* Child rows — hidden when collapsed */}
      {!isCollapsed && groupRows.map(r => (
        <Tr key={r.id}>
          <Td style={{ paddingLeft: 16, paddingRight: 0, verticalAlign: "middle" }}>
            <Box display="flex" alignItems="center" gap="16">
              <Box onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={selectedIds.has(r.id)} onCheckedChange={() => toggleSelect(r.id)} />
              </Box>
              <Box style={{ width: 32, height: 32, flexShrink: 0 }} /> {/* chevron placeholder */}
            </Box>
          </Td>
          <Td style={{ paddingLeft: 8 }}>
            {/* row content */}
          </Td>
        </Tr>
      ))}
    </React.Fragment>
  );
})}
```

**Keyed list returning multiple siblings** — `<>` shorthand cannot carry a `key` prop. Use `<React.Fragment key={...}>` whenever `.map()` returns more than one sibling element:
```tsx
// WRONG — key on inner element, fragment has no key
return <><Tr key={name}>...</Tr>{rows.map(...)}</>;
// CORRECT
return <React.Fragment key={name}><Tr>...</Tr>{rows.map(...)}</React.Fragment>;
```

### Key agent files (opal/agents area)
| File | Lines | Notes |
|---|---|---|
| `app/opal/agents/setup/page.tsx` | ~2700 | Read in 50–80 line sections |
| `app/opal/agents/components/NewAgentDialog.tsx` | ~600 | Agent builder wizard |
| `app/opal/agents/page.tsx` | ~400 | Agents listing |
| `app/opal/agents/setup/components/AgentAssistantPanel.tsx` | ~1900 | Guide/assistant panel |
| `app/opal/agents/setup/components/EnhancePopover.tsx` | ~150 | Enhance popup |
