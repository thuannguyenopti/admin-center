import { initialContentTypes, ContentType } from "@/app/db/initialData";

export interface PropertyDefinition {
    type: string;
    label: string;
    default?: any;
}

export interface BlockSchema {
    displayName: string;
    properties: Record<string, PropertyDefinition>;
    /** If set, this is a display-template variant of the referenced type. */
    variantOf?: string;
    /**
     * The `template` SelectOne option value for this variant (e.g. "outline").
     * Used to derive the Storybook story URL from the parent type's slug.
     */
    templateValue?: string;
    /** Override label shown in the registry style picker (defaults to templateValue). */
    displayLabel?: string;
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

// ---------------------------------------------------------------------------
// Display-template variant block types
// Each entry inherits its parent's properties and pre-sets displayTemplateKey.
// They appear as separate tiles in the element picker.
// ---------------------------------------------------------------------------

const buttonBase = BLOCK_SCHEMAS["ct-button"]?.properties ?? {};
const headingBase = BLOCK_SCHEMAS["ct-heading"]?.properties ?? {};
if (BLOCK_SCHEMAS["ct-heading"]) BLOCK_SCHEMAS["ct-heading"].displayLabel = "h1";

BLOCK_SCHEMAS["ct-button-outline"] = {
    displayName: "Button (Outline)",
    variantOf: "ct-button",
    templateValue: "outline",
    properties: {
        ...buttonBase,
        displayTemplateKey: { type: "string", label: "Display Template", default: "outlineButton" },
    },
};

BLOCK_SCHEMAS["ct-button-subtle"] = {
    displayName: "Button (Subtle)",
    variantOf: "ct-button",
    templateValue: "subtle",
    properties: {
        ...buttonBase,
        displayTemplateKey: { type: "string", label: "Display Template", default: "subtleButton" },
    },
};

BLOCK_SCHEMAS["ct-heading-h2"] = {
    displayName: "Heading H2",
    variantOf: "ct-heading",
    templateValue: "h-2",
    displayLabel: "h2",
    properties: {
        ...headingBase,
        displayTemplateKey: { type: "string", label: "Display Template", default: "h2Heading" },
    },
};

BLOCK_SCHEMAS["ct-heading-h3"] = {
    displayName: "Heading H3",
    variantOf: "ct-heading",
    templateValue: "h-3",
    displayLabel: "h3",
    properties: {
        ...headingBase,
        displayTemplateKey: { type: "string", label: "Display Template", default: "h3Heading" },
    },
};

BLOCK_SCHEMAS["ct-heading-h4"] = {
    displayName: "Heading H4",
    variantOf: "ct-heading",
    templateValue: "h-4",
    displayLabel: "h4",
    properties: {
        ...headingBase,
        displayTemplateKey: { type: "string", label: "Display Template", default: "h4Heading" },
    },
};

const heroBase = BLOCK_SCHEMAS["ct-hero"]?.properties ?? {};

BLOCK_SCHEMAS["ct-hero-centered"] = {
    displayName: "Hero (Centered)",
    variantOf: "ct-hero",
    templateValue: "centered",
    properties: {
        ...heroBase,
        displayTemplateKey: { type: "string", label: "Display Template", default: "centeredHero" },
    },
};

BLOCK_SCHEMAS["ct-hero-event"] = {
    displayName: "Hero (Event)",
    variantOf: "ct-hero",
    templateValue: "event",
    properties: {
        ...heroBase,
        displayTemplateKey: { type: "string", label: "Display Template", default: "eventHero" },
    },
};
