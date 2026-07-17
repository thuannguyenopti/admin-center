/**
 * Template Resolution Utilities
 *
 * Helper functions to resolve template IDs to CSS classes for elements and sections
 */

import { ELEMENT_TEMPLATES, SECTION_TEMPLATES } from './templates';

/**
 * Helper to extract property values from element properties object
 * Handles both direct values and {value: ...} structure
 */
function getProperty(properties: any, ...names: string[]): any {
    if (!properties) return undefined;

    for (const name of names) {
        const prop = properties[name];
        if (prop !== undefined) {
            // Handle {value: ...} structure
            if (prop && typeof prop === 'object' && 'value' in prop) {
                return prop.value;
            }
            return prop;
        }
    }

    return undefined;
}

/**
 * Get CSS classes for an element based on its template
 *
 * @param elementType - The element's content type (e.g., "ct-heading")
 * @param properties - The element's properties object
 * @param additionalProps - Additional props for conditional classes (e.g., {hasBgImage: true})
 * @returns Combined CSS class string
 */
export function getTemplateClasses(
    elementType: string,
    properties: any,
    additionalProps: any = {}
): string {
    // 1. Get template ID from element properties or use default
    const templateId = getProperty(properties, "template", "Template");

    const elementTemplates = ELEMENT_TEMPLATES[elementType];
    if (!elementTemplates) {
        console.warn(`[Template System] No templates defined for element type: ${elementType}`);
        return "";
    }

    const effectiveTemplateId = templateId || elementTemplates.defaultTemplate;

    // 2. Find template definition
    const template = elementTemplates.templates.find(t => t.id === effectiveTemplateId);

    // 3. Fallback to default if template not found
    if (!template) {
        console.warn(
            `[Template System] Template "${effectiveTemplateId}" not found for ${elementType}, using default`
        );
        const defaultTemplate = elementTemplates.templates.find(
            t => t.id === elementTemplates.defaultTemplate
        );
        if (!defaultTemplate) {
            return "";
        }
        const baseClasses = defaultTemplate.cssClasses;
        const conditionalClasses = defaultTemplate.conditionalClasses?.(additionalProps) || "";
        return `${baseClasses} ${conditionalClasses}`.trim();
    }

    // 4. Combine base classes + conditional classes
    const baseClasses = template.cssClasses;
    const conditionalClasses = template.conditionalClasses?.(additionalProps) || "";

    return `${baseClasses} ${conditionalClasses}`.trim();
}

/**
 * Get CSS classes for a section based on its template
 *
 * @param properties - The section's properties object (from outline or section data)
 * @param additionalProps - Additional props for conditional classes
 * @returns Combined CSS class string
 */
export function getSectionTemplateClasses(
    section: any,
    additionalProps: any = {}
): string {
    // 1. Get section type and template ID from section object
    // Sections store template directly (section.template), not in properties object
    const sectionType = section.type || "ct-section";
    const templateId = section.template;

    const sectionTemplates = SECTION_TEMPLATES[sectionType];
    if (!sectionTemplates) {
        console.warn(`[Template System] Section type "${sectionType}" not found, using ct-section`);
        return getSectionTemplateClasses({ ...section, type: "ct-section" }, additionalProps);
    }

    const effectiveTemplateId = templateId || sectionTemplates.defaultTemplate;

    // 2. Find template definition
    const template = sectionTemplates.templates.find(t => t.id === effectiveTemplateId);

    // 3. Fallback to default if template not found
    if (!template) {
        console.warn(
            `[Template System] Section template "${effectiveTemplateId}" not found, using default`
        );
        const defaultTemplate = sectionTemplates.templates.find(
            t => t.id === sectionTemplates.defaultTemplate
        );
        if (!defaultTemplate) {
            return "";
        }
        const baseClasses = defaultTemplate.cssClasses;
        const conditionalClasses = defaultTemplate.conditionalClasses?.(additionalProps) || "";
        return `${baseClasses} ${conditionalClasses}`.trim();
    }

    // 4. Combine base classes + conditional classes
    const baseClasses = template.cssClasses;
    const conditionalClasses = template.conditionalClasses?.(additionalProps) || "";

    return `${baseClasses} ${conditionalClasses}`.trim();
}

/**
 * Get available templates for an element type
 * Useful for building template selection UI
 *
 * @param elementType - The element's content type
 * @returns Array of template definitions
 */
export function getAvailableTemplates(elementType: string) {
    const elementTemplates = ELEMENT_TEMPLATES[elementType];
    if (!elementTemplates) {
        return [];
    }
    return elementTemplates.templates;
}

/**
 * Get available section templates
 * Useful for building section template selection UI
 *
 * @param sectionType - The section's type (e.g., "ct-section")
 * @returns Array of section template definitions
 */
export function getAvailableSectionTemplates(sectionType: string = "ct-section") {
    const sectionTemplates = SECTION_TEMPLATES[sectionType];
    if (!sectionTemplates) {
        console.warn(`[Template System] Section type "${sectionType}" not found, using ct-section`);
        return SECTION_TEMPLATES["ct-section"]?.templates || [];
    }
    return sectionTemplates.templates;
}

/**
 * Find template by semantic tag
 * Used by AI to map natural language to template IDs
 *
 * @param elementType - The element's content type
 * @param semanticTag - Natural language descriptor (e.g., "red", "prominent")
 * @returns Template ID if found, undefined otherwise
 */
export function findTemplateBySemanticTag(
    elementType: string,
    semanticTag: string
): string | undefined {
    const elementTemplates = ELEMENT_TEMPLATES[elementType];
    if (!elementTemplates) {
        return undefined;
    }

    const normalizedTag = semanticTag.toLowerCase().trim();
    const template = elementTemplates.templates.find(t =>
        t.semanticTags.some(tag => tag.toLowerCase() === normalizedTag)
    );

    return template?.id;
}

/**
 * Find section template by semantic tag
 *
 * @param semanticTag - Natural language descriptor
 * @param sectionType - Optional section type to search within (defaults to all types)
 * @returns Template ID if found, undefined otherwise
 */
export function findSectionTemplateBySemanticTag(
    semanticTag: string,
    sectionType?: string
): string | undefined {
    const normalizedTag = semanticTag.toLowerCase().trim();

    // If section type specified, search only that type
    if (sectionType && SECTION_TEMPLATES[sectionType]) {
        const template = SECTION_TEMPLATES[sectionType].templates.find(t =>
            t.semanticTags.some(tag => tag.toLowerCase() === normalizedTag)
        );
        return template?.id;
    }

    // Otherwise search all section types
    for (const typeKey of Object.keys(SECTION_TEMPLATES)) {
        const sectionTemplates = SECTION_TEMPLATES[typeKey];
        const template = sectionTemplates.templates.find(t =>
            t.semanticTags.some(tag => tag.toLowerCase() === normalizedTag)
        );
        if (template) {
            return template.id;
        }
    }

    return undefined;
}
