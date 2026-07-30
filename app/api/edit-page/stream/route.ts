<<<<<<< HEAD
import {NextRequest} from "next/server";
import {STRIDE_SHORT_CONTEXT} from "../../ai-context";
import {getContentType} from "@/app/db/initialData";
import {generateImage} from "@/app/lib/imageGeneration";
import {openai} from "@/app/lib/openai";
import {createSSEStream, ChecklistItem, delay, sseHeaders} from "@/app/lib/streaming";
import {executeActions, simplifyTree, type AIResponse} from "../actions";

async function editOutlineContent(
	instructions: string,
	currentOutlines: any[],
	sendEvent: (event: string, data: any) => void,
	checklist: ChecklistItem[]
) {
	const outline = currentOutlines[0]; // Get first outline

	console.log("[Edit Page] Outline structure:", {
		treeSections: outline.tree?.length || 0,
		elementCount: Object.keys(outline.elements || {}).length
	});

	// Check if we're creating from scratch or editing existing content
	const isEmptyOutline = !outline.tree || outline.tree.length === 0 ||
		(outline.tree.length === 1 && (!outline.tree[0].children || outline.tree[0].children.length === 0));

	console.log("[Edit Page] Empty outline:", isEmptyOutline);

	// Simplified structure for AI
	const elementsView = isEmptyOutline ? "{}" : JSON.stringify(outline.elements, null, 2);
	const treeView = isEmptyOutline ? "(empty - use create_section actions to build the page)" : simplifyTree(outline.tree);

	console.log("[Edit Page] Tree view for AI:", treeView);

	const systemPrompt = `You are ${isEmptyOutline ? 'creating' : 'editing'} a web page's visual builder content.

${STRIDE_SHORT_CONTEXT}

Current page elements:
${elementsView}

Current tree structure:
${treeView}

${isEmptyOutline ?
`The page is currently empty. Use create_section actions to build the page structure from scratch.
When creating a page, think about:
1. What sections does this page need? (Hero, Features, Pricing, CTA, etc.)
2. How many columns per section? (1 for full-width, 2-3 for side-by-side content)
3. What elements go in each section? (headings, text, buttons, images)

Create multiple sections if needed to fulfill the user's request.` :
`Apply the user's requested changes by modifying, adding, or removing existing content.`}

AVAILABLE ACTIONS:

1. add_image: Add a new image element
   {
     "action": "add_image",
     "elementId": "ele-new-unique-id",
     "afterElementId": "ele-existing-id",  // Insert after this element (or use beforeElementId)
     "imagePrompt": "Detailed DALL-E generation prompt",
     "altText": "Image description"
   }

2. update_text: Change text content of existing element
   {
     "action": "update_text",
     "elementId": "ele-heading-1",
     "newText": "Updated headline text"
   }

3. update_image: Replace an existing image
   {
     "action": "update_image",
     "elementId": "ele-img-1",
     "imagePrompt": "New DALL-E generation prompt",
     "altText": "New alt text"
   }

4. delete_element: Remove an element
   {
     "action": "delete_element",
     "elementId": "ele-to-remove"
   }

5. add_text: Add new text or heading
   {
     "action": "add_text",
     "elementId": "ele-new-text-id",
     "afterElementId": "ele-existing-id",
     "text": "New text content",
     "type": "heading" | "paragraph",
     "level": "h2",  // Only for type: "heading" (h1, h2, h3, h4, h5, h6)
     "template": "default"  // Optional visual style (see VISUAL STYLES below)
   }

6. add_button: Add a new button element
   {
     "action": "add_button",
     "elementId": "ele-new-button-id",
     "afterElementId": "ele-existing-id",
     "label": "Click here",
     "template": "primary"  // Optional: primary, secondary, subtle
   }

7. update_property: Change any element property (visual style, level, etc.)
   {
     "action": "update_property",
     "elementId": "ele-heading-1",
     "property": "template",  // Property name (template, level, label, etc.)
     "value": "prominent"     // New value
   }

8. create_section: Create a complete new section with rows, columns, and elements
   {
     "action": "create_section",
     "sectionId": "sec-new-features",
     "sectionName": "Features",
     "rows": [
       {
         "rowId": "row-features-1",
         "columns": [
           {
             "columnId": "col-features-1",
             "elements": [
               {
                 "elementId": "ele-feature-heading",
                 "type": "ct-heading",
                 "properties": {
                   "text": { "value": "Fast Performance" },
                   "level": { "value": "h3" },
                   "template": { "value": "default" }
                 }
               },
               {
                 "elementId": "ele-feature-text",
                 "type": "ct-text",
                 "properties": {
                   "text": { "value": "Lightning fast speeds." }
                 }
               }
             ]
           }
         ]
       }
     ]
   }

VISUAL STYLES (template property):

ct-heading templates:
- "default" - standard heading
- "prominent" - large, eye-catching (use for: make it bigger, emphasize, hero)
- "subtle" - smaller, understated (use for: make it smaller, de-emphasize, quiet)
- "accent-red" - red color (use for: make it red, danger, alert, warning)
- "accent-blue" - blue color (use for: make it blue, primary color, brand)

ct-text templates:
- "default" - standard text
- "prominent" - larger, emphasis (use for: make it bigger, important, emphasize)
- "subtle" - smaller, secondary (use for: make it smaller, muted, de-emphasize)

ct-button templates:
- "primary" - main CTA style (use for: primary, main action, prominent)
- "secondary" - outline style (use for: secondary, alternative, outline)
- "subtle" - text-like, minimal (use for: subtle, link-like, minimal)

COMMON OPERATIONS:
- "make the heading red" → update_property with property="template", value="accent-red"
- "make it more prominent" → update_property with property="template", value="prominent"
- "tone it down" → update_property with property="template", value="subtle"
- "change to h3" → update_property with property="level", value="h3"
- "make the button secondary" → update_property with property="template", value="secondary"
- "remove the button" → delete_element

Return format:
{
  "actions": [/* array of action objects */],
  "summary": "Brief description of changes made"
}

CRITICAL RULES:
- Use existing element IDs from the structure above when editing existing content
- Generate unique IDs for new elements (use descriptive names like "ele-new-race-bicycle")
- For images, ALWAYS use imagePrompt (detailed DALL-E prompt), not URLs
- Be specific with element placement (afterElementId or beforeElementId)
- Return multiple actions if needed (e.g., add image + update adjacent text)
- When user requests visual changes (color, size, emphasis), use update_property to change template
- All property values in create_section must be wrapped in { "value": ... } format
- IMPORTANT: Return valid JSON format only`;

	const completion = await openai!.chat.completions.create({
		model: "gpt-4o",
		messages: [
			{
				role: "system",
				content: systemPrompt,
			},
			{
				role: "user",
				content: instructions,
			},
		],
		temperature: 0.3,
		response_format: {type: "json_object"},
	});

	const result = completion.choices[0]?.message?.content?.trim() || "{}";
	console.log("[Edit Page] AI response:", result);
	const parsed: AIResponse = JSON.parse(result);

	console.log("[Edit Page] AI returned actions:", parsed.actions);

	// Count image actions for checklist
	const imageActions = parsed.actions.filter(
		(a) => a.action === "add_image" || a.action === "update_image"
	);

	// Add image generation steps to checklist
	if (imageActions.length > 0) {
		for (let i = 0; i < imageActions.length; i++) {
			checklist.push({
				label: `Generating image ${i + 1} of ${imageActions.length}`,
				status: "pending",
			});
		}
		checklist.push({label: "Finalizing changes", status: "pending"});
		sendEvent("checklist", {items: checklist});
		await delay(500);
	}

	// Execute actions
	const updatedOutline = await executeActions(parsed.actions, outline, sendEvent, checklist);

	return [updatedOutline]; // Return as array (outlines format)
}

async function editPropertyContent(
	instructions: string,
	currentData: Record<string, any>,
	contentType: any
) {
	const dataText = JSON.stringify(currentData, null, 2);

	const propertyDescriptions = contentType.properties
		?.map((p: any) => `- ${p.id} (${p.name}): ${p.type}`)
		.join("\n");

	const completion = await openai!.chat.completions.create({
		model: "gpt-4o",
		messages: [
			{
				role: "system",
				content: `You are editing a page's content properties.

${STRIDE_SHORT_CONTEXT}

Content type schema:
${propertyDescriptions}

Current content:
${dataText}

Apply the user's requested changes and return the COMPLETE updated data as JSON.
- Preserve all fields not affected by the change
- Only modify what's explicitly requested

IMPORTANT: For image fields:
- If the user asks to UPDATE or GENERATE an image, return an "imagePrompt" field with: {"prompt": "detailed DALL-E prompt", "alt": "alt text", "fieldName": "name of the image field"}
- If the user wants to keep the existing image, return the current image value as-is
- Do NOT make up image URLs

Return format (valid JSON only):
{
  "data": {/* complete data object with all properties */},
  "imagePrompt": {/* only if generating/updating an image */}
}`,
			},
			{
				role: "user",
				content: instructions,
			},
		],
		temperature: 0.3,
		response_format: {type: "json_object"},
	});

	const result = completion.choices[0]?.message?.content?.trim() || "{}";
	const parsed = JSON.parse(result);

	// Return both data and imagePrompt so the caller can handle image generation
	return parsed;
}

export async function POST(request: NextRequest) {
	if (!openai) {
		return new Response("OpenAI API key not configured", {status: 500});
	}

	const {instructions, contentTypeId, currentContent} = await request.json();

	const stream = createSSEStream(async ({sendEvent}) => {
		// Define editing checklist
		const checklist: ChecklistItem[] = [
			{label: "Understanding your request", status: "pending"},
			{label: "Analyzing current content", status: "pending"},
			{label: "Applying changes", status: "pending"},
		];

		sendEvent("checklist", {items: checklist});
		await delay(500);

		// Step 1: Understand request
		checklist[0].status = "running";
		sendEvent("checklist", {items: checklist});

		// Parse instructions and determine what to edit
		const contentType = getContentType(contentTypeId);

		checklist[0].status = "completed";
		sendEvent("checklist", {items: checklist});
		await delay(500);

		// Step 2: Analyze current content
		checklist[1].status = "running";
		sendEvent("checklist", {items: checklist});

		// Determine if this is outline-based or property-based content
		const hasOutlines = currentContent.outlines && currentContent.outlines.length > 0;

		checklist[1].status = "completed";
		sendEvent("checklist", {items: checklist});
		await delay(500);

		if (hasOutlines) {
			// Edit outline-based content (visual builder)
			checklist[2].status = "running";
			sendEvent("checklist", {items: checklist});

			const updatedOutlines = await editOutlineContent(
				instructions,
				currentContent.outlines,
				sendEvent,
				checklist
			);

			// Send updated outlines to client
			sendEvent("structure", {
				outlines: updatedOutlines,
			});

			// Mark all steps as completed
			if (checklist[2]) {
				checklist[2].status = "completed";
			}
			const lastIndex = checklist.length - 1;
			if (lastIndex >= 0 && lastIndex !== 2) {
				checklist[lastIndex].status = "completed";
			}
			sendEvent("checklist", {items: checklist, isCompleted: true});
			await delay(500);
		} else {
			// Edit property-based content (fields)
			checklist[2].status = "running";
			sendEvent("checklist", {items: checklist});

			const result = await editPropertyContent(
				instructions,
				currentContent.data,
				contentType
			);

			let finalData = result.data || result;

			// If there's an imagePrompt, add a step for image generation
			if (result.imagePrompt) {
				checklist[2].status = "completed";
				sendEvent("checklist", {items: checklist});
				await delay(500);

				// Insert image generation step
				checklist.splice(3, 0, {
					label: "Generating image 1 of 1",
					status: "running",
				});
				sendEvent("checklist", {items: checklist});

				console.log("[Edit Page] Generating image:", result.imagePrompt.prompt);
				const generatedImage = await generateImage({
					prompt: result.imagePrompt.prompt,
					alt: result.imagePrompt.alt,
				});

				// Replace the image field with the generated URL
				const fieldName = result.imagePrompt.fieldName || "featuredImage";
				finalData[fieldName] = generatedImage.url;

				console.log("[Edit Page] Image generated:", generatedImage.url);

				checklist[3].status = "completed";
				sendEvent("checklist", {items: checklist});
				await delay(500);

				// Add final "Applying changes" step
				checklist.push({label: "Applying changes", status: "running"});
				sendEvent("checklist", {items: checklist});
			}

			sendEvent("structure", {
				data: finalData,
			});

			checklist[checklist.length - 1].status = "completed";
			sendEvent("checklist", {items: checklist, isCompleted: true});
			await delay(500);
		}

		sendEvent("complete", {
			success: true,
			summary: "Page updated successfully!",
		});
	});

	return new Response(stream, {headers: sseHeaders()});
}
=======
import {NextRequest} from "next/server";
import {STRIDE_SHORT_CONTEXT} from "../../ai-context";
import {getContentType} from "@/app/db/initialData";
import {generateImage} from "@/app/lib/imageGeneration";
import {openai} from "@/app/lib/openai";
import {createSSEStream, ChecklistItem, delay, sseHeaders} from "@/app/lib/streaming";
import {executeActions, simplifyTree, type AIResponse} from "../actions";

async function editOutlineContent(
	instructions: string,
	currentOutlines: any[],
	sendEvent: (event: string, data: any) => void,
	checklist: ChecklistItem[]
) {
	const outline = currentOutlines[0]; // Get first outline

	console.log("[Edit Page] Outline structure:", {
		treeSections: outline.tree?.length || 0,
		elementCount: Object.keys(outline.elements || {}).length
	});

	// Check if we're creating from scratch or editing existing content
	const isEmptyOutline = !outline.tree || outline.tree.length === 0 ||
		(outline.tree.length === 1 && (!outline.tree[0].children || outline.tree[0].children.length === 0));

	console.log("[Edit Page] Empty outline:", isEmptyOutline);

	// Simplified structure for AI
	const elementsView = isEmptyOutline ? "{}" : JSON.stringify(outline.elements, null, 2);
	const treeView = isEmptyOutline ? "(empty - use create_section actions to build the page)" : simplifyTree(outline.tree);

	console.log("[Edit Page] Tree view for AI:", treeView);

	const systemPrompt = `You are ${isEmptyOutline ? 'creating' : 'editing'} a web page's visual builder content.

${STRIDE_SHORT_CONTEXT}

Current page elements:
${elementsView}

Current tree structure:
${treeView}

${isEmptyOutline ?
`The page is currently empty. Use create_section actions to build the page structure from scratch.
When creating a page, think about:
1. What sections does this page need? (Hero, Features, Pricing, CTA, etc.)
2. How many columns per section? (1 for full-width, 2-3 for side-by-side content)
3. What elements go in each section? (headings, text, buttons, images)

Create multiple sections if needed to fulfill the user's request.` :
`Apply the user's requested changes by modifying, adding, or removing existing content.`}

AVAILABLE ACTIONS:

1. add_image: Add a new image element
   {
     "action": "add_image",
     "elementId": "ele-new-unique-id",
     "afterElementId": "ele-existing-id",  // Insert after this element (or use beforeElementId)
     "imagePrompt": "Detailed DALL-E generation prompt",
     "altText": "Image description"
   }

2. update_text: Change text content of existing element
   {
     "action": "update_text",
     "elementId": "ele-heading-1",
     "newText": "Updated headline text"
   }

3. update_image: Replace an existing image
   {
     "action": "update_image",
     "elementId": "ele-img-1",
     "imagePrompt": "New DALL-E generation prompt",
     "altText": "New alt text"
   }

4. delete_element: Remove an element
   {
     "action": "delete_element",
     "elementId": "ele-to-remove"
   }

5. add_text: Add new text or heading
   {
     "action": "add_text",
     "elementId": "ele-new-text-id",
     "afterElementId": "ele-existing-id",
     "text": "New text content",
     "type": "heading" | "paragraph",
     "level": "h2",  // Only for type: "heading" (h1, h2, h3, h4, h5, h6)
     "template": "default"  // Optional visual style (see VISUAL STYLES below)
   }

6. add_button: Add a new button element
   {
     "action": "add_button",
     "elementId": "ele-new-button-id",
     "afterElementId": "ele-existing-id",
     "label": "Click here",
     "template": "primary"  // Optional: primary, secondary, subtle
   }

7. update_property: Change any element property (visual style, level, etc.)
   {
     "action": "update_property",
     "elementId": "ele-heading-1",
     "property": "template",  // Property name (template, level, label, etc.)
     "value": "prominent"     // New value
   }

8. create_section: Create a complete new section with rows, columns, and elements
   {
     "action": "create_section",
     "sectionId": "sec-new-features",
     "sectionName": "Features",
     "rows": [
       {
         "rowId": "row-features-1",
         "columns": [
           {
             "columnId": "col-features-1",
             "elements": [
               {
                 "elementId": "ele-feature-heading",
                 "type": "ct-heading",
                 "properties": {
                   "text": { "value": "Fast Performance" },
                   "level": { "value": "h3" },
                   "template": { "value": "default" }
                 }
               },
               {
                 "elementId": "ele-feature-text",
                 "type": "ct-text",
                 "properties": {
                   "text": { "value": "Lightning fast speeds." }
                 }
               }
             ]
           }
         ]
       }
     ]
   }

VISUAL STYLES (template property):

ct-heading templates:
- "default" - standard heading
- "prominent" - large, eye-catching (use for: make it bigger, emphasize, hero)
- "subtle" - smaller, understated (use for: make it smaller, de-emphasize, quiet)
- "accent-red" - red color (use for: make it red, danger, alert, warning)
- "accent-blue" - blue color (use for: make it blue, primary color, brand)

ct-text templates:
- "default" - standard text
- "prominent" - larger, emphasis (use for: make it bigger, important, emphasize)
- "subtle" - smaller, secondary (use for: make it smaller, muted, de-emphasize)

ct-button templates:
- "primary" - main CTA style (use for: primary, main action, prominent)
- "secondary" - outline style (use for: secondary, alternative, outline)
- "subtle" - text-like, minimal (use for: subtle, link-like, minimal)

COMMON OPERATIONS:
- "make the heading red" → update_property with property="template", value="accent-red"
- "make it more prominent" → update_property with property="template", value="prominent"
- "tone it down" → update_property with property="template", value="subtle"
- "change to h3" → update_property with property="level", value="h3"
- "make the button secondary" → update_property with property="template", value="secondary"
- "remove the button" → delete_element

Return format:
{
  "actions": [/* array of action objects */],
  "summary": "Brief description of changes made"
}

CRITICAL RULES:
- Use existing element IDs from the structure above when editing existing content
- Generate unique IDs for new elements (use descriptive names like "ele-new-race-bicycle")
- For images, ALWAYS use imagePrompt (detailed DALL-E prompt), not URLs
- Be specific with element placement (afterElementId or beforeElementId)
- Return multiple actions if needed (e.g., add image + update adjacent text)
- When user requests visual changes (color, size, emphasis), use update_property to change template
- All property values in create_section must be wrapped in { "value": ... } format
- IMPORTANT: Return valid JSON format only`;

	const completion = await openai!.chat.completions.create({
		model: "gpt-4o",
		messages: [
			{
				role: "system",
				content: systemPrompt,
			},
			{
				role: "user",
				content: instructions,
			},
		],
		temperature: 0.3,
		response_format: {type: "json_object"},
	});

	const result = completion.choices[0]?.message?.content?.trim() || "{}";
	console.log("[Edit Page] AI response:", result);
	const parsed: AIResponse = JSON.parse(result);

	console.log("[Edit Page] AI returned actions:", parsed.actions);

	// Count image actions for checklist
	const imageActions = parsed.actions.filter(
		(a) => a.action === "add_image" || a.action === "update_image"
	);

	// Add image generation steps to checklist
	if (imageActions.length > 0) {
		for (let i = 0; i < imageActions.length; i++) {
			checklist.push({
				label: `Generating image ${i + 1} of ${imageActions.length}`,
				status: "pending",
			});
		}
		checklist.push({label: "Finalizing changes", status: "pending"});
		sendEvent("checklist", {items: checklist});
		await delay(500);
	}

	// Execute actions
	const updatedOutline = await executeActions(parsed.actions, outline, sendEvent, checklist);

	return [updatedOutline]; // Return as array (outlines format)
}

async function editPropertyContent(
	instructions: string,
	currentData: Record<string, any>,
	contentType: any
) {
	const dataText = JSON.stringify(currentData, null, 2);

	const propertyDescriptions = contentType.properties
		?.map((p: any) => `- ${p.id} (${p.name}): ${p.type}`)
		.join("\n");

	const completion = await openai!.chat.completions.create({
		model: "gpt-4o",
		messages: [
			{
				role: "system",
				content: `You are editing a page's content properties.

${STRIDE_SHORT_CONTEXT}

Content type schema:
${propertyDescriptions}

Current content:
${dataText}

Apply the user's requested changes and return the COMPLETE updated data as JSON.
- Preserve all fields not affected by the change
- Only modify what's explicitly requested

IMPORTANT: For image fields:
- If the user asks to UPDATE or GENERATE an image, return an "imagePrompt" field with: {"prompt": "detailed DALL-E prompt", "alt": "alt text", "fieldName": "name of the image field"}
- If the user wants to keep the existing image, return the current image value as-is
- Do NOT make up image URLs

Return format (valid JSON only):
{
  "data": {/* complete data object with all properties */},
  "imagePrompt": {/* only if generating/updating an image */}
}`,
			},
			{
				role: "user",
				content: instructions,
			},
		],
		temperature: 0.3,
		response_format: {type: "json_object"},
	});

	const result = completion.choices[0]?.message?.content?.trim() || "{}";
	const parsed = JSON.parse(result);

	// Return both data and imagePrompt so the caller can handle image generation
	return parsed;
}

export async function POST(request: NextRequest) {
	if (!openai) {
		return new Response("OpenAI API key not configured", {status: 500});
	}

	const {instructions, contentTypeId, currentContent} = await request.json();

	const stream = createSSEStream(async ({sendEvent}) => {
		// Define editing checklist
		const checklist: ChecklistItem[] = [
			{label: "Understanding your request", status: "pending"},
			{label: "Analyzing current content", status: "pending"},
			{label: "Applying changes", status: "pending"},
		];

		sendEvent("checklist", {items: checklist});
		await delay(500);

		// Step 1: Understand request
		checklist[0].status = "running";
		sendEvent("checklist", {items: checklist});

		// Parse instructions and determine what to edit
		const contentType = getContentType(contentTypeId);

		checklist[0].status = "completed";
		sendEvent("checklist", {items: checklist});
		await delay(500);

		// Step 2: Analyze current content
		checklist[1].status = "running";
		sendEvent("checklist", {items: checklist});

		// Determine if this is outline-based or property-based content
		const hasOutlines = currentContent.outlines && currentContent.outlines.length > 0;

		checklist[1].status = "completed";
		sendEvent("checklist", {items: checklist});
		await delay(500);

		if (hasOutlines) {
			// Edit outline-based content (visual builder)
			checklist[2].status = "running";
			sendEvent("checklist", {items: checklist});

			const updatedOutlines = await editOutlineContent(
				instructions,
				currentContent.outlines,
				sendEvent,
				checklist
			);

			// Send updated outlines to client
			sendEvent("structure", {
				outlines: updatedOutlines,
			});

			// Mark all steps as completed
			if (checklist[2]) {
				checklist[2].status = "completed";
			}
			const lastIndex = checklist.length - 1;
			if (lastIndex >= 0 && lastIndex !== 2) {
				checklist[lastIndex].status = "completed";
			}
			sendEvent("checklist", {items: checklist, isCompleted: true});
			await delay(500);
		} else {
			// Edit property-based content (fields)
			checklist[2].status = "running";
			sendEvent("checklist", {items: checklist});

			const result = await editPropertyContent(
				instructions,
				currentContent.data,
				contentType
			);

			let finalData = result.data || result;

			// If there's an imagePrompt, add a step for image generation
			if (result.imagePrompt) {
				checklist[2].status = "completed";
				sendEvent("checklist", {items: checklist});
				await delay(500);

				// Insert image generation step
				checklist.splice(3, 0, {
					label: "Generating image 1 of 1",
					status: "running",
				});
				sendEvent("checklist", {items: checklist});

				console.log("[Edit Page] Generating image:", result.imagePrompt.prompt);
				const generatedImage = await generateImage({
					prompt: result.imagePrompt.prompt,
					alt: result.imagePrompt.alt,
				});

				// Replace the image field with the generated URL
				const fieldName = result.imagePrompt.fieldName || "featuredImage";
				finalData[fieldName] = generatedImage.url;

				console.log("[Edit Page] Image generated:", generatedImage.url);

				checklist[3].status = "completed";
				sendEvent("checklist", {items: checklist});
				await delay(500);

				// Add final "Applying changes" step
				checklist.push({label: "Applying changes", status: "running"});
				sendEvent("checklist", {items: checklist});
			}

			sendEvent("structure", {
				data: finalData,
			});

			checklist[checklist.length - 1].status = "completed";
			sendEvent("checklist", {items: checklist, isCompleted: true});
			await delay(500);
		}

		sendEvent("complete", {
			success: true,
			summary: "Page updated successfully!",
		});
	});

	return new Response(stream, {headers: sseHeaders()});
}
>>>>>>> origin/main
