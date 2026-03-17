/**
 * SSE Streaming endpoint for AI-powered page generation
 * Generates page structure and content based on user instructions
 */

import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		})
	: null;

interface ChecklistItem {
	label: string;
	status: "pending" | "running" | "completed" | "failed";
}

interface AnalysisResult {
	pageType: string;
	sections: Array<{
		type: string;
		title: string;
		purpose: string;
		contentNeeds: {
			headings?: number;
			paragraphs?: number;
			buttons?: number;
			images?: number;
		};
	}>;
	layout: "single-column" | "multi-column";
	tone: string;
	targetAudience: string;
}

interface ContentResult {
	sections: Record<
		string,
		{
			heading?: string;
			subheading?: string;
			paragraphs?: string[];
			buttonText?: string;
			buttonUrl?: string;
			imagePrompts?: Array<{
				prompt: string;
				alt: string;
			}>;
			images?: Array<{
				url: string;
				alt: string;
			}>;
			listItems?: Array<{
				title: string;
				description: string;
			}>;
		}
	>;
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {pageId, instructions, contentTypeId, files} = body;

		console.log("[Generate Page Stream] Request received:", {
			pageId,
			instructionsLength: instructions?.length,
			contentTypeId,
			filesCount: files?.length || 0,
		});

		// Check OpenAI client
		if (!openai) {
			console.error("[Generate Page Stream] OpenAI client not initialized");
			return new Response(
				JSON.stringify({error: "OpenAI API key not configured"}),
				{status: 500, headers: {"Content-Type": "application/json"}}
			);
		}

		// Validate inputs
		if (!pageId || !instructions || !contentTypeId) {
			return new Response(
				JSON.stringify({error: "pageId, instructions, and contentTypeId are required"}),
				{
					status: 400,
					headers: {"Content-Type": "application/json"},
				}
			);
		}

		// Validate files if provided
		if (files && Array.isArray(files)) {
			for (const file of files) {
				if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
					return new Response(
						JSON.stringify({error: `Unsupported file type: ${file.type}`}),
						{status: 400, headers: {"Content-Type": "application/json"}}
					);
				}
				const sizeEstimate = (file.url.length * 0.75) / 1024 / 1024;
				if (sizeEstimate > 20) {
					return new Response(
						JSON.stringify({error: "File too large (max 20MB)"}),
						{status: 400, headers: {"Content-Type": "application/json"}}
					);
				}
			}
		}

		// Create SSE stream
		const encoder = new TextEncoder();

		const stream = new ReadableStream({
			async start(controller) {
				// Helper to send SSE event
				const sendEvent = (event: string, data: any) => {
					const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
					controller.enqueue(encoder.encode(message));
				};

				// Helper to add delay between tasks
				const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
				const taskDelay = () => delay(500 + Math.random() * 500); // 500-1000ms

				// Initial checklist
				const checklist: ChecklistItem[] = [
					{label: "Analyzing instructions", status: "pending"},
					{label: "Designing page structure", status: "pending"},
					{label: "Generating content", status: "pending"},
					{label: "Creating sections", status: "pending"},
					{label: "Populating elements", status: "pending"},
					{label: "Finalizing page", status: "pending"},
				];

				// Send initial checklist
				sendEvent("checklist", checklist);

				try {
					// Task 1: Analyze instructions and create page structure
					checklist[0].status = "running";
					sendEvent("checklist", checklist);

					// Use OpenAI to analyze instructions and plan page structure
					const analysis = await analyzeInstructions(instructions, contentTypeId, files);

					// Create page structure immediately
					const pageStructure = await generatePageStructure(analysis);
					const outlines = await createSections(pageStructure, {});

					// Send initial structure with empty sections - VB can load now!
					sendEvent("structure", {outlines: outlines});

					checklist[0].status = "completed";
					sendEvent("checklist", checklist);
					await taskDelay();

					// Task 2: Design page structure (placeholder - structure already created)
					checklist[1].status = "running";
					sendEvent("checklist", checklist);

					await delay(300); // Simulate some work

					checklist[1].status = "completed";
					sendEvent("checklist", checklist);
					await taskDelay();

					// Task 3: Generate content
					checklist[2].status = "running";
					sendEvent("checklist", checklist);

					const contentData = await generateContent(analysis, instructions);

					// Generate images if content includes image prompts
					const contentWithImages = await generateImages(contentData);

					checklist[2].status = "completed";
					sendEvent("checklist", checklist);
					await taskDelay();

					// Task 4: Create sections (placeholder - sections already created)
					checklist[3].status = "running";
					sendEvent("checklist", checklist);

					await delay(300); // Simulate some work

					checklist[3].status = "completed";
					sendEvent("checklist", checklist);
					await taskDelay();

					// Task 5: Populate elements
					checklist[4].status = "running";
					sendEvent("checklist", checklist);

					// Debug: Send diagnostic info to client
					sendEvent("debug", {
						message: "Section matching info",
						outlineSectionTypes: outlines.map((o: any) => ({title: o.title, type: o.sectionType})),
						contentSectionKeys: Object.keys(contentWithImages.sections),
					});

					const populatedOutlines = await populateElements(outlines, contentWithImages);

					console.log("[Generate Page Stream] Generated outlines:", JSON.stringify(populatedOutlines, null, 2));

					// Send structure update with populated content
					sendEvent("structure", {outlines: populatedOutlines});

					checklist[4].status = "completed";
					sendEvent("checklist", checklist);
					await taskDelay();

					// Task 6: Finalize
					checklist[5].status = "running";
					sendEvent("checklist", checklist);

					await delay(500);

					checklist[5].status = "completed";
					sendEvent("checklist", checklist);

					// Send completion
					const sectionCount = populatedOutlines.length;
					const elementCount = populatedOutlines.reduce(
						(sum: number, outline: any) => sum + Object.keys(outline.elements || {}).length,
						0
					);

					sendEvent("complete", {
						success: true,
						summary: `Page generated successfully with ${sectionCount} section${sectionCount !== 1 ? "s" : ""} and ${elementCount} element${elementCount !== 1 ? "s" : ""}.`,
					});

					console.log("[Generate Page Stream] Complete:", {
						sectionCount,
						elementCount,
					});
				} catch (error) {
					console.error("[Generate Page Stream] Error occurred:", error);
					sendEvent("error", {
						message:
							error instanceof Error ? error.message : "An error occurred during generation",
					});
				} finally {
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("[Generate Page Stream] Error occurred:", error);
		return new Response(JSON.stringify({error: "Internal Server Error"}), {
			status: 500,
			headers: {"Content-Type": "application/json"},
		});
	}
}

// Helper functions for page generation

async function analyzeInstructions(
	instructions: string,
	contentTypeId: string,
	files?: Array<{url: string; type: string}>
): Promise<AnalysisResult> {
	// Truncate if too long
	const MAX_TOKENS = 10000;
	const estimatedTokens = Math.ceil(instructions.length / 4);
	let truncatedInstructions = instructions;
	let wasTruncated = false;

	if (estimatedTokens > MAX_TOKENS) {
		const maxChars = MAX_TOKENS * 4;
		truncatedInstructions =
			instructions.substring(0, maxChars) + "\n\n[Instructions truncated due to length...]";
		wasTruncated = true;
	}

	const messages: any[] = [
		{
			role: "system",
			content: `You are a web page planning expert. Analyze user instructions and plan a page structure.

Available section types: hero, features, benefits, testimonials, pricing, cta, faq, content
Available element types: ct-heading, ct-text, ct-rich-text, ct-button, ct-input, ct-image, ct-product

Respond with a JSON object:
{
  "pageType": "landing-page" | "product-page" | "content-page" | "form-page",
  "sections": [
    {
      "type": "section type",
      "title": "Section title for outline",
      "purpose": "Brief description",
      "contentNeeds": {"headings": 1, "paragraphs": 2, "buttons": 1}
    }
  ],
  "layout": "single-column",
  "tone": "professional" | "casual" | "technical" | "friendly",
  "targetAudience": "Brief description"
}`,
		},
	];

	// Add user instructions (with images if available)
	if (files && files.length > 0) {
		const content: any[] = [
			{
				type: "text",
				text: `Analyze these instructions for a ${contentTypeId} page:\n\n${truncatedInstructions}`,
			},
		];

		files.forEach((file) => {
			if (file.type.startsWith("image/")) {
				content.push({
					type: "image_url",
					image_url: {url: file.url},
				});
			}
		});

		messages.push({role: "user", content});
	} else {
		messages.push({
			role: "user",
			content: `Analyze these instructions for a ${contentTypeId} page:\n\n${truncatedInstructions}`,
		});
	}

	try {
		const completion = await openai!.chat.completions.create({
			model: "gpt-4o",
			messages,
			temperature: 0.3,
			response_format: {type: "json_object"},
			max_tokens: 2000,
		});

		const result = completion.choices[0]?.message?.content?.trim() || "{}";
		const parsed = JSON.parse(result) as AnalysisResult;

		// Validate structure
		if (!parsed.sections || !Array.isArray(parsed.sections)) {
			throw new Error("Invalid response structure");
		}

		console.log("[Generate Page Stream] Analysis result:", {
			pageType: parsed.pageType,
			sectionsCount: parsed.sections.length,
			tone: parsed.tone,
			wasTruncated,
		});

		return parsed;
	} catch (error: any) {
		console.error("[Generate Page Stream] AI analysis error:", error);

		// Fallback to basic structure
		return {
			pageType: "content-page",
			sections: [
				{
					type: "hero",
					title: "Hero",
					purpose: "Main hero section",
					contentNeeds: {headings: 1, paragraphs: 1, buttons: 1},
				},
				{
					type: "content",
					title: "Content",
					purpose: "Main content area",
					contentNeeds: {headings: 1, paragraphs: 2},
				},
			],
			layout: "single-column",
			tone: "professional",
			targetAudience: "General audience",
		};
	}
}

async function generatePageStructure(analysis: any) {
	return {
		sections: analysis.sections,
		layout: "single-column",
	};
}

async function generateContent(
	analysis: AnalysisResult,
	instructions: string
): Promise<ContentResult> {
	try {
		const completion = await openai!.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: `You are a professional copywriter. Generate engaging content for a web page.

Tone: ${analysis.tone}
Target Audience: ${analysis.targetAudience}

Guidelines:
- Write clear, compelling copy
- Match the specified tone
- Keep headings concise (under 60 characters)
- Keep paragraphs readable (2-3 sentences)
- Make CTAs action-oriented
- Include specific details from user instructions
- For sections that need images, provide detailed DALL-E prompts

IMPORTANT: Use the section "type" OR "title" as the key in your response.
If sections have unique types (hero, features, etc), use those.
If multiple sections have the same type (e.g., all "content"), use the section titles as keys.

Respond with a JSON object mapping sections to content:
{
  "sections": {
    "hero": {
      "heading": "Main headline",
      "subheading": "Supporting text",
      "buttonText": "CTA text",
      "buttonUrl": "#",
      "imagePrompts": [
        {"prompt": "Detailed DALL-E prompt for hero image", "alt": "Alt text for accessibility"}
      ]
    },
    "features": {
      "heading": "Section heading",
      "listItems": [
        {"title": "Feature name", "description": "Feature description"}
      ]
    }
  }
}`,
				},
				{
					role: "user",
					content: `Generate content for this page structure:

${JSON.stringify(analysis.sections, null, 2)}

User instructions:
${instructions}`,
				},
			],
			temperature: 0.7,
			response_format: {type: "json_object"},
			max_tokens: 4000,
		});

		const result = completion.choices[0]?.message?.content?.trim() || "{}";
		const parsed = JSON.parse(result) as ContentResult;

		console.log("[Generate Page Stream] Generated content for sections:", {
			sectionTypes: Object.keys(parsed.sections || {}),
		});

		return parsed;
	} catch (error: any) {
		console.error("[Generate Page Stream] AI content generation error:", error);

		// Fallback to basic content
		return {
			sections: {
				hero: {
					heading: "Welcome to Your New Page",
					subheading: "Create amazing experiences with ease",
					buttonText: "Get Started",
				},
				content: {
					heading: "Main Content",
					paragraphs: ["This is your main content area."],
				},
			},
		};
	}
}

async function generateImages(contentData: ContentResult): Promise<ContentResult> {
	console.log("[Generate Page Stream] generateImages called with sections:", Object.keys(contentData.sections));

	// Generate images for each section that has imagePrompts
	const updatedSections: Record<string, any> = {};

	for (const [sectionType, content] of Object.entries(contentData.sections)) {
		updatedSections[sectionType] = {...content};

		if (content.imagePrompts && content.imagePrompts.length > 0) {
			const generatedImages: Array<{url: string; alt: string}> = [];

			for (const imagePrompt of content.imagePrompts) {
				try {
					console.log(`[Generate Page Stream] Generating image: "${imagePrompt.prompt}"`);

					const response = await openai!.images.generate({
						model: "dall-e-3",
						prompt: imagePrompt.prompt,
						n: 1,
						size: "1024x1024",
						quality: "standard",
					});

					const imageUrl = response?.data?.[0]?.url;
					if (imageUrl) {
						generatedImages.push({
							url: imageUrl,
							alt: imagePrompt.alt,
						});
						console.log(`[Generate Page Stream] Image generated successfully`);
					}
				} catch (error: any) {
					console.error(`[Generate Page Stream] Image generation error:`, error.message);
					// Continue without this image if generation fails
				}
			}

			updatedSections[sectionType].images = generatedImages;
			delete updatedSections[sectionType].imagePrompts; // Remove prompts, keep URLs
		}
	}

	console.log("[Generate Page Stream] generateImages returning sections:", {
		sectionKeys: Object.keys(updatedSections),
		sectionDetails: Object.entries(updatedSections).map(([key, val]) => ({
			key,
			hasImages: !!(val as any).images,
			imageCount: ((val as any).images?.length || 0),
		})),
	});

	return {sections: updatedSections};
}

async function createSections(structure: any, contentData: any) {
	const outlines: any[] = [];

	structure.sections.forEach((section: any, index: number) => {
		const outlineId = `ol-${Date.now()}-${index}`;
		const sectionId = `sec-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
		const rowId = `row-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
		const colId = `col-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;

		// Extract title from section object (use provided title or capitalize type)
		const title = section.title || (section.type.charAt(0).toUpperCase() + section.type.slice(1));

		// Create tree structure immediately so VB can render the page shell
		const tree = [
			{
				id: sectionId,
				name: title,
				open: true,
				children: [
					{
						id: rowId,
						open: true,
						children: [
							{
								id: colId,
								open: true,
								elements: [], // Empty initially, will be populated later
							},
						],
					},
				],
			},
		];

		outlines.push({
			id: outlineId,
			title: title,
			sectionType: section.type, // Store the type for matching with content
			tree: tree,
			elements: {},
		});
	});

	return outlines;
}

async function populateElements(outlines: any[], contentData: ContentResult) {
	console.log("[Generate Page Stream] populateElements called with:", {
		outlineCount: outlines.length,
		outlineSectionTypes: outlines.map(o => ({title: o.title, sectionType: o.sectionType})),
		contentSectionKeys: Object.keys(contentData.sections),
	});

	return outlines.map((outline: any) => {
		// Store the section type for later use (e.g., determining heading level)
		const sectionType = outline.sectionType || "content";

		// Try to match by title first (AI uses titles as keys), then fall back to type
		let sectionContent = contentData.sections[outline.title];
		if (!sectionContent && outline.sectionType) {
			sectionContent = contentData.sections[outline.sectionType];
		}

		console.log("[Generate Page Stream] Matching section:", {
			outlineTitle: outline.title,
			outlineSectionType: outline.sectionType,
			foundByTitle: !!contentData.sections[outline.title],
			foundByType: outline.sectionType ? !!contentData.sections[outline.sectionType] : false,
			foundContent: !!sectionContent,
			availableKeys: Object.keys(contentData.sections),
		});

		if (!sectionContent) return outline;

		const elements: Record<string, any> = {};
		const elementIds: string[] = [];
		const genId = () => `ele-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		// Heading
		if (sectionContent.heading) {
			const id = genId();
			elementIds.push(id);
			elements[id] = {
				type: "ct-heading",
				properties: {
					text: {value: sectionContent.heading},
					level: {value: sectionType === "hero" ? "h1" : "h2"},
				},
			};
		}

		// Subheading
		if (sectionContent.subheading) {
			const id = genId();
			elementIds.push(id);
			elements[id] = {
				type: "ct-text",
				properties: {text: {value: sectionContent.subheading}},
			};
		}

		// Paragraphs
		if (sectionContent.paragraphs) {
			sectionContent.paragraphs.forEach((para) => {
				const id = genId();
				elementIds.push(id);
				elements[id] = {
					type: "ct-text",
					properties: {text: {value: para}},
				};
			});
		}

		// List items (for features, benefits)
		if (sectionContent.listItems) {
			sectionContent.listItems.forEach((item) => {
				const headingId = genId();
				const descId = genId();
				elementIds.push(headingId, descId);

				elements[headingId] = {
					type: "ct-heading",
					properties: {
						text: {value: item.title},
						level: {value: "h3"},
					},
				};

				elements[descId] = {
					type: "ct-text",
					properties: {text: {value: item.description}},
				};
			});
		}

		// Button
		if (sectionContent.buttonText) {
			const id = genId();
			elementIds.push(id);
			elements[id] = {
				type: "ct-button",
				properties: {
					label: {value: sectionContent.buttonText},
					url: {value: sectionContent.buttonUrl || "#"},
				},
			};
		}

		// Images (from DALL-E generation)
		if (sectionContent.images) {
			sectionContent.images.forEach((image: {url: string; alt: string}) => {
				const id = genId();
				elementIds.push(id);
				elements[id] = {
					type: "ct-image",
					properties: {
						src: {value: image.url},
						alt: {value: image.alt},
					},
				};
			});
		}

		// Update tree with elements
		const updatedTree = JSON.parse(JSON.stringify(outline.tree));
		if (updatedTree[0]?.children[0]?.children[0]) {
			updatedTree[0].children[0].children[0].elements = elementIds.map((id) => ({id}));
		}

		return {...outline, tree: updatedTree, elements};
	});
}
