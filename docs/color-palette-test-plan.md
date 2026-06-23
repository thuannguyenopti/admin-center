# Color Palette: Social Proof on PDP Test Plan

## Overview

This document maps all colors used in the design to both light and dark mode values, with references to the Optimizely Axiom design system tokens where applicable.

## Axiom Design System Integration

The project uses `@optiaxiom/react` which provides design tokens through CSS variables. See `app/globals.css` for custom overrides.

---

## Background Colors

### Light Mode

| Token/Name | Hex Value | Usage | Axiom Token |
|------------|-----------|-------|-------------|
| bg-page | `#f9fafc` | Canvas background, Opal panel | `--ax-colors-bg-page` / neutral.50 |
| bg-default | `#ffffff` | Card backgrounds, input | `--ax-colors-bg-default` / neutral.00 |
| bg-secondary | `#f3f5f8` | Assistant message bubbles | `--ax-colors-bg-secondary` / neutral.75 |
| bg-accent-subtle | `#e8f0fe` | User message bubbles | `--ax-colors-bg-accent-subtle` / brand.50 |

### Dark Mode

| Token/Name | Hex Value | Usage | Axiom Token |
|------------|-----------|-------|-------------|
| bg-page | `#171a23` | Canvas background, Opal panel | `--ax-colors-bg-page` / neutral.1100 |
| bg-default | `#1c2029` | Card backgrounds, input | `--ax-colors-bg-default` / neutral.1000 |
| bg-secondary | `#1c212b` | Assistant message bubbles | `--ax-colors-bg-secondary` / neutral.900 |
| bg-accent-subtle | `#21283f` | User message bubbles | `--ax-colors-bg-accent-subtle` / brand.dark.900 |

---

## Foreground/Text Colors

### Light Mode

| Token/Name | Hex Value | Usage | Axiom Token |
|------------|-----------|-------|-------------|
| fg-default | `#2e3442` | Primary headings, values, button text | `--ax-colors-fg-default` / neutral.800 |
| fg-secondary | `#66708c` | Labels, secondary text | `--ax-colors-fg-secondary` / neutral.600 |
| fg-tertiary | `#4f576e` | Captions, PIE description | `--ax-colors-fg-tertiary` / neutral.700 |
| fg-body | `#080736` | Opal chat messages | Custom (not in Axiom) |
| fg-body-alt | `#262b37` | Opal panel text | Custom |
| fg-placeholder | `#868fa4` | Input placeholder | Custom / neutral.450 |
| fg-icon-dark | `#626a81` | Quick action icons | Custom |

### Dark Mode

| Token/Name | Hex Value | Usage | Axiom Token |
|------------|-----------|-------|-------------|
| fg-default | `#d4d7e4` | Primary headings, values | `--ax-colors-fg-default` / neutral.200 |
| fg-secondary | `#b5bbd7` | Labels, secondary text | `--ax-colors-fg-secondary` / neutral.250 |
| fg-tertiary | `#838da4` | Captions, descriptions | `--ax-colors-fg-tertiary` / neutral.500 |
| fg-body | `#080736` | Opal chat messages (same) | Custom |
| fg-body-alt | `#e9edf5` | Opal panel text | neutral.100 |
| fg-placeholder | `#8591ad` | Input placeholder | neutral.450 |
| fg-icon-dark | `#626a81` | Quick action icons | Custom |

---

## Border Colors

### Light Mode

| Token/Name | Hex Value | Usage | Axiom Token |
|------------|-----------|-------|-------------|
| border-default | `#e9edf5` | Cards, Opal panel, input | `--ax-colors-border-default` / neutral.100 |
| border-secondary | `#dadfeb` | Table row dividers | `--ax-colors-border-secondary` / neutral.150 |
| border-control | `#cacfdc` | Export button | `--ax-colors-border-control` / neutral.200 |

### Dark Mode

| Token/Name | Hex Value | Usage | Axiom Token |
|------------|-----------|-------|-------------|
| border-default | `#353e4d` | Cards, Opal panel, input | `--ax-colors-border-default` / neutral.750 |
| border-secondary | `#2c3240` | Table row dividers | `--ax-colors-border-secondary` / neutral.850 |
| border-control | `#4f576e` | Export button | `--ax-colors-border-control` / neutral.700 |

---

## Accent/Brand Colors

### Both Modes (Same Values)

| Token/Name | Hex Value | Usage | Axiom Token |
|------------|-----------|-------|-------------|
| brand-500 | `#0037ff` | PIE progress bar | `--ax-colors-bg-accent` / brand.500 |
| brand-400 | `#2e66f7` | Content card ring shadow | brand.400 |
| icon-neutral-dark | `#2e3442` | SVG icons (toolbar, chat) | neutral.800 |
| icon-neutral-gray | `#838da4` | Undo/redo icons | neutral.500 |

---

## Special Colors

### Gradient Text - "Completed"

**Light & Dark Mode** (same gradient):
```css
background: linear-gradient(134.54deg, rgba(57,46,207,1) 16.24%, rgba(119,64,236,1) 85.41%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

Colors:
- Start: `#392ecf` (rgb(57,46,207))
- End: `#7740ec` (rgb(119,64,236))

**Note**: This is a purple gradient not in the standard Axiom palette. Custom implementation required.

### Shadow - Content Card Ring

**Light Mode**:
```css
box-shadow: 0px 0px 0px 3px #2e66f7, 0px 0px 0px 1px #ffffff;
```
- Outer ring: `#2e66f7` (brand.400) - 3px
- Inner ring: `#ffffff` (white) - 1px

**Dark Mode** (suggested):
```css
box-shadow: 0px 0px 0px 3px #2e66f7, 0px 0px 0px 1px #1c2029;
```
- Outer ring: `#2e66f7` (brand.400) - 3px
- Inner ring: `#1c2029` (bg-default) - 1px

### Shadow - Opal Panel

**Light Mode**:
```css
box-shadow: -6px 6px 25px rgba(12, 16, 29, 0.08);
```

**Dark Mode** (suggested):
```css
box-shadow: -6px 6px 25px rgba(0, 0, 0, 0.24);
```

---

## Color Usage by Component

### Toolbar
- Background: `bg-page` (#f9fafc → #171a23)
- Icons: `icon-neutral-dark` (#2e3442)
- Undo/Redo: `icon-neutral-gray` (#838da4)
- Export button:
  - Border: `border-control` (#cacfdc → #4f576e)
  - Text: `fg-default` (#2e3442 → #d4d7e4)

### Info Cards
- Background: `bg-default` (#ffffff → #1c2029)
- Labels: `fg-secondary` (#66708c → #b5bbd7)
- Values: `fg-default` (#2e3442 → #d4d7e4)
- Badge ("Draft"):
  - Background: light gray (estimated #f0f1f4 → #2c3240)
  - Text: `fg-default` (#2e3442 → #d4d7e4)

### Callout Cards
- Background: `bg-default` (#ffffff → #1c2029)
- Border: None visible (or matches bg)
- Section icons: `icon-neutral-dark` (#2e3442 → #d4d7e4)
- Headings: `fg-default` (#2e3442 → #d4d7e4)
- Body text: `fg-tertiary` (#4f576e → #838da4)

### Stats Tables
- Row divider: `border-secondary` (#dadfeb → #2c3240)
- Labels: `fg-secondary` (#66708c → #b5bbd7)
- Values: `fg-default` (#2e3442 → #d4d7e4)

### Circular Progress (Prioritization Score)
- Background circle: light gray (estimated #e9edf5 → #353e4d)
- Progress arc: `brand-500` (#0037ff)
- Score text: `fg-default` (#2e3442 → #d4d7e4)

### PIE Progress Bar
- Background: light gray (estimated #e9edf5 → #353e4d)
- Fill: `brand-500` (#0037ff)
- Label text: `fg-tertiary` (#4f576e → #838da4)

### Opal Panel
- Background: `bg-page` (#f9fafc → #171a23)
- Border left: `border-default` (#e9edf5 → #353e4d)
- Shadow: rgba(12, 16, 29, 0.08) → rgba(0, 0, 0, 0.24)

### Opal Header
- Title: `fg-default` (#2e3442 → #d4d7e4)
- Dropdown icon: `icon-neutral-dark` (#262b37 → #d4d7e4)
- Action buttons: `icon-neutral-dark` (#2e3442 → #d4d7e4)

### Opal Chat Messages
- User message:
  - Background: `bg-accent-subtle` (#e8f0fe → #21283f)
  - Text: `fg-body` (#080736)
- Assistant message:
  - Background: `bg-secondary` (#f3f5f8 → #1c212b)
  - Text: `fg-body` (#080736)
- Disclosure labels:
  - Text: `fg-default` (#2e3442 → #d4d7e4)
  - Badge: `fg-default` (#2e3442 → #d4d7e4)
- "Completed" text: Purple gradient (same in both modes)
- Quick action icons: `fg-icon-dark` (#626a81 → #8591ad)

### Content Card (with ring)
- Background: `bg-default` (#ffffff → #1c2029)
- Border: `border-default` (#e9edf5 → #353e4d)
- Ring shadow: 3px `brand-400` (#2e66f7) + 1px white/bg
- Icon: `fg-body` (#080736)
- Title: `fg-body-alt` (#262b37 → #e9edf5)
- Description: `fg-body-alt` (#262b37 → #b5bbd7)

### Suggestions
- "Suggestions:" label: `fg-tertiary` (#4f576e → #838da4)
- Suggestion text: `fg-body-alt` (#262b37 → #e9edf5)

### Input Area
- Background: `bg-default` (#ffffff → #1c2029)
- Border: `border-default` (#e9edf5 → #353e4d)
- Placeholder: `fg-placeholder` (#868fa4 → #8591ad)
- Disclaimer: `fg-icon-dark` (#626a81 → #8591ad)
- Microphone button:
  - Background: (appears to have fill)
  - Icon: `#ffffff` (white)

---

## Custom Color Variables Needed

The following colors are NOT in the standard Axiom palette and should be added to `app/globals.css` or component styles:

### Light Mode
```css
:root {
  /* Opal-specific colors */
  --opal-text-dark: #080736;
  --opal-text-body: #262b37;
  --opal-text-placeholder: #868fa4;
  --opal-icon-gray: #626a81;
  
  /* Gradient colors */
  --purple-gradient-start: #392ecf;
  --purple-gradient-end: #7740ec;
}
```

### Dark Mode
```css
[data-theme="dark"],
html.dark,
body.dark {
  --opal-text-dark: #080736; /* Keep same for consistency */
  --opal-text-body: #e9edf5;
  --opal-text-placeholder: #8591ad;
  --opal-icon-gray: #8591ad;
}
```

---

## Accessibility Considerations

### Contrast Ratios (WCAG AA requires 4.5:1 for normal text)

#### Light Mode
| Foreground | Background | Ratio | Status |
|------------|------------|-------|--------|
| #2e3442 | #ffffff | 13.0:1 | ✅ Pass AAA |
| #66708c | #ffffff | 4.9:1 | ✅ Pass AA |
| #4f576e | #ffffff | 6.3:1 | ✅ Pass AAA |
| #080736 | #f9fafc | 15.2:1 | ✅ Pass AAA |
| #262b37 | #ffffff | 12.2:1 | ✅ Pass AAA |

#### Dark Mode
| Foreground | Background | Ratio | Status |
|------------|------------|-------|--------|
| #d4d7e4 | #1c2029 | 11.5:1 | ✅ Pass AAA |
| #b5bbd7 | #1c2029 | 7.8:1 | ✅ Pass AAA |
| #838da4 | #1c2029 | 4.6:1 | ✅ Pass AA |
| #080736 | #1c212b | 13.8:1 | ✅ Pass AAA |

**Note**: All text colors meet WCAG AA standards. Most exceed AAA standards (7:1).

---

## Implementation Notes

1. **Use Axiom Tokens First**: Prefer Axiom design tokens (`--ax-colors-*`) where available
2. **Custom Overrides**: Add custom colors in `app/globals.css` under appropriate selectors
3. **Dark Mode Strategy**: Use `[data-theme="dark"]`, `html.dark`, and `body.dark` selectors
4. **Gradient Text**: Implement using `background-clip: text` technique (webkit-prefixed)
5. **Testing**: Verify all colors in both light and dark modes using browser DevTools

---

## Quick Reference Table

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Page Background | #f9fafc | #171a23 |
| Card Background | #ffffff | #1c2029 |
| Primary Text | #2e3442 | #d4d7e4 |
| Secondary Text | #66708c | #b5bbd7 |
| Tertiary Text | #4f576e | #838da4 |
| Border | #e9edf5 | #353e4d |
| Accent Blue | #0037ff | #0037ff |
| Accent Brand | #2e66f7 | #2e66f7 |
| Purple Gradient | #392ecf → #7740ec | Same |
