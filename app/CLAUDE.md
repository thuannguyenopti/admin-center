# Claude Code Instructions - CMP/Opal Project

## Design System: Optiaxiom

**ALWAYS** use the Optiaxiom design system for this project.

### Primary Reference
- Docs: https://optimizely-axiom.github.io/optiaxiom/
- Package: `@optiaxiom/react`
- See: `OPTIAXIOM_DESIGN_SYSTEM.md` in this directory for full token reference

### Critical Rules

1. **NEVER use arbitrary values**
   - ❌ `padding: 17px` or `gap: 11px`
   - ✅ `p="16"` or `gap="12"` (use tokens)

2. **NEVER use hex colors**
   - ❌ `color="#333"` or `background="#f5f5f5"`
   - ✅ `color="fg.default"` or `bg="bg.secondary"`

3. **ALWAYS use component library**
   - ❌ Custom `<button>` elements
   - ✅ `<Button variant="solid" intent="primary">`

4. **Font: Inter only** (already in design system)

### Component Imports

```tsx
import { 
  // Primitives
  Box, Grid, Group, Heading, Text, Separator,
  
  // Components
  Button, Input, Field, Card, Badge, Avatar,
  Alert, Dialog, Popover, Tooltip, Menu,
  Checkbox, Switch, Select, Tabs,
  
  // Provider (wrap app)
  AxiomProvider
} from "@optiaxiom/react";
```

### Spacing Scale (px)
`0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64`

### When Implementing Figma Designs

1. Identify the component type (button, card, input, etc.)
2. Match to Optiaxiom component
3. Use semantic color tokens (fg.*, bg.*, border.*)
4. Use spacing tokens for padding/margins/gaps
5. Use border-radius tokens (sm, md, lg, xl, full)

### File Structure
```
app/
├── fonts/
│   └── (Inter font files)
├── components/
│   └── (Use Optiaxiom components)
├── OPTIAXIOM_DESIGN_SYSTEM.md  ← Full reference
└── CLAUDE.md                    ← This file
```
