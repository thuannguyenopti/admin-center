/**
 * Display Template Utilities
 *
 * Helper functions for finding, filtering, and applying display templates.
 * Includes AI-friendly semantic tag search and default setting application.
 */

import { DisplayTemplate } from "../types";
import { DISPLAY_TEMPLATES } from "./displayTemplates";

/**
 * Find a template by semantic tag
 *
 * @param tag - Semantic tag to search for (e.g., "dark", "prominent", "minimal")
 * @param filters - Optional filters to narrow search
 * @returns Template key if found, undefined otherwise
 *
 * @example
 * // AI: "make this section dark"
 * const key = findTemplateBySemanticTag("dark", {baseType: "section"});
 * // Returns: "darkSection"
 */
export function findTemplateBySemanticTag(
	tag: string,
	filters?: {
		baseType?: "experience" | "section" | "component";
		contentType?: string;
		nodeType?: "row" | "column";
	}
): string | undefined {
	const normalizedTag = tag.toLowerCase().trim();

	// Filter templates by type first
	let templates = DISPLAY_TEMPLATES;

	if (filters?.baseType) {
		templates = templates.filter(t => t.baseType === filters.baseType);
	}

	if (filters?.contentType) {
		templates = templates.filter(t => t.contentType === filters.contentType);
	}

	if (filters?.nodeType) {
		templates = templates.filter(t => t.nodeType === filters.nodeType);
	}

	// Search for semantic tag
	const template = templates.find(t =>
		t.semanticTags.some(tag => tag.toLowerCase() === normalizedTag)
	);

	return template?.key;
}

/**
 * Get all templates for a specific base type
 *
 * @param baseType - Base type to filter by
 * @returns Array of templates
 */
export function getTemplatesByBaseType(
	baseType: "experience" | "section" | "component"
): DisplayTemplate[] {
	return DISPLAY_TEMPLATES.filter(t => t.baseType === baseType);
}

/**
 * Get all templates for a specific content type
 *
 * @param contentType - Content type to filter by (e.g., "ct-heading", "ct-text")
 * @returns Array of templates
 */
export function getTemplatesByContentType(
	contentType: string
): DisplayTemplate[] {
	return DISPLAY_TEMPLATES.filter(t => t.contentType === contentType);
}

/**
 * Get all templates for a specific node type
 *
 * @param nodeType - Node type to filter by ("row" or "column")
 * @returns Array of templates
 */
export function getTemplatesByNodeType(
	nodeType: "row" | "column"
): DisplayTemplate[] {
	return DISPLAY_TEMPLATES.filter(t => t.nodeType === nodeType);
}

/**
 * Get the default template for a given type
 *
 * @param filters - Type filters
 * @returns Default template if found, undefined otherwise
 */
export function getDefaultTemplate(
	filters: {
		baseType?: "experience" | "section" | "component";
		contentType?: string;
		nodeType?: "row" | "column";
	}
): DisplayTemplate | undefined {
	let templates = DISPLAY_TEMPLATES;

	if (filters.baseType) {
		templates = templates.filter(t => t.baseType === filters.baseType);
	}

	if (filters.contentType) {
		templates = templates.filter(t => t.contentType === filters.contentType);
	}

	if (filters.nodeType) {
		templates = templates.filter(t => t.nodeType === filters.nodeType);
	}

	return templates.find(t => t.isDefault === true);
}

/**
 * Get a template by its key
 *
 * @param key - Template key
 * @returns Template if found, undefined otherwise
 */
export function getTemplateByKey(key: string): DisplayTemplate | undefined {
	return DISPLAY_TEMPLATES.find(t => t.key === key);
}

/**
 * Find a template key by its templateValue (e.g. "h-2" → "h2Heading")
 */
export function findTemplateByValue(
	templateValue: string,
	filters?: { contentType?: string; baseType?: string }
): string | undefined {
	let templates = DISPLAY_TEMPLATES;
	if (filters?.contentType) templates = templates.filter(t => t.contentType === filters.contentType);
	if (filters?.baseType) templates = templates.filter(t => t.baseType === filters.baseType as any);
	return templates.find(t => t.templateValue === templateValue)?.key;
}

/**
 * Apply default settings for a template
 *
 * For AI use: when applying a template, use its default settings
 *
 * @param templateKey - Template key
 * @returns Array of display settings with default values
 *
 * @example
 * // AI applies "darkSection" template
 * const settings = applyDefaultSettings("darkSection");
 * // Returns: [{key: "colorScheme", value: "dark"}, {key: "spacing", value: "default"}]
 */
export function applyDefaultSettings(
	templateKey: string
): Array<{key: string; value: string}> {
	const template = getTemplateByKey(templateKey);

	if (!template) {
		console.warn(`[Display Template Utils] Template "${templateKey}" not found`);
		return [];
	}

	// Convert defaultSettings object to array format
	return Object.entries(template.defaultSettings).map(([key, value]) => ({
		key,
		value
	}));
}

/**
 * Merge user settings with defaults
 *
 * Fills in missing settings with defaults from the template
 *
 * @param templateKey - Template key
 * @param userSettings - User-provided settings (may be incomplete)
 * @returns Complete settings array with defaults filled in
 */
export function mergeWithDefaults(
	templateKey: string,
	userSettings: Array<{key: string; value: string}> = []
): Array<{key: string; value: string}> {
	const template = getTemplateByKey(templateKey);

	if (!template) {
		return userSettings;
	}

	// Start with defaults
	const defaults = applyDefaultSettings(templateKey);

	// Override with user settings
	const merged = [...defaults];

	userSettings.forEach(userSetting => {
		const existingIndex = merged.findIndex(s => s.key === userSetting.key);
		if (existingIndex >= 0) {
			merged[existingIndex] = userSetting;
		} else {
			merged.push(userSetting);
		}
	});

	return merged;
}

/**
 * Validate that a setting value is valid for a template
 *
 * @param templateKey - Template key
 * @param settingKey - Setting key
 * @param value - Value to validate
 * @returns true if valid, false otherwise
 */
export function isValidSettingValue(
	templateKey: string,
	settingKey: string,
	value: string
): boolean {
	const template = getTemplateByKey(templateKey);

	if (!template) return false;

	const setting = template.settings[settingKey];

	if (!setting) return false;

	// Checkbox settings accept "true" or "false"
	if (setting.editor === "checkbox") {
		return value === "true" || value === "false";
	}

	// Select settings must match a choice
	if (setting.editor === "select") {
		return setting.choices ? value in setting.choices : false;
	}

	return false;
}

/**
 * Get all available choices for a setting
 *
 * @param templateKey - Template key
 * @param settingKey - Setting key
 * @returns Array of choice keys, or empty array if not found
 */
export function getSettingChoices(
	templateKey: string,
	settingKey: string
): string[] {
	const template = getTemplateByKey(templateKey);

	if (!template) return [];

	const setting = template.settings[settingKey];

	if (!setting || !setting.choices) return [];

	return Object.keys(setting.choices);
}

/**
 * Get display name for a setting choice
 *
 * @param templateKey - Template key
 * @param settingKey - Setting key
 * @param choiceKey - Choice key
 * @returns Display name, or choiceKey if not found
 */
export function getChoiceDisplayName(
	templateKey: string,
	settingKey: string,
	choiceKey: string
): string {
	const template = getTemplateByKey(templateKey);

	if (!template) return choiceKey;

	const setting = template.settings[settingKey];

	if (!setting || !setting.choices) return choiceKey;

	const choice = setting.choices[choiceKey];

	return choice?.displayName || choiceKey;
}
