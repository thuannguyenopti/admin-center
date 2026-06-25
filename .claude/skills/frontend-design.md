---
name: frontend-design
description: >
  Frontend design rules for Optimizely product UI using Axiom V3. Invoke
  automatically before writing or reviewing any UI code in app/opal/, app/cmp/,
  app/cms/, or any other product route. Covers design philosophy, component
  rules, spacing, density, typography, motion, and visual QA requirements.
---

# Frontend Design Rule

Design and refine Optimizely product UI with a clean, calm, premium frontend sensibility while staying compliant with Axiom V3 / Optiaxiom React patterns.

This is a rule, not a suggestion. When this skill applies, the agent must behave like a senior frontend product designer using the repo's component library, tokens, typography, sizing, spacing, and interaction patterns. Do not invent a separate visual system.

## When to use this skill

Use this skill when you need to:
- Build or polish Opal, Brand Packs, or other Axiom V3 product screens
- Review UI for visual hierarchy, spacing, typography, and interaction quality
- Convert a rough design into a cleaner product-ready interface
- Fix UI that feels too heavy, cluttered, inverted, generic, or inconsistent
- Keep Claude aligned on Optimizely product craft for this repo

## Design philosophy

The UI should feel:
- Calm
- Premium
- Intelligent
- Editorial where appropriate
- Enterprise credible
- Fast to scan
- Productized, not decorative

This is not a marketing site, CMS admin clone, or generic dashboard. For Brand Packs and Opal experiences, the target feeling is:

> An AI-native operating system for brand intelligence.

## Required project rules

Before writing UI code:
- Read `OPAL_DESIGN_SYSTEM.md` when working in `app/opal/`
- Inspect nearby production-quality screens and reuse their page structure, control sizing, and interaction patterns
- Use `@optiaxiom/react` components whenever an equivalent exists
- Use Axiom V3 / Optiaxiom semantic tokens instead of hardcoded colors
- Use spacing tokens instead of arbitrary pixel spacing
- Prefer `@optimizely/axiom-icons` for product UI icons
- Inspect nearby screens before inventing a new pattern
- Do not extend monolithic files; split large multi-concern files first

If any of these checks fail, stop and fix the violation before continuing.

## Non-negotiable implementation contract

For product UI, these are hard requirements:
- Use Axiom `Button`, `Input`, `Select`, `Textarea`, `Switch`, `Tabs`, `Menu`, `Tooltip`, `Badge`, `Card`, `Box`, `Grid`, `Group`, `Heading`, and `Text` instead of raw equivalents
- Do not use raw `button`, `input`, `select`, or `textarea` unless the native element is unavoidable, such as `input type="color"` or file upload internals
- Do not use hardcoded hex/rgb colors for UI chrome; use semantic tokens or documented CSS variables
- Do not use arbitrary spacing for layout; use the repo spacing scale
- Primary page actions use Axiom `Button appearance="primary"` with `size="md"` or `size="lg"` unless the surrounding existing pattern proves otherwise
- Icon-only actions must use Axiom `Button` and have an accessible label or tooltip
- Never leave dead controls in the UI, including ellipsis menus with no actions
- Never add a Settings tab for one or two controls; move small identity/status controls into the page header or a contextual menu
- Files over 300 lines or with multiple concerns must be split before adding more behavior
- Before finishing, visually verify the changed route at desktop and narrower widths

If a prototype, screenshot, HTML file, or PM mock uses raw controls, tiny CTAs, hardcoded colors, or inconsistent sizing, treat those as prototype artifacts. Extract the product requirements, then rebuild with Axiom V3 components and this repo's visual system.

## Mandatory visual QA

Design work is not complete until the rendered UI is checked visually.

When the user provides a reference image and asks to match it, treat the reference as the acceptance spec, not moodboard inspiration.

After changing product UI:
- Open the changed local route
- Capture a screenshot at the primary desktop width
- Capture a screenshot at a narrower width when the layout is responsive
- Compare the rendered screenshot against the provided reference, screenshot, or stated design intent
- Match the reference's layout proportions, modal width, column balance, control hierarchy, typography scale, and spacing before introducing local reinterpretation
- Check specifically for collapsed controls, broken grids, clipping, overflow, wrong CTA hierarchy, inconsistent pills, unintended scrollbars, and dead whitespace
- Fix visual mismatches before reporting the work done

If screenshot capture or browser verification is unavailable, say that explicitly and do not claim the UI was visually verified. TypeScript, lint, and route `200` checks are necessary but never sufficient for frontend design work.

## Axiom V3 implementation rules

Use Axiom components for common product UI:
- `Button` for actions
- `Tabs` or `SegmentedControl` for view switching
- `SearchInput`, `Select`, `Menu`, and `Popover` for controls
- `Tooltip` for icon-only or unclear actions
- `Badge` only when the label helps the user decide
- `Card` only for repeated items, modals, or genuinely framed tools
- `Box`, `Group`, `Grid`, `Heading`, and `Text` for layout and type

Avoid:
- Raw HTML for product UI
- Hardcoded hex/rgb colors
- Arbitrary spacing values
- Custom button-like divs
- Nested cards
- Decorative blobs, excessive gradients, and noisy surfaces
- Pills or badges that do not carry decision-making value

When a required Axiom component does not support the exact layout prop needed, wrap it in `Box` instead of replacing it with a raw native control.

## Shared micro-patterns

Repeated UI atoms must be consistent across the whole feature, not recreated per file.

Use:
- Axiom `Badge variant="subtle"` for chips, tags, statuses, and short metadata pills
- One shared local wrapper when a repeated badge needs sizing or casing tweaks
- The same chip density, casing, and contrast across overview cards, detail tabs, and editing surfaces
- Axiom `Button` for removable chips or chip actions, with accessible labels

Avoid:
- Custom pill `Box` components when `Badge` works
- Mixing hand-rolled pills with Axiom badges in the same feature
- Making pills longer, taller, greener, or louder just because they are on a different tab
- Treating badges as decoration instead of decision-making metadata

If a screenshot exposes inconsistent chip styling, normalize the component pattern before polishing spacing.

## Visual hierarchy rules

Every section should have:
- One primary focal point
- One obvious primary action
- A clear reading order
- Enough whitespace to breathe

Prefer:
- Alignment over decoration
- Typography over borders
- Fewer metadata items
- Subtle elevation
- Calm neutral surfaces with selective green accents

Avoid:
- Multiple competing CTAs
- Oversized bold text inside compact product panels
- Dense rows of pills
- Loud card shadows
- Overlapping text or images that feel accidental
- Filling empty space just because it exists

## Preferred product density

Use a premium product density profile:
- Compact vertical rhythm inside controls, cards, and metadata
- Generous horizontal breathing room around major content
- Relaxed outer containers and page gutters
- Tight metadata grouping
- Clear section separation without excessive divider lines

Avoid:
- Enterprise table density unless the workflow is truly data-heavy
- Giant empty card interiors
- Overly compressed controls
- Random padding changes between sibling cards
- Layouts that feel either sparse by accident or crowded by default

The best density feels efficient, not cramped.

## Product shell spacing

Use one owner for page spacing. Do not stack route-level padding on top of shell padding.

Default rules:
- Standard app shell page padding: 32px
- Dense secondary product pages inside an existing shell: no extra top padding
- Custom full-page work surfaces that own their shell: 24px top padding
- Header-to-tabs rhythm: 16px
- Tabs-to-content rhythm: 16px for immediate work surfaces, 24px only when the first content module is visually dense
- Major section separation inside content: 24px or 32px

Avoid:
- 64px top offsets in product work surfaces
- Adding a page title, tab row, and content card with separate large gaps between each
- Local scrollbars on tab rows unless tabs truly overflow at the tested width

The active tab content should start quickly and feel connected to the page chrome.

## Surface philosophy

Surfaces should feel lightly layered, soft, and intentional.

Prefer:
- Subtle neutral tints
- Low-contrast borders
- Transparent or tokenized separation
- Ultra-soft shadows
- Gentle elevation changes on hover
- Clear background/content hierarchy

Avoid:
- Hard gray boxes
- Flat white overload
- Heavy dark shadows
- Loud gradient panels
- Multiple bordered containers stacked inside each other
- Card surfaces used as page sections

Use borders and shadows as quiet structure, not decoration.

## Editorial composition

Composition creates the premium feeling more than any single component.

Prefer:
- Asymmetrical balance
- Controlled preview imagery
- Whitespace framing
- Directional eye flow
- One dominant image or object per featured region
- Secondary visuals that support the main focal point

Avoid:
- Giant centered banners
- Accidental image crops
- Equal visual weighting across every element
- Competing focal points
- Full-width poster layouts when the task is product intelligence
- Decorative previews that hide important content

For hero or featured product areas, make the layout feel curated, not filled.

## Editorial product surfaces

Some product screens are not dashboards or settings panels even when they contain editable data. When the subject is inherently visual, such as typography, brand assets, color systems, templates, imagery, or creative rules, design the screen as an editorial product surface first and place management controls second.

Examples:
- Typography should feel like a premium type-foundry specimen embedded in the product, not a settings form
- Brand imagery should feel like a curated visual library, not file storage
- Color palettes should feel like a brand system, not a table of hex values

Use:
- Large specimen moments
- Curated preview panels
- Productive but quiet controls
- Sidebar/category navigation only when it helps browsing
- Detail rows that preview the asset before asking the user to edit metadata

Avoid:
- Repeating card forms for every item
- Leading with inputs before the user understands the asset
- Treating creative-system data like generic admin settings
- Tiny samples that undersell the visual subject

## Typography rules

Use the product font stack and Axiom type patterns.

Guidance:
- Use strong hierarchy, but reduce unnecessary boldness
- Keep compact UI headings compact
- Use labels sparingly and consistently
- Make metadata secondary, not visually equal to titles
- Never allow text clipping, collisions, or awkward wrapping
- For font management UI, show a real specimen: family name, Aa, pangram, uppercase alphabet, lowercase alphabet, numerals, and available weights/styles
- Let users understand whether a font is from the library, uploaded, linked from the web, or name-only metadata
- Match the approved specimen composition. Do not add extra decorative samples, captions, or background artwork when the reference intentionally omits them.
- Use readable spacing between metadata bullets; metadata should feel quiet and precise, not cramped.

If everything is bold, reduce weight until the page has a clear hierarchy again.

## Content restraint

Every metadata item must justify itself.

Before adding a label, pill, icon, stat, timestamp, status, or description, ask:

> Does this help the user decide what to do?

If not, remove it.

Prefer:
- Short labels
- Scannable titles
- Specific descriptions
- Metadata grouped by meaning
- One strong status signal instead of many weak ones

Avoid:
- Repeating the same idea in title, subtitle, badge, and metadata
- Overexplaining obvious actions
- Decorative status labels
- Long helper text in primary work surfaces
- Toolbars crowded with low-frequency actions

## Action architecture

Before finishing a screen, pressure-test the workflow, not only the visuals.

Every product surface should answer:
- What is the primary action?
- What is the secondary action?
- What action happens when a user selects an item?
- Are multiple buttons opening the same workflow?

Prefer:
- One clear add/create action per surface
- Direct selection for list/grid items that open detail editing
- Modal or sheet editing for focused item-level changes
- Contextual actions only where they represent genuinely different workflows
- Page-level create/upload actions use Axiom `Button appearance="primary"` with a plus icon
- Inline secondary add actions inside cards, modals, and chip editors use Axiom `Button appearance="default"` with a plus icon

Avoid:
- Duplicate CTAs that lead to the same modal, sheet, or page
- Repeated edit-icon buttons on every row when the entire row can be selected
- Dead or vague actions such as `Manage`, `More`, or ellipsis menus without a distinct purpose
- Separate settings or management screens for concepts that belong inside item editing
- Page-level save buttons when item-level modals already commit changes

If a screen offers more than three primary ways to act, simplify the action model before polishing the UI. Premium product UX usually reduces workflows to: create, select, edit.

## Color and green usage

Optimizely green is powerful. Use it surgically for:
- Primary actions
- Active states
- Confirmations
- AI/intelligence highlights
- High-value emphasis

Avoid:
- Green everywhere
- Too many green pills
- One-note green layouts
- Low-contrast green text on green backgrounds
- Primary buttons accidentally styled like inverse buttons

The UI should primarily feel neutral, elegant, and controlled, with green as an accent.

## Button and control rules

Primary actions should look primary and have readable contrast.

Check:
- Button appearance matches intended hierarchy
- Primary text is not accidentally white-on-green when the design expects dark-on-green, or vice versa
- Icon-only buttons have tooltips
- Controls align into predictable toolbars
- Search and filters feel like one system, not scattered inputs

Control sizing must feel intentional:
- Main CTAs: `size="md"` or `size="lg"`
- Secondary toolbar actions: usually `size="sm"` only when they sit inside dense product chrome
- Form controls in editing surfaces: use the same size within a row or section
- Do not mix tiny dropdowns, large text fields, and small save buttons in the same editing surface unless a clear hierarchy requires it

## Motion personality

Motion should feel intelligent, soft, responsive, and frictionless.

Prefer:
- 120-180ms transitions for common hover/focus changes
- Subtle opacity fades
- Slight elevation shifts
- Gentle transform changes when they clarify interactivity
- Smooth state changes that reinforce structure

Avoid:
- Bouncy animations
- Dramatic movement
- Slow delayed transitions
- Motion that distracts from work
- Animating too many elements at once

Use motion to reduce cognitive load, not to show off.

## AI product personality

AI should feel embedded into the workflow, not bolted on.

The product should feel:
- Quietly superhuman
- Anticipatory
- Context-aware
- Operational
- Calm under complexity

Avoid:
- Gimmicky AI UI
- Excessive sparkles
- Assistant-like clutter
- Chat-first patterns where a workflow surface is better
- Vague AI badges that do not explain value

AI cues should help the user understand priority, confidence, recommendation, or next action.

## Brand Packs guidance

Brand Packs should feel like brand intelligence, not a template marketplace.

## Stride prototype content rules

For Brand Packs prototype work, the primary fictive brand is `Stride`: an endurance sports / triathlon brand used to test Opal brand intelligence workflows. Treat Stride as a believable product brand, not generic placeholder content.

Stride content should feel:
- Endurance-driven
- High-performance
- Athletic and professional
- Editorial but real
- Focused on triathlon: swimming, cycling, running, transitions, race day, and finish-line energy

Use imagery that shows real athletes in action:
- Open-water swimmers and competitive pool swimmers
- Professional road cyclists, pelotons, time-trial riders, and race climbs
- Runners in races, track starts, road running packs, finish chutes, and endurance moments
- Triathlon transition energy when the athlete is actively competing or preparing to compete
- High-quality sport photography with motion, effort, pace, water, road, track, weather, or race context

Avoid Stride imagery that is merely adjacent to sport:
- Solo product/object shots such as a bike against a wall
- Yoga, stretching, generic gym classes, dumbbells, lifting, or wellness lifestyle content
- Smiling fitness portraits that do not show sport action
- Casual jogging, posed stock-photo workouts, or influencer-style training images
- Broken images, duplicate images, or generic placeholders

For Stride logos and marks:
- Use intentional logo specimens such as white logo on dark surface and black/dark logo on light surface
- Do not use random photography as logo placeholders
- Logo cards should make the mark inspectable and full-bleed or specimen-like, not tiny thumbnails floating in empty space

For Stride templates:
- Use action sport creative, race-day energy, endurance campaign language, and Optimizely/Stride wordmark placement
- Templates should feel like generated brand outputs, not generic marketplace cards
- When creating new template or image placeholders, prefer fewer high-quality examples over many weak examples

When adding fake content, name it as if it came from a real brand library. Bad names: `Image 1`, `Bike photo`, `Hero`. Better names: `Open Water Race Pack`, `Peloton Race Attack`, `Finish Chute Sprint`, `Aero Position Push`.

Hero / active pack:
- Keep the left side informational and scannable
- Keep previews controlled and intentional
- Use overlap only when it feels designed and does not hide important content
- Avoid giant poster crops and loud banners

Pack cards:
- Keep structures consistent
- Lead with the asset preview
- Use a clear name and short descriptor
- Keep metadata minimal
- Use tags only when they help filtering or recognition

## Agentic product cues

Use subtle intelligence labels when they help prioritization:
- `Recommended`
- `AI optimized`
- `Most used`
- `Recently adapted`
- `Performing best`

Do not add AI labels as decoration. They must help the user decide what to do.

## Signals of cheap UI

Treat these as warning signs:
- Excessive pills
- Too many borders
- Inconsistent spacing
- Giant shadows
- Loud gradients
- Oversized icons
- Floating metadata
- Equal visual emphasis everywhere
- Too many CTA colors
- Clipped text
- Crowded toolbars
- Accidental image overlap
- Generic empty states
- Buttons that look visually inverted

When these appear, simplify first. Do not decorate your way out of weak hierarchy.

## Review checklist

Before finishing UI work, check:
- `OPAL_DESIGN_SYSTEM.md` was read (for any work in `app/opal/`)
- Axiom V3 components and tokens are used wherever available
- No raw product `button`, `input`, `select`, or `textarea` was introduced except unavoidable native internals
- The primary action is visually correct
- Primary CTAs are `md`/`lg`, not tiny
- Spacing follows a consistent 8/12/16/24/32 rhythm
- Metadata and pills are reduced
- Surfaces feel soft, layered, and restrained
- Composition has one clear focal point
- Motion is subtle and useful
- AI cues feel operational, not gimmicky
- Icons are from the product icon system
- Hover, selected, empty, loading, and responsive states are handled
- No overlapping text, clipped labels, nested cards, arbitrary colors, or decorative noise slipped in
- No empty ellipsis menus, decorative controls, or dead settings tabs slipped in
- PM/vibe-coded prototypes were translated into requirements, not copied as UI
- The result looks designed, not assembled

---

## Prop Token Values

Valid values for key props — anything outside this list throws a `SprinklesError`.

| Prop | Valid values |
|------|-------------|
| `w`, `h` | `"0"` `"10"` `"12"` `"16"` `"20"` `"24"` `"32"` `"40"` `"48"` `"56"` `"64"` `"80"` `"224"` `"384"` · `"2xs"` `"xs"` `"sm"` `"md"` `"lg"` `"xl"` `"3xl"` · `"1/2"` `"1/3"` `"2/3"` `"1/4"` `"3/4"` · `"auto"` `"fit"` `"full"` `"max"` `"min"` |
| `p`, `m`, `gap` | `"0"` `"2"` `"4"` `"6"` `"8"` `"10"` `"12"` `"16"` `"20"` `"24"` `"32"` `"40"` `"48"` `"64"` `"80"` · `"auto"` (margin only) |
| `border` / `borderT/B/L/R` | `"0"` `"1"` `"2"` |
| `maxH` | `"xs"` `"sm"` `"md"` `"lg"` `"full"` |

Custom values outside the token scale → `style={{ width: '200px', maxHeight: '400px' }}`.

---

## Component Quick Reference

All imports from `@optiaxiom/react`.

### Primitives
```tsx
<Box display="flex" flexDirection="column" gap="16" p="24" bg="bg.default" />
<Group gap="8">{/* horizontal flex */}</Group>
<Grid gridTemplateColumns="3" gap="16">{/* 3-col grid */}</Grid>
<Heading level="2">Section Title</Heading>
<Text color="fg.secondary" fontSize="sm">Muted text</Text>
```

### Button
```tsx
// appearance: "primary" | "default" | "subtle" | "danger" | "danger-outline"
// size: "sm" | "md" | "lg"
<Button appearance="primary" size="md">Primary Action</Button>
<Button appearance="subtle">Tertiary</Button>
<Button icon={<IconPlus />}>With Icon</Button>
<Button icon={<IconFilter />} appearance="default" />  {/* icon-only */}
```

### Form Controls
```tsx
<Field label="Email" error="Required">
  <Input placeholder="Enter email" />
</Field>

<SearchInput placeholder="Search..." w="224" value={q} onChange={e => setQ(e.target.value)} />

{/* Select — single-value dropdown */}
<Field label="Status">
  <Select
    value={status}
    onValueChange={setStatus}
    options={[
      { label: "Draft", value: "draft", group: { label: "Unpublished" } },
      { label: "Live",  value: "live",  group: { label: "Published" } },
    ]}
  />
</Field>

<Switch checked={on} onCheckedChange={setOn}>Label</Switch>
```

> **Select gotcha:** `value` must match an entry in `options` — otherwise downshift throws `"getItemProps"`. Validate:
> ```tsx
> const safeValue = useMemo(() => OPTIONS.some(o => o.value === raw) ? raw : OPTIONS[0].value, [raw]);
> ```

### Tabs
```tsx
<Tabs defaultValue="list">
  <TabsList>
    <TabsTrigger value="list">List</TabsTrigger>
    <TabsTrigger value="calendar">Calendar</TabsTrigger>
  </TabsList>
  <TabsContent value="list">...</TabsContent>
</Tabs>
```

### Menu
```tsx
<Menu options={[
  { label: "Edit", execute: () => {} },
  { label: "Delete", execute: () => {} },
]}>
  <MenuTrigger asChild><Button>Actions</Button></MenuTrigger>
  <MenuContent />
</Menu>
```

### Data Display
```tsx
<Avatar name="John Doe" src="/avatar.jpg" />
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
| `fg.error` / `fg.success` / `fg.warning` | Semantic states |
| `fg.white` | Always white |

### Background (bg.*)
| Token | Usage |
|-------|-------|
| `bg.default` | Default surface |
| `bg.default.hovered` | Hover state |
| `bg.default.pressed` | Selected quick-filter pills, active toggles |
| `bg.page` | Page background |
| `bg.secondary` | Secondary surface — neutral gray |
| `bg.accent` | Primary action fill |
| `bg.pill.default` | **Only valid on `<Pill>`** — TypeScript error on `<Box>` |
| `bg.error` / `bg.success` / `bg.warning` / `bg.information` | Semantic states (+ `.subtle`, `.light` variants) |

### Border (border.*)
| Token | Usage |
|-------|-------|
| `border.default` | Default borders |
| `border.secondary` | Secondary |
| `border.tertiary` | Subtle |
| `border.control` | Form control borders |
| `border.focus` | Focus ring |
| `border.error` | Error state |

### CSS variables (for raw CSS)
```css
var(--ax-colors-fg-default)
var(--ax-colors-bg-accent)
var(--ax-colors-border-default)
var(--ax-spacing-16)
var(--ax-radii-lg)
```

---

## Typography

| Token | Size | Usage |
|-------|------|-------|
| `xs` | 12px | Captions, labels |
| `sm` | 14px | Secondary text |
| `md` | 16px | Body (default) |
| `lg` | 18px | Large body |
| `xl` | 20px | Subheadings |
| `2xl` | 24px | H3 |
| `3xl` | 30px | H2 |
| `4xl` | 36px | H1 |

Weights: `400` (body) · `500` (emphasis) · `600` (subheadings) · `700` (headings/buttons)

Border radius tokens: `sm` (2px) · `md` (4px) · `lg` (8px) · `xl` (12px) · `full` (9999px — pills/avatars)
Shadow tokens: `sm` (subtle) · `md` (cards/dropdowns) · `lg` (modals/popovers)

---

## Visual Pattern → Axiom Mapping

| What you see | What to write |
|---|---|
| Primary filled button | `<Button appearance="primary">` |
| Gray/secondary button | `<Button appearance="default">` |
| Text-only button | `<Button appearance="subtle">` |
| Destructive action | `<Button appearance="danger">` |
| Large bold heading | `<Heading level="1\|2\|3">` |
| Gray muted text | `<Text color="fg.secondary">` |
| White card with shadow | `<Card>` or `<Box bg="bg.default" shadow="md" rounded="lg">` |
| Gray background area | `<Box bg="bg.secondary">` |
| Bordered section | `<Box border="1" borderColor="border.default" rounded="md">` |
| Filter chip / dismissible tag | `<Pill>` from `@optiaxiom/react/unstable` |
| Selected filter chip | `style={{ background: "var(--ax-colors-bg-default-pressed)" }}` — never `bg.accent` on a Box |

---

## Project-Specific Patterns

### Opal product page layout
```tsx
<Box px="32" py="24" display="flex" flexDirection="column" gap="24" overflow="auto" h="full">
  <Box display="flex" flexDirection="column" gap="8">
    <Heading level="1" fontSize="2xl">Page Title</Heading>
    <Text color="fg.secondary">One-sentence description.</Text>
  </Box>
  <Tabs value={activeTab} onValueChange={setActiveTab}>
    <TabsList><TabsTrigger value="tab1">Tab 1</TabsTrigger></TabsList>
  </Tabs>
  <Box display="flex" flexDirection="column" gap="16" style={{ flex: 1, minHeight: 0 }}>
    {/* content */}
  </Box>
</Box>
```
Pages with `customLayout: true` must manage their own height (`h="full"`) — never `100vh`.

### Persistence
Use `app/usePersistentState.js` to sync UI state to `localStorage`. Always check `isHydrated` before rendering state-dependent content.

### Dark mode
Use `[data-theme="dark"]` selectors. Never `@media (prefers-color-scheme: dark)`.

### Layout hook
`useLayout()` from `app/context/LayoutContext.tsx` — exposes `asideContent`, `footerContent`, `hidePageHeader`, `opalPanelControls`.

---

## Agents Area Patterns (`app/opal/agents/`)

### Badge intent (V3 API)
```tsx
// In app/opal/ use `intent`, not `colorScheme` (that is V2)
<Badge intent="success" variant="subtle">New</Badge>
// Valid: "success" | "information" | "primary" | "danger" | "warning"
```

### ResizableDetailsTray
Use `ResizableDetailsTray` from `app/opal/agents/setup/components/ResizableDetailsTray.tsx` for any right-side panel that should be user-resizable.
```tsx
<ResizableDetailsTray
  isOpen={isOpen}
  onClose={() => setOpen(false)}
  title="My Panel"
  defaultWidth={400}
  minWidth={320}
  maxWidth={640}
  footer={<Box>...</Box>}
>
  {/* body */}
</ResizableDetailsTray>
```

### SelectionTooltip
Fixed-position tooltip anchored to mouse coordinates from a text selection — uses raw `<div>`, not Axiom Tooltip. Styled with `--ax-colors-bg-default-inverse` / `--ax-colors-fg-default-inverse` for automatic light/dark adaptation.

### BuildWithOpalPage
When an agent has no configuration, render `<BuildWithOpalPage />` as a full-page replacement (not inside the normal form). Never nest it inside the form layout.

### Lazy-loading heavy panels
```tsx
const MyPanel = dynamic(
  () => import("./components/MyPanel").then((mod) => mod.MyPanel),
  { ssr: false }
);
```

### Workflow builder
`app/opal/agents/workflow/` uses `@xyflow/react` + `elkjs`. Axiom components appear only in sidebars/toolbars — not on the canvas itself.

---

## Common Mistakes

1. Arbitrary spacing — `padding: 17px` → use `p="16"` token
2. Hex colors — `color="#333"` → use `color="fg.default"`
3. Custom button styles — use `<Button>` variants
4. Hardcoded shadows — use `shadow="sm|md|lg"`
5. `prefers-color-scheme` media queries — use `[data-theme="dark"]` selectors
6. Raw HTML for product UI — use Axiom components (raw HTML only in VB website blocks)
7. `maxHeight="400px"` — not a valid prop; use `style={{ maxHeight: '400px' }}`
8. `<Select><option>…</option></Select>` — use the `options={[...]}` prop
9. `bg.pill.default` on `<Box>` — scoped to `<Pill>` only; causes TypeScript build failure

## Debugging: SprinklesError

`"width" has no value "200". Possible values are...`

1. Find the prop (`width` → `w` prop)
2. Pick the closest valid token from the Prop Token Values table (`200` → `w="224"`)
3. Or escape with `style` for exact values: `style={{ width: '200px' }}`
