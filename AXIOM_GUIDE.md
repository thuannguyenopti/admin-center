# Axiom Component Usage Guide

## ⚠️ Important: Using Valid Token Values

Axiom components use **design tokens** for styling props. You cannot use arbitrary values like `w="200"` or `p="md"`. Instead, you must use predefined token values.

---

## Common Props and Valid Values

### 📏 Width (`w`) and Height (`h`)

**Valid values:**
```typescript
"0" | "10" | "12" | "16" | "20" | "24" | "32" | "40" | "48" | "56" | "64" | "80" | "224" | "384"
| "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "3xl"
| "1/2" | "1/3" | "2/3" | "1/4" | "3/4"
| "auto" | "fit" | "full" | "max" | "min"
```

**Examples:**
```tsx
✅ <Box w="224">...</Box>         // 224px width
✅ <Box w="full">...</Box>        // 100% width
✅ <Box w="1/2">...</Box>         // 50% width
✅ <Box h="auto">...</Box>        // auto height

❌ <Box w="200">...</Box>         // INVALID - not a token
❌ <Box w="300px">...</Box>       // INVALID - no units
```

**Alternative for custom values:**
```tsx
<Box style={{width: '200px'}}>...</Box>
```

---

### 📐 Spacing (Padding, Margin, Gap)

**Props:** `p`, `px`, `py`, `pt`, `pb`, `pl`, `pr`, `m`, `mx`, `my`, `mt`, `mb`, `ml`, `mr`, `gap`

**Valid values:**
```typescript
"0" | "2" | "4" | "6" | "8" | "10" | "12" | "16" | "20" | "24" | "32" | "40" | "48" | "64" | "80"
| "auto" (for margin only)
```

**Examples:**
```tsx
✅ <Box p="16">...</Box>          // 16px padding
✅ <Box mb="24">...</Box>         // 24px margin-bottom
✅ <Group gap="8">...</Group>     // 8px gap
✅ <Box m="auto">...</Box>        // auto margin

❌ <Box p="md">...</Box>          // INVALID - use "16" not "md"
❌ <Box gap="sm">...</Box>        // INVALID - use "8" not "sm"
❌ <Box p="15">...</Box>          // INVALID - not a token
```

---

### 🎨 Colors

**Props:** `bg`, `color`, `borderColor`

**Background (`bg`) valid values:**
```typescript
"transparent" | "current"
| "bg.default" | "bg.secondary" | "bg.tertiary"
| "bg.accent" | "bg.accent.hovered" | "bg.accent.light" | "bg.accent.subtle"
| "bg.error" | "bg.error.light" | "bg.error.subtle"
| "bg.success" | "bg.success.light" | "bg.success.subtle"
| "bg.warning" | "bg.warning.light" | "bg.warning.subtle"
| "bg.information" | "bg.information.light" | "bg.information.subtle"
| "bg.page" | "bg.overlay"
```

**Text color (`color`) valid values:**
```typescript
"transparent" | "current"
| "fg.default" | "fg.secondary" | "fg.tertiary"
| "fg.accent" | "fg.accent.strong"
| "fg.error" | "fg.error.strong"
| "fg.success" | "fg.success.strong"
| "fg.warning" | "fg.warning.strong"
| "fg.information" | "fg.information.strong"
| "fg.link.default" | "fg.link.visited"
| "fg.disabled"
```

**Border color (`borderColor`) valid values:**
```typescript
"transparent" | "current"
| "border.default" | "border.secondary" | "border.tertiary"
| "border.accent" | "border.error" | "border.success" | "border.warning"
| "border.focus" | "border.disabled"
```

**Examples:**
```tsx
✅ <Box bg="bg.default">...</Box>
✅ <Text color="fg.secondary">...</Text>
✅ <Box borderColor="border.default">...</Box>

❌ <Box bg="surface.primary">...</Box>   // INVALID - wrong prefix
❌ <Text color="#666">...</Text>         // INVALID - use tokens
```

**Alternative for custom colors:**
```tsx
<Box style={{background: '#custom'}}>...</Box>
```

---

### 📝 Typography

**Font size (`fontSize`):**
```typescript
"inherit" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
```

**Font weight (`fontWeight`):**
```typescript
"400" | "500" | "600" | "700"
```

**Examples:**
```tsx
✅ <Text fontSize="sm">...</Text>
✅ <Heading fontSize="xl">...</Heading>
✅ <Text fontWeight="600">...</Text>

❌ <Text fontSize="14px">...</Text>      // INVALID - use "sm"
❌ <Text fontWeight="bold">...</Text>    // INVALID - use "700"
```

---

### 📥 Input & SearchInput Sizes

**Input/SearchInput size (`size`):**
```typescript
"md" | "lg" | "xl"  // Default: "md"
```

**IMPORTANT:** Input and SearchInput do NOT support `size="sm"`. Only `"md"`, `"lg"`, and `"xl"` are valid.

**Examples:**
```tsx
✅ <Input />                    // Uses default "md" size
✅ <Input size="md" />          // Explicit medium size
✅ <Input size="lg" />          // Large size
✅ <SearchInput />              // Uses default "md" size
✅ <SearchInput size="lg" />    // Large size

❌ <Input size="sm" />          // INVALID - "sm" not supported
❌ <SearchInput size="sm" />    // INVALID - causes weird heights
```

**When to use each size:**
- `"md"` (default) - Standard form inputs
- `"lg"` - Emphasized inputs or larger touch targets
- `"xl"` - Hero sections or prominent search bars

---

### 🔲 Borders

**Border width (`border`, `borderT`, `borderB`, `borderL`, `borderR`):**
```typescript
"0" | "1" | "2"
```

**Border radius (`rounded`):**
```typescript
"none" | "xs" | "sm" | "md" | "lg" | "xl" | "full" | "inherit"
```

**Examples:**
```tsx
✅ <Box border="1" borderColor="border.default">...</Box>
✅ <Box rounded="md">...</Box>
✅ <Box borderT="1">...</Box>

❌ <Box border="default">...</Box>       // INVALID - use "1"
❌ <Box borderRadius="md">...</Box>      // INVALID - use "rounded"
```

---

### 🌟 Shadows

**Box shadow (`shadow`):**
```typescript
"none" | "sm" | "md" | "lg" | "xl"
```

**Examples:**
```tsx
✅ <Box shadow="sm">...</Box>
✅ <Card shadow="md">...</Card>

❌ <Box boxShadow="sm">...</Box>         // INVALID - use "shadow"
```

---

### 📏 Max Height/Width

**Max height (`maxH`):**
```typescript
"xs" | "sm" | "md" | "lg" | "full"
```

**Examples:**
```tsx
✅ <Box maxH="md">...</Box>
✅ <Box overflow="auto">...</Box>

❌ <Box maxHeight="400px">...</Box>      // INVALID - use style prop
```

**Alternative for custom maxHeight:**
```tsx
<Box overflow="auto" style={{maxHeight: '400px'}}>...</Box>
```

---

## 🎯 Quick Reference Cheat Sheet

| Prop | Common Values | Custom Alternative |
|------|--------------|-------------------|
| `w`, `h` | `"16"`, `"24"`, `"full"`, `"auto"` | `style={{width: '200px'}}` |
| `p`, `m` | `"0"`, `"8"`, `"16"`, `"24"` | `style={{padding: '15px'}}` |
| `gap` | `"4"`, `"8"`, `"12"`, `"16"` | n/a (use padding instead) |
| `bg` | `"bg.default"`, `"bg.secondary"` | `style={{background: '#fff'}}` |
| `color` | `"fg.default"`, `"fg.secondary"` | `style={{color: '#333'}}` |
| `fontSize` | `"xs"`, `"sm"`, `"md"`, `"lg"` | `style={{fontSize: '15px'}}` |
| `rounded` | `"sm"`, `"md"`, `"lg"`, `"full"` | `style={{borderRadius: '6px'}}` |
| `border` | `"0"`, `"1"`, `"2"` | `style={{borderWidth: '3px'}}` |
| `shadow` | `"none"`, `"sm"`, `"md"`, `"lg"` | `style={{boxShadow: '...'}}` |

---

## 🔍 How to Find Valid Values

### Method 1: Use the MCP Axiom Tools
```typescript
// Ask Claude to check valid props:
mcp__axiom__get_component({
  name: "Box",
  props: "width padding background"
})
```

### Method 2: Check TypeScript Errors
When you use an invalid value, TypeScript will show all valid options in the error message.

### Method 3: Axiom Documentation
Visit the Axiom documentation for comprehensive prop listings.

---

## 💡 Common Patterns

### Form Inputs with Labels
```tsx
// ✅ Use Field component to wrap inputs with labels
<Field label="Name" required>
  <Input placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
</Field>

<Field label="Country">
  <Select
    value={country}
    onValueChange={setCountry}
    options={[
      {label: "United States", value: "us"},
      {label: "Canada", value: "ca"},
    ]}
  >
    <SelectTrigger placeholder="Select country" />
    <SelectContent />
  </Select>
</Field>

// ❌ Don't manually create labels with Text component
<Text fontSize="sm" fontWeight="600" mb="8">Name *</Text>
<Input placeholder="Enter name" />
```

### Flexible Width Container
```tsx
// ✅ Good: Use flex instead of fixed width
<Box style={{flex: 1}}>...</Box>

// ❌ Avoid: Custom px widths
<Box w="200">...</Box>
```

### Responsive Spacing
```tsx
// ✅ Use token spacing
<Box p="16" mb="24">...</Box>

// ❌ Don't use size names
<Box p="md" mb="lg">...</Box>
```

### Custom Values When Needed
```tsx
// ✅ Use style prop for custom values
<Box
  p="16"
  style={{
    maxWidth: '1200px',
    minHeight: '400px'
  }}
>
  ...
</Box>
```

### Color Consistency
```tsx
// ✅ Use semantic tokens
<Box bg="bg.default" borderColor="border.default">
  <Text color="fg.secondary">...</Text>
</Box>

// ❌ Don't mix custom colors
<Box style={{background: '#f5f5f5'}}>
  <Text color="fg.secondary">...</Text>
</Box>
```

---

## 🚨 Common Mistakes

| ❌ Wrong | ✅ Correct | Note |
|---------|-----------|------|
| `<Text>Label</Text><Input />` | `<Field label="Label"><Input /></Field>` | Use Field for form inputs |
| `<Input size="sm" />` | `<Input />` or `<Input size="md" />` | Input/SearchInput only support md/lg/xl |
| `p="md"` | `p="16"` | Use numbers for spacing |
| `w="200"` | `w="224"` or `style={{width: '200px'}}` | Use valid token or style |
| `bg="surface.primary"` | `bg="bg.default"` | Wrong color prefix |
| `borderRadius="md"` | `rounded="md"` | Wrong prop name |
| `boxShadow="sm"` | `shadow="sm"` | Wrong prop name |
| `color="#666"` | `color="fg.secondary"` | Use color tokens |
| `fontSize="14px"` | `fontSize="sm"` | Use size tokens |
| `maxHeight="400px"` | `style={{maxHeight: '400px'}}` | Use style for custom |
| `<Select><option>...</option></Select>` | `<Select options={[...]}><SelectTrigger /><SelectContent /></Select>` | Use options prop |

---

## 📚 Best Practices

1. **Always use design tokens first** - They ensure consistency across your app
2. **Use `style` prop for one-off custom values** - When tokens don't fit
3. **Prefer semantic color names** - `bg.default` instead of hardcoded colors
4. **Check TypeScript errors** - They show you valid options
5. **Use MCP tools to verify** - Ask Claude to check component props
6. **Stick to the scale** - Don't use arbitrary spacing values

---

## 🛠️ Debugging Tips

### When you see a SprinklesError:

1. **Read the error message** - It lists all valid values
2. **Find the closest valid token** - e.g., `"200"` → `"224"`
3. **Use style prop if needed** - For truly custom values
4. **Check prop name** - e.g., `borderRadius` → `rounded`

### Example Error:
```
"width" has no value "200".
Possible values are "0", "10", "12", "16", "20", "24", "32", "40",
"48", "56", "64", "80", "224", "384", ...
```

**Solution:**
```tsx
// Option 1: Use closest token
<Box w="224">...</Box>

// Option 2: Use style prop
<Box style={{width: '200px'}}>...</Box>
```

---

## 🎓 Learning Resources

- **Axiom Storybook**: Browse all components and their props
- **MCP Axiom Tools**: Use `mcp__axiom__get_component` to check props
- **TypeScript**: Let the type system guide you
- **This Guide**: Bookmark this for quick reference!

---

**Remember**: Axiom's design token system ensures consistency, accessibility, and maintainability. Always prefer tokens over custom values when possible!
