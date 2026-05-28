/**
 * SSE Streaming endpoint for AI-powered page generation
 * Generates page structure and content based on user instructions
 */

import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({apiKey: process.env.OPENAI_API_KEY})
	: null;

// Types
interface ChecklistItem {
	label: string;
	status: "pending" | "running" | "completed" | "failed";
}

interface SectionSpec {
	type: string;
	title: string;
	purpose: string;
	contentNeeds: {
		headings?: number;
		paragraphs?: number;
		buttons?: number;
		images?: number;
	};
}

interface AnalysisResult {
	pageType: string;
	sections: SectionSpec[];
	layout: "single-column" | "multi-column";
	tone: string;
	targetAudience: string;
	visualStyle?: "realistic-photo" | "illustration" | "3d-render" | "flat-design" | "artistic";
}

interface SectionContent {
	heading?: string;
	subheading?: string;
	paragraphs?: string[];
	buttonText?: string;
	buttonUrl?: string;
	imagePrompts?: Array<{prompt: string; alt: string}>;
	images?: Array<{url: string; alt: string}>;
	listItems?: Array<{title: string; description: string}>;
}

interface ContentResult {
	sections: Record<string, SectionContent>;
}

interface PageOutline {
	id: string;
	title: string;
	sectionType: string;
	tree: any[];
	elements: Record<string, any>;
}

interface FileData {
	url: string;
	type: string;
}

// Utilities
const generateId = (prefix: string, suffix?: string) => {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 11);
	return suffix ? `${prefix}-${timestamp}-${suffix}-${random}` : `${prefix}-${timestamp}-${random}`;
};

const jsonResponse = (data: any, status: number = 200) => {
	return new Response(JSON.stringify(data), {
		status,
		headers: {"Content-Type": "application/json"},
	});
};

// Main handler
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

		if (!openai) {
			console.error("[Generate Page Stream] OpenAI client not initialized");
			return jsonResponse({error: "OpenAI API key not configured"}, 500);
		}

		if (!pageId || !contentTypeId) {
			return jsonResponse(
				{error: "pageId and contentTypeId are required"},
				400
			);
		}

		// Instructions or files are required (but not both)
		if (!instructions && (!files || files.length === 0)) {
			return jsonResponse(
				{error: "Either instructions or files are required"},
				400
			);
		}

		if (files && Array.isArray(files)) {
			const validation = validateFiles(files);
			if (!validation.valid) {
				return jsonResponse({error: validation.error}, 400);
			}
		}

		const stream = createGenerationStream(instructions, contentTypeId, files);

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("[Generate Page Stream] Error occurred:", error);
		return jsonResponse({error: "Internal Server Error"}, 500);
	}
}

// File validation
function validateFiles(files: FileData[]): {valid: boolean; error?: string} {
	for (const file of files) {
		if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
			return {valid: false, error: `Unsupported file type: ${file.type}`};
		}
		const sizeEstimate = (file.url.length * 0.75) / 1024 / 1024;
		if (sizeEstimate > 20) {
			return {valid: false, error: "File too large (max 20MB)"};
		}
	}
	return {valid: true};
}

// SSE stream creation
function createGenerationStream(
	instructions: string,
	contentTypeId: string,
	files?: FileData[]
) {
	const encoder = new TextEncoder();

	return new ReadableStream({
		async start(controller) {
			const sendEvent = (event: string, data: any) => {
				const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
				controller.enqueue(encoder.encode(message));
			};

			const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

			try {
				// Send checklist
				const checklist: ChecklistItem[] = [
					{label: "Analyzing instructions", status: "pending"},
					{label: "Generating text content", status: "pending"},
					{label: "Generating images", status: "pending"},
					{label: "Populating elements", status: "pending"},
				];

				sendEvent("checklist", checklist);
				await delay(500);

				// Step 1: Analyze & create structure
				checklist[0].status = "running";
				sendEvent("checklist", checklist);

				const analysis = await analyzeInstructions(instructions, contentTypeId, files);
				const outlines = createSections(analysis.sections);

				sendEvent("structure", {outlines});

				checklist[0].status = "completed";
				sendEvent("checklist", checklist);
				await delay(500);

				// Step 2: Generate text content
				checklist[1].status = "running";
				sendEvent("checklist", checklist);

				const contentData = await generateContent(analysis, instructions);

				checklist[1].status = "completed";
				sendEvent("checklist", checklist);
				await delay(500);

				// Step 3: Generate images with DALL-E
				checklist[2].status = "running";
				sendEvent("checklist", checklist);

				const contentWithImages = await generateImages(contentData, analysis.visualStyle, sendEvent);

				checklist[2].status = "completed";
				sendEvent("checklist", checklist);
				await delay(500);

				// Step 4: Populate elements
				checklist[3].status = "running";
				sendEvent("checklist", checklist);

				const populatedOutlines = populateElements(outlines, contentWithImages);
				sendEvent("structure", {outlines: populatedOutlines});

				checklist[3].status = "completed";
				sendEvent("checklist", checklist);

				const sectionCount = populatedOutlines.length;
				const elementCount = populatedOutlines.reduce(
					(sum, outline) => sum + Object.keys(outline.elements || {}).length,
					0
				);

				sendEvent("complete", {
					success: true,
					summary: `Page generated successfully with ${sectionCount} section${sectionCount !== 1 ? "s" : ""} and ${elementCount} element${elementCount !== 1 ? "s" : ""}.`,
				});

				console.log("[Generate Page Stream] Complete:", {sectionCount, elementCount});
			} catch (error) {
				console.error("[Generate Page Stream] Error occurred:", error);
				sendEvent("error", {
					message: error instanceof Error ? error.message : "An error occurred during generation",
				});
			} finally {
				controller.close();
			}
		},
	});
}

// AI: Analyze instructions
async function analyzeInstructions(
	instructions: string,
	contentTypeId: string,
	files?: FileData[]
): Promise<AnalysisResult> {
	const MAX_TOKENS = 10000;
	const estimatedTokens = Math.ceil(instructions.length / 4);
	const truncatedInstructions =
		estimatedTokens > MAX_TOKENS
			? instructions.substring(0, MAX_TOKENS * 4) + "\n\n[Instructions truncated due to length...]"
			: instructions;

	const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
		{
			role: "system",
			content: `You are a web page planning expert. Analyze user instructions and plan a page structure.

Available section types: hero, features, benefits, testimonials, pricing, cta, faq, content
Available element types: ct-heading, ct-text, ct-rich-text, ct-button, ct-input, ct-image, ct-product

${files && files.length > 0 ? 'IMPORTANT: Reference images have been provided. Analyze their visual style (realistic photography, illustration, 3D render, etc.) and maintain this style consistently throughout the page.' : ''}

Respond with a JSON object:
{
  "pageType": "landing-page" | "product-page" | "content-page" | "form-page",
  "sections": [
    {
      "type": "section type",
      "title": "Section title for outline",
      "purpose": "Brief description",
      "contentNeeds": {"headings": 1, "paragraphs": 2, "buttons": 1, "images": 0}
    }
  ],
  "layout": "single-column",
  "tone": "professional" | "casual" | "technical" | "friendly",
  "targetAudience": "Brief description",
  "visualStyle": "realistic-photo" | "illustration" | "3d-render" | "flat-design" | "artistic"
}`,
		},
	];

	if (files && files.length > 0) {
		const content: any[] = [];

		// Add text instructions if provided
		if (truncatedInstructions.trim()) {
			content.push({
				type: "text",
				text: `Analyze these instructions for a ${contentTypeId} page:\n\n${truncatedInstructions}`,
			});
		} else {
			content.push({
				type: "text",
				text: `Analyze the provided image(s) and create a ${contentTypeId} page based on what you see. Extract relevant content, layouts, and design elements from the image(s). IMPORTANT: Identify the visual style of these images (realistic photo, illustration, etc.) and ensure ALL generated content maintains this exact same visual style.`,
			});
		}

		files.forEach((file) => {
			if (file.type.startsWith("image/")) {
				content.push({type: "image_url", image_url: {url: file.url}});
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

		if (!parsed.sections || !Array.isArray(parsed.sections)) {
			throw new Error("Invalid response structure");
		}

		console.log("[Generate Page Stream] Analysis complete:", {
			pageType: parsed.pageType,
			sectionsCount: parsed.sections.length,
		});

		return parsed;
	} catch (error) {
		console.error("[Generate Page Stream] AI analysis error:", error);

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
			visualStyle: files && files.length > 0 ? "realistic-photo" : undefined,
		};
	}
}

// AI: Generate content
async function generateContent(
	analysis: AnalysisResult,
	instructions: string
): Promise<ContentResult> {
	const visualStyleGuidance = analysis.visualStyle
		? `\nVisual Style: ${analysis.visualStyle}
CRITICAL: All image prompts MUST match this visual style exactly. ${
			analysis.visualStyle === 'realistic-photo'
				? 'ONLY photorealistic photography. Describe real scenes that could be photographed. NO fantasy, NO illustrations, NO cartoons, NO artistic renderings, NO magical elements. Realistic documentary-style photography only.'
				: analysis.visualStyle === 'illustration'
				? 'Use illustrated, drawn style. NO photorealistic images.'
				: analysis.visualStyle === '3d-render'
				? 'Use 3D rendered, CGI style. Clean and modern.'
				: analysis.visualStyle === 'flat-design'
				? 'Use flat, minimalist design with simple shapes and colors.'
				: 'Use artistic, creative interpretations.'
		}`
		: '';

	try {
		const completion = await openai!.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: `You are a professional copywriter. Generate engaging content for a web page.

Tone: ${analysis.tone}
Target Audience: ${analysis.targetAudience}${visualStyleGuidance}

Guidelines:
- Write clear, compelling copy
- Match the specified tone
- Keep headings concise (under 60 characters)
- Keep paragraphs readable (2-3 sentences)
- Make CTAs action-oriented
- Include specific details from user instructions
- For sections that need images, provide detailed DALL-E prompts that STRICTLY match the visual style above

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

${instructions ? `User instructions:\n${instructions}` : 'Base the content on the page structure and tone specified above.'}`,
				},
			],
			temperature: 0.7,
			response_format: {type: "json_object"},
			max_tokens: 4000,
		});

		const result = completion.choices[0]?.message?.content?.trim() || "{}";
		const parsed = JSON.parse(result) as ContentResult;

		console.log("[Generate Page Stream] Content generated:", {
			sectionCount: Object.keys(parsed.sections || {}).length,
		});

		return parsed;
	} catch (error) {
		console.error("[Generate Page Stream] AI content generation error:", error);

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

// AI: Generate images with DALL-E
async function generateImages(
	contentData: ContentResult,
	visualStyle?: "realistic-photo" | "illustration" | "3d-render" | "flat-design" | "artistic",
	sendEvent?: (event: string, data: any) => void
): Promise<ContentResult> {
	const updatedSections: Record<string, SectionContent> = {};

	// Count total images to generate
	let totalImages = 0;
	let currentImageIndex = 0;
	for (const content of Object.values(contentData.sections)) {
		if (content.imagePrompts) {
			totalImages += content.imagePrompts.length;
		}
	}

	// Create style prefix for DALL-E prompts based on visual style
	const getStylePrefix = () => {
		switch (visualStyle) {
			case "realistic-photo":
				return "Photorealistic photograph, professional photography, high resolution, sharp focus, natural lighting, realistic, documentary style, authentic, ";
			case "illustration":
				return "Hand-drawn illustration style, artistic, detailed illustration of ";
			case "3d-render":
				return "3D rendered CGI image, clean modern render, ";
			case "flat-design":
				return "Flat design style, minimalist, simple shapes and colors, ";
			case "artistic":
				return "Artistic creative interpretation, expressive style, ";
			default:
				return "";
		}
	};

	const stylePrefix = getStylePrefix();

	for (const [sectionKey, content] of Object.entries(contentData.sections)) {
		updatedSections[sectionKey] = {...content};

		if (content.imagePrompts && content.imagePrompts.length > 0) {
			const generatedImages: Array<{url: string; alt: string}> = [];

			for (const imagePrompt of content.imagePrompts) {
				currentImageIndex++;

				// Send progress update for this image
				if (sendEvent) {
					sendEvent("checklist", [
						{label: "Analyzing instructions", status: "completed"},
						{label: "Generating text content", status: "completed"},
						{label: `Generating images (${currentImageIndex} of ${totalImages})`, status: "running"},
						{label: "Populating elements", status: "pending"},
					]);
				}

				try {
					// Prepend visual style to ensure consistency
					let enhancedPrompt = stylePrefix + imagePrompt.prompt;

					// For realistic photos, add explicit anti-fantasy instructions
					if (visualStyle === "realistic-photo") {
						enhancedPrompt += ". NO fantasy, NO artistic rendering, NO illustration, realistic photography only";
					}

					console.log(`[Generate Page Stream] Generating image ${currentImageIndex}/${totalImages} (${visualStyle || 'default'}): "${enhancedPrompt.substring(0, 80)}..."`);

					const response = await openai!.images.generate({
						model: "dall-e-3",
						prompt: enhancedPrompt,
						n: 1,
						size: "1024x1024",
						quality: "hd", // Use HD quality for better photorealistic results
					});

					const imageUrl = response?.data?.[0]?.url;
					if (imageUrl) {
						generatedImages.push({url: imageUrl, alt: imagePrompt.alt});
					}
				} catch (error: any) {
					console.error(`[Generate Page Stream] Image generation error:`, error.message);
				}
			}

			updatedSections[sectionKey].images = generatedImages;
			delete updatedSections[sectionKey].imagePrompts;
		}
	}

	return {sections: updatedSections};
}

// Create section outlines
function createSections(sections: SectionSpec[]): PageOutline[] {
	return sections.map((section, index) => {
		const outlineId = generateId("ol", index.toString());
		const sectionId = generateId("sec", index.toString());
		const rowId = generateId("row", index.toString());
		const colId = generateId("col", index.toString());
		const title = section.title || section.type.charAt(0).toUpperCase() + section.type.slice(1);

		return {
			id: outlineId,
			title,
			sectionType: section.type,
			tree: [
				{
					id: sectionId,
					name: title,
					open: true,
					children: [
						{
							id: rowId,
							open: true,
							children: [{id: colId, open: true, elements: []}],
						},
					],
				},
			],
			elements: {},
		};
	});
}

// Element creation helpers
function createElement(type: string, properties: any) {
	return {type, properties};
}

function createHeadingElement(text: string, level: string, template?: string) {
	return createElement("ct-heading", {
		text: {value: text},
		level: {value: level},
		template: {value: template || "default"},
	});
}

function createTextElement(text: string, template?: string) {
	return createElement("ct-text", {
		text: {value: text},
		template: {value: template || "default"},
	});
}

function createButtonElement(label: string, url: string = "#", template?: string) {
	return createElement("ct-button", {
		label: {value: label},
		url: {value: url},
		template: {value: template || "primary"},
	});
}

function createImageElement(src: string, alt: string) {
	return createElement("ct-image", {
		src: {value: src},
		alt: {value: alt},
	});
}

// Populate elements into outlines
function populateElements(outlines: PageOutline[], contentData: ContentResult): PageOutline[] {
	return outlines.map((outline) => {
		const sectionType = outline.sectionType || "content";

		// Match by title first, then by type
		let sectionContent = contentData.sections[outline.title];
		if (!sectionContent && outline.sectionType) {
			sectionContent = contentData.sections[outline.sectionType];
		}

		if (!sectionContent) return outline;

		const elements: Record<string, any> = {};
		const elementIds: string[] = [];
		const addElement = (element: any) => {
			const id = generateId("ele");
			elementIds.push(id);
			elements[id] = element;
		};

		// Heading
		if (sectionContent.heading) {
			addElement(createHeadingElement(sectionContent.heading, sectionType === "hero" ? "h1" : "h2"));
		}

		// Subheading
		if (sectionContent.subheading) {
			addElement(createTextElement(sectionContent.subheading));
		}

		// Paragraphs
		sectionContent.paragraphs?.forEach((para) => {
			addElement(createTextElement(para));
		});

		// List items
		sectionContent.listItems?.forEach((item) => {
			addElement(createHeadingElement(item.title, "h3"));
			addElement(createTextElement(item.description));
		});

		// Button
		if (sectionContent.buttonText) {
			addElement(createButtonElement(sectionContent.buttonText, sectionContent.buttonUrl));
		}

		// Images
		sectionContent.images?.forEach((image) => {
			addElement(createImageElement(image.url, image.alt));
		});

		// Update tree
		const updatedTree = JSON.parse(JSON.stringify(outline.tree));
		if (updatedTree[0]?.children[0]?.children[0]) {
			updatedTree[0].children[0].children[0].elements = elementIds.map((id) => ({id}));
		}

		return {...outline, tree: updatedTree, elements};
	});
}
