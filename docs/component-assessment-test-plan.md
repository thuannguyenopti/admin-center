# Component Assessment: Social Proof on PDP Test Plan

## Overview

This document categorizes all UI components in the design into three groups:
1. **Available in @optiaxiom/react** - Can be used directly from the design system
2. **Custom Components Required** - Need to be built from scratch
3. **Composite Components** - Built by composing Axiom components

---

## Part 1: Components FROM Design System (@optiaxiom/react)

These components are available in the installed `@optiaxiom/react` package and can be used directly.

### Layout Components

| Component | Usage | Import |
|-----------|-------|--------|
| `Box` | Generic container, flex/grid layouts | `@optiaxiom/react` |
| `Flex` | Flexbox container | `@optiaxiom/react` |
| `Grid` | Grid container | `@optiaxiom/react` |

### Content Components

| Component | Usage | Import |
|-----------|-------|--------|
| `Heading` | Section titles ("Hypothesis", "Targeting", etc.) | `@optiaxiom/react` |
| `Text` | Body text, labels, values | `@optiaxiom/react` |
| `Badge` | "Draft" badge, status indicators | `@optiaxiom/react` |
| `Card` | Container for callout sections | `@optiaxiom/react` |
| `Avatar` | User avatar in Opal chat | `@optiaxiom/react` |

### Form Components

| Component | Usage | Import |
|-----------|-------|--------|
| `Input` | Text input fields (if needed) | `@optiaxiom/react` |
| `Textarea` | Chat input "Ask Opal" | `@optiaxiom/react` |
| `Button` | Export button, action buttons | `@optiaxiom/react` |

### Interactive Components

| Component | Usage | Import |
|-----------|-------|--------|
| `Disclosure` | "About your test plan", "Completed" sections | `@optiaxiom/react` |
| `DisclosureTrigger` | Clickable disclosure header | `@optiaxiom/react` |
| `DisclosureContent` | Hidden/shown content | `@optiaxiom/react` |
| `Menu` | Dropdown menus (Opal dropdown) | `@optiaxiom/react` |
| `MenuTrigger` | Menu button trigger | `@optiaxiom/react` |
| `MenuContent` | Menu items container | `@optiaxiom/react` |
| `Tooltip` | Hover tooltips for icon buttons | `@optiaxiom/react` |

### Utility Components

| Component | Usage | Import |
|-----------|-------|--------|
| `Separator` | Dividers (if needed) | `@optiaxiom/react` |
| `Skeleton` | Loading states (if needed) | `@optiaxiom/react` |

---

## Part 2: Custom Components Required

These components are **NOT** available in the design system and must be built from scratch or heavily customized.

### 1. Circular Progress Chart ⭐ **HIGH COMPLEXITY**

**Location**: Prioritization Score card (node: n_2dd63)

**Description**: A circular donut chart showing 50% completion with the score in the center.

**Specifications**:
- Diameter: ~130px
- Stroke width: ~12px
- Fill color: `#0037ff` (brand.500)
- Background: `#e9edf5` (light) / `#353e4d` (dark)
- Center text: "50" (28px, bold)
- Label below: "Prioritization Score"

**Implementation Options**:
1. **SVG Component** (Recommended):
   ```tsx
   <svg viewBox="0 0 130 130">
     <circle /> {/* Background circle */}
     <circle /> {/* Progress arc */}
     <text>50</text>
   </svg>
   ```
2. **Third-party library**:
   - `recharts` - Full featured but heavy
   - `react-circular-progressbar` - Lightweight, specialized
3. **CSS conic-gradient**: Limited browser support, less flexible

**Effort**: 4-6 hours

---

### 2. Horizontal Progress Bar

**Location**: PIE Framework card (node: n_3f5f8)

**Description**: Simple horizontal bar showing progress/score.

**Specifications**:
- Width: 148px (relative to container)
- Height: 8px
- Fill color: `#0037ff` (brand.500)
- Background: `#e9edf5` (light) / `#353e4d` (dark)
- Border radius: None apparent

**Implementation**:
```tsx
<Box w="full" h="2" bg="neutral.100" rounded="sm">
  <Box w="148px" h="full" bg="brand.500" />
</Box>
```

**Effort**: 30 minutes

---

### 3. Stats Table Component

**Location**: Sample Size Estimates, Targeting sections

**Description**: Key-value pair table with bottom borders.

**Specifications**:
- Layout: Two columns (label left, value right)
- Gap between label/value: 32px (in Targeting), varies in Sample Size
- Border bottom: 1px solid `#dadfeb` (light) / `#2c3240` (dark)
- Last row: No border
- Padding: ~10px vertical per row

**Implementation**:
```tsx
<Box as="table" w="full">
  <tbody>
    {stats.map((stat, i) => (
      <tr key={i} borderBottom={i !== last ? "1px solid" : undefined}>
        <td>{stat.label}</td>
        <td align="right">{stat.value}</td>
      </tr>
    ))}
  </tbody>
</Box>
```

**Effort**: 1-2 hours

---

### 4. Gradient Text Component

**Location**: "Completed" text in Opal chat (node: n_a80a8)

**Description**: Text with purple gradient fill.

**Specifications**:
```css
background: linear-gradient(134.54deg, #392ecf 16.24%, #7740ec 85.41%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

**Implementation**:
```tsx
<Text
  as="span"
  bgGradient="linear-gradient(134.54deg, #392ecf 16.24%, #7740ec 85.41%)"
  bgClip="text"
  color="transparent"
>
  Completed
</Text>
```

**Effort**: 30 minutes

---

### 5. Content Card with Ring Shadow ⭐ **MEDIUM COMPLEXITY**

**Location**: Social Proof on PDP card in Opal chat (node: n_c9ac0)

**Description**: Card with double-ring shadow (blue + white).

**Specifications**:
- Border radius: 12px
- Border: 1px solid `#e9edf5`
- Shadow: `0px 0px 0px 3px #2e66f7, 0px 0px 0px 1px #ffffff`
- Padding: 12px
- Layout: Icon left, text middle, close button right

**Implementation**:
```tsx
<Card
  borderRadius="12px"
  border="1px solid"
  borderColor="neutral.100"
  boxShadow="0 0 0 3px #2e66f7, 0 0 0 1px #ffffff"
  p="3"
>
  {/* Content */}
</Card>
```

**Effort**: 1 hour

---

### 6. Chat Message Component

**Location**: Opal chat messages (nodes: n_2b306, n_5b8a2)

**Description**: Message bubbles for user and assistant.

**Specifications**:
- User message:
  - Background: `#e8f0fe` (light) / `#21283f` (dark)
  - Border radius: 8px (except top-right: 4px)
  - Max width: 80%
  - Align: right
- Assistant message:
  - Background: `#f3f5f8` (light) / `#1c212b` (dark)
  - Border radius: 8px (except top-left: 4px)
  - Max width: 80%
  - Align: left

**Implementation**:
```tsx
<Box
  bg={isUser ? "accent.subtle" : "secondary"}
  borderRadius="8px"
  borderTopRightRadius={isUser ? "4px" : "8px"}
  borderTopLeftRadius={isUser ? "8px" : "4px"}
  maxW="80%"
  p="3"
  alignSelf={isUser ? "flex-end" : "flex-start"}
>
  {message}
</Box>
```

**Effort**: 2 hours (including variants)

---

### 7. Quick Action Buttons Row

**Location**: Below "I've drafted a test plan..." message (node: n_ec7d8)

**Description**: Row of 4 icon buttons with equal spacing.

**Specifications**:
- Icons: Refresh, Copy, Thumbs up, Thumbs down
- Icon color: `#626a81`
- Gap: 8px
- Icon size: 14-16px

**Implementation**:
```tsx
<Flex gap="2">
  {actions.map((action) => (
    <Button variant="ghost" size="sm" key={action.id}>
      <Icon name={action.icon} color="gray.600" />
    </Button>
  ))}
</Flex>
```

**Effort**: 1 hour

---

### 8. Suggestion Pills

**Location**: Suggestions list in Opal chat (node: n_53d73)

**Description**: Clickable suggestion items with hover state.

**Specifications**:
- Layout: Stacked list
- Gap: 8px
- Text color: `#262b37` (light) / `#e9edf5` (dark)
- Font: 14px, normal
- Indent: 16px (appears to be indented from "Suggestions:" label)

**Implementation**:
```tsx
<Box pl="4">
  <Text fontSize="xs" color="tertiary" mb="2">Suggestions:</Text>
  {suggestions.map((s) => (
    <Text key={s} fontSize="sm" color="default" lineHeight="tall">
      {s}
    </Text>
  ))}
</Box>
```

**Note**: Design shows plain text, not interactive pills. If clickable, add hover styles.

**Effort**: 1 hour

---

### 9. Toolbar Component

**Location**: Top of canvas (node: n_2744d)

**Description**: Horizontal toolbar with left and right action groups.

**Specifications**:
- Height: ~56px
- Gap between left/right: 40px (justify-between)
- Background: `#f9fafc` (same as page)
- Left: Close + Code/View toggles
- Right: Undo, Redo, Copy, Download, Export button

**Implementation**:
```tsx
<Flex justify="between" align="center" h="56px" px="4" bg="page">
  <Flex gap="3" align="center">
    {/* Left actions */}
  </Flex>
  <Flex gap="2" align="center">
    {/* Right actions */}
  </Flex>
</Flex>
```

**Effort**: 2 hours

---

### 10. Resize Handle (Grab Handle)

**Location**: Between Canvas and Opal panel (node: n_2810c)

**Description**: Visual indicator for resizable panel.

**Specifications**:
- Width: 10px
- Height: 52px
- Border: 1px solid `#e9edf5`
- Border radius: 4px
- Position: Centered vertically (appears around middle of viewport)

**Implementation**:
```tsx
<Box
  w="10px"
  h="52px"
  border="1px solid"
  borderColor="neutral.100"
  borderRadius="4px"
  cursor="col-resize"
  position="absolute"
  left="-5px"
  top="50%"
  transform="translateY(-50%)"
/>
```

**Note**: If implementing resizable panels, use a library like `react-resizable-panels` or `react-split-pane`.

**Effort**: 1 hour (visual only), 4-6 hours (with resize functionality)

---

## Part 3: Composite Components

These are built by composing multiple Axiom components together.

### 1. Info Card (Owner, Test Type, etc.)

**Built with**:
- `Card` (container)
- `Text` (label and value)
- `Flex` or `Box` (layout)

**Structure**:
```tsx
<Card p="4" bg="default">
  <Flex direction="column" gap="2">
    <Text fontSize="md" color="secondary">{label}</Text>
    <Text fontSize="md" fontWeight="semibold" color="default">{value}</Text>
  </Flex>
</Card>
```

---

### 2. Callout Card (Hypothesis, Targeting, Variations)

**Built with**:
- `Card` (container)
- `Heading` (section title)
- `Text` (icon label, body text)
- `Flex` (layout for icon + title)

**Structure**:
```tsx
<Card p="4" bg="default" rounded="md">
  <Flex gap="2" align="center" mb="2">
    <Icon name="lightbulb" size="md" />
    <Heading size="md">Hypothesis</Heading>
  </Flex>
  <Text fontSize="md" color="tertiary" lineHeight="tall">
    {content}
  </Text>
</Card>
```

---

### 3. Opal Header

**Built with**:
- `Flex` (layout)
- `Button` (menu and action buttons)
- `Menu` + `MenuTrigger` + `MenuContent` (Opal dropdown)
- `Text` (title)

**Structure**:
```tsx
<Flex justify="between" align="center" h="56px" px="4">
  <Button variant="ghost" size="sm">{/* Menu icon */}</Button>
  
  <Menu>
    <MenuTrigger>
      <Flex gap="1" align="center">
        <Text fontWeight="medium">Opal</Text>
        <Icon name="chevron-down" />
      </Flex>
    </MenuTrigger>
    <MenuContent>{/* Options */}</MenuContent>
  </Menu>
  
  <Flex gap="2">
    {/* Action buttons */}
  </Flex>
</Flex>
```

---

### 4. Chat Input Area

**Built with**:
- `Box` (container)
- `Textarea` (input)
- `Flex` (actions row)
- `Button` (@ and microphone buttons)
- `Text` (disclaimer)

**Structure**:
```tsx
<Box p="3" borderRadius="4px">
  <Box border="1px solid" borderColor="neutral.100" borderRadius="8px" p="3">
    <Textarea
      placeholder="Ask Opal"
      border="none"
      resize="none"
      rows={2}
    />
    <Flex justify="between" align="center" mt="2">
      <Button variant="ghost" size="sm">{/* @ icon */}</Button>
      <Button variant="ghost" size="sm">{/* microphone */}</Button>
    </Flex>
  </Box>
  <Text fontSize="xs" color="tertiary" mt="2">
    Opal can make mistakes. Double-check its responses.
  </Text>
</Box>
```

---

## Part 4: Assets & Icons

### SVG Icons from Figma

These SVG assets should be copied from `data://assets/` to the project:

| Asset File | Suggested Name | Purpose | Node ID |
|------------|----------------|---------|---------|
| `36e095.svg` | `icon-close.svg` | Close button | n_91070 |
| `6b6f12.svg` | `icon-code.svg` | Code toggle | n_9003e |
| `70672e.svg` | `icon-eye.svg` | Preview toggle | n_72475 |
| `797bf6.svg` | `icon-undo.svg` | Undo | n_bffc6 |
| `afadf3.svg` | `icon-redo.svg` | Redo | n_5727b |
| `d2141a.svg` | `icon-copy.svg` | Copy button | n_d61b3, n_2aa00 |
| `8445c3.svg` | `icon-download.svg` | Download | n_2bfed |
| `dad54f.svg` | `icon-chevron-down.svg` | Dropdown | n_d16dd |
| `751c12.svg` | `icon-menu.svg` | Menu button | n_43e5c |
| `2c3802.svg` | `icon-chevron-down-small.svg` | Opal dropdown | n_06f1a |
| `8856c8.svg` | `icon-trash.svg` | Delete | n_ec546 |
| `75128e.svg` | `icon-close-small.svg` | Close (small) | n_4c10e, n_61798 |
| `8834c7.svg` | `icon-share.svg` | Share | n_059b9 |
| `fb665d.svg` | `icon-chevron-right.svg` | Disclosure expand | n_667c2 |
| `48ba1c.svg` | `icon-chevron-left.svg` | Disclosure collapse | n_7a03f |
| `876f52.svg` | `icon-refresh.svg` | Refresh action | n_88759 |
| `d3c55e.svg` | `icon-thumbs-up.svg` | Like | n_6e3e5 |
| `f8d0cc.svg` | `icon-thumbs-down.svg` | Dislike | n_97480 |
| `f7999e.svg` | `icon-at.svg` | @ mention | n_83524 |

### Images

| Asset File | Suggested Name | Purpose | Node ID |
|------------|----------------|---------|---------|
| `fd5b24.png` | `control-variation.png` | Variation screenshot | n_3c7d8 |
| `2c8231.png` | `avatar-user.png` | User avatar | n_9ea27 |

### Font Awesome Icons Needed

These icons are referenced by name in the design. Map to available icon libraries:

| Design Label | Icon Purpose | Component | Suggested Icon |
|--------------|--------------|-----------|----------------|
| `star` | Prioritization Score | FA Pro or Tabler `IconStar` | ⭐ |
| `calendar-time` | Sample Size | FA Pro or Tabler `IconCalendarTime` | 📅 |
| `chart-bar` | PIE Framework | FA Pro or Tabler `IconChartBar` | 📊 |
| `lightbulb` | Hypothesis | FA Pro or Tabler `IconBulb` | 💡 |
| `bullseye` | Targeting | FA Pro or Tabler `IconTarget` | 🎯 |
| `vials` | Variations | FA Pro or Tabler `IconFlask` | 🧪 |
| `file-lines` | Content card | FA Pro or Tabler `IconFileText` | 📄 |
| `microphone` | Voice input | FA Pro or Tabler `IconMicrophone` | 🎤 |

**Recommendation**: Use `@tabler/icons-react` (already installed) for these icons rather than relying on Font Awesome Pro (requires license).

---

## Implementation Priority

### Phase 1: Core Layout (Week 1)
- Toolbar component
- Two-panel layout (Canvas + Opal)
- Info cards grid
- Callout cards

### Phase 2: Custom Components (Week 2)
- Circular progress chart
- Stats tables
- Progress bar (PIE)
- Gradient text

### Phase 3: Opal Panel (Week 3)
- Chat messages
- Content card with ring
- Quick action buttons
- Input area
- Disclosures

### Phase 4: Polish (Week 4)
- Resize handle (if implementing resize)
- Animations
- Dark mode testing
- Responsive adjustments

---

## Component Complexity Summary

| Component | Complexity | Effort | Priority |
|-----------|------------|--------|----------|
| Circular Progress | **High** | 4-6h | Must Have |
| Stats Table | Low | 1-2h | Must Have |
| Content Card (ring) | Medium | 1h | Must Have |
| Chat Messages | Medium | 2h | Must Have |
| Toolbar | Low | 2h | Must Have |
| Progress Bar | Low | 30m | Should Have |
| Gradient Text | Low | 30m | Should Have |
| Quick Actions | Low | 1h | Should Have |
| Suggestion Pills | Low | 1h | Nice to Have |
| Resize Handle | High (if functional) | 4-6h | Nice to Have |

**Total Estimated Effort**: 16-23 hours for custom components + 20-30 hours for layout and composition = **36-53 hours** total

---

## Dependencies & Libraries

### Already Installed ✅
- `@optiaxiom/react` - Design system
- `@optimizely/axiom-icons` - Icon library
- `@tabler/icons-react` - Alternative icons
- `framer-motion` - Animations
- `tailwindcss` - Utility styles

### Recommended to Add

For Circular Progress:
- Option 1: **Custom SVG** (no dependency)
- Option 2: `react-circular-progressbar` (4.6kB)
- Option 3: `recharts` (95kB - heavy)

For Resizable Panels:
- Option 1: `react-resizable-panels` (18kB, recommended)
- Option 2: `react-split-pane` (older, 25kB)

---

## Next Steps

1. ✅ **Assets**: Copy all SVG and image assets from `data://assets/` to `public/icons/` and `public/images/`
2. **Component Library**: Create custom components in `app/components/test-plan/`
3. **Colors**: Add custom color variables to `app/globals.css`
4. **Layout**: Build the two-panel structure
5. **Integration**: Compose components into full page
6. **Testing**: Verify light/dark modes, responsiveness

