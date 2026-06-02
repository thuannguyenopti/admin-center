---
name: figma-generate-page
description: "Translates existing Axiom Play app pages into Figma designs with 1:1 visual fidelity using the Optimizely Axiom design system tokens. Use whenever the user wants to push a page or component into Figma, create a Figma spec from code, document a UI in Figma, or produce a design handoff. Trigger for: 'create a Figma design for...', 'push this page to Figma', 'document the X page in Figma', 'make a Figma frame for the Y screen', 'generate a design from app/cms/...', or any request to represent a built UI page as a Figma design."
---

# Page → Figma Design Generator

**Prerequisite**: You MUST invoke the `figma:figma-use` skill before calling any Figma write tools. Never call Figma write tools directly without loading that skill first.

## What this skill does

Reads a page from the Axiom Play codebase and recreates it as a Figma frame with accurate layout, spacing, typography, and color — using Axiom design tokens as the source of truth.

## Axiom design system quick reference

**Spacing tokens** (only valid values — never arbitrary px):
`"0" "2" "4" "6" "8" "10" "12" "16" "20" "24" "32" "40" "48" "56" "64" "80"`

**Color tokens** (semantic):
- Foreground: `fg.default`, `fg.secondary`, `fg.tertiary`, `fg.disabled`, `fg.inverse`, `fg.link`
- Background: `bg.default`, `bg.secondary`, `bg.tertiary`, `bg.overlay`, `bg.information`, `bg.success`, `bg.warning`, `bg.danger`
- Border: `border.default`, `border.secondary`, `border.active`

**Typography**: Body = 14px/1.5, Heading levels use `fontSize` prop (sm/md/lg/xl/2xl/3xl)

**Component sources**:
- UI components: `@optiaxiom/react`
- Icons: `@optimizely/axiom-icons` (FontAwesome Pro Light)
- Custom SVG icons: `app/cmp/assets/` (CMP product)

**Page padding defaults**: `px="32" py="24"` (unless `customLayout: true`)

## Workflow

### 1. Identify the page

Confirm the route or file path. Examples:
- `app/cms/page.tsx` → `/cms` dashboard
- `app/opal/agents/page.tsx` → Opal agents listing
- `app/cmp/create/page.tsx` → CMP create flow

If the user says "the CMS dashboard" or "Opal agents", map that to the correct file path.

### 2. Read the page code

Read the page file and trace 1–2 levels of component imports to understand:
- Overall layout structure (grid, flex direction, columns)
- What Axiom components are used and with what props
- Spacing between sections
- Color and typography tokens applied
- Any conditional/interactive states worth capturing

For large files (300+ lines), use `offset`/`limit` to read in sections. Focus on the render output, not the data-fetching logic.

### 3. Understand the shell context

Every page renders inside `app/components/template.tsx`. Account for:
- Left sidebar (56px collapsed / 224px expanded) — note which state is "default"
- Secondary VT sidebar if the page has nested nav children
- Page header with product name (unless `customLayout: true`)
- `px="32" py="24"` content padding

Design the Figma frame at **1440px wide** (standard desktop) unless the user specifies otherwise.

### 4. Plan the Figma frame

Before writing anything to Figma, describe the layout plan:
- Frame dimensions and name
- Major sections and their Axiom spacing
- Color fills (use CSS variable names: `var(--ax-colors-bg-default)` etc.)
- Component representations (use Auto Layout in Figma to mirror flex containers)

For interactive components (dropdowns, modals, tabs), ask the user which state to capture — default, hover, open, or multiple frames.

### 5. Use Figma tools

Load `figma:figma-use` first. Then use `mcp__Figma__get_design_context` to find the target file/page and write the design using Figma's write tools.

**Fidelity priorities** (in order):
1. Layout structure and spacing (most important — get the grid right)
2. Color tokens → Figma styles/variables
3. Typography sizing and weight
4. Component shapes (rounded corners, border widths)
5. Icons (use icon name as text label if the exact icon isn't in Figma library)

### 6. Annotate design tokens

Add a small annotation layer or component-notes section that lists which Axiom tokens were used. This helps designers and the design system team cross-reference.

### 7. Confirm with user

Report:
- Which Figma file/page the frame was added to
- Frame name and dimensions
- Any simplifications made (e.g., real data replaced with placeholder, interactive states not captured)
- Suggested follow-up frames (e.g., mobile breakpoint, dark mode, different nav state)

## Mapping Axiom components to Figma

| Axiom component | Figma equivalent |
|---|---|
| `Box` / `Flex` / `Grid` | Auto Layout frame |
| `Button` | Rectangle + text, border-radius 6px |
| `Text` | Text layer with correct size/weight |
| `Input` / `SearchInput` | Rectangle, 1px border, `border.default` fill |
| `Badge` | Pill shape with bg token fill |
| `Card` | Rectangle with `bg.default` fill + shadow |
| `Separator` | 1px line with `border.default` |
| `Avatar` | Circle, 32px default |
| `Table` | Grid of rectangles |
| `Sidebar Nav` | 56 or 224px left frame, `bg.secondary` fill |

## Page file locations

| Product | Route prefix | Page files |
|---|---|---|
| CMS | `/cms` | `app/cms/**/page.tsx` |
| CMP | `/cmp` | `app/cmp/**/page.tsx` |
| Opal | `/opal` | `app/opal/**/page.tsx` |
| Connect Platform | `/connect-platform` | `app/connect-platform/**/page.tsx` |
| Frontend Hosting | `/fe-hosting` | `app/fe-hosting/**/page.tsx` |
| Web Experimentation | `/web-experimentation` | `app/web-experimentation/**/page.tsx` |
