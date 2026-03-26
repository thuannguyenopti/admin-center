# app/cmp/ — CMP (Content Marketing Platform) Context

> Design system rules, tokens, and components are in **[../../DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md)**.
> This file covers only CMP-specific context.

## Overview

This is the CMP prototype — a 1:1 replica of the Opal CMP design for feature development and testing.

## CMP Navigation Structure

The sidebar menu items (defined in root `layout.tsx`):
1. **Create** — Menu trigger (dropdown: Campaign, Task, Hypothesis, Event, Milestone, Work Request, Pitch Request)
2. **Home** — `/cmp/dashboard`
3. **Plan** — `/cmp/plan-view`
4. **Library** — `/cmp/library`
5. **Marketplace** — `/cmp/marketplace`
6. **Idea Lab** — `/cmp/idea-lab`
7. **Analytics** — `/cmp/analytics`
8. **Requests** — `/cmp/work-request`
9. **Settings** — `/cmp/settings`

## CMP Icons

Custom SVG icons in `/app/cmp/assets/` use `fill="currentColor"` for dynamic coloring.

## Page Layout Patterns

### Full-width table page
```tsx
<Box className="h-full flex flex-col -m-6 -mt-[72px]">
  <Box borderB="1" borderColor="border.tertiary" bg="bg.default" px="16">
    {/* Tabs, filters */}
  </Box>
  <Box flex="1" overflow="auto">
    <Table>...</Table>
  </Box>
  <Box borderT="1" borderColor="border.tertiary" px="16" py="8">
    {/* Pagination */}
  </Box>
</Box>
```

The template wrapper adds `px="32" py="24"` padding, so full-width pages need negative margins to break out.

## Key Pages to Reference

When building new CMP pages, look at existing ones for patterns:
- `app/cmp/plan-view/page.tsx` — Table with tabs and filters
- `app/cmp/library/page.tsx` — Grid layout with header
- `app/cmp/dashboard/page.tsx` — Dashboard with sidebar
