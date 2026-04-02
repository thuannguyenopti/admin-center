# Content Type Validation

## Overview

This project validates that page data matches content type property definitions through:
1. **Build-time validation** - Ensures seed data (`initialPages`) follows `initialContentTypes` rules
2. **Runtime validation** - Shows validation errors in the UI as users edit content

## Build-Time Validation

### Validation Script

Run `npm run validate` to validate all seed data:

```bash
npm run validate
```

This runs [scripts/validate-initial-data.ts](scripts/validate-initial-data.ts) which checks:
- ✅ All `initialPages` match their `initialContentTypes` definitions
- ✅ Required fields are present
- ✅ Data types are correct (string, number, boolean, etc.)
- ✅ No unknown properties exist
- ✅ All content type references exist
- ✅ Content types have valid structure

**Integrated into build:**
```json
{
  "scripts": {
    "validate": "npx tsx scripts/validate-initial-data.ts",
    "build": "npm run validate && next build --webpack"
  }
}
```

If validation fails, the build will fail with detailed error messages.

### Example Output

**✅ Success:**
```
🔍 Validating initial data...

📄 Validating initialPages against initialContentTypes:
✅ Homepage
✅ About Us
✅ Blog
✅ 5 Tips for Your First Marathon
...

🔗 Validating content type references:
✅ All content type references exist

🏗️  Validating content type structure:
✅ Page (4 properties)
✅ Blog Post (5 properties)
...

============================================================
✅ All validation checks passed!
```

**❌ Failure:**
```
📄 Validating initialPages against initialContentTypes:

❌ Blog (ct-blog-listing):
   • Required property "Title" is missing (field: title)

============================================================
❌ Validation failed! Please fix the errors above.
```

## Runtime Validation

### Properties Panel

When editing content in Visual Builder, the Properties panel shows real-time validation errors:

**Location:** [app/components/vb/PropertiesPanel.tsx:213](app/components/vb/PropertiesPanel.tsx#L213)

**Visual feedback:**
```
┌─────────────────────────────────────┐
│ 🔴 Validation Issues                │
│ • Required property "Title" is missing │
│ • Required property "Body" is missing  │
└─────────────────────────────────────┘
```

- Red banner appears when errors exist
- Updates in real-time as you edit
- Shows both errors (❌ blocking) and warnings (⚠️ informational)

### Save-Time Validation

When saving pages, validation runs and shows a toast notification:

**Location:** [app/cms/edit/[id]/page.tsx:94](app/cms/edit/[id]/page.tsx#L94)

**Toast notifications:**
- 🔴 "Validation: 2 errors found. Check Properties panel for details."
- ⚠️ "Validation: 1 warning found."

This is **soft validation** - saves are allowed to proceed, but users are warned about issues.

## Validation Rules

### Errors (❌)

Validation errors prevent clean builds and show prominently in the UI:

1. **Missing required fields**
   ```
   Required property "Title" is missing
   ```

2. **Wrong data type**
   ```
   "Price" must be a number
   "Published" must be a boolean
   ```

3. **Invalid values**
   ```
   "Publish Date" must be a valid date string
   ```

### Warnings (⚠️)

Validation warnings inform but don't block:

1. **Unknown properties**
   ```
   Unknown property "oldField" not defined in content type
   ```

## Validation API

### Library

**File:** [app/lib/contentTypeValidation.ts](app/lib/contentTypeValidation.ts)

### Usage

```typescript
import { validatePageData } from "@/app/lib/contentTypeValidation";
import { initialContentTypes } from "@/app/db/initialData";

// Find the content type
const contentType = initialContentTypes.find(
  ct => ct.id === "ct-blog-post"
);

// Validate page data
const result = validatePageData(page.data, contentType);

if (!result.valid) {
  result.errors.forEach(error => {
    console.log(`${error.severity}: ${error.message}`);
  });
}
```

### Return Type

```typescript
{
  valid: boolean;           // true if no errors (warnings are OK)
  errors: Array<{
    field: string;          // Property ID that failed
    message: string;        // Human-readable error
    severity: "error" | "warning";
  }>;
}
```

### Supported Property Types

The validator checks these property types:

**String types:** `String`, `LongString`, `XhtmlString`, `Url`, `Guid`, `text`, `textarea`, `richtext`

**Number types:** `Int`, `Double`

**Boolean types:** `Boolean`, `checkbox`

**Date types:** `DateTime`

**Select types:** `SelectOne`, `SelectMany`

**Reference types:** `ContentReference`, `PageReference`, `reference`

**Media types:** `ImageReference`, `VideoReference`

**Link types:** `LinkItem`, `LinkItemCollection`

**Complex types:** `ContentArea`, `address`, `seo`

**Special types:** `outline` (skipped - handled separately)

## Best Practices

### 1. Always Validate Before Committing

Run validation before committing changes to seed data:

```bash
npm run validate
```

### 2. Define Required Fields Carefully

Mark fields as required in content type definitions:

```typescript
{
  id: "ct-blog-post",
  name: "Blog Post",
  properties: [
    {
      id: "title",
      name: "Title",
      type: "String",
      required: true  // ✅ Enforced at build + runtime
    },
    {
      id: "subtitle",
      name: "Subtitle",
      type: "String"  // ❌ Optional
    }
  ]
}
```

### 3. Use Validation in Custom Code

When creating or updating pages programmatically:

```typescript
import { validatePageData } from "@/app/lib/contentTypeValidation";

function createBlogPost(data: Record<string, any>) {
  const contentType = initialContentTypes.find(
    ct => ct.id === "ct-blog-post"
  );

  const result = validatePageData(data, contentType);

  if (!result.valid) {
    const errors = result.errors.filter(e => e.severity === "error");
    throw new Error(`Invalid blog post data: ${errors[0].message}`);
  }

  // Create the page...
}
```

### 4. Keep Content Types and Pages in Sync

When changing a content type definition:

1. Update the content type in `initialContentTypes`
2. Update affected pages in `initialPages`
3. Run `npm run validate` to catch issues
4. Fix any validation errors before committing

## Summary

The validation system ensures data integrity through:

1. ✅ **Build-time validation** - Catches errors in seed data before deployment
2. ✅ **Runtime validation** - Helps users create valid content in the UI
3. ✅ **No hardcoded types** - Works for all content types, including user-created ones
4. ✅ **Comprehensive checks** - Required fields, data types, unknown properties
5. ✅ **Clear feedback** - Detailed error messages in both CLI and UI

This approach provides strong validation without requiring TypeScript compile-time types, making it work seamlessly with dynamically created content types.
