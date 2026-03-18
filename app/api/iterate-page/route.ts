/**
 * API endpoint for iterating on AI-generated pages
 * Handles user feedback and updates page content accordingly
 */

import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({apiKey: process.env.OPENAI_API_KEY})
	: null;

/**
 * Validates and fixes element IDs in page structure
 * Ensures all elements have proper IDs to prevent React key warnings
 */
function validateAndFixElementIds(outlines: any[]): any[] {
	return outlines.map((outline: any) => {
		// Validate elements object
		if (outline.elements) {
			Object.keys(outline.elements).forEach((eleId) => {
				if (!eleId || eleId === "undefined") {
					console.warn("[Iterate Page] Found element without proper ID");
				}
			});
		}

		// Fix tree element references
		if (outline.tree) {
			outline.tree = outline.tree.map((section: any) => ({
				...section,
				children: (section.children || []).map((row: any) => ({
					...row,
					children: (row.children || []).map((col: any) => {
						const elements = (col.elements || []).map((el: any) => {
							if (!el.id) {
								console.warn("[Iterate Page] Element missing ID, generating one");
								return {...el, id: `ele-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`};
							}
							return el;
						});
						return {...col, elements};
					}),
				})),
			}));
		}

		return outline;
	});
}

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

		// Use OpenAI to understand the feedback and apply changes to the page structure
		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: `You are a helpful web page editor. The user wants to modify their page. Apply the requested changes directly to the page structure.

Current page structure (outlines with elements):
${JSON.stringify(currentPage, null, 2)}

IMPORTANT: Return the COMPLETE MODIFIED page structure with all changes applied. Include ALL outlines, even ones that weren't modified.

Respond with a JSON object:
{
  "outlines": [...complete modified outlines array...],
  "summary": "Brief description of what was changed (e.g., 'Removed the button from the Welcome section')"
}

Common operations:
- Remove element: Delete it from the elements object and elementIds array
- Update text: Modify the properties.text.value
- Add element: Create new element with unique ID, add to elements object and elementIds array
- Change heading level: Modify properties.level.value`,
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
		const updates = JSON.parse(result);

		// Validate and fix element IDs
		if (updates.outlines) {
			updates.outlines = validateAndFixElementIds(updates.outlines);
		}

		console.log("[Iterate Page] Applied changes:", {
			summary: updates.summary,
			outlinesCount: updates.outlines?.length,
			elementCounts: updates.outlines?.map((o: any) => Object.keys(o.elements || {}).length),
		});

		return new Response(JSON.stringify(updates), {
			status: 200,
			headers: {"Content-Type": "application/json"},
		});
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
