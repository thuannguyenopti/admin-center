## Debug Changes Made for White Bar Issue

### Issue Description
White bar appearing at bottom of categories and tags pages. Grey background should span full window height.

### Root Cause
Grid container uses `h-[100vh]` but grid items (sidebar and content areas) were overflowing their grid cell because they lacked `min-height: 0`, a common CSS Grid gotcha. Grid items were rendering at 987px when they should be constrained to ~856px.

### Changes Made

#### 1. Fixed template.tsx grid layout constraints
- **File:** `app/components/template.tsx`
- **Changes:** 
  - Line 87: Changed `h-[100vh]` to `h-screen` for consistent height calculation
  - Line 89: Added `style={{ minHeight: 0 }}` to sidebar container to allow grid item to shrink
  - Line 211: Added `style={{ minHeight: 0 }}` to content area container to allow grid item to shrink
  - Line 217: Added `h="full"` to ensure content area fills grid cell
  - Line 222: Added `h="full"` to inner content box to fill parent
- **Revert:** Remove inline styles and h="full" props, restore original h-[100vh]

## Revert Status
- [ ] Change 1 - Template height and minHeight fixes
