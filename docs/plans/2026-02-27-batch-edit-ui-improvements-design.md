# Batch Edit UI Improvements

**Date:** 2026-02-27
**Status:** Approved
**File:** `app/cms/content/MultiSelectDetailsPane.tsx`

## Summary

Improve the batch edit experience in the multi-select details panel by:
1. Hiding the "on X items" suffix for newly added tags/categories
2. Adding expand/collapse to the categories section (matching tags)
3. Simplifying section labels to "Batch tags" and "Batch categories"

## Current State

**Tags Section:**
- Has expand/collapse (Disclosure component)
- Label switches between "Common tags" and "Existing" based on AI suggestions
- Each tag shows "on X items" suffix for all items

**Categories Section:**
- Flat list without expand/collapse
- Each category shows "on X items" suffix for all items

## Design Decisions

### 1. Hide Suffix for Newly Added Items

**Problem:** When adding a new tag or category to items, the badge shows "on 0 items" which is confusing since the item hasn't been applied yet.

**Solution:** Conditionally hide the suffix when `isAddedInBatch === true`:

```tsx
{!isAddedInBatch && (
  <Text fontSize="xs" color="fg.secondary" style={{ fontWeight: 400 }}>
    on {count} {count === 1 ? "item" : "items"}
  </Text>
)}
```

**Applies to:** Both tags (line 705-707) and categories (line 989-991)

### 2. Add Expand/Collapse to Categories

**Problem:** Categories section doesn't match the collapsible pattern used for tags, leading to inconsistent UX.

**Solution:** Wrap categories list in a `Disclosure` component matching the tags implementation:

- Add state: `const [batchCategoriesExpanded, setBatchCategoriesExpanded] = useState(true)`
- Wrap categories list (line 979-1015) in `<Disclosure>` and `<DisclosureContent>`
- Add `<DisclosureTrigger>` button with chevron icon
- Match visual styling: same button style, chevron animation, text formatting

**Visual consistency:**
- Same transparent button background
- Same chevron rotation (0deg → 90deg)
- Same text styling (fontSize="xs", fontWeight="600", color="fg.secondary")
- Same gap and padding structure

### 3. Simplify Section Labels

**Problem:** Tags label switches between "Common tags" and "Existing" based on AI suggestions, which adds cognitive overhead. Categories would need similar logic.

**Solution:** Use consistent labels regardless of context:
- Tags: Always show "Batch tags (X)"
- Categories: Always show "Batch categories (X)"

Update tags label from:
```tsx
{suggestedSlugs.length > 0 ? 'Existing' : 'Common tags'} ({tags.length})
```

To:
```tsx
Batch tags ({tags.length})
```

## Edge Cases

**Empty state:**
- Both sections already have (or will have) `{items.length > 0 && (...)}` wrapper
- Disclosure only appears when there are items to show

**Zero-count items:**
- Newly added items with count=0: suffix hidden via `isAddedInBatch` check
- Existing items with count=0: shouldn't occur in practice, but suffix would show as safety

## Implementation Approach

**Approach:** Minimal direct changes (low risk, targeted edits)

**Why not extract components?**
- Tags and categories sections have meaningful differences (AI suggestions, different preview logic)
- Creating shared components would introduce unnecessary complexity
- Current structure is clear and maintainable

**Changes required:**
1. Add state variable for categories disclosure
2. Update tags label text (1 line change)
3. Add conditional rendering to hide suffix in tags badges (1 line change)
4. Wrap categories section in Disclosure component
5. Add conditional rendering to hide suffix in categories badges (1 line change)

## Files Changed

- `app/cms/content/MultiSelectDetailsPane.tsx`: All changes in this single file

## Testing Considerations

- Verify suffix appears for existing tags/categories (count > 0, not newly added)
- Verify suffix is hidden for newly added tags/categories (isAddedInBatch = true)
- Verify categories disclosure expands/collapses correctly
- Verify visual consistency between tags and categories disclosures
- Test with 0, 1, and many items selected
- Test with empty categories/tags lists
