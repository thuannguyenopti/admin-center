# Icon Mapping: Social Proof on PDP Test Plan

## Overview

This document maps all icons used in the design to their implementation sources. The design references Font Awesome 6 Pro icons, but since we may not have access to the Pro license, we provide alternatives using:

1. **Figma SVG exports** (preferred, already available)
2. **@tabler/icons-react** (already installed)
3. **@optimizely/axiom-icons** (already installed)
4. **Font Awesome Free** (fallback)

---

## Icon Strategy

### Recommended Approach

**Use Figma SVG exports directly** for UI chrome icons (toolbar, buttons) and **@tabler/icons-react** for semantic icons (hypothesis, targeting, etc.).

**Rationale**:
- Figma SVGs match the design exactly
- No dependency on Font Awesome Pro license
- Tabler icons provide excellent coverage for semantic icons
- Already installed in the project

---

## Part 1: UI Chrome Icons (Use Figma SVGs)

These icons are part of the interface chrome and should use the exact SVG files from Figma.

### Toolbar Icons

| Icon Purpose | Node ID | Figma Asset | Suggested Path | Color |
|-------------|---------|-------------|----------------|-------|
| Close/X | n_91070 | `36e095.svg` | `public/icons/close.svg` | #2e3442 |
| Code Toggle | n_9003e | `6b6f12.svg` | `public/icons/code.svg` | #2e3442 |
| Eye/Preview | n_72475 | `70672e.svg` | `public/icons/eye.svg` | #2e3442 |
| Undo | n_bffc6 | `797bf6.svg` | `public/icons/undo.svg` | #838da4 |
| Redo | n_5727b | `afadf3.svg` | `public/icons/redo.svg` | #838da4 |
| Copy | n_d61b3 | `d2141a.svg` | `public/icons/copy.svg` | #2e3442 |
| Download | n_2bfed | `8445c3.svg` | `public/icons/download.svg` | #2e3442 |
| Chevron Down | n_d16dd | `dad54f.svg` | `public/icons/chevron-down.svg` | #2e3442 |

**Usage Example**:
```tsx
import CloseIcon from '@/public/icons/close.svg';

<Button variant="ghost">
  <CloseIcon width={16} height={16} />
</Button>
```

### Opal Panel Icons

| Icon Purpose | Node ID | Figma Asset | Suggested Path | Color |
|-------------|---------|-------------|----------------|-------|
| Menu/Hamburger | n_43e5c | `751c12.svg` | `public/icons/menu.svg` | #2e3442 |
| Chevron Down (small) | n_06f1a | `2c3802.svg` | `public/icons/chevron-down-small.svg` | #262b37 |
| Trash/Delete | n_ec546 | `8856c8.svg` | `public/icons/trash.svg` | #2e3442 |
| Close (small) | n_4c10e, n_61798 | `75128e.svg` | `public/icons/close-small.svg` | #2e3442 |
| Share | n_059b9 | `8834c7.svg` | `public/icons/share.svg` | #2e3442 |
| Horizontal Line | n_11c3d | (line element) | N/A (use CSS border) | #2e3442 |

### Disclosure Icons

| Icon Purpose | Node ID | Figma Asset | Suggested Path | Color |
|-------------|---------|-------------|----------------|-------|
| Chevron Right | n_667c2 | `fb665d.svg` | `public/icons/chevron-right.svg` | #2e3442 |
| Chevron Left | n_7a03f | `48ba1c.svg` | `public/icons/chevron-left.svg` | #2e3442 |

**Note**: These may be rotated versions of the same chevron. Check if one can be reused with CSS `transform: rotate()`.

### Quick Action Icons

| Icon Purpose | Node ID | Figma Asset | Suggested Path | Color |
|-------------|---------|-------------|----------------|-------|
| Refresh/Reload | n_88759 | `876f52.svg` | `public/icons/refresh.svg` | #626a81 |
| Copy | n_2aa00 | `d2141a.svg` | `public/icons/copy.svg` | #626a81 |
| Thumbs Up | n_6e3e5 | `d3c55e.svg` | `public/icons/thumbs-up.svg` | #626a81 |
| Thumbs Down | n_97480 | `f8d0cc.svg` | `public/icons/thumbs-down.svg` | #626a81 |

### Input Actions

| Icon Purpose | Node ID | Figma Asset | Suggested Path | Color |
|-------------|---------|-------------|----------------|-------|
| @ Mention | n_83524 | `f7999e.svg` | `public/icons/at.svg` | Multiple colors |
| Microphone | n_0d696 | (text label) | Use Tabler or create | #ffffff |

**Note**: `n_0d696` is a text element "microphone" in Font Awesome Pro font. We should use an actual icon instead.

---

## Part 2: Semantic Icons (Use @tabler/icons-react)

These icons represent semantic concepts and should use icon library components for better maintainability and consistency.

### Section Header Icons

| Design Label | Node ID | Icon Purpose | Tabler Component | Optimizely Axiom | FA Free Alternative |
|-------------|---------|--------------|------------------|------------------|---------------------|
| `star` | n_45fdc | Prioritization Score | `IconStar` | `IconStar` | `fa-star` |
| `calendar-time` | n_61221 | Sample Size Estimates | `IconCalendarTime` | N/A | `fa-calendar-clock` ❌ (Pro only) |
| `chart-bar` | n_02c88 | PIE Framework | `IconChartBar` | `IconChartBar` | `fa-chart-column` |
| `lightbulb` | n_89723 | Hypothesis | `IconBulb` | `IconLightbulb` | `fa-lightbulb` |
| `bullseye` | n_a6cfd | Targeting | `IconTarget` | N/A | `fa-bullseye` |
| `vials` | n_167fc | Variations | `IconFlask` | N/A | `fa-flask` |
| `file-lines` | n_2006c | Content card | `IconFileText` | `IconFileText` | `fa-file-lines` |

### Icon Library Import Examples

**Using @tabler/icons-react**:
```tsx
import { 
  IconStar, 
  IconCalendarTime, 
  IconChartBar, 
  IconBulb, 
  IconTarget, 
  IconFlask, 
  IconFileText,
  IconMicrophone 
} from '@tabler/icons-react';

<IconStar size={16} color="#2e3442" />
```

**Using @optimizely/axiom-icons**:
```tsx
import { 
  IconStar, 
  IconChartBar, 
  IconLightbulb, 
  IconFileText 
} from '@optimizely/axiom-icons';

<IconStar width={16} height={16} />
```

---

## Part 3: Recommended Icon Mapping

### Final Recommendation by Icon

| Icon | Use | Import From | Component/File |
|------|-----|-------------|----------------|
| **Toolbar** | | | |
| Close | ✅ Figma SVG | `public/icons/close.svg` | Default import |
| Code | ✅ Figma SVG | `public/icons/code.svg` | Default import |
| Eye | ✅ Figma SVG | `public/icons/eye.svg` | Default import |
| Undo | ✅ Figma SVG | `public/icons/undo.svg` | Default import |
| Redo | ✅ Figma SVG | `public/icons/redo.svg` | Default import |
| Copy | ✅ Figma SVG | `public/icons/copy.svg` | Default import |
| Download | ✅ Figma SVG | `public/icons/download.svg` | Default import |
| Chevron Down | ✅ Figma SVG | `public/icons/chevron-down.svg` | Default import |
| **Opal Panel** | | | |
| Menu | ✅ Figma SVG | `public/icons/menu.svg` | Default import |
| Trash | ✅ Figma SVG | `public/icons/trash.svg` | Default import |
| Share | ✅ Figma SVG | `public/icons/share.svg` | Default import |
| Close Small | ✅ Figma SVG | `public/icons/close-small.svg` | Default import |
| Chevrons | ✅ Figma SVG | `public/icons/chevron-*.svg` | Default import |
| **Quick Actions** | | | |
| Refresh | ✅ Figma SVG | `public/icons/refresh.svg` | Default import |
| Thumbs Up | ✅ Figma SVG | `public/icons/thumbs-up.svg` | Default import |
| Thumbs Down | ✅ Figma SVG | `public/icons/thumbs-down.svg` | Default import |
| @ Mention | ✅ Figma SVG | `public/icons/at.svg` | Default import |
| **Semantic** | | | |
| Star | ✅ Tabler | `@tabler/icons-react` | `IconStar` |
| Calendar Time | ✅ Tabler | `@tabler/icons-react` | `IconCalendarTime` |
| Chart Bar | ✅ Tabler | `@tabler/icons-react` | `IconChartBar` |
| Lightbulb | ✅ Tabler | `@tabler/icons-react` | `IconBulb` |
| Bullseye | ✅ Tabler | `@tabler/icons-react` | `IconTarget` |
| Vials | ✅ Tabler | `@tabler/icons-react` | `IconFlask` |
| File Lines | ✅ Tabler | `@tabler/icons-react` | `IconFileText` |
| Microphone | ✅ Tabler | `@tabler/icons-react` | `IconMicrophone` |

---

## Part 4: SVG Configuration

### Next.js Configuration

The project already has SVGR configured in `next.config.ts`:

```typescript
turbopack: {
  rules: {
    '*.svg': {
      loaders: ['@svgr/webpack'],
      as: '*.js',
    },
  },
},
```

This allows importing SVGs as React components:

```tsx
import CloseIcon from '@/public/icons/close.svg';

<CloseIcon width={16} height={16} className="text-neutral-800" />
```

### Color Application

Figma SVG icons have `background-color` set in the design. When importing as React components:

1. **Remove fill/stroke from SVG** to allow CSS color control, OR
2. **Apply color via CSS** using `currentColor`

**Option 1: Modify SVG files**
```svg
<!-- Before -->
<svg><path fill="#2e3442" ... /></svg>

<!-- After -->
<svg><path fill="currentColor" ... /></svg>
```

**Option 2: Use CSS**
```tsx
<CloseIcon className="text-neutral-800 dark:text-neutral-200" />
```

---

## Part 5: Asset Copy Checklist

### SVG Icons to Copy

```bash
# From data://assets/ to public/icons/

cp data://assets/36e095.svg public/icons/close.svg
cp data://assets/6b6f12.svg public/icons/code.svg
cp data://assets/70672e.svg public/icons/eye.svg
cp data://assets/797bf6.svg public/icons/undo.svg
cp data://assets/afadf3.svg public/icons/redo.svg
cp data://assets/d2141a.svg public/icons/copy.svg
cp data://assets/8445c3.svg public/icons/download.svg
cp data://assets/dad54f.svg public/icons/chevron-down.svg
cp data://assets/751c12.svg public/icons/menu.svg
cp data://assets/2c3802.svg public/icons/chevron-down-small.svg
cp data://assets/8856c8.svg public/icons/trash.svg
cp data://assets/75128e.svg public/icons/close-small.svg
cp data://assets/8834c7.svg public/icons/share.svg
cp data://assets/fb665d.svg public/icons/chevron-right.svg
cp data://assets/48ba1c.svg public/icons/chevron-left.svg
cp data://assets/876f52.svg public/icons/refresh.svg
cp data://assets/d3c55e.svg public/icons/thumbs-up.svg
cp data://assets/f8d0cc.svg public/icons/thumbs-down.svg
cp data://assets/f7999e.svg public/icons/at.svg
```

### Images to Copy

```bash
# From data://assets/ to public/images/

cp data://assets/fd5b24.png public/images/control-variation.png
cp data://assets/2c8231.png public/images/avatar-user.png
```

---

## Part 6: Icon Size Standards

### Design Measurements

| Context | Size (px) | Tabler `size` | Usage |
|---------|-----------|---------------|-------|
| Section Headers | 16px | `16` or `"md"` | Hypothesis, Targeting icons |
| Content Card | 24px | `24` or `"lg"` | file-lines icon |
| Toolbar Buttons | 14-16px | `16` or `"md"` | Undo, redo, copy |
| Quick Actions | 14-16px | `14` or `"sm"` | Thumbs up/down, refresh |
| Input Actions | 16px | `16` or `"md"` | @ and microphone |

### Tabler Icon Props

```tsx
interface IconProps {
  size?: number | string; // 16, 24, "sm", "md", "lg"
  color?: string;         // Hex or CSS color
  stroke?: number;        // Stroke width (default: 2)
  className?: string;     // Tailwind classes
}

// Examples
<IconStar size={16} color="#2e3442" />
<IconBulb size="md" className="text-neutral-800" stroke={2} />
```

---

## Part 7: Accessibility

### Icon Labels

All icons must have accessible labels for screen readers:

**Decorative icons** (with adjacent text):
```tsx
<IconStar size={16} aria-hidden="true" />
<span>Prioritization Score</span>
```

**Standalone icons** (buttons without text):
```tsx
<button aria-label="Close">
  <CloseIcon size={16} />
</button>
```

**Tabler icons with labels**:
```tsx
<IconStar size={16} aria-label="Star rating" />
```

---

## Part 8: Dark Mode Support

### Color Tokens for Icons

Use Tailwind CSS or Axiom color tokens that adapt to dark mode:

```tsx
// Tailwind approach
<CloseIcon className="text-neutral-800 dark:text-neutral-200" />

// Axiom token approach (via CSS variable)
<CloseIcon style={{ color: 'var(--ax-colors-fg-default)' }} />

// Tabler with token
<IconStar 
  size={16} 
  color="var(--ax-colors-fg-default)" 
/>
```

### Icon Color Mapping

| Icon Type | Light Mode | Dark Mode | Token |
|-----------|-----------|-----------|-------|
| Primary icons | #2e3442 | #d4d7e4 | `--ax-colors-fg-default` |
| Secondary icons | #838da4 | #838da4 | `--ax-colors-fg-tertiary` |
| Quick actions | #626a81 | #8591ad | Custom |

---

## Summary & Next Steps

### ✅ Decision Made

1. **UI Chrome Icons**: Use Figma SVG exports (exact match, no licensing issues)
2. **Semantic Icons**: Use @tabler/icons-react (comprehensive, free, already installed)
3. **No Font Awesome Pro Required**: Eliminates licensing dependency

### 📋 Action Items

1. Copy all 19 SVG icons from `data://assets/` to `public/icons/`
2. Copy 2 images from `data://assets/` to `public/images/`
3. Modify SVG `fill` attributes to use `currentColor` for theme support
4. Import Tabler icons where needed in components
5. Add aria-labels to all standalone icon buttons
6. Test icon rendering in both light and dark modes

### 📦 No Additional Dependencies Needed

All required icon libraries are already installed:
- ✅ `@tabler/icons-react` (v3.35.0)
- ✅ `@optimizely/axiom-icons` (v1.13.2)
- ✅ `@svgr/webpack` (v8.1.0) for SVG imports

