# Tag Import Test Files

This directory contains test files for the tag import feature. All files are available in both CSV and JSON formats.

## Test File Descriptions

### 1. Basic Import (`test-tags-import`)
**Purpose:** Test basic successful import with all valid tags

**Contents:**
- 8 tags with complete, valid data
- Mix of public and private visibility
- No conflicts, duplicates, or errors

**URLs:**
- CSV: `http://localhost:3000/test-tags-import.csv`
- JSON: `http://localhost:3000/test-tags-api.json`

---

### 2. Conflicts (`test-tags-conflicts`)
**Purpose:** Test import with tags that already exist in the system

**Contents:**
- Contains tags like "Getting Started" and "Advanced Guide" which likely exist
- Will trigger the conflict resolution UI
- Tests skip, update, and create-new actions

**URLs:**
- CSV: `http://localhost:3000/test-tags-conflicts.csv`
- JSON: `http://localhost:3000/test-tags-conflicts.json`

**Expected Behavior:**
- Tags with matching slugs will show as "Conflict" status
- User can choose to: Skip, Update, or Create New (with modified slug)

---

### 3. Duplicates (`test-tags-duplicates`)
**Purpose:** Test import with duplicate slugs within the same file

**Contents:**
- "product-launch" appears twice
- "engineering-blog" appears twice
- Other valid tags

**URLs:**
- CSV: `http://localhost:3000/test-tags-duplicates.csv`
- JSON: `http://localhost:3000/test-tags-duplicates.json`

**Expected Behavior:**
- Duplicate entries will show "Duplicate" badge
- Only the first occurrence will be imported
- Subsequent duplicates will be skipped

---

### 4. Errors (`test-tags-errors`)
**Purpose:** Test import with validation errors

**Contents:**
- Tags with missing `name` field
- Tags with empty string `name`
- Tags with only whitespace in `name`
- Some valid tags mixed in

**URLs:**
- CSV: `http://localhost:3000/test-tags-errors.csv`
- JSON: `http://localhost:3000/test-tags-errors.json`

**Expected Behavior:**
- Invalid rows will show "Error" badge
- Error details will be displayed
- Valid tags will still import successfully

---

### 5. Mixed Scenarios (`test-tags-mixed`)
**Purpose:** Test import with a combination of all scenarios

**Contents:**
- Valid new tags
- Conflicting tags (existing in system)
- Duplicate slugs within the file
- Error cases (missing/empty names)

**URLs:**
- CSV: `http://localhost:3000/test-tags-mixed.csv`
- JSON: `http://localhost:3000/test-tags-mixed.json`

**Expected Behavior:**
- Comprehensive test of all validation and conflict resolution features
- Preview will show mix of Valid, Conflict, Duplicate, and Error badges
- Statistics summary will show counts for each category

---

## How to Use

1. Start your development server (usually `npm run dev`)
2. Open the tag import modal
3. Select either "URL" or "API Endpoint" as import source
4. Paste one of the URLs above
5. Click "Continue" to see the preview

## Testing Checklist

- [ ] Basic import with all valid tags
- [ ] Conflict resolution (skip, update, create new)
- [ ] Duplicate handling (first occurrence used)
- [ ] Error validation (missing/empty names)
- [ ] Mixed scenario with all cases
- [ ] URL validation (both CSV and JSON)
- [ ] Endpoint detection (JSON auto-converted to CSV)
- [ ] Pagination with large datasets
- [ ] Bulk conflict resolution actions
- [ ] Keyboard navigation (n/p keys)
- [ ] File upload vs URL vs Endpoint comparison

## Notes

- The "Getting Started" and "Advanced Guide" tags are assumed to exist in the system (based on the template)
- Adjust conflict test files if your system has different existing tags
- All JSON files follow the expected schema: `[{"name": "...", "slug": "...", "visibility": "..."}]`
- CSV files follow the format: `name,slug,visibility` (header row required)