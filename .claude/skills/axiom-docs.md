# Axiom Documentation Skill

Quick reference for Optimizely Axiom design system components.

## When to use this skill

Use this skill when you need to:
- Look up Axiom component props and API
- Find examples of Axiom components
- Understand design token usage
- Check available Axiom icons

## Quick reference

**Official documentation:**
- Axiom Components: https://optimizely-axiom.github.io/optiaxiom/
- Axiom Icons: https://optimizely-axiom.github.io/optiaxiom/icons/

**Common components:**

### Layout
- `Box` - Flexible container with style props
- `Flex` - Flexbox container
- `Grid` - Grid container

### Typography
- `Text` - Text with semantic sizing and colors
- `Heading` - Headings with semantic levels

### Buttons & Actions
- `Button` - Primary interactive element
- `IconButton` - Icon-only button
- `Link` - Navigation link

### Forms
- `Input` - Text input field
- `Select` - Dropdown selection
- `Checkbox` - Boolean input
- `Switch` - Toggle switch

### Feedback
- `Alert` - Alert messages
- `Badge` - Status indicators
- `Spinner` - Loading indicator
- `Toast` - Toast notifications

### Overlays
- `Dialog` - Modal dialog
- `Popover` - Floating popover
- `Tooltip` - Contextual tooltip
- `Menu` - Dropdown menu

### Data Display
- `Card` - Content container
- `CardHeader` - Card header with title/description
- `Table` - Data tables
- `Avatar` - User avatar

### Navigation
- `Tabs` - Tab navigation
- `Breadcrumb` - Breadcrumb navigation

## Design tokens

Axiom uses CSS custom properties for theming:

**Colors:**
```tsx
// Background colors
bg="bg.default"
bg="bg.secondary"
bg="bg.accent"

// Text colors
color="fg.default"
color="fg.secondary"
color="fg.tertiary"

// Border colors
borderColor="border.default"
borderColor="border.accent"
```

**Spacing:**
```tsx
// Padding and margin
p="8"   // 8px
m="16"  // 16px
gap="12"  // 12px

// Individual sides
pt="4"  // padding-top
pl="8"  // padding-left
```

**Typography:**
```tsx
fontSize="sm"
fontSize="md"
fontSize="lg"
fontWeight="400"
fontWeight="600"
```

## Icons

Import icons from `@optimizely/axiom-icons`:

```tsx
import { IconDots, IconTrash, IconTag } from "@optimizely/axiom-icons";

// Use in components
<IconButton icon={<IconDots />} />
```

## Project rules (from .cursorrules)

- **ALWAYS** use Axiom components from `@optiaxiom/react`
- **NEVER** use raw HTML elements if an Axiom equivalent exists
- **ALWAYS** use `@optimizely/axiom-icons` for icons
- Ensure premium aesthetics with proper spacing and semantic colors
- Use design tokens for colors, spacing, and typography

## MCP server

The project mentions using Axiom MCP server (`@optiaxiom/mcp`) to fetch component documentation. You can leverage this to get real-time component information.

## Examples

**Basic Card with Axiom:**
```tsx
import { Card, CardHeader, Text } from "@optiaxiom/react";

<Card>
  <CardHeader
    title={<Text fontSize="sm" fontWeight="600">Title</Text>}
    description={<Text fontSize="xs" color="fg.secondary">Description</Text>}
  />
</Card>
```

**Button with icon:**
```tsx
import { Button } from "@optiaxiom/react";
import { IconPlus } from "@optimizely/axiom-icons";

<Button icon={<IconPlus />}>Add Item</Button>
```

## Notes

- Always check the official docs for the latest API
- Use the MCP server when available for real-time documentation
- Follow the design system conventions for consistency
- Dark mode is handled automatically via design tokens
