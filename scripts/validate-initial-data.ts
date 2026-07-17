#!/usr/bin/env tsx
/**
 * Validation script for initial data
 * Run with: npx tsx scripts/validate-initial-data.ts
 *
 * Ensures that initialPages instances match their initialContentTypes definitions
 */

import { initialPages, initialContentTypes, initialPropertyGroups, type Property, type ContentType } from "../app/db/initialData";

// Inline validation logic (copied from contentTypeValidation.ts)
type ValidationError = {
  field: string;
  message: string;
  severity: "error" | "warning";
};

type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

function validatePageData(
  data: Record<string, any> | undefined,
  contentType: ContentType
): ValidationResult {
  const errors: ValidationError[] = [];
  const properties = contentType.properties || [];

  if (!data) {
    const requiredProps = properties.filter(
      (prop) => prop.required && prop.type !== "outline"
    );

    if (requiredProps.length > 0) {
      requiredProps.forEach((prop) => {
        errors.push({
          field: prop.id,
          message: `Required property "${prop.displayName || prop.name}" is missing`,
          severity: "error",
        });
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  properties.forEach((prop) => {
    if (prop.type === "outline") {
      return;
    }

    const value = data[prop.id];

    if (prop.required && (value === undefined || value === null || value === "")) {
      errors.push({
        field: prop.id,
        message: `Required property "${prop.displayName || prop.name}" is missing`,
        severity: "error",
      });
      return;
    }

    if (value === undefined || value === null) {
      return;
    }

    const typeError = validatePropertyType(prop, value);
    if (typeError) {
      errors.push({
        field: prop.id,
        message: typeError,
        severity: "error",
      });
    }
  });

  Object.keys(data).forEach((key) => {
    const propertyExists = properties.some((prop) => prop.id === key);
    if (!propertyExists) {
      errors.push({
        field: key,
        message: `Unknown property "${key}" not defined in content type`,
        severity: "warning",
      });
    }
  });

  return {
    valid: errors.filter((e) => e.severity === "error").length === 0,
    errors,
  };
}

function validatePropertyType(prop: Property, value: any): string | null {
  const displayName = prop.displayName || prop.name;

  switch (prop.type) {
    case "String":
    case "LongString":
    case "XhtmlString":
    case "Url":
    case "Guid":
    case "text":
    case "textarea":
    case "richtext":
      if (typeof value !== "string") {
        return `"${displayName}" must be a string`;
      }
      break;

    case "Int":
    case "Double":
      if (typeof value !== "number") {
        return `"${displayName}" must be a number`;
      }
      break;

    case "Boolean":
    case "checkbox":
      if (typeof value !== "boolean") {
        return `"${displayName}" must be a boolean`;
      }
      break;

    case "DateTime":
      if (typeof value !== "string" || isNaN(Date.parse(value))) {
        return `"${displayName}" must be a valid date string`;
      }
      break;

    case "SelectOne":
      if (typeof value !== "string") {
        return `"${displayName}" must be a string (select option)`;
      }
      break;

    case "SelectMany":
      if (!Array.isArray(value)) {
        return `"${displayName}" must be an array`;
      }
      break;

    case "ContentReference":
    case "PageReference":
    case "reference":
      if (typeof value !== "string" && typeof value !== "object") {
        return `"${displayName}" must be a reference ID (string) or inline block (object)`;
      }
      break;

    case "ImageReference":
    case "VideoReference":
      if (typeof value !== "string") {
        return `"${displayName}" must be a media reference (string)`;
      }
      break;

    case "LinkItem":
    case "link":
      if (typeof value !== "string" && typeof value !== "object") {
        return `"${displayName}" must be a link (string or object)`;
      }
      break;

    case "LinkItemCollection":
      if (!Array.isArray(value)) {
        return `"${displayName}" must be an array of links`;
      }
      break;

    case "ContentArea":
      if (!Array.isArray(value) && typeof value !== "object") {
        return `"${displayName}" must be a content area (array or object)`;
      }
      break;

    case "address":
      if (typeof value !== "object") {
        return `"${displayName}" must be an address object`;
      }
      break;

    case "seo":
      if (typeof value !== "object") {
        return `"${displayName}" must be an SEO settings object`;
      }
      break;

    case "outline":
      break;

    default:
      break;
  }

  return null;
}

// Main validation
let hasErrors = false;

console.log("🔍 Validating initial data...\n");

// Validate each page against its content type
console.log("📄 Validating initialPages against initialContentTypes:");
initialPages.forEach((page) => {
  const contentType = initialContentTypes.find(
    (ct) => ct.id === page.contentTypeId
  );

  if (!contentType) {
    console.error(
      `❌ Page "${page.name}" references unknown content type: ${page.contentTypeId}`
    );
    hasErrors = true;
    return;
  }

  const result = validatePageData(page.data, contentType);
  const errors = result.errors.filter((e) => e.severity === "error");
  const warnings = result.errors.filter((e) => e.severity === "warning");

  if (errors.length > 0) {
    console.error(`\n❌ ${page.name} (${page.contentTypeId}):`);
    errors.forEach((e) => {
      console.error(`   • ${e.message} (field: ${e.field})`);
    });
    hasErrors = true;
  } else if (warnings.length > 0) {
    console.warn(`\n⚠️  ${page.name} (${page.contentTypeId}):`);
    warnings.forEach((e) => {
      console.warn(`   • ${e.message} (field: ${e.field})`);
    });
  } else {
    console.log(`✅ ${page.name}`);
  }
});

// Validate content type references
console.log("\n\n🔗 Validating content type references:");
const contentTypeIds = new Set(initialContentTypes.map((ct) => ct.id));
let missingRefs = false;

initialPages.forEach((page) => {
  if (!contentTypeIds.has(page.contentTypeId)) {
    console.error(
      `❌ Page "${page.name}" references missing content type: ${page.contentTypeId}`
    );
    hasErrors = true;
    missingRefs = true;
  }
});

if (!missingRefs) {
  console.log("✅ All content type references exist");
}

// Validate content type structure
console.log("\n\n🏗️  Validating content type structure:");
initialContentTypes.forEach((contentType) => {
  const propertyIds = contentType.properties.map((p) => p.id);
  const duplicates = propertyIds.filter(
    (id, index) => propertyIds.indexOf(id) !== index
  );

  if (duplicates.length > 0) {
    console.error(
      `❌ Content type "${contentType.name}" has duplicate property IDs: ${duplicates.join(", ")}`
    );
    hasErrors = true;
    return;
  }

  // Check required property fields
  const invalidProps = contentType.properties.filter(
    (prop) => !prop.id || !prop.name || !prop.type
  );

  if (invalidProps.length > 0) {
    console.error(
      `❌ Content type "${contentType.name}" has ${invalidProps.length} invalid properties`
    );
    invalidProps.forEach((prop) => {
      if (!prop.id) console.error(`   • Property missing id`);
      else if (!prop.name)
        console.error(`   • Property "${prop.id}" missing name`);
      else if (!prop.type)
        console.error(`   • Property "${prop.id}" missing type`);
    });
    hasErrors = true;
  } else {
    console.log(`✅ ${contentType.name} (${contentType.properties.length} properties)`);
  }
});

// Validate property group naming consistency
console.log("\n\n📋 Validating property group naming:");

// Create a set of valid group names
const validGroupNames = new Set(initialPropertyGroups.map(g => g.name));

// Check for properties using undefined group names
const invalidGroupNames: string[] = [];
initialContentTypes.forEach((contentType) => {
  contentType.properties.forEach((prop) => {
    if (prop.groupName && !validGroupNames.has(prop.groupName)) {
      invalidGroupNames.push(
        `Content type "${contentType.name}" has property "${prop.name}" with invalid groupName "${prop.groupName}"`
      );
    }
  });
});

if (invalidGroupNames.length > 0) {
  console.error("❌ Properties using undefined property groups:");
  invalidGroupNames.forEach((msg) => console.error(`   • ${msg}`));
  console.error(`\nValid property groups: ${Array.from(validGroupNames).join(", ")}`);
  hasErrors = true;
} else {
  console.log(`✅ All property groups are valid (${validGroupNames.size} groups defined)`);
}

// Check for properties without groupName (except outline properties)
const missingGroupNames: string[] = [];
initialContentTypes.forEach((contentType) => {
  contentType.properties.forEach((prop) => {
    if (!prop.groupName && prop.type !== "outline") {
      missingGroupNames.push(
        `Content type "${contentType.name}" has property "${prop.name}" without groupName`
      );
    }
  });
});

if (missingGroupNames.length > 0) {
  console.warn("⚠️  Properties without groupName (will use default):");
  missingGroupNames.forEach((msg) => console.warn(`   • ${msg}`));
  // This is a warning, not an error
}

// Summary
console.log("\n" + "=".repeat(60));
if (hasErrors) {
  console.error("❌ Validation failed! Please fix the errors above.");
  process.exit(1);
} else {
  console.log("✅ All validation checks passed!");
  process.exit(0);
}
