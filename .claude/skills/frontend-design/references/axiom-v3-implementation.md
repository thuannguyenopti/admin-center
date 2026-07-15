# Axiom V3 Implementation

This is the authority for implementing Optimizely product UI with Axiom V3 in `axiom-play`. Product-design decisions are owned by `interaction-and-composition.md`; repository build and architecture rules remain in `CLAUDE.md`.

## Required preflight

- If a Figma design exists or is supplied for the surface being built, fetch it (`get_design_context` plus `get_variable_defs`, and `get_screenshot` for visual confirmation) before writing layout code. Treat its exact spacing, typography and component composition as authoritative over general judgment calls, prose descriptions or reference screenshots from elsewhere — those are useful for interaction intent, not for pixel/token fidelity. If the fetched Figma content conflicts with an existing implementation or with general guidance below, follow the Figma spec and state the reconciliation rather than silently picking one. Do not proceed to layout code on a Figma-sourced surface from memory or assumption once a node ID is available — fetch it first.
- Inspect nearby production-quality routes and reuse established page structure and local wrappers.
- Use `@optiaxiom/react` whenever an equivalent component exists.
- Use semantic color tokens and spacing tokens.
- Use the correct icon package for the product area.
- Split files over 300 lines or with multiple concerns before adding behavior.
- Query the configured `axiom-v3` MCP when a component API, prop or token is uncertain; do not guess.

## Component contract

Use Axiom components for product chrome:

- Layout/type: `Box`, `Cover`, `Grid`, `Group`, `Heading`, `Separator`, `Text`
- Forms: `Button`, `Checkbox`, `DateInput`, `DateRangePicker`, `Field`, `Input`, `RadioGroup`, `SearchInput`, `Select`, `Switch`, `Textarea`, `ToggleButton`
- Feedback: `Alert`, `AlertDialog`, `Badge`, `Banner`, `Indicator`, `Progress`, `Skeleton`, `Spinner`, `Toast`, `Tooltip`
- Navigation: `Breadcrumb`, `Link`, `Menu`, `Pagination`, `Sidebar`, `Tabs`
- Surfaces/data: `Card`, `Dialog`, `Disclosure`, `Popover`, `Table`, `DataTable`, `Avatar`, `FileUpload`, `HoverCard`, `SegmentedControl`, `Sortable`

Do not use raw `button`, `input`, `select` or `textarea` when an Axiom equivalent exists. Native elements are allowed only for unavoidable internals such as file inputs, `input type="color"`, canvas/SVG work surfaces or customer website content under `app/components/vb/blocks/`.

When a component lacks an exact layout prop, wrap it in `Box` or use `style`; do not replace an accessible Axiom control with custom markup.

Icon-only buttons require an accessible label and a tooltip when the meaning is not obvious. Do not leave dead buttons, filters, tabs, menus or ellipsis actions.

## Semantic colors

Use `fg.*`, `bg.*` and `border.*` props for UI chrome. In CSS or `style`, use the matching `--ax-colors-*` variables. Hardcoded hex/rgb values are not allowed for product chrome.

Common roles:

| Family | Roles |
| --- | --- |
| `fg.default`, `fg.secondary`, `fg.tertiary`, `fg.disabled` | Text hierarchy |
| `fg.error`, `fg.success`, `fg.warning` | Semantic text/icons |
| `bg.default`, `bg.page`, `bg.secondary` | Neutral surface hierarchy |
| `bg.default.hovered`, `bg.default.pressed` | Interaction and neutral selected state |
| `bg.accent` | Filled primary action only |
| `bg.error/success/warning/information` plus subtle variants | Semantic state surfaces |
| `border.default`, `border.secondary`, `border.tertiary` | Structural separation |
| `border.control`, `border.focus`, `border.error` | Controls and validation |

`fg.accent` / `--ax-colors-fg-accent` is reserved for primary-button text; do not use it for links, labels, badges or icons. Use `LinkStyle` from `app/components/LinkStyle.tsx` for inline links and pass `external` for external URLs.

`bg.pill.default` is scoped to `Pill`; it is not valid on `Box`.

Selected filters, tabs and toggle-like button groups use Axiom's selected state or `var(--ax-colors-bg-default-pressed)`, never `bg.accent`.

## Spacing and sizing tokens

Use Axiom spacing props before raw pixel values.

| Prop | Valid values used here |
| --- | --- |
| `p`, `m`, `gap` | `0 2 4 6 8 10 12 16 20 24 32 40 48 64 80`; `auto` for margin |
| `w`, `h` | numeric tokens including `10 12 16 20 24 32 40 48 56 64 80 224 384`; named `2xs xs sm md lg xl 3xl`; fractions; `auto fit full max min` |
| `border`, `borderT/B/L/R` | `0 1 2` |
| `maxH` | `xs sm md lg full` |

Use `style` only when an exact value is structurally required and no token exists, for example `style={{ width: 448 }}` for a proven panel dimension. Do not introduce arbitrary spacing merely to tune by eye.

Use `rounded`, not `borderRadius`, and `shadow`, not `boxShadow`, when the tokenized prop fits. Radius tokens: `sm`, `md`, `lg`, `xl`, `full`. Shadow tokens: `sm`, `md`, `lg`.

## Typography implementation

The installed Axiom scale is:

| Token | Size | Implementation role |
| --- | --- | --- |
| `xs` | 10px | Not approved for this project; do not use |
| `sm` | 12px | Body/Small and secondary metadata |
| `md` | 14px | Body/Medium and default product copy |
| `lg` | 16px | Body/Large and Heading 4 |
| `xl` | 20px | Heading 3 |
| `2xl` | 24px | Heading 2 |
| `3xl` | 28px | Exceptional intermediate display size |
| `4xl` | 50px | Heading 1 token; use only where the established page pattern calls for it |

Use `fontSize` tokens on Axiom `Text`; do not hardcode raw pixel font sizes. Use Axiom `Heading` levels for headings and the product font stack. Weight roles: `400` body, `500` emphasis, `600` subheading, `700` heading/button.

Caption is implemented at `app/dam/components/Caption.tsx` until Axiom ships a primitive. Reuse a shared wrapper rather than reconstructing uppercase/letter-spacing styles locally. The decision to use Caption is governed by `interaction-and-composition.md`.

## Buttons and forms

- Primary page/panel actions: `Button appearance="primary" size="md"` or `size="lg"`.
- Secondary: `appearance="default"`.
- Tertiary: `appearance="subtle"`.
- Destructive: `appearance="danger"` or `danger-outline` as supported.
- `size="sm"` is limited to genuinely dense toolbars or compact contextual chrome, not standalone consequential CTAs.
- `Input` and `SearchInput` support `md` (default), `lg` and `xl`; never `sm`.
- Wrap inputs with `Field`; do not create manual text labels.
- Keep form-control sizes consistent within a row or section.

`Select` is data-driven. `value` must match one of `options`; validate persisted/remote values before rendering. Do not render native `<option>` children.

## Menus

Use Axiom V3 `Menu` with the `options` prop, `MenuTrigger` and `MenuContent`. Do not introduce `DropdownMenu`.

`MenuOption[]` supports search, nested `subOptions`, grouped labels/separators, `addon`, `detail`, `intent: "danger"`, `disabledReason` and `keywords`. Helpers should return `MenuOption[]`, not JSX fragments. Use `subOptionsInputVisible` and `keywords` for searchable submenus instead of hand-rolled input state.

## Badges, pills and shared atoms

- Use `Badge` for short read-only status/metadata when it changes a decision.
- Use `Pill`/`PillMenu` from the supported unstable export for interactive tags or filter chips when that existing pattern is appropriate.
- Create one shared local wrapper for repeated sizing/casing changes.
- Keep chip density, casing and contrast consistent across a feature.
- Use Axiom `Button` with an accessible label for removable-chip actions.

Do not mix custom pill boxes and Axiom badges in one feature.

## Page shell and layout

`app/components/template.tsx` owns standard shell padding (`px="32" py="24"`) and the generated page title. Use `customLayout: true` for full-bleed work surfaces and manage `h="full"`; never use `100vh` inside the product shell.

Use one owner for page padding. Do not stack route padding on shell padding. Standard rhythm:

- header to tabs: `16`;
- tabs to immediate work surface: `16`;
- major section separation: `24` or `32`.

Use `useLayout()` from `app/context/LayoutContext.tsx` for `asideContent`, `footerContent`, `hidePageHeader`, `opalPanelControls` and other shell injection. Use `app/usePersistentState.js` for localStorage-backed state and wait for `isHydrated` before hydration-sensitive rendering.

## Configuration forms and `Flow`

`Flow` from `app/components/Flow.tsx` is the standard container for settings pages, detail forms and document-like vertical content.

- Root settings/form Flow uses `maxW="lg"`.
- Do not add manual `mt`/`mb` to direct children; Flow owns vertical rhythm.
- Do not replace it with a column flex stack.
- Put notices before the first section heading.
- Put the save action in `Footer` from LayoutContext, outside Flow.
- Put dialogs outside Flow.
- Only direct children receive Flow spacing; wrappers hide their descendants from it.

Canonical structure:

```tsx
<>
  <Flow maxW="lg">
    {notice && <Alert intent="information">...</Alert>}
    <Heading level="4">Section</Heading>
    <Field label="Name" required><Input /></Field>
    <Field label="Description"><Textarea rows={3} /></Field>
    <Separator />
    <Heading level="4">Delete</Heading>
    <Text color="fg.secondary">This cannot be undone.</Text>
    <Button appearance="danger">Delete</Button>
  </Flow>
  <Footer><Button appearance="primary">Save</Button></Footer>
  <AlertDialog ... />
</>
```

## Icons

| Area | Package |
| --- | --- |
| `app/opal/` | `@optiaxiom/icons` first; `@optimizely/axiom-icons` only for a missing icon |
| All other product areas | `@optimizely/axiom-icons` |

Never import `@tabler/icons-react` directly in product UI. Outside Opal, add a missing-icon fallback only in `app/lib/axiom-icons.tsx`. CMP custom SVG components live in `app/cmp/assets/` and use `fill="currentColor"`.

The temporary Sub Agent icon remains `IconAgent` until the correct Material-style export exists; do not use the dashed-box `IconSubAgent`.

## Dark mode and CSS

- Use `[data-theme="dark"]`, never `@media (prefers-color-scheme: dark)`.
- Put product-specific CSS in `app/<product>/styles.css`, not `app/globals.css`.
- Use semantic CSS variables in raw CSS.
- Do not mutate webpack SVG rules or build bundler flags; those rules are authoritative in `CLAUDE.md`.

## Markup and hydration gotcha

Axiom `Box` renders a `div`; `as="span"` is ignored. Inside a button/menu label that renders a `p`, use `asChild` with a native `span`:

```tsx
<Box asChild display="inline-flex" alignItems="center" gap="8">
  <span><IconClock />All Time</span>
</Box>
```

Use a keyed `React.Fragment` when a `.map()` iteration returns multiple siblings; shorthand fragments cannot receive a key.

## Tables

Use the shared `Table`, `Th`, `Td`, and `Tr` wrappers. Selectable rows should make the row target predictable; avoid repeated edit buttons when row selection opens the same detail flow.

For grouped/collapsible tables:

- merge checkbox and chevron into the first column;
- stop propagation around checkbox/button actions;
- use `colSpan` on the group label cell;
- keep child-row content aligned with a fixed placeholder matching the chevron target;
- render group and children in a keyed `React.Fragment`;
- preserve keyboard-operable controls and visible focus.

The established alignment uses 16px first-column inset, a 32px chevron/placeholder target and small content-column inset. Inspect the current shared-table implementation before copying values into a new table.

## Opal agents-area implementation

General Opal identity is authoritative in `.claude/skills/opal-design/SKILL.md`. Additional live patterns:

- Reuse `ResizableDetailsTray` for resizable agent side panels.
- Render `BuildWithOpalPage` as a full-page replacement when configuration is absent.
- Lazy-load heavy browser-only panels with `next/dynamic` and `ssr: false` when required.
- The workflow builder uses `@xyflow/react` and `elkjs`; Axiom components belong in sidebars/toolbars, not as canvas nodes by default.
- Use existing selection-tooltip and loader patterns; do not invent parallel primitives.

## Common build-time mistakes

- Invalid Sprinkles value: choose the nearest supported token or use `style` for a justified exact value.
- `maxHeight="400px"`: invalid prop; use `style={{ maxHeight: 400 }}`.
- Hardcoded product color: replace with semantic prop/variable.
- Custom button-like element: replace with Axiom `Button`.
- Native select children: use `options`.
- `bg.pill.default` on `Box`: use the token only on `Pill`.
- `prefers-color-scheme`: replace with the repository theme selector.

## Implementation verification

Typecheck/lint the touched scope, confirm no raw equivalent controls or invalid tokens were introduced, and then run the rendered visual-quality workflow. Code compliance is necessary but not sufficient.
