/**
 * API endpoint for iterating on AI-generated pages
 * Handles user feedback and updates page content accordingly
 * Uses action-based architecture from edit-page
 */

import {openai} from "@/app/lib/openai";
import {executeActions, type EditAction, type AIResponse} from "../edit-page/actions";
import {STRIDE_SHORT_CONTEXT} from "../ai-context";
import {simplifyTree} from "../edit-page/actions";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {pageId, feedback, currentPage} = body;

		console.log("[Iterate Page] Request received:", {
			pageId,
			feedbackLength: feedback?.length,
			hasCurrentPage: !!currentPage,
		});

		if (!openai) {
			return new Response(
				JSON.stringify({error: "OpenAI API key not configured"}),
				{status: 500, headers: {"Content-Type": "application/json"}}
			);
		}

		if (!pageId || !feedback || !currentPage) {
			return new Response(
				JSON.stringify({error: "pageId, feedback, and currentPage are required"}),
				{status: 400, headers: {"Content-Type": "application/json"}}
			);
		}

		// Get outline from currentPage
		const outline = currentPage.outlines?.[0] || currentPage;

		console.log("[Iterate Page] Current outline:", {
			hasTree: !!outline.tree,
			treeLength: outline.tree?.length,
			elementsCount: Object.keys(outline.elements || {}).length
		});

		// Simplified structure for AI
		const elementsView = JSON.stringify(outline.elements || {}, null, 2);
		const treeView = simplifyTree(outline.tree || []);

		// Use the same action-based prompt as edit-page
		const systemPrompt = `You are editing a web page's visual builder content.

${STRIDE_SHORT_CONTEXT}

Current page elements:
${elementsView}

Current tree structure:
${treeView}

Apply the user's requested changes by returning a JSON object with an array of actions.

AVAILABLE ACTIONS:

1. add_image: Add a new image element
2. update_text: Change text content of existing element
3. update_image: Replace an existing image
4. delete_element: Remove an element
5. add_text: Add new text or heading
6. add_button: Add a new button element
7. update_property: Change any element property (visual style, level, etc.)

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
- "make the heading red" → {"action": "update_property", "elementId": "ele-X", "property": "template", "value": "accent-red"}
- "make it more prominent" → {"action": "update_property", "elementId": "ele-X", "property": "template", "value": "prominent"}
- "tone it down" → {"action": "update_property", "elementId": "ele-X", "property": "template", "value": "subtle"}
- "change to h3" → {"action": "update_property", "elementId": "ele-X", "property": "level", "value": "h3"}
- "make the button secondary" → {"action": "update_property", "elementId": "ele-X", "property": "template", "value": "secondary"}
- "remove the button" → {"action": "delete_element", "elementId": "ele-X"}

Return format:
{
  "actions": [/* array of action objects */],
  "summary": "Brief description of changes made"
}

CRITICAL RULES:
- Use existing element IDs from the structure above
- Generate unique IDs for new elements (use descriptive names like "ele-new-race-bicycle")
- For images, ALWAYS use imagePrompt (detailed DALL-E prompt), not URLs
- Be specific with element placement (afterElementId or beforeElementId)
- Return multiple actions if needed
- IMPORTANT: Return valid JSON format only`;

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{
					role: "user",
					content: `User request: ${feedback}`,
				},
			],
			temperature: 0.3,
			response_format: {type: "json_object"},
			max_tokens: 8000,
		});

		const result = completion.choices[0]?.message?.content?.trim() || "{}";
		const parsed: AIResponse = JSON.parse(result);

		console.log("[Iterate Page] AI returned actions:", parsed.actions);

		// Execute actions using the action executor
		// Create a no-op sendEvent since we're not streaming
		const sendEvent = (event: string, data: any) => {
			console.log(`[Iterate Page] Event: ${event}`, data);
		};

		const updatedOutline = await executeActions(
			parsed.actions,
			outline,
			sendEvent,
			[] // Empty checklist since we're not streaming progress
		);

		console.log("[Iterate Page] Actions executed successfully");

		return new Response(
			JSON.stringify({
				outlines: [updatedOutline],
				summary: parsed.summary
			}),
			{
				status: 200,
				headers: {"Content-Type": "application/json"},
			}
		);
	} catch (error) {
		console.error("[Iterate Page] Error occurred:", error);
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : "An error occurred",
			}),
			{status: 500, headers: {"Content-Type": "application/json"}}
		);
	}
}
