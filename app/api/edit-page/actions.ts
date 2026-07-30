<<<<<<< HEAD
import {
	insertElement,
	updateElementProperty,
	deleteElement,
	getSelectionForElement,
} from "@/app/components/vb/mutations";
import type {OutlineState} from "@/app/components/vb/types";
import {generateImage} from "@/app/lib/imageGeneration";
import {delay} from "@/app/lib/streaming";

// Action type definitions
export type AddImageAction = {
	action: "add_image";
	elementId: string;
	afterElementId?: string;
	beforeElementId?: string;
	imagePrompt: string;
	altText?: string;
};

export type UpdateTextAction = {
	action: "update_text";
	elementId: string;
	newText: string;
};

export type UpdateImageAction = {
	action: "update_image";
	elementId: string;
	imagePrompt: string;
	altText?: string;
};

export type DeleteElementAction = {
	action: "delete_element";
	elementId: string;
};

export type AddTextAction = {
	action: "add_text";
	elementId: string;
	afterElementId?: string;
	beforeElementId?: string;
	text: string;
	type: "heading" | "paragraph";
	level?: string;
	template?: string; // Visual style: default, prominent, subtle, accent-red, accent-blue
};

export type AddButtonAction = {
	action: "add_button";
	elementId: string;
	afterElementId?: string;
	beforeElementId?: string;
	label: string;
	template?: string; // primary, secondary, subtle
};

export type UpdatePropertyAction = {
	action: "update_property";
	elementId: string;
	property: string; // e.g., "template", "level", "label"
	value: any;
};

export type CreateSectionAction = {
	action: "create_section";
	sectionId: string;
	sectionName: string;
	rows: Array<{
		rowId: string;
		columns: Array<{
			columnId: string;
			elements: Array<{
				elementId: string;
				type: string;
				properties: Record<string, any>;
			}>;
		}>;
	}>;
};

export type EditAction =
	| AddImageAction
	| UpdateTextAction
	| UpdateImageAction
	| DeleteElementAction
	| AddTextAction
	| AddButtonAction
	| UpdatePropertyAction
	| CreateSectionAction;

export type AIResponse = {
	actions: EditAction[];
	summary: string;
};

// Validation function
function validateAction(action: EditAction, outline: OutlineState): boolean {
	switch (action.action) {
		case "add_image":
		case "add_text":
		case "add_button":
			// Validate insertion point exists (if specified)
			if (action.afterElementId && !outline.elements[action.afterElementId]) {
				console.error(`[Validation] afterElementId not found: ${action.afterElementId}`);
				return false;
			}
			if (action.beforeElementId && !outline.elements[action.beforeElementId]) {
				console.error(`[Validation] beforeElementId not found: ${action.beforeElementId}`);
				return false;
			}
			return true;

		case "update_text":
		case "update_image":
		case "update_property":
		case "delete_element":
			// Validate element exists
			if (!outline.elements[action.elementId]) {
				console.error(`[Validation] Element not found: ${action.elementId}`);
				return false;
			}
			return true;

		case "create_section":
			// Section creation doesn't need validation (creates from scratch)
			return true;

		default:
			console.error(`[Validation] Unknown action type:`, action);
			return false;
	}
}

// Main action executor
export async function executeActions(
	actions: EditAction[],
	outline: OutlineState,
	sendEvent: (event: string, data: any) => void,
	checklist: any[]
): Promise<OutlineState> {
	let currentOutline = outline;
	const pendingImages: Array<{elementId: string; prompt: string; alt: string}> = [];

	console.log("[Actions] Executing actions:", actions);

	// Phase 1: Execute structural changes (add, delete, update text)
	for (const action of actions) {
		if (!validateAction(action, currentOutline)) {
			console.warn(`[Actions] Skipping invalid action:`, action);
			continue;
		}

		switch (action.action) {
			case "add_image": {
				// Find where to insert
				console.log(`[Actions] Looking for element: ${action.afterElementId || action.beforeElementId}`);
				const selection = action.afterElementId
					? getSelectionForElement(currentOutline, action.afterElementId)
					: getSelectionForElement(currentOutline, action.beforeElementId || "");

				if (!selection) {
					console.error(`[Actions] Cannot find selection for element:`, action);
					console.error(`[Actions] Current outline tree:`, JSON.stringify(currentOutline.tree, null, 2).substring(0, 500));
					continue;
				}

				console.log(`[Actions] Found selection:`, selection);
				console.log(`[Actions] Inserting image element ${action.elementId}`);

				// Insert placeholder image element
				currentOutline = insertElement(
					currentOutline,
					selection,
					"ct-image-block",
					action.elementId,
					action.afterElementId ? "after" : "before"
				);

				console.log(`[Actions] Image element inserted, tree:`, JSON.stringify(currentOutline.tree, null, 2).substring(0, 500));

				// Queue for image generation
				pendingImages.push({
					elementId: action.elementId,
					prompt: action.imagePrompt,
					alt: action.altText || "",
				});
				break;
			}

			case "update_text": {
				console.log(`[Actions] Updating text for ${action.elementId}`);
				currentOutline = updateElementProperty(
					currentOutline,
					action.elementId,
					"text",
					action.newText
				);
				break;
			}

			case "update_image": {
				console.log(`[Actions] Queuing image update for ${action.elementId}`);
				// Queue for image generation
				pendingImages.push({
					elementId: action.elementId,
					prompt: action.imagePrompt,
					alt: action.altText || "",
				});
				break;
			}

			case "delete_element": {
				console.log(`[Actions] Deleting element ${action.elementId}`);
				currentOutline = deleteElement(currentOutline, action.elementId);
				break;
			}

			case "add_text": {
				const selection = action.afterElementId
					? getSelectionForElement(currentOutline, action.afterElementId)
					: getSelectionForElement(currentOutline, action.beforeElementId || "");

				if (!selection) {
					console.warn(`[Actions] Cannot find selection for element:`, action);
					continue;
				}

				const elementType = action.type === "heading" ? "ct-heading" : "ct-text";
				console.log(`[Actions] Inserting ${elementType} element ${action.elementId}`);

				currentOutline = insertElement(
					currentOutline,
					selection,
					elementType,
					action.elementId,
					action.afterElementId ? "after" : "before"
				);

				// Set text property
				currentOutline = updateElementProperty(
					currentOutline,
					action.elementId,
					"text",
					action.text
				);

				// Set level for headings
				if (action.type === "heading" && action.level) {
					currentOutline = updateElementProperty(
						currentOutline,
						action.elementId,
						"level",
						action.level
					);
				}

				// Set template (visual style)
				if (action.template) {
					currentOutline = updateElementProperty(
						currentOutline,
						action.elementId,
						"template",
						action.template
					);
				}
				break;
			}

			case "add_button": {
				const selection = action.afterElementId
					? getSelectionForElement(currentOutline, action.afterElementId)
					: getSelectionForElement(currentOutline, action.beforeElementId || "");

				if (!selection) {
					console.warn(`[Actions] Cannot find selection for element:`, action);
					continue;
				}

				console.log(`[Actions] Inserting button element ${action.elementId}`);

				currentOutline = insertElement(
					currentOutline,
					selection,
					"ct-button",
					action.elementId,
					action.afterElementId ? "after" : "before"
				);

				// Set label property
				currentOutline = updateElementProperty(
					currentOutline,
					action.elementId,
					"label",
					action.label
				);

				// Set template (visual style)
				if (action.template) {
					currentOutline = updateElementProperty(
						currentOutline,
						action.elementId,
						"template",
						action.template
					);
				}
				break;
			}

			case "update_property": {
				console.log(`[Actions] Updating property ${action.property} for ${action.elementId}`);
				currentOutline = updateElementProperty(
					currentOutline,
					action.elementId,
					action.property,
					action.value
				);
				break;
			}

			case "create_section": {
				console.log(`[Actions] Creating section ${action.sectionId}: ${action.sectionName}`);

				// Build section tree structure
				const newSection = {
					id: action.sectionId,
					name: action.sectionName,
					open: true,
					children: action.rows.map(row => ({
						id: row.rowId,
						open: true,
						children: row.columns.map(col => ({
							id: col.columnId,
							open: true,
							elements: col.elements.map(el => ({id: el.elementId}))
						}))
					}))
				};

				// Add elements to outline.elements
				const newElements: Record<string, any> = {};
				for (const row of action.rows) {
					for (const col of row.columns) {
						for (const el of col.elements) {
							newElements[el.elementId] = {
								type: el.type,
								properties: el.properties
							};

							// If element has imagePrompt property, queue for generation
							if (el.properties.imagePrompt) {
								pendingImages.push({
									elementId: el.elementId,
									prompt: el.properties.imagePrompt.prompt,
									alt: el.properties.imagePrompt.alt || ""
								});
								// Remove imagePrompt from properties (will be replaced with image URL)
								delete newElements[el.elementId].properties.imagePrompt;
							}
						}
					}
				}

				// Add section to tree
				currentOutline = {
					...currentOutline,
					tree: [...currentOutline.tree, newSection],
					elements: {
						...currentOutline.elements,
						...newElements
					}
				};
				break;
			}
		}
	}

	// Phase 2: Generate images with progress updates
	if (pendingImages.length > 0) {
		console.log(`[Actions] Generating ${pendingImages.length} images`);

		for (let i = 0; i < pendingImages.length; i++) {
			const checklistIndex = 3 + i; // After "Applying changes"
			checklist[checklistIndex].status = "running";
			sendEvent("checklist", {items: checklist});

			const {elementId, prompt, alt} = pendingImages[i];
			console.log(`[Actions] Generating image ${i + 1}/${pendingImages.length}: ${prompt.substring(0, 50)}...`);

			const generatedImage = await generateImage({prompt, alt});

			// Update element with generated URL
			console.log(`[Actions] Setting image URL for ${elementId}: ${generatedImage.url.substring(0, 80)}...`);
			currentOutline = updateElementProperty(currentOutline, elementId, "image", generatedImage.url);

			checklist[checklistIndex].status = "completed";
			sendEvent("checklist", {items: checklist});
			await delay(500);
		}
	}

	console.log("[Actions] All actions completed successfully");
	return currentOutline;
}

// Helper to simplify tree structure for AI
export function simplifyTree(tree: any[]): string {
	if (!tree || !Array.isArray(tree) || tree.length === 0) {
		return "(empty tree)";
	}
	return tree
		.map((section, si) => {
			if (!section.children || section.children.length === 0) {
				return `Section ${si}: "${section.name}" (empty)`;
			}
			return (
				`Section ${si}: "${section.name}"\n` +
				section.children
					.map((row: any, ri: number) => {
						if (!row.children || row.children.length === 0) {
							return `  Row ${ri}: (empty)`;
						}
						return (
							`  Row ${ri}:\n` +
							row.children
								.map((col: any, ci: number) => {
									const elementRefs = col.elements || [];
									const elementIds = elementRefs.map((e: any) => e.id).join(", ");
									return `    Column ${ci}: [${elementIds}]`;
								})
								.join("\n")
						);
					})
					.join("\n")
			);
		})
		.join("\n\n");
}
=======
import {
	insertElement,
	updateElementProperty,
	deleteElement,
	getSelectionForElement,
} from "@/app/components/vb/mutations";
import type {OutlineState} from "@/app/components/vb/types";
import {generateImage} from "@/app/lib/imageGeneration";
import {delay} from "@/app/lib/streaming";

// Action type definitions
export type AddImageAction = {
	action: "add_image";
	elementId: string;
	afterElementId?: string;
	beforeElementId?: string;
	imagePrompt: string;
	altText?: string;
};

export type UpdateTextAction = {
	action: "update_text";
	elementId: string;
	newText: string;
};

export type UpdateImageAction = {
	action: "update_image";
	elementId: string;
	imagePrompt: string;
	altText?: string;
};

export type DeleteElementAction = {
	action: "delete_element";
	elementId: string;
};

export type AddTextAction = {
	action: "add_text";
	elementId: string;
	afterElementId?: string;
	beforeElementId?: string;
	text: string;
	type: "heading" | "paragraph";
	level?: string;
	template?: string; // Visual style: default, prominent, subtle, accent-red, accent-blue
};

export type AddButtonAction = {
	action: "add_button";
	elementId: string;
	afterElementId?: string;
	beforeElementId?: string;
	label: string;
	template?: string; // primary, secondary, subtle
};

export type UpdatePropertyAction = {
	action: "update_property";
	elementId: string;
	property: string; // e.g., "template", "level", "label"
	value: any;
};

export type CreateSectionAction = {
	action: "create_section";
	sectionId: string;
	sectionName: string;
	rows: Array<{
		rowId: string;
		columns: Array<{
			columnId: string;
			elements: Array<{
				elementId: string;
				type: string;
				properties: Record<string, any>;
			}>;
		}>;
	}>;
};

export type EditAction =
	| AddImageAction
	| UpdateTextAction
	| UpdateImageAction
	| DeleteElementAction
	| AddTextAction
	| AddButtonAction
	| UpdatePropertyAction
	| CreateSectionAction;

export type AIResponse = {
	actions: EditAction[];
	summary: string;
};

// Validation function
function validateAction(action: EditAction, outline: OutlineState): boolean {
	switch (action.action) {
		case "add_image":
		case "add_text":
		case "add_button":
			// Validate insertion point exists (if specified)
			if (action.afterElementId && !outline.elements[action.afterElementId]) {
				console.error(`[Validation] afterElementId not found: ${action.afterElementId}`);
				return false;
			}
			if (action.beforeElementId && !outline.elements[action.beforeElementId]) {
				console.error(`[Validation] beforeElementId not found: ${action.beforeElementId}`);
				return false;
			}
			return true;

		case "update_text":
		case "update_image":
		case "update_property":
		case "delete_element":
			// Validate element exists
			if (!outline.elements[action.elementId]) {
				console.error(`[Validation] Element not found: ${action.elementId}`);
				return false;
			}
			return true;

		case "create_section":
			// Section creation doesn't need validation (creates from scratch)
			return true;

		default:
			console.error(`[Validation] Unknown action type:`, action);
			return false;
	}
}

// Main action executor
export async function executeActions(
	actions: EditAction[],
	outline: OutlineState,
	sendEvent: (event: string, data: any) => void,
	checklist: any[]
): Promise<OutlineState> {
	let currentOutline = outline;
	const pendingImages: Array<{elementId: string; prompt: string; alt: string}> = [];

	console.log("[Actions] Executing actions:", actions);

	// Phase 1: Execute structural changes (add, delete, update text)
	for (const action of actions) {
		if (!validateAction(action, currentOutline)) {
			console.warn(`[Actions] Skipping invalid action:`, action);
			continue;
		}

		switch (action.action) {
			case "add_image": {
				// Find where to insert
				console.log(`[Actions] Looking for element: ${action.afterElementId || action.beforeElementId}`);
				const selection = action.afterElementId
					? getSelectionForElement(currentOutline, action.afterElementId)
					: getSelectionForElement(currentOutline, action.beforeElementId || "");

				if (!selection) {
					console.error(`[Actions] Cannot find selection for element:`, action);
					console.error(`[Actions] Current outline tree:`, JSON.stringify(currentOutline.tree, null, 2).substring(0, 500));
					continue;
				}

				console.log(`[Actions] Found selection:`, selection);
				console.log(`[Actions] Inserting image element ${action.elementId}`);

				// Insert placeholder image element
				currentOutline = insertElement(
					currentOutline,
					selection,
					"ct-image-block",
					action.elementId,
					action.afterElementId ? "after" : "before"
				);

				console.log(`[Actions] Image element inserted, tree:`, JSON.stringify(currentOutline.tree, null, 2).substring(0, 500));

				// Queue for image generation
				pendingImages.push({
					elementId: action.elementId,
					prompt: action.imagePrompt,
					alt: action.altText || "",
				});
				break;
			}

			case "update_text": {
				console.log(`[Actions] Updating text for ${action.elementId}`);
				currentOutline = updateElementProperty(
					currentOutline,
					action.elementId,
					"text",
					action.newText
				);
				break;
			}

			case "update_image": {
				console.log(`[Actions] Queuing image update for ${action.elementId}`);
				// Queue for image generation
				pendingImages.push({
					elementId: action.elementId,
					prompt: action.imagePrompt,
					alt: action.altText || "",
				});
				break;
			}

			case "delete_element": {
				console.log(`[Actions] Deleting element ${action.elementId}`);
				currentOutline = deleteElement(currentOutline, action.elementId);
				break;
			}

			case "add_text": {
				const selection = action.afterElementId
					? getSelectionForElement(currentOutline, action.afterElementId)
					: getSelectionForElement(currentOutline, action.beforeElementId || "");

				if (!selection) {
					console.warn(`[Actions] Cannot find selection for element:`, action);
					continue;
				}

				const elementType = action.type === "heading" ? "ct-heading" : "ct-text";
				console.log(`[Actions] Inserting ${elementType} element ${action.elementId}`);

				currentOutline = insertElement(
					currentOutline,
					selection,
					elementType,
					action.elementId,
					action.afterElementId ? "after" : "before"
				);

				// Set text property
				currentOutline = updateElementProperty(
					currentOutline,
					action.elementId,
					"text",
					action.text
				);

				// Set level for headings
				if (action.type === "heading" && action.level) {
					currentOutline = updateElementProperty(
						currentOutline,
						action.elementId,
						"level",
						action.level
					);
				}

				// Set template (visual style)
				if (action.template) {
					currentOutline = updateElementProperty(
						currentOutline,
						action.elementId,
						"template",
						action.template
					);
				}
				break;
			}

			case "add_button": {
				const selection = action.afterElementId
					? getSelectionForElement(currentOutline, action.afterElementId)
					: getSelectionForElement(currentOutline, action.beforeElementId || "");

				if (!selection) {
					console.warn(`[Actions] Cannot find selection for element:`, action);
					continue;
				}

				console.log(`[Actions] Inserting button element ${action.elementId}`);

				currentOutline = insertElement(
					currentOutline,
					selection,
					"ct-button",
					action.elementId,
					action.afterElementId ? "after" : "before"
				);

				// Set label property
				currentOutline = updateElementProperty(
					currentOutline,
					action.elementId,
					"label",
					action.label
				);

				// Set template (visual style)
				if (action.template) {
					currentOutline = updateElementProperty(
						currentOutline,
						action.elementId,
						"template",
						action.template
					);
				}
				break;
			}

			case "update_property": {
				console.log(`[Actions] Updating property ${action.property} for ${action.elementId}`);
				currentOutline = updateElementProperty(
					currentOutline,
					action.elementId,
					action.property,
					action.value
				);
				break;
			}

			case "create_section": {
				console.log(`[Actions] Creating section ${action.sectionId}: ${action.sectionName}`);

				// Build section tree structure
				const newSection = {
					id: action.sectionId,
					name: action.sectionName,
					open: true,
					children: action.rows.map(row => ({
						id: row.rowId,
						open: true,
						children: row.columns.map(col => ({
							id: col.columnId,
							open: true,
							elements: col.elements.map(el => ({id: el.elementId}))
						}))
					}))
				};

				// Add elements to outline.elements
				const newElements: Record<string, any> = {};
				for (const row of action.rows) {
					for (const col of row.columns) {
						for (const el of col.elements) {
							newElements[el.elementId] = {
								type: el.type,
								properties: el.properties
							};

							// If element has imagePrompt property, queue for generation
							if (el.properties.imagePrompt) {
								pendingImages.push({
									elementId: el.elementId,
									prompt: el.properties.imagePrompt.prompt,
									alt: el.properties.imagePrompt.alt || ""
								});
								// Remove imagePrompt from properties (will be replaced with image URL)
								delete newElements[el.elementId].properties.imagePrompt;
							}
						}
					}
				}

				// Add section to tree
				currentOutline = {
					...currentOutline,
					tree: [...currentOutline.tree, newSection],
					elements: {
						...currentOutline.elements,
						...newElements
					}
				};
				break;
			}
		}
	}

	// Phase 2: Generate images with progress updates
	if (pendingImages.length > 0) {
		console.log(`[Actions] Generating ${pendingImages.length} images`);

		for (let i = 0; i < pendingImages.length; i++) {
			const checklistIndex = 3 + i; // After "Applying changes"
			checklist[checklistIndex].status = "running";
			sendEvent("checklist", {items: checklist});

			const {elementId, prompt, alt} = pendingImages[i];
			console.log(`[Actions] Generating image ${i + 1}/${pendingImages.length}: ${prompt.substring(0, 50)}...`);

			const generatedImage = await generateImage({prompt, alt});

			// Update element with generated URL
			console.log(`[Actions] Setting image URL for ${elementId}: ${generatedImage.url.substring(0, 80)}...`);
			currentOutline = updateElementProperty(currentOutline, elementId, "image", generatedImage.url);

			checklist[checklistIndex].status = "completed";
			sendEvent("checklist", {items: checklist});
			await delay(500);
		}
	}

	console.log("[Actions] All actions completed successfully");
	return currentOutline;
}

// Helper to simplify tree structure for AI
export function simplifyTree(tree: any[]): string {
	if (!tree || !Array.isArray(tree) || tree.length === 0) {
		return "(empty tree)";
	}
	return tree
		.map((section, si) => {
			if (!section.children || section.children.length === 0) {
				return `Section ${si}: "${section.name}" (empty)`;
			}
			return (
				`Section ${si}: "${section.name}"\n` +
				section.children
					.map((row: any, ri: number) => {
						if (!row.children || row.children.length === 0) {
							return `  Row ${ri}: (empty)`;
						}
						return (
							`  Row ${ri}:\n` +
							row.children
								.map((col: any, ci: number) => {
									const elementRefs = col.elements || [];
									const elementIds = elementRefs.map((e: any) => e.id).join(", ");
									return `    Column ${ci}: [${elementIds}]`;
								})
								.join("\n")
						);
					})
					.join("\n")
			);
		})
		.join("\n\n");
}
>>>>>>> origin/main
