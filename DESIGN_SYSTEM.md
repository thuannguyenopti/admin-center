# Optimizely Design System Reference

> **This is the single source of truth for AI coding assistants working in this repo.**
> All tool-specific config files (CLAUDE.md, .cursorrules, copilot-instructions.md) point here.
> When the design system updates, update THIS file only.

## Overview

- **Design system**: Optiaxiom (`@optiaxiom/react`)
- **Docs**: https://optimizely-axiom.github.io/optiaxiom/
- **Framework**: Next.js (App Router), TypeScript, React
- **Font**: Inter (all weights, loaded via design system)
- **Icons**: `@optimizely/axiom-icons` (primary — always use this), `@fortawesome` (secondary)
- **MCP**: Two Axiom MCP servers are configured — use the right one for the target area:
  - `mcp__axiom__*` — Axiom V2, for all non-Opal product areas
  - `mcp__axiom_v3__*` — Axiom V3, for `app/opal/` and new V3 screens
- **Opal design layer**: `app/opal/` uses both Axiom V3 AND Opal-specific additions — see `OPAL_DESIGN_SYSTEM.md`

### Package versions by product area

| Product area | `@optiaxiom/react` | Extra packages |
|---|---|---|
| CMS, CMP, Connect, FE Hosting | V2 (`^1.9.1`) | — |
| Opal (`app/opal/`) | V3 (`3.0.0-next.0`) | `@optiaxiom/proteus` |

---

## Hard Rules

These are non-negotiable. Every LLM must follow them.

### 1. Always use Axiom components
```tsx
// YES
import { Button, Box, Input, Card } from "@optiaxiom/react";
<Button appearance="primary">Save</Button>

// NO - never use raw HTML when an Axiom component exists
<button className="bg-blue-500 text-white px-4 py-2">Save</button>
```

### 2. Never use arbitrary spacing values
```tsx
// YES - use token scale
<Box p="16" gap="12" mt="24" />

// NO - arbitrary pixels
<Box style={{ padding: 17, gap: 11 }} />
```

**Spacing scale (px):** `0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64`

### 3. Never use hex/rgb colors directly
```tsx
// YES - semantic tokens
<Box bg="bg.secondary" color="fg.default" borderColor="border.tertiary" />

// NO - hardcoded colors
<Box style={{ background: "#f5f5f5", color: "#333" }} />
```

### 4. Exception: "Stride" website blocks
Files in `app/components/vb/blocks/` represent a customer's website, not Optimizely product UI. These blocks should use **raw HTML + Tailwind**, not Axiom components.

---

## Prop Token Values

Valid values for key props — anything outside this list throws a `SprinklesError`.

| Prop | Valid values |
|------|-------------|
| `w`, `h` | `"0"` `"10"` `"12"` `"16"` `"20"` `"24"` `"32"` `"40"` `"48"` `"56"` `"64"` `"80"` `"224"` `"384"` · `"2xs"` `"xs"` `"sm"` `"md"` `"lg"` `"xl"` `"3xl"` · `"1/2"` `"1/3"` `"2/3"` `"1/4"` `"3/4"` · `"auto"` `"fit"` `"full"` `"max"` `"min"` |
| `p`, `m`, `gap` | `"0"` `"2"` `"4"` `"6"` `"8"` `"10"` `"12"` `"16"` `"20"` `"24"` `"32"` `"40"` `"48"` `"64"` `"80"` · `"auto"` (margin only) |
| `border` / `borderT/B/L/R` | `"0"` `"1"` `"2"` |
| `maxH` | `"xs"` `"sm"` `"md"` `"lg"` `"full"` |

**Custom values** outside the token scale → use `style={{ width: '200px', maxHeight: '400px' }}`.

---

## Component Quick Reference

All imports from `@optiaxiom/react`.

### Primitives
```tsx
import { Box, Grid, Group, Heading, Text, Separator, Cover } from "@optiaxiom/react";

<Box display="flex" flexDirection="column" gap="16" p="24" bg="bg.default" />
<Group gap="8">{/* horizontal flex */}</Group>
<Grid gridTemplateColumns="3" gap="16">{/* 3-col grid */}</Grid>
<Heading level="2">Section Title</Heading>
<Text color="fg.secondary" fontSize="sm">Muted text</Text>
```

### Button
```tsx
import { Button } from "@optiaxiom/react";

// Appearance: "primary" | "default" | "subtle" | "danger" | "danger-outline"
// Size: "sm" | "md" | "lg"
<Button appearance="primary" size="md">Primary Action</Button>
<Button appearance="default">Secondary</Button>
<Button appearance="subtle">Tertiary</Button>
<Button appearance="danger">Delete</Button>
<Button icon={<IconPlus />}>With Icon</Button>
<Button icon={<IconFilter />} appearance="default" />  {/* icon-only */}
```

### Form Controls
```tsx
import { Input, Field, SearchInput, Select, Switch, Checkbox, Textarea, DateInput } from "@optiaxiom/react";

<Field label="Email" error="Required">
  <Input placeholder="Enter email" />
</Field>

<SearchInput placeholder="Search..." w="224" value={q} onChange={e => setQ(e.target.value)} />

{/* Select — single-value dropdown. Use when user must pick exactly one option. */}
{/* Use Menu instead for multi-select, actions, links, or filtering. */}
<Field label="Status">
  <Select
    value={status}
    onValueChange={setStatus}
    options={[
      { label: "Reuse existing", value: "reuse" },
      { label: "Create new copy", value: "copy" },
    ]}
  />
</Field>

{/* Grouping options */}
<Select
  options={[
    { label: "Draft",     value: "draft",     group: { label: "Unpublished" } },
    { label: "Scheduled", value: "scheduled", group: { label: "Unpublished" } },
    { label: "Live",      value: "live",      group: { label: "Published" } },
  ]}
/>

<Switch checked={on} onCheckedChange={setOn}>Label</Switch>
```

> **Select gotcha:** `value` must match an entry in `options` — otherwise downshift throws `"getItemProps"`. Validate with useMemo:
> ```tsx
> const safeValue = useMemo(() => OPTIONS.some(o => o.value === raw) ? raw : OPTIONS[0].value, [raw]);
> ```

### Tabs
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@optiaxiom/react";

<Tabs defaultValue="list">
  <TabsList>
    <TabsTrigger value="list">List</TabsTrigger>
    <TabsTrigger value="calendar">Calendar</TabsTrigger>
  </TabsList>
  <TabsContent value="list">...</TabsContent>
</Tabs>
```

### Menu (Dropdown)
```tsx
import { Menu, MenuTrigger, MenuContent } from "@optiaxiom/react";

<Menu options={[
  { label: "Edit", execute: () => {} },
  { label: "Delete", execute: () => {} },
]}>
  <MenuTrigger asChild><Button>Actions</Button></MenuTrigger>
  <MenuContent />
</Menu>
```

### Feedback & Overlay
```tsx
import { Badge, Alert, Dialog, Popover, Tooltip, Toast, Spinner, Skeleton } from "@optiaxiom/react";

<Badge colorScheme="primary">5</Badge>
<Badge colorScheme="success">Active</Badge>
<Tooltip content="Help text"><Button>Hover me</Button></Tooltip>
```

### Navigation
```tsx
import { Sidebar, Nav, NavBody, NavItem, NavFooter, SubNav, Breadcrumb, Link } from "@optiaxiom/react";
```

### Data Display
```tsx
import { Avatar, Card, Table, DataTable } from "@optiaxiom/react";

<Avatar name="John Doe" src="/avatar.jpg" />
<Card><Box p="24">Content</Box></Card>

// Card does NOT support onClick — wrap in a Box
<Box onClick={handleClick} cursor="pointer"><Card>...</Card></Box>
```

### Full component list
**Primitives**: Box, Cover, Grid, Group, Heading, Separator, Text
**Form**: Button, Checkbox, DateInput, DateRangePicker, Field, Input, RadioGroup, SearchInput, Select, Switch, Textarea, ToggleButton
**Feedback**: Alert, AlertDialog, Badge, Banner, Indicator, Progress, Skeleton, Spinner, Toast, Tooltip
**Navigation**: Breadcrumb, Link, Menu, Pagination, Sidebar, Tabs
**Layout**: Card, Dialog, Disclosure, Popover, Table, DataTable
**Other**: Avatar, FileUpload, HoverCard, Pill, PillMenu, SegmentedControl, Sortable

---

## Color Tokens

### Text (fg.*)
| Token | Usage |
|-------|-------|
| `fg.default` | Primary text |
| `fg.secondary` | Muted/secondary text |
| `fg.tertiary` | Subtle text, placeholders |
| `fg.disabled` | Disabled state |
| `fg.default.inverse` | Text on dark backgrounds |
| `fg.accent` | Brand accent |
| `fg.error` | Error messages |
| `fg.success` | Success messages |
| `fg.warning` | Warning messages |
| `fg.information` | Info messages |
| `fg.link.default` | Links |
| `fg.white` | Always white |

### Background (bg.*)
| Token | Usage |
|-------|-------|
| `bg.default` | Default surface (white/dark) |
| `bg.default.hovered` | Default surface hover state |
| `bg.default.pressed` | Default surface pressed/active state — use for selected quick-filter pills, active toggle buttons |
| `bg.page` | Page background |
| `bg.secondary` | Secondary surface — neutral gray |
| `bg.tertiary` | Tertiary surface |
| `bg.pill.default` | Pill background — **only valid on `<Pill>` from `@optiaxiom/react/unstable`**, not on `<Box>` |
| `bg.pill.hovered` | Pill hover state — same scope restriction |
| `bg.accent` | Primary action fill |
| `bg.accent.hovered` | Primary action hover |
| `bg.accent.pressed` | Primary action pressed |
| `bg.accent.light` | Light accent |
| `bg.overlay` | Modal/overlay backdrop |
| `bg.error` / `.subtle` / `.light` | Error states |
| `bg.success` / `.subtle` / `.light` | Success states |
| `bg.warning` / `.subtle` / `.light` | Warning states |
| `bg.information` / `.subtle` / `.light` | Info states |

> **Never guess token names or apply tokens to the wrong component.** `bg.pill.default` exists but is scoped to `<Pill>` — using it on `<Box>` causes a TypeScript build failure. Verify tokens with `mcp__axiom_v3__get_tokens` or use `style={{ background: "var(--ax-colors-*)" }}` as a type-safe fallback.

### Border (border.*)
| Token | Usage |
|-------|-------|
| `border.default` | Default borders |
| `border.secondary` | Secondary borders |
| `border.tertiary` | Subtle/light borders |
| `border.accent` | Accent/focus borders |
| `border.control` | Form control borders |
| `border.error` | Error state |
| `border.focus` | Focus ring |

### Data Visualization Colors
- Use Axiom UI tokens for product chrome, surfaces, and text.
- Use the shared data-viz palette **only** for charts, legends, heatmaps, and data-driven accents.
- See `app/DATA_VISUALIZATION_COLORS.md` for the canonical palette.

---

## Typography

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `xs` | 12px | 16px | Captions, labels |
| `sm` | 14px | 20px | Secondary text |
| `md` | 16px | 24px | Body (default) |
| `lg` | 18px | 28px | Large body |
| `xl` | 20px | 28px | Subheadings |
| `2xl` | 24px | 32px | H3 |
| `3xl` | 30px | 36px | H2 |
| `4xl` | 36px | 40px | H1 |

Weights: `400` (body), `500` (emphasis), `600` (subheadings), `700` (headings/buttons)

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 2px | Subtle |
| `md` | 4px | Buttons, inputs |
| `lg` | 8px | Cards, modals |
| `xl` | 12px | Large components |
| `2xl` | 16px | Prominent |
| `full` | 9999px | Pills, avatars |

---

## Shadows

| Token | Usage |
|-------|-------|
| `sm` | Subtle elevation |
| `md` | Cards, dropdowns |
| `lg` | Modals, popovers |

---

## CSS Variables

All tokens are available as CSS custom properties for the rare cases where you need raw CSS:
```css
var(--ax-colors-fg-default)
var(--ax-colors-bg-accent)
var(--ax-colors-border-default)
var(--ax-spacing-16)
var(--ax-radii-lg)
```

---

## Pattern Recognition (Figma to Code)

When translating a design into code, use this mapping:

| Visual pattern | Axiom code |
|---------------|------------|
| Blue filled button | `<Button appearance="primary">` |
| Gray filled button | `<Button appearance="default">` |
| Outlined button | `<Button appearance="default">` |
| Text-only button | `<Button appearance="subtle">` |
| Red destructive button | `<Button appearance="danger">` |
| Large bold text | `<Heading level="1\|2\|3">` |
| Gray muted text | `<Text color="fg.secondary">` |
| Small label | `<Text fontSize="xs">` |
| White card with shadow | `<Card>` or `<Box bg="bg.default" shadow="md" rounded="lg">` |
| Gray background area | `<Box bg="bg.secondary">` |
| Bordered section | `<Box border="1" borderColor="border.default" rounded="md">` |
| Filter chip / dismissible tag | Use `<Pill>` from `@optiaxiom/react/unstable` (experimental). Supports dismiss, size, and `bg.pill.default` / `bg.pill.hovered` tokens natively. |
| Filter chip selected state | Toggle button row (quick filters): `style={{ background: "var(--ax-colors-bg-default-pressed)" }}` — never `bg.accent` or `bg.pill.default` on a `Box` |

---

## Project-Specific Patterns

### Opal product page layout

All Opal product pages (Agents, Context, etc.) follow this shell:

```tsx
// Outer container — full height, standard padding, vertical flex stack
<Box px="32" py="24" display="flex" flexDirection="column" gap="24" overflow="auto" h="full">

  {/* Page header — heading + description grouped with tight gap */}
  <Box display="flex" flexDirection="column" gap="8">
    <Heading level="1" fontSize="2xl">Page Title</Heading>
    <Text color="fg.secondary">One-sentence description of what this page does.</Text>
  </Box>

  {/* Tabs (if tabbed) */}
  <Tabs value={activeTab} onValueChange={setActiveTab}>
    <TabsList>
      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    </TabsList>
  </Tabs>

  {/* Content — fills remaining height */}
  <Box display="flex" flexDirection="column" gap="16" style={{ flex: 1, minHeight: 0 }}>
    {/* page content */}
  </Box>

</Box>
```

Key rules:
- Outer gap is `"24"` between all top-level sections (header, tabs, content)
- Header inner gap is `"8"` (heading ↔ description)
- Heading always uses `fontSize="2xl"` on Opal product pages
- Pages with `customLayout: true` in the nav must manage their own height (`h="full"` or `height: "100%"`) — do **not** use `100vh`

### Local component wrappers
`app/components/` contains wrappers like `Button.tsx`, `Input.tsx`, `Text.tsx` that override Axiom defaults for this prototype. Prefer raw `@optiaxiom/react` imports, but use local wrappers when their specific defaults are needed (e.g., `Input` for `size="lg"`).

### Persistence
This is a high-fidelity prototype. Use `app/usePersistentState.js` to sync UI state to `localStorage`. Always check `isHydrated` before rendering state-dependent content to avoid Next.js hydration mismatches.

### Dark mode
Semantic tokens adapt automatically. Use `[data-theme="dark"]` / `html.dark` CSS selectors for custom dark overrides. **Never** use `@media (prefers-color-scheme: dark)` — the app manages its own theme via `useTheme()`.

### Layout
The shared `app/components/template.tsx` provides sidebar + content layout. Pages can access `useLayout()` for `opalPanelControls`, `asideContent`, `footerContent`, `hidePageHeader`.

### Development
```bash
corepack enable   # if yarn is missing
yarn dev          # start dev server
```

---

## Code Architecture: No Monoliths

### On every new conversation:
1. **Audit first.** Before writing code, check if the files you're about to touch are monolithic (300+ line components, pages with multiple unrelated concerns, god-files that do everything). Flag them.
2. **Split before extending.** If you need to add features to a monolithic file, split it up first, then add the feature to the correct new file. Do not make a big file bigger.

### Rules:
- **Never create monolithic files.** A single `.tsx` file should not contain unrelated UI sections, data fetching, state management, and styling all tangled together.
- **One concern per file.** Separate components, hooks, utilities, types, and constants into their own files.
- **Components > 250 lines are a smell.** Extract sub-components, custom hooks, or utility functions.
- **Co-locate by feature.** Group related files in a folder (`ComponentName/index.tsx`, `useComponentState.ts`, `utils.ts`) rather than dumping everything into one file.

### How to split:
| Extract this... | Into... |
|----------------|---------|
| State logic & effects | Custom hook (`useFeatureName.ts`) |
| Sub-sections of UI | Separate components in same folder |
| Constants & config | `constants.ts` or `config.ts` |
| Types & interfaces | `types.ts` |
| Utility/helper functions | `utils.ts` |
| Inline styles / style objects | Co-located style constants or CSS module |

### Example:
```
# BAD: one 800-line god-file
app/cmp/dashboard/page.tsx  (everything in one file)

# GOOD: split by concern
app/cmp/dashboard/
├── page.tsx                 # Page shell, layout
├── DashboardStats.tsx       # Stats cards section
├── RecentActivity.tsx       # Activity feed section
├── useDashboardData.ts      # Data fetching hook
├── constants.ts             # Config, labels, options
└── types.ts                 # TypeScript interfaces
```

---

## Agents Area Patterns (`app/opal/agents/`)

These patterns are established in the agents section and should be reused when extending it.

### Badge intent (V3 API)
In V3 Opal areas, `<Badge>` uses `intent` instead of V2's `colorScheme`:
```tsx
<Badge intent="success" variant="subtle">New</Badge>
<Badge intent="information" variant="subtle">SEO/GEO</Badge>
<Badge intent="primary" variant="subtle">Copywriting</Badge>
// Valid intents: "success" | "information" | "primary" | "danger" | "warning"
```
Never use `colorScheme` in `app/opal/` — that is the V2 API.

### Resizable detail tray
Use `ResizableDetailsTray` from `app/opal/agents/setup/components/ResizableDetailsTray.tsx` for any right-side panel that should be user-resizable. It wraps Axiom's `DetailsPanel` / `DetailsPanelHeader` / `DetailsPanelBody` / `DetailsPanelFooter` (all from `@optiaxiom/react/unstable`) with a pointer-event drag handle.

```tsx
<ResizableDetailsTray
  isOpen={isOpen}
  onClose={() => setOpen(false)}
  title="My Panel"
  defaultWidth={400}
  minWidth={320}
  maxWidth={640}
  footer={<Box>...</Box>}
  headerAfter={<Button ... />}
>
  {/* body content */}
</ResizableDetailsTray>
```

The drag handle renders as a pill-shaped `<Box role="separator">` on the left edge. Resize is handled via `onPointerDown` + `window.pointermove/pointerup` — no library needed. Transition is suppressed during active drag (`transition: "none"`) to avoid lag.

### SelectionTooltip ("Ask Opal" chip)
A fixed-position tooltip rendered as raw `<div>` (not an Axiom Tooltip) because it must anchor to mouse coordinates from a text selection.

```tsx
// Get position from selection
const rect = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
// Render
<SelectionTooltip
  x={rect.left + rect.width / 2}
  y={rect.top}
  onAskOpal={() => opalPanelControls?.launchWithContext("Selected text", selectedText)}
  onClose={() => setTooltipVisible(false)}
/>
```

Styled with `--ax-colors-bg-default-inverse` / `--ax-colors-fg-default-inverse` so it appears as a dark chip in light mode and a light chip in dark mode without manual overrides. Closes on `pointerdown` outside via a `document` listener.

### BuildWithOpal empty state
When an agent has no saved configuration, render `<BuildWithOpalPage />` instead of the normal form. It provides a full `OpalChatView` where the user describes the agent in chat. Opal responds with an `AgentInteractiveCardBlock` containing pre-filled form fields. Never render `BuildWithOpalPage` inside the normal form layout — it is a full-page replacement.

### Version history + comparison
Version data uses the `Version` type exported from `VersionHistory.tsx`:
```ts
interface Version {
  id: string;
  version: string;   // e.g. "v3"
  mode: string;      // e.g. "Edited"
  timestamp: string;
  author: string;
  authorInitials: string;
  isCurrent?: boolean;
}
```
`VersionHistory` is rendered inside a `ResizableDetailsTray`. When the user selects "Compare", set `isComparing: true` and `comparisonVersionId` — `ComparisonBanner` and `ComparisonModal` handle the diff display. `VersionPreviewBanner` is shown when `viewingVersionId` is set (non-current version preview mode).

### Workflow builder
`app/opal/agents/workflow/` uses `@xyflow/react` for the node canvas and `elkjs` for automatic layout. This area is intentionally outside the Axiom layout system — ReactFlow manages its own DOM. Axiom components appear only in sidebars and toolbars, not on the canvas itself. Custom node types are defined in `WorkflowNodes.tsx`; custom icons (`BroomIcon`, `WebhookIcon`) are inline SVG components in `workflow/icon/`.

### Lazy-loading heavy panels
All heavy panels in `setup/page.tsx` are loaded with `next/dynamic` to keep the initial bundle small. Follow this pattern for any new tray or modal:
```tsx
const MyPanel = dynamic(
  () => import("./components/MyPanel").then((mod) => mod.MyPanel),
  { ssr: false }
);
```

---

## Common Mistakes

1. **Arbitrary spacing** — `padding: 17px` -> use `p="16"` token
2. **Hex colors** — `color="#333"` -> use `color="fg.default"`
3. **Custom button styles** — use `<Button>` variants
4. **Hardcoded shadows** — use `shadow="sm|md|lg"`
5. **Custom fonts** — Inter is provided by the design system
6. **`prefers-color-scheme` media queries** — use `[data-theme="dark"]` selectors instead
7. **Raw HTML for CMS UI** — use Axiom components (raw HTML is only for VB website blocks)
8. **`maxHeight="400px"`** — not a valid prop; use `style={{ maxHeight: '400px' }}`
9. **`<Select><option>…</option></Select>`** — use `options={[...]}` prop with `<SelectTrigger /><SelectContent />`

---

## Debugging: SprinklesError

When you see `"width" has no value "200". Possible values are...`:

1. Identify the prop in the error (`width` → `w` prop)
2. Pick the closest valid token from the **Prop Token Values** table above (`200` → `w="224"`)
3. Or escape with `style` for exact values: `style={{ width: '200px' }}`

---

*Reference: https://optimizely-axiom.github.io/optiaxiom/*
*Use the Axiom MCP server (`@optiaxiom/mcp`) for live component API lookups.*
