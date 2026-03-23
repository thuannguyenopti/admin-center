# Optiaxiom Design System Reference
## For CMP (Content Management Platform) - Opal Project

> **IMPORTANT**: This is the authoritative design system for all CMP projects. 
> Always use these tokens and components. Never use arbitrary values.

---

## Quick Reference URLs

- **Components**: https://optimizely-axiom.github.io/optiaxiom/components/
- **Styling/Tokens**: https://optimizely-axiom.github.io/optiaxiom/styling/
- **Colors**: https://optimizely-axiom.github.io/optiaxiom/styling/colors/
- **Installation**: https://optimizely-axiom.github.io/optiaxiom/guides/
- **Data Visualization Colors**: [app/DATA_VISUALIZATION_COLORS.md](./DATA_VISUALIZATION_COLORS.md)

---

## Installation

```bash
npm install @optiaxiom/react
```

```tsx
// Wrap app with provider
import { AxiomProvider } from "@optiaxiom/react";

export function App() {
  return <AxiomProvider>{/* Your app */}</AxiomProvider>;
}
```

---

## Typography

### Font Family
- **Primary Font**: Inter (all weights)
- **Monospace**: System monospace stack

### Font Weights
| Token | Weight | Usage |
|-------|--------|-------|
| `400` | Regular | Body text |
| `500` | Medium | Emphasized text |
| `600` | Semibold | Subheadings |
| `700` | Bold | Headings, buttons |

### Font Sizes (with line-height)
| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `xs` | 12px | 16px | Captions, labels |
| `sm` | 14px | 20px | Secondary text |
| `md` | 16px | 24px | Body text (default) |
| `lg` | 18px | 28px | Large body |
| `xl` | 20px | 28px | Subheadings |
| `2xl` | 24px | 32px | H3 |
| `3xl` | 30px | 36px | H2 |
| `4xl` | 36px | 40px | H1 |

---

## Color Tokens

### UI Colors vs Data Viz Colors
- Use Axiom `fg.*`, `bg.*`, and `border.*` tokens for product UI, surfaces, and interaction states.
- Use the shared data-viz palette for charts, legends, dashboards, heatmaps, and data-driven accents.
- Do not replace normal UI chrome with chart colors by default.
- Canonical data-viz guidance lives in [app/DATA_VISUALIZATION_COLORS.md](./DATA_VISUALIZATION_COLORS.md).
- Live reference page is available at `/data-viz-colors`.

### Text Colors (fg.*)
| Token | Usage |
|-------|-------|
| `fg.default` | Primary text |
| `fg.secondary` | Secondary/muted text |
| `fg.tertiary` | Tertiary/subtle text |
| `fg.disabled` | Disabled state |
| `fg.default.inverse` | Text on dark backgrounds |
| `fg.accent` | Brand accent text |
| `fg.accent.hovered` | Accent hover state |
| `fg.accent.strong` | Strong accent emphasis |
| `fg.error` | Error messages |
| `fg.error.strong` | Strong error emphasis |
| `fg.success` | Success messages |
| `fg.success.strong` | Strong success emphasis |
| `fg.warning` | Warning messages |
| `fg.warning.strong` | Strong warning emphasis |
| `fg.information` | Info messages |
| `fg.information.strong` | Strong info emphasis |
| `fg.link.default` | Default link color |
| `fg.link.default.hovered` | Link hover state |
| `fg.link.visited` | Visited links |
| `fg.white` | Always white |

### Background Colors (bg.*)
| Token | Usage |
|-------|-------|
| `bg.default` | Default surface |
| `bg.default.hovered` | Surface hover |
| `bg.default.pressed` | Surface pressed |
| `bg.default.inverse` | Inverse/dark surface |
| `bg.page` | Page background |
| `bg.secondary` | Secondary surface |
| `bg.secondary.hovered` | Secondary hover |
| `bg.tertiary` | Tertiary surface |
| `bg.accent` | Primary action |
| `bg.accent.hovered` | Primary hover |
| `bg.accent.pressed` | Primary pressed |
| `bg.accent.light` | Light accent |
| `bg.accent.subtle` | Subtle accent |
| `bg.error` | Error state |
| `bg.error.subtle` | Subtle error |
| `bg.error.light` | Light error |
| `bg.success` | Success state |
| `bg.success.subtle` | Subtle success |
| `bg.success.light` | Light success |
| `bg.warning` | Warning state |
| `bg.warning.subtle` | Subtle warning |
| `bg.warning.light` | Light warning |
| `bg.information` | Info state |
| `bg.information.subtle` | Subtle info |
| `bg.information.light` | Light info |
| `bg.overlay` | Modal/overlay |

### Border Colors (border.*)
| Token | Usage |
|-------|-------|
| `border.default` | Default borders |
| `border.secondary` | Secondary borders |
| `border.tertiary` | Subtle borders |
| `border.accent` | Accent/focus borders |
| `border.control` | Form control borders |
| `border.control.hovered` | Control hover |
| `border.disabled` | Disabled state |
| `border.error` | Error state |
| `border.success` | Success state |
| `border.warning` | Warning state |
| `border.focus` | Focus ring |
| `border.focus.error` | Error focus ring |

---

## Spacing Scale

**⚠️ CRITICAL: Only use these spacing values. Never use arbitrary pixels.**

| Token | Value | Common Usage |
|-------|-------|--------------|
| `0` | 0px | Reset |
| `2` | 2px | Micro spacing |
| `4` | 4px | Tight spacing |
| `6` | 6px | Small gaps |
| `8` | 8px | Default small |
| `10` | 10px | Between related |
| `12` | 12px | Component padding |
| `14` | 14px | |
| `16` | 16px | Default medium |
| `20` | 20px | Section gaps |
| `24` | 24px | Card padding |
| `28` | 28px | |
| `32` | 32px | Large gaps |
| `40` | 40px | Section spacing |
| `48` | 48px | |
| `56` | 56px | |
| `64` | 64px | Page sections |

### Usage with Box
```tsx
<Box p="16" m="8" gap="12">  {/* padding: 16px, margin: 8px, gap: 12px */}
<Box px="24" py="16">        {/* horizontal: 24px, vertical: 16px */}
<Box mt="32" mb="16">        {/* top: 32px, bottom: 16px */}
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `none` | 0px | Sharp corners |
| `sm` | 2px | Subtle rounding |
| `md` | 4px | Default (buttons, inputs) |
| `lg` | 8px | Cards, modals |
| `xl` | 12px | Large components |
| `2xl` | 16px | Prominent elements |
| `full` | 9999px | Pills, avatars |

```tsx
<Box rounded="md">   {/* 4px radius */}
<Box rounded="lg">   {/* 8px radius */}
<Box rounded="full"> {/* Fully rounded */}
```

---

## Box Shadow

| Token | Usage |
|-------|-------|
| `sm` | Subtle elevation |
| `md` | Cards, dropdowns |
| `lg` | Modals, popovers |

```tsx
<Box shadow="md">Elevated card</Box>
```

---

## Components Reference

### Button
```tsx
import { Button } from "@optiaxiom/react";

// Variants: "solid" | "outline" | "ghost" | "link"
// Intent: "neutral" | "primary" | "danger" | "success"
// Size: "sm" | "md" | "lg"

<Button variant="solid" intent="primary" size="md">
  Primary Action
</Button>

<Button variant="outline" intent="neutral">
  Secondary
</Button>

<Button variant="ghost">
  Tertiary
</Button>
```

### Input
```tsx
import { Input, Field } from "@optiaxiom/react";

<Field label="Email" error="Invalid email">
  <Input placeholder="Enter email" />
</Field>
```

### Card
```tsx
import { Card } from "@optiaxiom/react";

<Card>
  <Box p="24">Card content</Box>
</Card>
```

### Text & Heading
```tsx
import { Text, Heading } from "@optiaxiom/react";

<Heading level="1">Page Title</Heading>
<Heading level="2">Section Title</Heading>

<Text>Default paragraph text</Text>
<Text color="fg.secondary" fontSize="sm">Secondary smaller text</Text>
```

### Box (Base Primitive)
```tsx
import { Box } from "@optiaxiom/react";

<Box 
  bg="bg.secondary"
  p="16"
  rounded="lg"
  display="flex"
  flexDirection="column"
  gap="8"
>
  Content
</Box>
```

### Group (Flex Layout)
```tsx
import { Group } from "@optiaxiom/react";

// Horizontal layout with gap
<Group gap="8">
  <Button>One</Button>
  <Button>Two</Button>
</Group>

// Vertical layout
<Group gap="16" flexDirection="column">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Group>
```

### Grid
```tsx
import { Grid } from "@optiaxiom/react";

<Grid gridTemplateColumns="3" gap="16">
  <Box>Col 1</Box>
  <Box>Col 2</Box>
  <Box>Col 3</Box>
</Grid>
```

---

## Complete Component List

**Primitives**: Box, Cover, Grid, Group, Heading, Separator, Text

**Form Controls**: Button, Checkbox, DateInput, DateRangePicker, Field, Input, RadioGroup, SearchInput, Select, Switch, Textarea, ToggleButton

**Feedback**: Alert, AlertDialog, Badge, Banner, Indicator, Progress, Skeleton, Spinner, Toast, Tooltip

**Navigation**: Breadcrumb, Link, Menu, Pagination, Sidebar, Tabs

**Layout**: Card, Dialog, Disclosure, Popover, Table, DataTable

**Other**: Avatar, FileUpload, HoverCard, Pill, PillMenu, SegmentedControl, Sortable

---

## CSS Variables

All tokens are available as CSS variables:

```css
/* Colors */
var(--ax-colors-fg-default)
var(--ax-colors-bg-accent)
var(--ax-colors-border-default)

/* Spacing */
var(--ax-spacing-16)
var(--ax-spacing-24)

/* Usage in custom CSS */
.custom-element {
  background: var(--ax-colors-bg-secondary);
  padding: var(--ax-spacing-16);
  border-radius: var(--ax-radii-lg);
}
```

---

## Pattern Recognition Guide

When analyzing a Figma design, identify these patterns:

### Buttons
- **Blue filled** → `<Button variant="solid" intent="primary">`
- **Gray filled** → `<Button variant="solid" intent="neutral">`
- **Outlined** → `<Button variant="outline">`
- **Text only** → `<Button variant="ghost">` or `variant="link"`
- **Red/destructive** → `<Button intent="danger">`

### Text Hierarchy
- **Large bold text** → `<Heading level="1|2|3">`
- **Regular body** → `<Text>`
- **Gray/muted text** → `<Text color="fg.secondary">`
- **Small labels** → `<Text fontSize="xs">`

### Spacing
- **Tight (4-8px)** → `gap="4"` or `gap="8"`
- **Medium (12-16px)** → `gap="12"` or `gap="16"`
- **Large (24-32px)** → `gap="24"` or `gap="32"`

### Cards/Containers
- **White with shadow** → `<Card>` or `<Box bg="bg.default" shadow="md" rounded="lg">`
- **Gray background** → `<Box bg="bg.secondary">`
- **Bordered section** → `<Box border="1" borderColor="border.default" rounded="md">`

---

## Example: Full Component

```tsx
import { 
  Box, 
  Button, 
  Card, 
  Group, 
  Heading, 
  Text 
} from "@optiaxiom/react";

export function AssetRecommendationCard() {
  return (
    <Card>
      <Box p="24" display="flex" flexDirection="column" gap="16">
        <Group justifyContent="space-between" alignItems="center">
          <Heading level="3">Recommended Assets</Heading>
          <Button variant="ghost" size="sm">View All</Button>
        </Group>
        
        <Box bg="bg.secondary" p="16" rounded="md">
          <Text color="fg.secondary" fontSize="sm">
            Based on your recent activity
          </Text>
        </Box>
        
        <Group gap="8">
          <Button variant="solid" intent="primary">Apply</Button>
          <Button variant="outline">Dismiss</Button>
        </Group>
      </Box>
    </Card>
  );
}
```

---

## Dark Mode

Semantic tokens automatically support dark mode:

```css
:root {
  color-scheme: light dark;
}
```

No code changes needed—tokens like `bg.default`, `fg.default` adapt automatically.

---

## ⚠️ Common Mistakes to Avoid

1. **Never use arbitrary pixel values** - Always use spacing tokens
2. **Never use hex colors directly** - Always use semantic color tokens
3. **Never use custom fonts** - Always use Inter via the design system
4. **Don't create custom button styles** - Use Button component variants
5. **Don't hardcode shadows** - Use shadow tokens

---

*Last updated: Based on @optiaxiom/react v1.9.0*
*Reference: https://optimizely-axiom.github.io/optiaxiom/*
