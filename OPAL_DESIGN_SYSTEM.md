# Opal Design System

This file documents the Opal-specific design layer that sits **on top of Axiom V3**. Agents load this as `OPAL_CONTEXT` when working on any file under `app/opal/`.

Axiom V3 rules still apply — this file covers only what the Axiom V3 MCP doesn't know about.

---

## Figma Sources

| File | Purpose | Key |
|---|---|---|
| [Opal Components](https://www.figma.com/design/Q9NrkuaNZVeV9f4qURl9bw/Opal-Components--V2-Rebrand-) | Opal UI components, colors, tokens | `Q9NrkuaNZVeV9f4qURl9bw` |
| [Action Cards](https://www.figma.com/design/tt1XbZP9uV2glsyiFMNUg5/Action-Cards) | Action Card component library | `tt1XbZP9uV2glsyiFMNUg5` |
| [Axiom Design System](https://www.figma.com/design/qs72V79n1s9wYOcZ1TzBwM/Axiom-Design-System) | Axiom V3 tokens and components | `qs72V79n1s9wYOcZ1TzBwM` |

---

## Colors

### Gradient tokens
Opal uses gradient colors that are **not in the Axiom token system**. Use CSS custom properties for these:

| Token | Usage |
|---|---|
| `--opal-gradient-light` | Light pastel gradient (lavender → pink → mint) |
| `--opal-gradient-dark` | Dark gradient variant |
| `--opal-gradient-medium` | Mid-weight gradient |
| `--opal-gradient-loading` | Animated loading gradient |
| `--opal-gradient-rebrand` | V3 rebranded page background gradient (see below) |

**Rule: Never use `bg.*` Axiom tokens for Opal gradients. Use CSS custom properties only.**

#### `--opal-gradient-rebrand`

Opal's rebranded background gradient — a purple-to-blue-to-green wash over white:

```css
background:
  linear-gradient(90deg, rgba(186, 158, 245, 0.2), rgba(168, 184, 240, 0.17) 60%, rgba(119, 236, 133, 0.14)),
  linear-gradient(#fff, #fff);
```

| Stop | Color | Opacity | Notes |
|---|---|---|---|
| 0% | `rgb(186, 158, 245)` | 20% | Soft violet — Opal purple |
| 60% | `rgb(168, 184, 240)` | 17% | Periwinkle blue — transition |
| 100% | `rgb(119, 236, 133)` | 14% | Mint green — V3 brand echo |

The second `linear-gradient(#fff, #fff)` ensures a white base so transparent stops render on pure white.

### Solid palette
Opal has a distinctive solid color palette used for accents, pills, and state indicators:

| Color | Usage |
|---|---|
| Opal Purple | Primary accent, agent cards |
| Opal Pink | Secondary accent |
| Opal Cyan | Info, links |
| Opal Mint | Success states |
| Opal Bright Green | Active/online indicators |

These map to Axiom semantic tokens where possible. Use `fg.*`, `bg.*`, `border.*` Axiom tokens for UI chrome — use Opal palette only for Opal-specific visual identity elements.

### ⚠ Inline style colors — always use CSS vars, never bare hex

**This is the single most common source of merge conflicts and compliance failures.** When writing `style={{}}` props, every color must be a CSS custom property — never a bare hex value like `#e4f0da`.

**V3 quick-reference: hex → CSS var**

| Bare hex (never use) | Correct CSS var | Token name | Usage |
|---|---|---|---|
| `#e4f0da` | `var(--ax-colors-bg-secondary)` | `bg.secondary` | Light green surface / avatar container bg |
| `#f6faf3` | `var(--ax-colors-bg-page)` | `bg.page` | Near-white page background |
| `#eff5eb` | `var(--ax-colors-bg-secondary)` | `bg.secondary` | Secondary surface (same token, slightly lighter) |
| `#eeffd9` | `var(--ax-colors-bg-accent-subtle)` | `bg.accent.subtle` | Pale lime accent wash |
| `#202320` | `var(--ax-colors-fg-default)` | `fg.default` | Near-black body text |
| `#484e46` | `var(--ax-colors-fg-secondary)` | `fg.secondary` | Secondary / muted text |
| `#616755` | `var(--ax-colors-fg-tertiary)` | `fg.tertiary` | Tertiary / placeholder text |
| `#d8e4cb` | `var(--ax-colors-border-default)` | `border.default` | Default border |
| `#e4f0da` | `var(--ax-colors-border-secondary)` | `border.secondary` | Subtle border (same hex as bg.secondary — context-dependent) |

**V2 quick-reference: hex → CSS var**

| Bare hex (never use) | Correct CSS var | Token name | Usage |
|---|---|---|---|
| `#c4b5fd` / `#e5dcf4` | `var(--ax-colors-bg-avatar-purple)` | `bg.avatar.purple` | Purple avatar/initials background |
| `#3b1a8a` / `#412470` | `var(--ax-colors-fg-avatar-purple)` | `fg.avatar.purple` | Purple avatar/initials text |
| `#f0f3ff` | `var(--ax-colors-bg-accent-subtle)` | `bg.accent.subtle` | Blue accent wash |
| `#2e3442` | `var(--ax-colors-fg-default)` | `fg.default` | Default text |
| `#4f576e` | `var(--ax-colors-fg-secondary)` | `fg.secondary` | Secondary text |

**Avatar container pattern (V3):**
```tsx
<span style={{
  width: 20, height: 20,
  borderRadius: 4,
  background: "var(--ax-colors-bg-secondary)",  // ← never #e4f0da
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  overflow: "hidden", flexShrink: 0,
}}>
  <img src={avatar} alt={name} style={{ width: 14, height: 14, display: "block" }} />
</span>
```

**User initials badge pattern (V2):**
```tsx
<span style={{
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 24, height: 24, borderRadius: 999,
  background: "var(--ax-colors-bg-avatar-purple)",  // ← never #c4b5fd
  color: "var(--ax-colors-fg-avatar-purple)",        // ← never #3b1a8a
  fontSize: 10, fontWeight: 600, letterSpacing: "0.02em", flexShrink: 0,
}}>JC</span>
```

---

## Typography

| Style | Size | Line Height | Usage |
|---|---|---|---|
| Opal Body Text | 14px | 160% | General Opal UI text |
| Opal Activity Stream | 12px | 160% | Message feeds, timestamps |

Map to Axiom V3 typography tokens where the size matches. Use these custom styles only for elements that specifically require the Opal type spec.

---

## Components

### From `@optiaxiom/proteus` (Action Cards library)

Install: `@optiaxiom/proteus@^0.2.11`

| Component | Description |
|---|---|
| Action Cards | Structured output cards for AI responses — various layouts and content types |

**Rule: Action Cards MUST use `@optiaxiom/proteus` components. Never recreate them with raw HTML or Axiom primitives.**

### Opal-specific UI components (in `app/opal/components/`)

These components are part of the Opal product layer and should be reused, not recreated:

| Component | File | Usage |
|---|---|---|
| OpalLoader (V1–V5) | `app/opal/components/OpalLoader*.tsx` | AI thinking/loading states |
| OpalOrb | Use `public/opal-orb.png` | Opal mascot orb — always use the PNG asset |
| OpalAlert | `app/opal/components/OpalAlert.tsx` | Opal-branded alert/notification banner with gradient background |

**Rule: The OpalOrb must always use `/opal-orb.png`. Do not recreate it with CSS gradients or SVG.**

#### OpalAlert

Two variants controlled by the `type` prop:

| Variant | Layout | Key props |
|---|---|---|
| `"Default"` (default) | Stacked — opal orb + optional title + body text + optional link | `title?`, `body`, `link?: { label, href }`, `dismissible?` |
| `"CTA"` | Single row — opal orb + body text + action slot | `body`, `action?: ReactNode` (typically a `<Button size="sm">`) |

Both variants use the Opal radial gradient (`rgba(186,158,245,…)` → purple → teal → green) over white, `rounded="lg"`, with the opal orb PNG as the leading icon. Preview all variants at `/opal/alert-preview`.

```tsx
// Default with title + link
<OpalAlert type="Default" title="Alert Title." body="Details here." link={{ label: "Learn more", href: "/docs" }} />

// CTA with action button
<OpalAlert type="CTA" body="Try the new feature." action={<Button size="sm" appearance="primary">Get started</Button>} />
```

### Opal UI patterns (from Figma — build using Axiom V3 primitives + Opal conventions)

| Pattern | Description | Key props/notes |
|---|---|---|
| ActivityStream | Scrollable chat/message feed | Use `Box` with overflow scroll; messages in chronological order |
| AgentCard | Agent profile card with avatar, name, description | Reuse `Card` from Axiom V3; avatar uses `Avatar` component |
| PromptInput | Multi-line prompt entry with send button | Wrap in `Field`; send button uses `IconSend` from axiom-icons |
| OutputIsland | Contained AI response block | Distinct background using `bg.surface` or Opal surface token |
| Pills / filter chips | Small tag/label chips; active filter indicators in search bars | Use `<Pill>` from `@optiaxiom/react/unstable` (experimental) — has built-in dismiss, hover, and `bg.pill.default`/`bg.pill.hovered` tokens. `<PillMenu>` (also unstable) for dropdown selection that shows selected items as pills. `Badge` for static read-only labels. For quick-filter toggle rows (All / Mine / Pinned), use `Button` appearance="default" with `style={{ background: "var(--ax-colors-bg-default-pressed)" }}` for the selected state — never `bg.accent`. |
| Sidenav | Opal-specific side navigation | Reuse existing `app/opal/` nav patterns |
| Canvas | Drawing/content work area | Full-bleed layout using `customLayout: true` |
| Header | Top bar for Opal pages | Reuse Axiom V3 `Box` with `bg.surface` and border |

---

## Motion & Animation

### Opal Loader
The canonical Opal loading animation is the **V3 Spiral** pattern (`OpalLoaderV3.tsx`).

- Always use an existing `OpalLoader` component for AI thinking/loading states
- Do not create new CSS `@keyframes` animations for loading — use the loader components
- `OpalLoaderDevPanel` exists at `/opal/loader-preview` for previewing all variants

### Entry transitions
- Opal panels and overlays use smooth entry transitions
- Follow the pattern in `app/opal/components/` — avoid custom one-off `transition` values
- Use Axiom V3 motion tokens where available; fall back to `transition: all 0.2s ease`

---

## Rules Summary

When working on any file in `app/opal/`:

| # | Rule |
|---|------|
| 1 | Gradient colors → CSS custom properties only, never `bg.*` Axiom tokens |
| 2 | Action Cards → must use `@optiaxiom/proteus`, never custom HTML |
| 3 | OpalOrb → always use `/opal-orb.png`, never CSS recreation |
| 4 | Loading states → use existing `OpalLoader` components, never new keyframes |
| 5 | Opal UI patterns (ActivityStream, PromptInput, etc.) → follow Figma patterns above |
| 6 | Alert banners in `app/opal/` → use `OpalAlert` component, never custom banner markup |
| 7 | All standard Axiom V3 rules still apply — see `.claude/AXIOM_V3_MIGRATION.md` (tokens, spacing, icons, Field labels, page titles, etc.) |
