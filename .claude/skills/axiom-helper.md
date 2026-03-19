# Axiom Helper Skill

**Skill Name:** axiom-helper
**Description:** Helps you use Axiom components correctly with valid prop values and debugging SprinklesErrors.

---

## When to Use This Skill

Use this skill when:
- You encounter a SprinklesError about invalid prop values
- You need to know valid values for Axiom component props
- You're unsure which design token to use
- You want to convert custom CSS values to Axiom tokens
- You need help with component patterns (Field, Select, Card, SearchInput, etc.)
- You're getting errors like "getItemProps" from Select component
- You're unsure how to properly label form inputs

---

## What This Skill Does

1. **Validates Prop Values** - Checks if you're using valid Axiom tokens
2. **Suggests Alternatives** - Recommends the closest valid token for your custom value
3. **Explains Design Tokens** - Helps you understand Axiom's token system
4. **Fixes Common Mistakes** - Corrects typical prop naming and value errors
5. **Component Patterns** - Shows correct usage of Field, Select, Card, SearchInput, and other components
6. **Debugging Component Errors** - Helps resolve downshift, validation, and accessibility issues

---

## Instructions for Claude

When this skill is invoked, you should:

### 1. Check for Common Mistakes

Review the user's code and check for these common errors:

**Component Usage:**
- ❌ `<Text>Label</Text><Input />` → ✅ `<Field label="Label"><Input /></Field>`
- ❌ `<Select><option>...</option></Select>` → ✅ `<Select options={[...]}><SelectTrigger /><SelectContent /></Select>`
- ❌ `<Card onClick={...}>` → ✅ `<Box onClick={...}><Card>...</Card></Box>`
- ❌ `<Input size="sm" />` → ✅ `<Input />` (Input/SearchInput only support md/lg/xl)
- ❌ Manual labels with Text → ✅ Use Field component wrapper

**Spacing:**
- ❌ `p="md"` → ✅ `p="16"`
- ❌ `gap="sm"` → ✅ `gap="8"`
- ❌ `mb="lg"` → ✅ `mb="24"`

**Width/Height:**
- ❌ `w="200"` → ✅ `w="224"` or `style={{width: '200px'}}`
- ❌ `h="300"` → ✅ `h="384"` or `style={{height: '300px'}}`

**Colors:**
- ❌ `bg="surface.primary"` → ✅ `bg="bg.default"`
- ❌ `color="#666"` → ✅ `color="fg.secondary"`
- ❌ `borderColor="gray"` → ✅ `borderColor="border.default"`

**Prop Names:**
- ❌ `borderRadius="md"` → ✅ `rounded="md"`
- ❌ `boxShadow="sm"` → ✅ `shadow="sm"`
- ❌ `maxHeight="400px"` → ✅ `style={{maxHeight: '400px'}}`

### 2. Use MCP Tools to Verify

When unsure about valid values, use the MCP Axiom tools:

```typescript
mcp__axiom__get_component({
  name: "Box",
  props: "width padding background"
})
```

This will return all valid values for the requested props.

### 3. Provide Solutions

For each error, provide:

1. **What's wrong** - Explain the invalid value
2. **Why it's wrong** - Reference the design token system
3. **The fix** - Show the correct token or style prop usage
4. **Alternative** - If token doesn't fit, show the style prop approach

### 4. Reference the Guide

Always point users to `/AXIOM_GUIDE.md` for comprehensive documentation.

---

## Example Interaction

**User:** "I'm getting a SprinklesError about width having no value '200'"

**Claude Response:**

I see the issue. Axiom's `w` prop only accepts predefined design tokens, and `"200"` isn't one of them.

**The Problem:**
```tsx
❌ <Box w="200">...</Box>
```

**Valid Solutions:**

1. **Use the closest token (224px):**
```tsx
✅ <Box w="224">...</Box>
```

2. **Use custom value with style prop:**
```tsx
✅ <Box style={{width: '200px'}}>...</Box>
```

**Valid width tokens:**
- Numbers: `"0"`, `"16"`, `"24"`, `"32"`, `"48"`, `"64"`, `"80"`, `"224"`, `"384"`
- Sizes: `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`, `"full"`
- Fractions: `"1/2"`, `"1/3"`, `"2/3"`, `"1/4"`, `"3/4"`
- Special: `"auto"`, `"fit"`, `"max"`, `"min"`

For more details, see the [Axiom Guide](AXIOM_GUIDE.md#-width-w-and-height-h).

---

## Quick Reference Tables

### Spacing (p, m, gap)
| Token | Pixels | Use Case |
|-------|--------|----------|
| `"0"` | 0px | No spacing |
| `"4"` | 4px | Tight spacing |
| `"8"` | 8px | Small gap |
| `"12"` | 12px | Medium-small |
| `"16"` | 16px | Standard spacing |
| `"24"` | 24px | Large spacing |
| `"32"` | 32px | Section spacing |

### Colors
| Prop | Prefix | Example |
|------|--------|---------|
| `bg` | `bg.` | `"bg.default"`, `"bg.secondary"` |
| `color` | `fg.` | `"fg.default"`, `"fg.secondary"` |
| `borderColor` | `border.` | `"border.default"` |

### Common Props
| CSS Property | Axiom Prop | Valid Values |
|--------------|------------|--------------|
| `padding` | `p` | Numbers: `"0"` to `"80"` |
| `margin` | `m` | Numbers: `"0"` to `"80"`, `"auto"` |
| `gap` | `gap` | Numbers: `"0"` to `"80"` |
| `border-radius` | `rounded` | `"sm"`, `"md"`, `"lg"`, `"full"` |
| `box-shadow` | `shadow` | `"none"`, `"sm"`, `"md"`, `"lg"` |
| `font-size` | `fontSize` | `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"` |

---

## Component Usage Patterns

### Field Component (Forms & Labels)

**Purpose:** Wraps form inputs to provide labels, required indicators, errors, and help text.

**Always use Field for:**
- Input
- SearchInput
- Select
- Textarea
- Any form control that needs a label

**Pattern:**
```tsx
// ✅ Correct - Input with label
<Field label="Name" required>
  <Input placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
</Field>

// ✅ Correct - Select with label
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

// ✅ Correct - SearchInput with label
<Field label="Search">
  <SearchInput placeholder="Search items..." />
</Field>

// ❌ Wrong - Manual labels
<Text fontSize="sm" fontWeight="600" mb="8">Name *</Text>
<Input placeholder="Enter name" />
```

**Benefits:**
- ✅ Proper accessibility (label association)
- ✅ Automatic required indicators
- ✅ Consistent styling
- ✅ Support for descriptions and errors

---

### Select Component

**IMPORTANT:** Select uses downshift internally and requires specific patterns.

**Required Pattern:**
```tsx
<Select
  value={value}
  onValueChange={setValue}
  options={OPTIONS_ARRAY}
>
  <SelectTrigger />
  <SelectContent />
</Select>
```

**Common Mistakes:**
```tsx
// ❌ WRONG - HTML option tags don't work
<Select value={lang} onValueChange={setLang}>
  <option value="en">English</option>
  <option value="es">Spanish</option>
</Select>

// ❌ WRONG - Value not in options causes "getItemProps" error
<Select value={value} options={[...]} />  // value must exist in options array

// ✅ CORRECT - Options array with value validation
const OPTIONS = [
  {label: "English", value: "en"},
  {label: "Spanish", value: "es"},
];

const validValue = useMemo(() => {
  return OPTIONS.some(o => o.value === value) ? value : OPTIONS[0].value;
}, [value]);

<Select
  value={validValue}
  onValueChange={setValue}
  options={OPTIONS}
>
  <SelectTrigger />
  <SelectContent />
</Select>
```

**Why validate value?**
Downshift throws "Pass either item or index to getItemProps!" if the value doesn't exist in the options array. Always ensure the value matches an option.

---

### Card Component

**IMPORTANT:** Card does NOT support onClick directly.

**Pattern:**
```tsx
// ❌ WRONG - onClick not supported
<Card onClick={handleClick} cursor="pointer">
  ...
</Card>

// ✅ CORRECT - Wrap in clickable Box
<Box onClick={handleClick} cursor="pointer">
  <Card>
    ...
  </Card>
</Box>

// ✅ CORRECT - Use CardLink for links
<Card>
  <CardHeader>
    <CardLink href="/page">Link text</CardLink>
  </CardHeader>
</Card>
```

---

### Box vs Group

**Box:** Use for simple styling without flexbox layout
- Padding, margin, colors, borders
- When you don't need flex layout

**Group:** Use for flexbox layouts
- Automatically sets `display: flex`
- Use when you need `gap`, `alignItems`, `justifyContent`, etc.

```tsx
// ✅ Box - Simple container
<Box p="16" bg="bg.default" rounded="md">
  <Text>Content</Text>
</Box>

// ✅ Group - Flexbox layout
<Group gap="8" alignItems="center">
  <Icon />
  <Text>Label</Text>
</Group>
```

---

### Input & SearchInput Components

**IMPORTANT SIZE RESTRICTION:**
Input and SearchInput only support `size="md"` (default), `"lg"`, or `"xl"`.
**There is NO `size="sm"` option** - using it causes rendering issues.

**Always wrap in Field for labels:**
```tsx
// ✅ Correct - Default size (md)
<Field label="Search">
  <SearchInput placeholder="Search..." />
</Field>

// ✅ Correct - With valid size
<Field label="Name">
  <Input size="lg" placeholder="Enter name" />
</Field>

// ❌ WRONG - Invalid size="sm"
<SearchInput size="sm" placeholder="Search..." />  // Causes weird heights!

// ❌ Wrong - No label
<SearchInput placeholder="Search..." />
```

**Valid size values:**
- `"md"` - Default, standard form inputs
- `"lg"` - Larger touch targets
- `"xl"` - Hero sections or prominent inputs

---

### Common Component Patterns

**Form with multiple fields:**
```tsx
<Group flexDirection="column" gap="16">
  <Field label="Name" required>
    <Input placeholder="Enter name" />
  </Field>

  <Field label="Email" required>
    <Input type="email" placeholder="Enter email" />
  </Field>

  <Field label="Country">
    <Select options={countryOptions}>
      <SelectTrigger placeholder="Select country" />
      <SelectContent />
    </Select>
  </Field>
</Group>
```

**Horizontal form fields:**
```tsx
<Group gap="16">
  <Box style={{flex: 1}}>
    <Field label="First Name" required>
      <Input placeholder="First name" />
    </Field>
  </Box>

  <Box w="224">
    <Field label="Title">
      <Select options={titleOptions}>
        <SelectTrigger />
        <SelectContent />
      </Select>
    </Field>
  </Box>
</Group>
```

---

## Debugging Workflow

When encountering a SprinklesError:

1. **Read the error message** - It lists all valid values
2. **Identify the prop** - Which prop has the invalid value?
3. **Check the Quick Reference** - Find valid tokens for that prop type
4. **Choose the closest token** - Or use `style` prop for custom values
5. **Apply the fix** - Update your code
6. **Verify** - The error should be gone

---

## Best Practices to Share

### Component Usage
1. **Always use Field for form inputs** - Provides labels, accessibility, and consistency
2. **Wrap SearchInput in Field** - Even search inputs need labels for accessibility
3. **Validate Select values** - Use useMemo to ensure value exists in options array
4. **Don't put onClick on Card** - Wrap Card in a clickable Box instead
5. **Use Group for flex layouts** - Use Box for simple styling

### Design Tokens
6. **Always use tokens first** - They ensure design consistency
7. **Use `style` prop for one-offs** - When tokens don't fit exactly
8. **Prefer semantic naming** - `bg.default` over hardcoded colors
9. **Check TypeScript errors** - They show valid options
10. **Use MCP tools** - To verify component props
11. **Keep the guide handy** - Bookmark AXIOM_GUIDE.md

---

## Resources to Reference

- **AXIOM_GUIDE.md** - Comprehensive guide in the project root
- **MCP Axiom Tools** - `mcp__axiom__get_component`, `mcp__axiom__search_components`, `mcp__axiom__get_patterns`
- **Axiom Storybook** - For visual component browsing
- **TypeScript** - Let the type system guide you

---

## Remember

Axiom's design token system is intentional. It ensures:
- ✅ Visual consistency across the application
- ✅ Accessibility compliance
- ✅ Easy theme switching
- ✅ Reduced CSS complexity
- ✅ Better maintainability

When in doubt, **use tokens** → save **custom values** for truly unique cases.
