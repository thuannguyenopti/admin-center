import { initialContentTypes, ContentType } from "@/app/db/initialData";

export interface PropertyDefinition {
  type: string;
  label: string;
  default?: any;
}

export interface BlockSchema {
  displayName: string;
  properties: Record<string, PropertyDefinition>;
}

/**
 * We map the ContentTypes from initialData to our UI schema.
 * In a production app, this would be generated from C# models.
 */
const mapContentTypesToSchemas = (): Record<string, BlockSchema> => {
  const schemas: Record<string, BlockSchema> = {};

  initialContentTypes.forEach((ct: ContentType) => {
    // Only map content types that are baseType "Block" or "Media" (for Image)
    if (ct.baseType === "Block" || ct.baseType === "Media") {
      // VB now uses ContentType IDs for strict alignment
      const vbType = ct.id; 
      
      schemas[vbType] = {
        displayName: ct.name,
        properties: {}
      };

      ct.properties.forEach(prop => {
        schemas[vbType].properties[prop.id] = {
          type: prop.type,
          label: prop.name,
          default: "" // Default value for new properties
        };
      });
    }
  });

  return schemas;
};

export const BLOCK_SCHEMAS = mapContentTypesToSchemas();
