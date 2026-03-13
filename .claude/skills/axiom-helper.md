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

---

## What This Skill Does

1. **Validates Prop Values** - Checks if you're using valid Axiom tokens
2. **Suggests Alternatives** - Recommends the closest valid token for your custom value
3. **Explains Design Tokens** - Helps you understand Axiom's token system
4. **Fixes Common Mistakes** - Corrects typical prop naming and value errors

---

## Instructions for Claude

When this skill is invoked, you should:

### 1. Check for Common Mistakes

Review the user's code and check for these common errors:

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

1. **Always use tokens first** - They ensure design consistency
2. **Use `style` prop for one-offs** - When tokens don't fit exactly
3. **Prefer semantic naming** - `bg.default` over hardcoded colors
4. **Check TypeScript errors** - They show valid options
5. **Use MCP tools** - To verify component props
6. **Keep the guide handy** - Bookmark AXIOM_GUIDE.md

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
