# CMP Development Guidelines

## Project Overview
This is the Content Marketing Platform (CMP) prototype built with the Axiom v2 design system. The goal is to create a 1:1 replica of the Opal CMP design for feature development and testing.

## Design System: Axiom v2
**Documentation:** https://optimizely-axiom.github.io/optiaxiom/

**CRITICAL:** Always use Axiom components. Never use custom HTML/CSS when an Axiom component exists.

## Component Reference

### Import Pattern
```tsx
import { ComponentName } from "@optiaxiom/react";
```

### Core Components

#### Box (Layout Container)
```tsx
import { Box } from "@optiaxiom/react";
<Box display="flex" gap="16" p="24" bg="bg.default" />
```

#### Button
Docs: https://optimizely-axiom.github.io/optiaxiom/components/button/
```tsx
import { Button } from "@optiaxiom/react";

// Variants
<Button appearance="primary">Primary</Button>
<Button appearance="default">Default</Button>
<Button appearance="subtle">Subtle</Button>
<Button appearance="danger">Danger</Button>

// Sizes: "sm" | "md" | "lg"
<Button size="lg">Large Button</Button>

// Icon only (for filter buttons, etc.)
<Button icon={<IconFilter />} size="lg" appearance="default" />

// With icon
<Button icon={<IconPlus />}>Add Item</Button>
```

#### SearchInput
Docs: https://optimizely-axiom.github.io/optiaxiom/components/search-input/
```tsx
import { SearchInput } from "@optiaxiom/react";

<SearchInput
  placeholder="Search..."
  w="224"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

#### Switch (Toggle)
Docs: https://optimizely-axiom.github.io/optiaxiom/components/switch/
```tsx
import { Switch } from "@optiaxiom/react";

<Switch
  checked={isEnabled}
  onCheckedChange={setIsEnabled}
>
  Label text goes here
</Switch>
```

#### Tabs
Docs: https://optimizely-axiom.github.io/optiaxiom/components/tabs/
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@optiaxiom/react";

<Tabs defaultValue="list">
  <TabsList>
    <TabsTrigger value="list">List</TabsTrigger>
    <TabsTrigger value="calendar">Calendar</TabsTrigger>
  </TabsList>
  <TabsContent value="list">List content</TabsContent>
  <TabsContent value="calendar">Calendar content</TabsContent>
</Tabs>
```

#### Menu (Dropdown)
Docs: https://optimizely-axiom.github.io/optiaxiom/components/menu/
```tsx
import { Menu, MenuTrigger, MenuContent } from "@optiaxiom/react";

<Menu options={[
  { label: "Option 1", execute: () => {} },
  { label: "Option 2", execute: () => {} },
]}>
  <MenuTrigger asChild>
    <Button>Open Menu</Button>
  </MenuTrigger>
  <MenuContent />
</Menu>
```

#### Badge
Docs: https://optimizely-axiom.github.io/optiaxiom/components/badge/
```tsx
import { Badge } from "@optiaxiom/react";

<Badge colorScheme="primary">5</Badge>
<Badge colorScheme="success">Active</Badge>
<Badge colorScheme="danger">Error</Badge>
```

#### Input
Docs: https://optimizely-axiom.github.io/optiaxiom/components/input/
```tsx
import { Input, Field } from "@optiaxiom/react";

<Field label="Label">
  <Input placeholder="Enter text..." />
</Field>
```

#### Select
Docs: https://optimizely-axiom.github.io/optiaxiom/components/select/
```tsx
import { Select, SelectContent, SelectTrigger, SelectValue } from "@optiaxiom/react";
```

#### Table
Docs: https://optimizely-axiom.github.io/optiaxiom/components/table/
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@optiaxiom/react";
```

#### Avatar
Docs: https://optimizely-axiom.github.io/optiaxiom/components/avatar/
```tsx
import { Avatar } from "@optiaxiom/react";

<Avatar name="John Doe" src="/path/to/image.jpg" />
<Avatar name="John Doe" /> // Shows initials if no src
```

#### Sidebar Navigation
```tsx
import { Sidebar, Nav, NavBody, NavItem, SubNav } from "@optiaxiom/react";
```

### Typography
Use the Text component from the project:
```tsx
import { Text } from "@/app/components/Text";

<Text fontSize="sm" fontWeight="500" color="fg.default">Text</Text>
```

Or Axiom Heading:
```tsx
import { Heading } from "@optiaxiom/react";

<Heading level="1">H1 Heading</Heading>
<Heading level="2">H2 Heading</Heading>
<Heading level="3">H3 Heading</Heading>
```

### Spacing & Sizing Tokens
Use Axiom's design tokens for consistency:
- Spacing: "0", "4", "8", "12", "16", "20", "24", "32", "40", "48", "56", "64", "80"
- Width: "full", "auto", or specific values like "224"

### Colors (Semantic Tokens)
- Background: `bg="bg.default"`, `bg="bg.page"`, `bg="bg.secondary"`
- Foreground: `color="fg.default"`, `color="fg.secondary"`, `color="fg.tertiary"`
- Border: `borderColor="border.default"`, `borderColor="border.tertiary"`

## CMP-Specific Icons
Custom SVG icons are stored in `/app/cmp/assets/`:
- `plus-16.svg` - Create button (blue circle with white plus)
- `home.svg` - Home icon
- `plan.svg` - Plan View icon
- `dashboard.svg` - Dashboard icon
- `resource-management.svg` - Resource Management icon
- `library.svg` - Library icon
- `marketplace.svg` - Marketplace icon
- `workrequest.svg` - Work Request icon

All icons use `fill="currentColor"` for dynamic coloring (gray by default, blue when selected).

## CMP Navigation Structure
The CMP sidebar has these menu items:
1. **Create** - Menu trigger (dropdown with Campaign, Task, Hypothesis, Event, Milestone, Work Request, Pitch Request)
2. **Home** - `/cmp/dashboard`
3. **Plan View** - `/cmp/plan-view`
4. **Dashboard** - `/cmp/reports`
5. **Resource Management** - `/cmp/resource-management`
6. **Library** - `/cmp/library`
7. **Market Place** - `/cmp/marketplace`
8. **Work Request** - `/cmp/work-request`

## Common Patterns

### Filter Button with Badge
```tsx
<Button icon={<IconFilter size={20} />} size="lg" appearance="default" />
```
Note: Badge should be positioned separately, not inside the button.

### Page with Full-Width Table
```tsx
<Box className="h-full flex flex-col -m-6 -mt-[72px]">
  {/* Header */}
  <Box borderB="1" borderColor="border.tertiary" bg="bg.default" px="16">
    {/* Tabs, filters, etc. */}
  </Box>

  {/* Table */}
  <Box flex="1" overflow="auto">
    <Table>...</Table>
  </Box>

  {/* Footer/Pagination */}
  <Box borderT="1" borderColor="border.tertiary" px="16" py="8">
    {/* Pagination */}
  </Box>
</Box>
```

## Reference Screenshots
The design reference is from Opal CMP. Key pages to replicate:
- Home/Dashboard
- Plan View (List, Calendar, Timeline, Board views)
- Library
- Reports/Dashboard
- Resource Management
- Marketplace
- Work Request

## Notes
- Always check Axiom docs before implementing a component
- Use Tabler icons (`@tabler/icons-react`) for standard icons
- Custom CMP icons are in `/app/cmp/assets/`
- The template wrapper adds padding, so full-width pages need negative margins
