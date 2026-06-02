---
name: stride-import
description: >
  Import components, patterns, styles, and animations from the stride-web
  reference implementation into axiom-play. Use when the user asks to match
  stride-web behavior, copy a section from stride-web, check how stride-web
  implements something, or compare our implementation against stride-web.
  Triggers: 'import from stride-web', 'match stride-web', 'how does stride-web
  do X', 'copy from stride-web', 'stride reference', '/stride-import'.
---

# Stride-Web Import Skill

## Purpose

The stride-web reference implementation lives at `/Users/stefan.svebeck/dev/stride-web`.
This skill helps import patterns, components, styles, and animations from stride-web
into the axiom-play Stride prototype at `/Users/stefan.svebeck/dev/axiom-play/app/site/`.

## Stride-Web Project Structure

```
/Users/stefan.svebeck/dev/stride-web/
├── app/
│   ├── page.tsx              # Homepage (~425 lines) — primary reference
│   ├── layout.tsx            # Root layout, imports Lenis CSS
│   ├── globals.css           # Global styles, Lenis parallax CSS, Tailwind v4
│   ├── challenges/page.tsx   # Challenges page
│   ├── features/page.tsx     # Features page
│   └── icon.tsx              # Favicon
├── components/
│   ├── Hero.tsx              # Hero section with parallax app image
│   ├── SmoothScrollProvider.tsx  # Lenis scroll + parallax provider
│   ├── DecoGrid.tsx          # Decorative column grid
│   ├── SectionLine.tsx       # Section number + side label
│   ├── FeatureSection.tsx    # Feature cards grid
│   ├── Header.tsx            # Site header/nav
│   ├── Footer.tsx            # Site footer
│   ├── ProductCard.tsx       # Product listing card
│   ├── ProductHero.tsx       # Product detail hero
│   ├── Product.tsx           # Product component
│   ├── Cta.tsx               # Call-to-action section
│   ├── Puff.tsx              # Frosted glass card
│   ├── Logo.tsx              # Logo component
│   ├── Sidebar.tsx           # Sidebar navigation
│   ├── MobileMenu.tsx        # Mobile navigation
│   ├── SearchModal.tsx       # Search overlay
│   ├── LoginModal.tsx        # Login modal
│   ├── Breadcrumbs.tsx       # Breadcrumb navigation
│   ├── EventItem.tsx         # Event listing item
│   ├── NewsItem.tsx          # News listing item
│   └── AboutSidenav.tsx      # About page sidebar
├── data/                     # Static content data
├── lib/
│   ├── utils.ts              # Utility functions
│   └── useKeyboardShortcuts.ts
└── public/                   # Static assets (app-1.png, app-2.png, etc.)
```

## Axiom-Play Stride Mapping

| Stride-Web | Axiom-Play Equivalent |
|---|---|
| `app/page.tsx` (hardcoded sections) | `app/db/initialData.ts` (CMS data) + `app/site/SitePageRenderer.tsx` |
| `components/Hero.tsx` | `app/components/vb/blocks/StrideHeroBlock.tsx` |
| `components/SmoothScrollProvider.tsx` | `app/components/SmoothScrollProvider.tsx` |
| `components/DecoGrid.tsx` | `app/site/StrideColumnGrid.tsx` |
| `components/SectionLine.tsx` | `app/components/vb/blocks/displayTemplateRenderer.ts` |
| `components/FeatureSection.tsx` | `app/components/vb/blocks/StrideFeatureCardBlock.tsx` |
| `components/Puff.tsx` | `app/components/vb/blocks/StrideCardBlock.tsx` |
| App preview cards (inline in page.tsx) | `app/components/vb/blocks/StrideAppShowcaseBlock.tsx` |
| `app/globals.css` (Lenis rules) | `app/globals.css` (lines 4-10) |
| `app/globals.css` (Tailwind v4) | `app/stride.css` (custom utility classes) |

## How to Import

### Step 1: Read the stride-web source

Read the relevant file from `/Users/stefan.svebeck/dev/stride-web/` to understand
the reference implementation.

### Step 2: Identify differences

Compare the stride-web code with the corresponding axiom-play file. Key areas to check:
- **CSS classes** — stride-web uses Tailwind v4 with `@theme` variables; axiom-play uses custom utility classes in `app/stride.css`
- **Spacing** — stride-web uses `calc(var(--spacing) * N)` via Tailwind v4; axiom-play defines matching classes in `app/stride.css`
- **Structure** — stride-web uses hardcoded JSX; axiom-play uses CMS-driven rendering via block registry
- **Animation** — stride-web uses Lenis parallax only (no Framer Motion)

### Step 3: Adapt to axiom-play architecture

When importing:
1. **Do NOT copy JSX verbatim** — axiom-play uses a block component architecture
2. **Extract values** — copy CSS values, spacing, timing, class names
3. **Update block components** — modify the corresponding block in `app/components/vb/blocks/`
4. **Update data** — if new properties are needed, update `app/db/initialData.ts`
5. **Update CSS** — add any missing utility classes to `app/stride.css`

## Key Technical Differences

### Tailwind v4 vs v3 — The #1 Gotcha

Stride-web uses **Tailwind v4**. Axiom-play uses **Tailwind v3**. This causes
the majority of import issues.

**What works differently:**

| Feature | Stride-web (TW v4) | Axiom-play (TW v3) |
|---|---|---|
| Spacing utilities | Native: `pt-180` just works | Custom CSS in `app/stride.css` |
| Responsive prefixes | Auto-generated: `md:pt-180` works | Must be **manually defined** in a `@media` block |
| `--spacing` variable | Built-in (`0.25rem`) | Manually set in `app/stride.css` `:root` |
| `@theme` block | Supported | Not supported — use `tailwind.config.ts` |
| Arbitrary values | `pt-[45rem]` | Same (works in both) |

**Critical rule:** When stride-web uses `md:some-class` and `some-class` is a
custom utility in `app/stride.css`, you MUST add an explicit responsive definition:

```css
/* In app/stride.css — at the END of the file (after base classes) */
@media (min-width: 768px) {
  .md\:some-class {
    /* ... */
  }
}
```

**Ordering matters:** The `@media` block MUST come AFTER the base class definition
in the file. CSS cascade means later rules win at equal specificity. If `.pt-6`
is defined on line 205 and `.md\:pt-180` on line 106, the base class wins and
the responsive override does nothing.

All responsive spacing overrides live at the **end** of `app/stride.css`.

### Responsive Classes Already Defined

These `md:` variants exist in `app/stride.css` (at end of file):
- `md:pt-40` — 160px (community app preview section)
- `md:pt-180` — 720px (showcase app preview section)
- `md:-mt-120` — -480px (showcase overlap pull-up)
- `md:-mb-100` — -400px (showcase overlap pull-down)
- `md:text-stride-xl` — responsive font size
- `md:text-stride-3xl` — responsive font size

When importing new sections from stride-web that use `md:` prefixed spacing,
always check if the responsive variant exists. If not, add it at the end of
`app/stride.css`.

### Parallax System

Both use identical Lenis parallax — no Framer Motion:
- CSS: `transform: translate3d(0, calc(var(--lenis-parallax, 0) * 1px), 0)`
- JS: `offset = scrollValue * (speed - 1)` → sets `--lenis-parallax`
- Only on desktop: `@media screen and (min-width: 768px)`

**Do NOT use Framer Motion for parallax.** Framer Motion writes inline `transform`
styles that override the CSS parallax transform. If entrance/hover animations are
needed alongside parallax, they must be on a **separate nested element** — outer
div for parallax, inner element for Framer Motion.

**Stride-web Lenis config** (smooth scrolling enabled):
```ts
const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
```

**Axiom-play Lenis config** (smooth scrolling disabled — native scroll feel):
```ts
const lenis = new Lenis({
  duration: 0,
  easing: (t) => t,
  smoothWheel: false,
});
```

### Section Clipping & Overflow

The showcase section uses large negative margins (`-mt-120`, `-mb-100`) to create
an overlapping effect where the cards float above and below adjacent sections.
This can cause clipping issues. Key rules:

1. The wrapper div needs the mask gradient: `linear-gradient(black 60%, transparent 70%)`
2. Top padding (`pt-180` = 720px) minus top margin (`-mt-120` = -480px) = 240px net
   offset — this pushes cards into the visible mask area
3. If cards are clipped at the top, the padding isn't large enough or the responsive
   `md:` class isn't taking effect (see Tailwind v4 vs v3 section above)
4. Parallax cards with `data-lenis-parallax` move vertically — parent containers
   must NOT have `overflow: hidden`

### Font System
- **Stride-web**: `next/font/local` with SF Pro variable font
- **Axiom-play**: System font stack via `.font-stride-sans`

## App Preview Cards (Section 2) — Reference

Stride-web's implementation of the three parallax cards (lines 215-262 of `app/page.tsx`):

```tsx
<div
  className="md:pt-180 md:-mt-120 mt-6 md:-mb-100 -mb-20"
  style={{
    WebkitMaskImage: "linear-gradient(black 60%, transparent 70%)",
  }}
>
  <div className="flex gap-6 items-start container">
    {/* Card 1 — fastest (speed 1) */}
    <div className="basis-0 grow">
      <div
        className="w-full relative aspect-[1/2.02] md:mt-[20%] sm:!transform-none"
        data-lenis-parallax
        data-lenis-speed="1"
      >
        <img src="/app-1.png" alt="Hero Image"
          className="absolute -left-[32.9%] !max-w-[166%] md:-top-[10%]" />
      </div>
    </div>
    {/* Card 2 — medium (speed 0.9) */}
    <div className="basis-0 grow">
      <div
        className="w-full relative aspect-[1/2.02] md:mt-[10%]"
        data-lenis-parallax
        data-lenis-speed="0.9"
      >
        <img src="/app-2.png" alt="Hero Image"
          className="absolute -left-[32.9%] !max-w-[166%] md:-top-[10%]" />
      </div>
    </div>
    {/* Card 3 — slowest (speed 0.8) */}
    <div className="basis-0 grow">
      <div
        className="w-full relative aspect-[1/2.02]"
        data-lenis-parallax
        data-lenis-speed=".8"
      >
        <img src="/app-3.png" alt="Hero Image"
          className="absolute -left-[32.9%] !max-w-[166%] md:-top-[10%]" />
      </div>
    </div>
  </div>
</div>
```

Key details:
- Wrapper has `md:pt-180 md:-mt-120 mt-6 md:-mb-100 -mb-20` and mask gradient
- Each card column is `basis-0 grow`
- Parallax div has `aspect-[1/2.02]` and staggered `md:mt-[20%]`, `md:mt-[10%]`, none
- Image is positioned with `absolute -left-[32.9%] !max-w-[166%] md:-top-[10%]`
- Speeds: 1, 0.9, 0.8 (fastest to slowest, left to right)
- First card has `sm:!transform-none` to disable parallax on small screens
- **No Framer Motion** — parallax only via Lenis

## Common Import Tasks

### "Match section X from stride-web"
1. Read the relevant section from `stride-web/app/page.tsx`
2. Read the corresponding block component in axiom-play
3. Compare CSS classes, spacing, and structure
4. Update the block component or `initialData.ts` to match

### "Copy component from stride-web"
1. Read the stride-web component
2. Identify the equivalent axiom-play block
3. Adapt the JSX/styling to the block component pattern
4. Test in the browser at http://localhost:3001/site

### "Check how stride-web does animation X"
1. Search stride-web for the animation pattern
2. Read the component and CSS
3. Report the implementation details
4. Suggest how to replicate in axiom-play
