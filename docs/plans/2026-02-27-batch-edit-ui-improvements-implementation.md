# Batch Edit UI Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve batch edit UX by hiding suffix for new items, adding categories disclosure, and simplifying labels.

**Architecture:** Minimal direct edits to `MultiSelectDetailsPane.tsx` - add state, update labels, conditionally hide suffixes, wrap categories in Disclosure component.

**Tech Stack:** React, TypeScript, @optiaxiom/react (Disclosure components)

**Design Doc:** See `docs/plans/2026-02-27-batch-edit-ui-improvements-design.md`

---

## Task 1: Add State for Categories Disclosure

**Files:**
- Modify: `app/cms/content/MultiSelectDetailsPane.tsx:127`

**Step 1: Add state variable**

Add the state variable right after the `batchTagsExpanded` state on line 127:

```tsx
const [batchTagsExpanded, setBatchTagsExpanded] = useState(false);
const [batchCategoriesExpanded, setBatchCategoriesExpanded] = useState(true);
```

**Step 2: Verify TypeScript compiles**

Run: `npm run type-check` or check IDE for TypeScript errors
Expected: No errors

**Step 3: Commit**

```bash
git add app/cms/content/MultiSelectDetailsPane.tsx
git commit -m "feat: add state for categories disclosure in batch edit"
```

---

## Task 2: Simplify Tags Label

**Files:**
- Modify: `app/cms/content/MultiSelectDetailsPane.tsx:680`

**Step 1: Update tags disclosure label**

Find line 680 which currently reads:
```tsx
{suggestedSlugs.length > 0 ? 'Existing' : 'Common tags'} ({tags.length})
```

Replace with:
```tsx
Batch tags ({tags.length})
```

**Step 2: Save and verify in browser**

1. Start dev server: `npm run dev` (if not already running)
2. Navigate to CMS content page
3. Select multiple items
4. Click "Edit tags" to enter batch edit mode
5. Verify the disclosure label shows "Batch tags (X)" regardless of whether AI suggestions are present

Expected: Label always shows "Batch tags" with count

**Step 3: Commit**

```bash
git add app/cms/content/MultiSelectDetailsPane.tsx
git commit -m "feat: simplify tags label to 'Batch tags' in batch edit"
```

---

## Task 3: Hide Suffix for Newly Added Tags

**Files:**
- Modify: `app/cms/content/MultiSelectDetailsPane.tsx:705-707`

**Step 1: Add conditional rendering for tags suffix**

Find lines 705-707 which currently show:
```tsx
<Text fontSize="xs" color="fg.secondary" style={{ fontWeight: 400 }}>
  on {count} {count === 1 ? "item" : "items"}
</Text>
```

Wrap with conditional to hide when `isAddedInBatch` is true:
```tsx
{!isAddedInBatch && (
  <Text fontSize="xs" color="fg.secondary" style={{ fontWeight: 400 }}>
    on {count} {count === 1 ? "item" : "items"}
  </Text>
)}
```

**Step 2: Test in browser**

1. In batch edit mode, add a new tag using the search input
2. Verify the newly added tag badge (green, success intent) does NOT show "on X items"
3. Verify existing tags (neutral badge) still show "on X items"
4. Click "Apply" to apply the changes
5. Re-enter batch edit mode
6. Verify the previously-new tag now shows "on X items" (since it's no longer `isAddedInBatch`)

Expected: Suffix hidden for green badges, shown for neutral badges

**Step 3: Commit**

```bash
git add app/cms/content/MultiSelectDetailsPane.tsx
git commit -m "feat: hide 'on X items' suffix for newly added tags in batch edit"
```

---

## Task 4: Wrap Categories in Disclosure Component

**Files:**
- Modify: `app/cms/content/MultiSelectDetailsPane.tsx:979-1015`

**Step 1: Add Disclosure wrapper structure**

Find the categories section starting around line 979. Currently it's a flat `Box` with categories mapped directly.

The current structure (lines 979-1015):
```tsx
<Box display="flex" flexDirection="column" gap="8">
  {categories.map((slug) => {
    // ... category badge rendering
  })}
</Box>
```

Replace with Disclosure structure matching tags (reference lines 663-734):

```tsx
{categories.length > 0 && (
  <Disclosure open={batchCategoriesExpanded} onOpenChange={setBatchCategoriesExpanded}>
    <DisclosureTrigger asChild>
      <button
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          padding: '8px 0',
          border: 'none',
          background: 'transparent',
          width: '100%',
        }}
      >
        <Text fontSize="xs" color="fg.secondary" fontWeight="600">
          Batch categories ({categories.length})
        </Text>
        <Box
          style={{
            transform: batchCategoriesExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <IconChevronRight size={14} />
        </Box>
      </button>
    </DisclosureTrigger>
    <DisclosureContent>
      <Box display="flex" flexDirection="column" gap="8" pt="8">
        {categories.map((slug) => {
          const itemsWithCategory = items.filter((item) => (item.categories ?? []).includes(slug));
          const count = itemsWithCategory.length;
          const isAddedInBatch = addedCategoriesInBatch.includes(slug);
          return (
            <Box key={slug} display="flex" alignItems="center" gap="4">
              <Badge intent={isAddedInBatch ? "success" : "neutral"} variant={isAddedInBatch ? "subtle" : undefined}>
                <Box display="flex" alignItems="center" gap="4">
                  <span>{getCategoryDisplayName(slug)}</span>
                  <Text fontSize="xs" color="fg.secondary" style={{ fontWeight: 400 }}>
                    on {count} {count === 1 ? "item" : "items"}
                  </Text>
                  <button
                    onClick={() => handleRemoveCategory(slug)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      fontSize: "14px",
                      fontWeight: "500",
                      lineHeight: "1",
                      color: "inherit",
                    }}
                    aria-label={`Remove category ${getCategoryDisplayName(slug)}`}
                  >
                    ×
                  </button>
                </Box>
              </Badge>
            </Box>
          );
        })}
      </Box>
    </DisclosureContent>
  </Disclosure>
)}
```

**Step 2: Verify in browser**

1. Navigate to batch edit mode for categories
2. Verify the categories section now has a disclosure trigger with "Batch categories (X)"
3. Click the disclosure trigger and verify it expands/collapses
4. Verify the chevron icon rotates 90 degrees when expanded
5. Verify visual consistency with the tags disclosure (same styling, animation, spacing)

Expected: Categories section matches tags disclosure exactly

**Step 3: Commit**

```bash
git add app/cms/content/MultiSelectDetailsPane.tsx
git commit -m "feat: add expand/collapse disclosure to categories in batch edit"
```

---

## Task 5: Hide Suffix for Newly Added Categories

**Files:**
- Modify: `app/cms/content/MultiSelectDetailsPane.tsx` (within the code from Task 4)

**Step 1: Add conditional rendering for categories suffix**

In the categories Disclosure content you just added in Task 4, find the suffix Text component:

```tsx
<Text fontSize="xs" color="fg.secondary" style={{ fontWeight: 400 }}>
  on {count} {count === 1 ? "item" : "items"}
</Text>
```

Wrap with conditional to match tags pattern:

```tsx
{!isAddedInBatch && (
  <Text fontSize="xs" color="fg.secondary" style={{ fontWeight: 400 }}>
    on {count} {count === 1 ? "item" : "items"}
  </Text>
)}
```

**Step 2: Test in browser**

1. In batch edit mode for categories, add a new category using the search input
2. Verify the newly added category badge (green, success intent) does NOT show "on X items"
3. Verify existing categories (neutral badge) still show "on X items"
4. Click "Apply" to apply the changes
5. Re-enter batch edit mode
6. Verify the previously-new category now shows "on X items"

Expected: Suffix hidden for green badges, shown for neutral badges

**Step 3: Commit**

```bash
git add app/cms/content/MultiSelectDetailsPane.tsx
git commit -m "feat: hide 'on X items' suffix for newly added categories in batch edit"
```

---

## Task 6: Comprehensive Manual Testing

**Files:**
- Test: `app/cms/content/MultiSelectDetailsPane.tsx` (manual browser testing)

**Step 1: Test tags disclosure**

1. Select multiple content items (e.g., 3 items)
2. Click "Edit tags" to enter batch edit mode
3. Verify disclosure shows "Batch tags (X)" regardless of AI suggestions
4. Add a new tag via search input
5. Verify new tag badge is green and does NOT show "on X items"
6. Verify existing tags show "on X items" count
7. Click disclosure trigger to collapse, verify chevron rotates and content hides
8. Click to expand again, verify it works smoothly

**Step 2: Test categories disclosure**

1. In the same batch edit session, switch to "Edit categories"
2. Verify disclosure shows "Batch categories (X)"
3. Add a new category via search input
4. Verify new category badge is green and does NOT show "on X items"
5. Verify existing categories show "on X items" count
6. Click disclosure trigger to collapse/expand
7. Verify visual consistency with tags (same spacing, animation, styling)

**Step 3: Test edge cases**

1. Select 1 item: verify singular "on 1 item" text (for existing tags/categories)
2. Select 0 tags/categories: verify disclosure doesn't appear (wrapped in conditional)
3. Add tag to all items: verify it shows correct count after application
4. Remove tag from batch: verify preview updates correctly

**Step 4: Visual regression check**

1. Compare tags and categories disclosures side-by-side
2. Verify identical styling: button, chevron, text, spacing, animation
3. Verify badge colors: green for new (isAddedInBatch), neutral for existing
4. Verify suffix only shows for neutral badges

Expected: All scenarios work correctly, no visual regressions

**Step 5: Final commit (if any fixes needed)**

If you found and fixed issues during testing:
```bash
git add app/cms/content/MultiSelectDetailsPane.tsx
git commit -m "fix: address edge cases in batch edit UI"
```

---

## Testing Checklist

- [ ] Tags disclosure shows "Batch tags (X)" label
- [ ] Categories disclosure shows "Batch categories (X)" label
- [ ] Tags disclosure expands/collapses with chevron animation
- [ ] Categories disclosure expands/collapses with chevron animation
- [ ] Newly added tags (green badge) hide "on X items" suffix
- [ ] Newly added categories (green badge) hide "on X items" suffix
- [ ] Existing tags (neutral badge) show "on X items" suffix
- [ ] Existing categories (neutral badge) show "on X items" suffix
- [ ] Singular/plural: "on 1 item" vs "on 2 items"
- [ ] Empty state: disclosures don't appear when no tags/categories
- [ ] Visual consistency between tags and categories disclosures

---

## Rollback Plan

If issues are found in production:

1. Revert all commits:
   ```bash
   git revert HEAD~5..HEAD
   ```

2. Or revert specific commits:
   ```bash
   git log --oneline  # find commit hashes
   git revert <hash>
   ```

3. The changes are isolated to one file, making rollback safe and straightforward.
