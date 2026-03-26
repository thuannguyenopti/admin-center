# Optimizely Design System Reference

> **This is the single source of truth for AI coding assistants working in this repo.**
> All tool-specific config files (CLAUDE.md, .cursorrules, copilot-instructions.md) point here.
> When the design system updates, update THIS file only.

## Overview

- **Design system**: Optiaxiom (`@optiaxiom/react`)
- **Docs**: https://optimizely-axiom.github.io/optiaxiom/
- **Framework**: Next.js (App Router), TypeScript, React
- **Font**: Inter (all weights, loaded via design system)
- **Icons**: `@tabler/icons-react` (primary), `@fortawesome` (secondary)
- **MCP**: An Axiom MCP server (`@optiaxiom/mcp`) is available in Claude Code and Cursor. Use it to look up component APIs, props, and live examples when unsure.

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

<Switch checked={on} onCheckedChange={setOn}>Label</Switch>
```

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
| `bg.page` | Page background |
| `bg.secondary` | Secondary surface |
| `bg.tertiary` | Tertiary surface |
| `bg.accent` | Primary action fill |
| `bg.accent.light` | Light accent |
| `bg.overlay` | Modal/overlay backdrop |
| `bg.error` / `.subtle` / `.light` | Error states |
| `bg.success` / `.subtle` / `.light` | Success states |
| `bg.warning` / `.subtle` / `.light` | Warning states |
| `bg.information` / `.subtle` / `.light` | Info states |

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

---

## Project-Specific Patterns

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

## Common Mistakes

1. **Arbitrary spacing** — `padding: 17px` -> use `p="16"` token
2. **Hex colors** — `color="#333"` -> use `color="fg.default"`
3. **Custom button styles** — use `<Button>` variants
4. **Hardcoded shadows** — use `shadow="sm|md|lg"`
5. **Custom fonts** — Inter is provided by the design system
6. **`prefers-color-scheme` media queries** — use `[data-theme="dark"]` selectors instead
7. **Raw HTML for CMS UI** — use Axiom components (raw HTML is only for VB website blocks)

---

*Reference: https://optimizely-axiom.github.io/optiaxiom/*
*Use the Axiom MCP server (`@optiaxiom/mcp`) for live component API lookups.*
