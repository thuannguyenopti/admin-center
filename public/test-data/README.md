# Test Data Files for Import Testing

This directory contains realistic test data files for testing the tags and categories import functionality. All data is based on actual cycling/fitness-related content from the website's dummy data.

## Import Sources Supported

The import modals support **3 different import sources**:

### 1. CSV File Upload (Drag & Drop or Browse)
- Use any `.csv` file from this directory
- Drag and drop into the upload area or click to browse

### 2. URL (Direct CSV Link)
- Point to CSV files served from your development server
- Example: `http://localhost:3000/test-data/test-tags-import.csv`
- Example: `http://localhost:3000/test-data/test-categories-import.csv`

### 3. API Endpoint (JSON or CSV Response)
- Point to JSON endpoints that return tag/category data
- The modal automatically converts JSON to CSV format
- Example: `http://localhost:3000/test-data/test-tags-import.json`
- Example: `http://localhost:3000/test-data/test-categories-import.json`

---

## Tags Test Files

### Valid Import
- **test-tags-import.csv/json** - 6 new tags that don't exist in the system
  - Beginner Friendly, Advanced Techniques, Nutrition Tips, Recovery Methods, Race Preparation, Winter Training
  - **CSV URL**: `http://localhost:3000/test-data/test-tags-import.csv`
  - **JSON API**: `http://localhost:3000/test-data/test-tags-import.json`

### Conflicts
- **test-tags-conflicts.csv/json** - 3 tags that already exist in the system
  - Cycling Training, Road Cycling, Mountain Biking (conflict with existing tags)
  - **CSV URL**: `http://localhost:3000/test-data/test-tags-conflicts.csv`
  - **JSON API**: `http://localhost:3000/test-data/test-tags-conflicts.json`

### Duplicates
- **test-tags-duplicates.csv/json** - Duplicate slugs within the same file
  - 4 entries with 1 duplicate (advanced-techniques appears twice)
  - **CSV URL**: `http://localhost:3000/test-data/test-tags-duplicates.csv`
  - **JSON API**: `http://localhost:3000/test-data/test-tags-duplicates.json`

### Errors
- **test-tags-errors.csv/json** - Various validation errors
  - Missing name field, name too short (< 2 characters)
  - **CSV URL**: `http://localhost:3000/test-data/test-tags-errors.csv`
  - **JSON API**: `http://localhost:3000/test-data/test-tags-errors.json`

### Mixed Scenarios
- **test-tags-mixed.csv/json** - Combination of all scenarios
  - Valid entries, conflicts, errors, and duplicates
  - **CSV URL**: `http://localhost:3000/test-data/test-tags-mixed.csv`
  - **JSON API**: `http://localhost:3000/test-data/test-tags-mixed.json`

---

## Categories Test Files

### Valid Import
- **test-categories-import.csv/json** - 8 hierarchical categories under Equipment and Training
  - Bikes → Road Bikes, Mountain Bikes
  - Accessories → Helmets, Lights
  - Nutrition, Plans (under Training)
  - **CSV URL**: `http://localhost:3000/test-data/test-categories-import.csv`
  - **JSON API**: `http://localhost:3000/test-data/test-categories-import.json`

### Conflicts
- **test-categories-conflicts.csv/json** - 3 root categories that already exist
  - Equipment, Cycling, Training (conflict with existing categories)
  - **CSV URL**: `http://localhost:3000/test-data/test-categories-conflicts.csv`
  - **JSON API**: `http://localhost:3000/test-data/test-categories-conflicts.json`

### Duplicates
- **test-categories-duplicates.csv/json** - Duplicate slugs within the same file
  - 4 entries with 1 duplicate (bikes appears twice)
  - **CSV URL**: `http://localhost:3000/test-data/test-categories-duplicates.csv`
  - **JSON API**: `http://localhost:3000/test-data/test-categories-duplicates.json`

### Errors
- **test-categories-errors.csv/json** - Various validation errors
  - Missing name field, name too short, invalid parent, invalid status
  - **CSV URL**: `http://localhost:3000/test-data/test-categories-errors.csv`
  - **JSON API**: `http://localhost:3000/test-data/test-categories-errors.json`

### Hierarchy Testing
- **test-categories-hierarchy.csv/json** - Maximum depth testing (4 levels)
  - Equipment → Bikes → Road Bikes → Racing Bikes → Professional Racing
  - **CSV URL**: `http://localhost:3000/test-data/test-categories-hierarchy.csv`
  - **JSON API**: `http://localhost:3000/test-data/test-categories-hierarchy.json`

### Depth Error
- **test-categories-depth-error.csv/json** - Exceeds maximum depth
  - **⚠️ Requires test-categories-hierarchy.csv to be imported first**
  - Too Deep (would be 5th level under Professional Racing)
  - **CSV URL**: `http://localhost:3000/test-data/test-categories-depth-error.csv`
  - **JSON API**: `http://localhost:3000/test-data/test-categories-depth-error.json`

### Circular References
- **test-categories-circular.csv** - Circular dependency testing (CSV only)
  - Category A → Category C → Category B → Category A (circular)
  - **CSV URL**: `http://localhost:3000/test-data/test-categories-circular.csv`

### Mixed Scenarios
- **test-categories-mixed.csv/json** - Combination of all scenarios
  - Valid entries, conflicts, errors, duplicates, and orphans
  - **CSV URL**: `http://localhost:3000/test-data/test-categories-mixed.csv`
  - **JSON API**: `http://localhost:3000/test-data/test-categories-mixed.json`

---

## How to Use

### Method 1: File Upload
1. Navigate to `/cms/settings/tags` or `/cms/settings/categories`
2. Click the "Import" button
3. Select "CSV File" as the import source
4. Drag and drop a test file or click to browse
5. Review the preview and test conflict resolution
6. Complete the import

### Method 2: URL Import
1. Click the "Import" button
2. Select "URL" as the import source
3. Paste a CSV URL from above (e.g., `http://localhost:3000/test-data/test-tags-import.csv`)
4. Click "Continue" to fetch and preview
5. Complete the import

### Method 3: API Endpoint Import
1. Click the "Import" button
2. Select "API Endpoint" as the import source
3. Paste a JSON URL from above (e.g., `http://localhost:3000/test-data/test-tags-import.json`)
4. The modal will automatically detect JSON and convert to CSV
5. Click "Continue" to preview
6. Complete the import

---

## Test Scenarios Covered

✓ **Valid imports** with new data
✓ **Conflicts** with existing system data
✓ **Duplicate slugs** within import file
✓ **Validation errors** (missing fields, invalid formats)
✓ **Hierarchical relationships** (categories only)
✓ **Maximum depth validation** (categories only)
✓ **Circular reference detection** (categories only)
✓ **Orphan detection** (categories only)
✓ **Mixed scenarios** combining multiple issues

✓ **All 3 import sources**: File upload, URL, API endpoint
✓ **Both formats**: CSV and JSON

---

## Notes

- All tags use realistic cycling/fitness-related names
- All categories use equipment and training-related hierarchies
- Test files reference actual existing data from `initialData.ts`:
  - Existing tags: Cycling Training, Road Cycling, Mountain Biking, etc.
  - Existing categories: Equipment, Cycling, Features, Training, etc.
- Circular reference test (CSV only) uses generic names to demonstrate the concept
- JSON files are automatically converted to CSV format by the import modal
- URLs assume your dev server is running on `http://localhost:3000` (adjust port if needed)

---

## File Count

- **Tags**: 5 test scenarios × 2 formats = 10 files
- **Categories**: 7 test scenarios × 2 formats + 1 CSV-only = 15 files
- **Total**: 25 test files + 1 README
