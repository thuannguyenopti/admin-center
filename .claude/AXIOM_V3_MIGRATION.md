# Axiom V3 Migration Guide

This document captures everything needed to convert a page from Axiom V2 to V3, audit existing V3 pages, and understand the V3 shell/nav implementation in this repo. Read this before touching any `app/opal/` file.

---

## How V3 is scoped in this repo

V3 is **not a separate npm package** — the repo runs `@optiaxiom/react@3.0.0-next.0` everywhere. The V3 lime-green brand is activated by a CSS custom-property override block scoped to `[data-brand="v3"]`.

### Where the scope is applied

**`app/layout.tsx`** wraps the rendered content in:

```tsx
<div data-brand={path.startsWith("/opal") ? "v3" : undefined} style={{ display: "contents" }}>
  {menu ? <Template structure={menu}>{children}</Template> : children}
</div>
```

This means **every route under `/opal`** gets V3 visuals automatically — including the GlobalBar, sidenav, and all child pages.

### Where the CSS overrides live

**`app/globals.css`** — `[data-brand="v3"]` block. Key overrides:

```css
[data-brand="v3"] {
  --ax-fontFamily-sans: "Die Grotesk B", system-ui, sans-serif;
  --ax-colors-bg-accent: #abff44;                      /* lime green CTA */
  --ax-colors-bg-accent-subtle: rgba(94, 139, 39, 0.16); /* NavItem selected bg — Figma: colors/bg/states/default-selected */
  --ax-colors-bg-accent-subtle-hovered: rgba(94, 139, 39, 0.24);
  --ax-colors-bg-page: #f9fcf8;                        /* page canvas */
  --ax-colors-bg-secondary: #eff5eb;
  --ax-colors-border-default: #d8e4cb;
  --ax-colors-border-focus: #226b1e;                   /* active tab underline, focus ring */
  --ax-colors-fg-default: #202320;
  --ax-colors-fg-secondary: #484e46;
  --ax-colors-fg-tertiary: #616755;
  --ax-colors-fg-accent: #226b1e;
  /* ... full set in globals.css */
}
```

**`--ax-size-2xs: 1.25rem` is required** — without it, `@optiaxiom/icons` Material icons inside `NavItem` render at 16px (Axiom's `Icon asChild` wrapper overrides the icon's natural 20px default via `h="2xs"`). At 16px the thin Material outlines look visually smaller than V2 FontAwesome icons at the same size.

**`--ax-colors-bg-accent-subtle` is required** — without it the NavItem `active` state falls back to V2 blue. This token must be present in the `[data-brand="v3"]` block. The value `rgba(94, 139, 39, 0.16)` comes directly from the Figma V3 design token `colors/bg/states/default-selected (#5e8b2729)`.

**You do not need to add `data-brand` to individual page components.** It is inherited automatically for all `/opal` routes via the root layout wrapper.

---

## Global Bar — V2 vs V3

`app/components/GlobalBar.tsx` renders conditionally based on `isOpalRoute = pathname.startsWith("/opal")`.

### V3 layout (Opal routes)

```
LEFT                          RIGHT
──────────────────────────────────────────────────────────────────
[Optimizely wordmark] [⊞ Opal ˅]     [Ask Opal] [🔍] [🔔] [?] [Avatar]
```

- **Logo**: full "Optimizely" wordmark SVG — lime green (`#ABFF44`) letter fills + dark green (`#0D3A29`) outline. Light/dark mode variants toggled via `theme === "dark"`.
- **Product switcher**: `<Button appearance="subtle" addonBefore={<IconGrid2 />}>Opal</Button>` inside `<MenuTrigger asChild>`. Uses `IconGrid2` from `@optimizely/axiom-icons`.
- **Ask Opal button**: `<Button appearance="default">` with opal-orb.png (16×16) + "Ask Opal" text. Uses `<Box asChild display="inline-flex"><span>` to avoid `<div>` inside `<p>` hydration error.
- **Icons**: search (`IconSearch`), notifications (`<NotificationDropdown />`), help (`IconHelp`), avatar (`<Image src="/avatars/aamr-fakhry.png" />`).
- **Removed from V3**: theme/System dropdown, code-panel button, Opal orb icon-only button.

### V2 layout (all other routes)

- **Logo**: flame SVG (multicolor)
- **"Stride ˅"** breadcrumb
- **Product switcher**: `<Box>` with inline chevron SVG (no Axiom Button)
- **Theme menu**: System / Light / Dark dropdown
- **Opal orb button**: subtle icon button with opal-orb.png
- **Code panel button**: `IconCode` → opens code view panel

### Key conditional pattern

```tsx
const isOpalRoute = pathname.startsWith("/opal");

// Logo
{isOpalRoute ? <OpalWordmarkSVG /> : <FlameSVG />}

// "Stride" breadcrumb — V2 only
{!isOpalRoute && <Box>Stride {chevronSvg}</Box>}

// Product Menu trigger
<MenuTrigger asChild>
  {isOpalRoute
    ? <Button appearance="subtle" addonBefore={<IconGrid2 />}>{product}</Button>
    : <Box>{product} {chevronSvg}</Box>
  }
</MenuTrigger>

// Right-side controls
{isOpalRoute ? (
  <>
    <Button appearance="default" onClick={onOpalClick}>
      <Box asChild display="inline-flex" alignItems="center" gap="8">
        <span><Image src="/opal-orb.png" width={16} height={16} alt="" />Ask Opal</span>
      </Box>
    </Button>
    <Button icon={<IconSearch />} />
    <NotificationDropdown />
    <Button icon={<IconHelp />} />
    <Button><Image src="/avatars/aamr-fakhry.png" width={24} height={24} style={{borderRadius:999}} /></Button>
  </>
) : (
  /* V2: theme menu + orb button + search + bell + help + code + user profile menu */
)}
```

---

## V2 → V3 conversion checklist

When converting a page at `app/opal/some-page.tsx` from V2 to V3:

### 1. Route scope (automatic)
- Nothing to do — if the file is under `app/opal/`, it inherits `[data-brand="v3"]` automatically.
- Do **not** add `data-brand="v3"` to the page component itself.

### 2. Raw CSS variable strings → Axiom props

V2 pages often use raw `var(--ax-colors-*)` strings in `style={{}}`. Replace with Axiom component props:

| Old (V2 inline style) | New (V3 Axiom prop) |
|---|---|
| `style={{ color: "var(--ax-colors-fg-tertiary)" }}` | `color="fg.tertiary"` on `<Box>` |
| `style={{ background: "var(--ax-colors-bg-default)" }}` | `bg="bg.default"` on `<Box>` |
| `style={{ borderRadius: "var(--ax-radii-md)" }}` | `rounded="md"` prop |
| `style={{ boxShadow: "var(--ax-shadows-sm)" }}` | `shadow="sm"` prop |
| `style={{ borderColor: "var(--ax-colors-border-default)" }}` | `borderColor="border.default"` |

**Acceptable exceptions** — keep as inline style when:
- Applied to a native HTML element (`<th>`, `<td>`, `<tr>`) that Axiom doesn't own
- Part of a conditional style override (e.g. drag-over highlight, focus ring)
- A separator div: `style={{ background: "var(--ax-colors-border-default)" }}` — this pattern is documented in CLAUDE.md as valid

### 3. Tag/category pills → `<Badge>`

V2 pages commonly render colored pills as raw `<span style={{ background: tag.bg, color: tag.color, borderRadius: "..." }}>`. Replace with:

```tsx
// Before (V2)
<span style={{ background: "var(--ax-colors-bg-information-subtle)", color: "var(--ax-colors-fg-information)", borderRadius: "var(--ax-radii-md)", padding: "2px 6px" }}>
  {tag.label}
</span>

// After (V3)
<Badge intent="information" variant="subtle">{tag.label}</Badge>
```

Intent mapping:
| Old bg CSS var | `intent` value |
|---|---|
| `--ax-colors-bg-information-subtle` | `"information"` |
| `--ax-colors-bg-success-subtle` | `"success"` |
| `--ax-colors-bg-primary-subtle` | `"primary"` |
| `--ax-colors-bg-warning-subtle` | `"warning"` |

Update the data type to drop `bg`/`color` fields and use `intent: "information" | "success" | "primary" | "warning"` instead.

### 4. "New" / status badges

Any badge using a raw CSS gradient for its background in V2:

```tsx
// Before (V2 — illegible in V3 dark green context)
<span style={{ background: "linear-gradient(135deg, var(--ax-colors-fg-link-default)...)" }}>New</span>

// After (V3)
<Badge intent="information" variant="subtle">New</Badge>
```

### 5. Agent/AI icon backgrounds

Agent icon containers that use a V2 accent color should use the Opal rebrand gradient in V3:

```tsx
// V3 — Opal rebrand gradient (documented in OPAL_DESIGN_SYSTEM.md)
style={{
  background: "linear-gradient(90deg, rgba(186,158,245,0.2), rgba(168,184,240,0.17) 60%, rgba(119,236,133,0.14)), linear-gradient(#fff,#fff)"
}}
```

See `OPAL_DESIGN_SYSTEM.md` → Gradient tokens → `--opal-gradient-rebrand`.

### 6. Icons — two-package split

`app/opal/` uses a **different icon package** from the rest of the app:

| Area | Package | Style |
|---|---|---|
| `app/opal/` (V3) | `@optiaxiom/icons` | Material-style (outlined) |
| All other areas (V2) | `@optimizely/axiom-icons` | FontAwesome Pro Light |

```tsx
// V3 — app/opal/ files
import { IconSearch, IconBell, IconGear } from "@optiaxiom/icons";

// V2 — all other product areas
import { IconSearch } from "@optimizely/axiom-icons";
```

**Never use `@tabler/icons-react` directly** in any product UI file. If an icon is missing from `@optimizely/axiom-icons` (V2 area), add a Tabler fallback to `app/lib/axiom-icons.tsx`.

**`IconAgent` exception** — `IconAgent` does not yet exist in `@optiaxiom/icons`. Import it from `@optimizely/axiom-icons` even in V3 opal files, as a second named import block:

```tsx
// V3 opal file — most icons from V3 package, IconAgent still from V2
import { IconSearch, IconBell, IconGear } from "@optiaxiom/icons";
import { IconAgent } from "@optimizely/axiom-icons";
```

**`app/layout.tsx` nav icons** — The opal section of the nav (`layout.tsx`) must use `@optiaxiom/icons` for all icons except `IconAgent`. Non-opal nav sections stay on `@optimizely/axiom-icons`. Use import aliases to avoid name conflicts when both packages are imported in the same file (e.g. `IconGear as IconGearV3`).

### 7. Danger → Error token rename

V3 renames all `*-danger` color tokens to `*-error`. Any V2 code using the old names will compile but render with the wrong color or fall through to a missing token:

| V2 token | V3 token |
|---|---|
| `fg-danger` | `fg-error` |
| `bg-danger` | `bg-error` |
| `border-danger` | `border-error` |

```tsx
// Before (V2)
<Button appearance="danger">Delete</Button>
<DropdownMenuItem color="fg-danger">Delete</DropdownMenuItem>

// After (V3)
<Button appearance="danger">Delete</Button>      // appearance prop unchanged
<DropdownMenuItem color="fg-error">Delete</DropdownMenuItem>  // color token renamed
```

Grep for `fg-danger\|bg-danger\|border-danger` when auditing a V2-origin file.

### 8. Typography — Die Grotesk B (body) + Nudge SemiNormal (headings)

V3 uses two font families, both declared via `@font-face` in `globals.css` and applied via the `[data-brand="v3"]` CSS block. **Never set `font-family` inline** — it's inherited automatically.

| Role | Font | CSS selector |
|---|---|---|
| Body / UI text | Die Grotesk B | `[data-brand="v3"] { font-family: "Die Grotesk B" }` |
| Headings h1–h6 | Nudge SemiNormal (= VC Nudge) | `[data-brand="v3"] h1–h6 { font-family: "Nudge SemiNormal" }` |

Font files live in `public/fonts/` (die-grotesk-b-*.woff2, NudgeSemiNormal-*.woff2).

**Why not `--ax-fontFamily-sans`?** Axiom V3's compiled CSS has zero explicit `font-family` declarations — it relies on CSS inheritance. The `[data-brand="v3"]` block directly sets `font-family` on the element so it overrides the `body { font-family: Arial }` fallback (attribute selector specificity 0,1,0 > element selector 0,0,1).

### 9. `--ax-colors-fg-default-inverse` — do not override to dark

This token controls **tooltip text color** (text on `bg.default.inverse` dark surfaces). Setting it to `#202320` (dark) makes tooltip labels invisible on dark backgrounds.

Primary button dark text on lime-green is handled separately by `--v3iotm`:
```css
/* In Axiom button CSS: color: var(--v3iotm, var(--ax-colors-fg-white)) */
[data-brand="v3"] {
  --v3iotm: #202320; /* ✓ dark text on lime-green buttons */
  /* --ax-colors-fg-default-inverse: #202320 ← ✗ do NOT add this — breaks tooltips */
}
```

### 10. Tabs — use custom Box underline pattern

The Axiom `<Tabs>/<TabsList>/<TabsTrigger>` components render the active indicator using `--ax-colors-bg-accent` (V2 blue in a V3 context). Do **not** use them in `app/opal/` pages. Use the custom `Box` underline pattern instead.

**Active tab underline color: `var(--ax-colors-fg-default)` (`#202320`)** — from Figma spec (`border-[var(--colors/fg/default)]`).
- ❌ Do NOT use `--ax-colors-border-focus` (that is the teal focus ring, not a tab indicator)

```tsx
// Wrong — renders V2 blue active indicator
<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
  <TabsList>
    <TabsTrigger value="a">Tab A</TabsTrigger>
    <TabsTrigger value="b">Tab B</TabsTrigger>
  </TabsList>
</Tabs>

// Correct — dark underline on selected tab (Figma: border-[var(--colors/fg/default,#202320)])
const [activeTab, setActiveTab] = useState<"a" | "b">("a");

<Box display="flex" gap="24" borderB="1" borderColor="border.tertiary">
  {(["a", "b"] as const).map((tab) => (
    <Box
      key={tab}
      pb="12"
      cursor="pointer"
      borderB={activeTab === tab ? "2" : "0"}
      onClick={() => setActiveTab(tab)}
      style={activeTab === tab ? { borderBottomColor: "var(--ax-colors-fg-default)" } : {}}
    >
      <Text
        fontWeight={activeTab === tab ? "500" : "400"}
        color={activeTab === tab ? "fg.default" : "fg.tertiary"}
      >
        {tab === "a" ? "Tab A" : "Tab B"}
      </Text>
    </Box>
  ))}
</Box>
```

**Typography spec (Axiom V3 Figma `857:29464`):**
- Font: `Die Grotesk B` (falls back to Inter until font files are added)
- Size: 14px (`font-size-300`) · Letter spacing: 0.28px
- Selected: `fontWeight="500"` · `color="fg.default"` (`#202320`)
- Unselected: `fontWeight="400"` · `color="fg.tertiary"` (`#616755`)

### 9. Semantic HTML inside `<Text>`

`<Text>` renders a `<p>` by default. Nesting block elements or bare `<strong>`/`<em>` tags directly inside will cause React hydration errors or incorrect rendering. Use `asChild` to merge styles onto the semantic element:

```tsx
// Wrong — <strong> inside <Text> renders fine visually but misses the fontWeight
<Text>The file <strong>{name}</strong> will be deleted.</Text>

// Correct — fontWeight applied via asChild
<Text>The file <Text asChild fontWeight="600"><strong>{name}</strong></Text> will be deleted.</Text>
```

For inline elements with icons, keep the layout outside `<Text>` rather than wrapping a flex container inside it:

```tsx
// Wrong — Box (div) inside Text (p) = hydration error
<Text><Box display="flex" gap="6"><IconUsers />Shared</Box></Text>

// Correct
<Box display="flex" gap="6">
  <IconUsers />
  <Text>Shared</Text>
</Box>
```

### 10. Input sizes

Only `"md"` (default), `"lg"`, `"xl"` are valid. Remove any `size="sm"`.

### 11. Dark mode

Replace `@media (prefers-color-scheme: dark)` with `[data-theme="dark"]` selector.

### 12. Page titles — always `<Heading level="1">`

The shared template (`app/components/template.tsx`) auto-renders a `<Heading level="1">` page title for all pages that do **not** set `customLayout: true` or `hidePageHeader: true` in the nav structure (`app/layout.tsx`).

For pages that **do** set one of those flags, the page component owns its title and **must** use `<Heading level="1">`.

```tsx
// CORRECT — page owns its title (customLayout or hidePageHeader is set)
<Heading level="1">Agents</Heading>

// WRONG — Text is not a heading
<Text fontSize="2xl" fontWeight="600">Agents</Text>

// WRONG — inline style is not a heading
<Text style={{ fontSize: 28, fontWeight: 700 }}>Agents</Text>

// WRONG — raw HTML element
<h1 className="text-2xl font-bold">Agents</h1>
```

For pages without either flag, the template renders the heading — **do not render a duplicate `<Heading>` in the page component**.

| Nav item config | Who renders the page title |
|---|---|
| _(no flag)_ | Template — page does NOT render one |
| `hidePageHeader: true` | Page must render `<Heading level="1">` |
| `customLayout: true` | Page must render `<Heading level="1">` (or intentionally omit for fully custom layouts like chat) |

This rule applies to **all V3 pages across all product areas** (Opal, CMS, CMP, etc.).

---

## V3 audit — what to look for

Run through these checks on any `app/opal/` file before marking it V3-compliant:

```
□ No raw var(--ax-colors-*) in style={{}} — use Axiom color props instead (with noted exceptions)
□ No raw var(--ax-radii-*) — use rounded="..." prop
□ No raw var(--ax-shadows-*) — use shadow="..." prop
□ Icons from @optiaxiom/icons (NOT @optimizely/axiom-icons) — except IconAgent
□ No @tabler/icons-react imports in product UI (only allowed in app/lib/axiom-icons.tsx)
□ No size="sm" on Input or SearchInput
□ No <span style={{ background, color, borderRadius }}> for colored pills — use <Badge intent>
□ No @media (prefers-color-scheme: dark) — use [data-theme="dark"]
□ No data-brand="v3" on the page component (inherited from layout)
□ Agent icon containers use --opal-gradient-rebrand, not a plain accent color
□ "New" / status badges use <Badge intent="information" variant="subtle">
□ No fg-danger / bg-danger / border-danger tokens — renamed to fg-error / bg-error / border-error
□ No style={{ fontFamily }} or fontFamily prop — V3 fonts are inherited via globals.css
□ No <Tabs>/<TabsList>/<TabsTrigger> — use custom Box borderB underline pattern
□ Active tab underline uses var(--ax-colors-fg-default) NOT var(--ax-colors-border-focus)
□ Tab text: selected fg.default/500, unselected fg.tertiary/400
□ --ax-colors-fg-default-inverse NOT overridden to dark (breaks tooltips; use --v3iotm for button text)
□ No bare <strong>/<em> inside <Text> — use <Text asChild fontWeight="..."><strong>
□ globals.css [data-brand="v3"] block includes --ax-colors-bg-accent-subtle (NavItem selected state)
□ Page title — if customLayout/hidePageHeader is set, page uses <Heading level="1"> not <Text fontSize> or raw <h1>; if no flag is set, no duplicate <Heading> in the page component
```

---

## Files touched in the V3 migration (May 2025)

| File | What changed |
|---|---|
| `app/layout.tsx` | Added `data-brand={path.startsWith("/opal") ? "v3" : undefined}` wrapper div |
| `app/globals.css` | Added `[data-brand="v3"]` CSS custom property override block (lime green brand, Die Grotesk B font) |
| `app/components/GlobalBar.tsx` | Conditional V3/V2 nav rendering based on `isOpalRoute`. V3: wordmark logo, `IconGrid2` + product menu, Ask Opal button, simplified right side |
| `app/opal/agents/page.tsx` | Replaced raw span pills with `<Badge intent>`, updated "New" badge to `intent="information"`, applied `--opal-gradient-rebrand` to agent icon background |
| `app/opal/agents/layout.tsx` | Simplified — removed `data-brand` (moved to root layout) |
| `OPAL_DESIGN_SYSTEM.md` | Documented `--opal-gradient-rebrand` gradient token |
| `.claude/FIGMA_LIBRARY_V3.md` | Added reference to Opal-specific gradients |

---

## Opal-specific gradient tokens

See `OPAL_DESIGN_SYSTEM.md` → Gradient tokens for the full list. The most important:

**`--opal-gradient-rebrand`** — used for agent icon containers, AI feature card backgrounds:
```css
background:
  linear-gradient(90deg, rgba(186,158,245,0.2), rgba(168,184,240,0.17) 60%, rgba(119,236,133,0.14)),
  linear-gradient(#fff, #fff);
```

---

## References

- `OPAL_DESIGN_SYSTEM.md` — Opal-specific rules, gradient tokens, component rules
- `.claude/FIGMA_LIBRARY_V3.md` — V3 Figma design tokens, component keys, layout constants
- `DESIGN_SYSTEM.md` — General Axiom rules applying to both V2 and V3
- `CLAUDE.md` → "Additional rules for `app/opal/`" — canonical V3 rules
