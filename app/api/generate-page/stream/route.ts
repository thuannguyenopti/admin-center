/**
 * SSE Streaming endpoint for AI-powered page generation
 * Generates page structure and content based on user instructions
 */

import OpenAI from "openai";
import {STRIDE_SHORT_CONTEXT} from "../../ai-context";
import {getContentType} from "@/app/db/initialData";
import {openai} from "@/app/lib/openai";
import {ChecklistItem, delay, sseHeaders} from "@/app/lib/streaming";
import {generateImage, type VisualStyle} from "@/app/lib/imageGeneration";

// Types

interface SectionSpec {
	type: string;
	title: string;
	purpose: string;
	columns?: number;
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
	visualStyle?: VisualStyle;
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

interface PropertyGenerationSpec {
	id: string;
	name: string;
	type: string;
	required?: boolean;
	allowedTypes?: string[];
}

interface GenerationStrategy {
	type: "outline" | "property" | "mixed";
	outlineProperties: PropertyGenerationSpec[];
	dataProperties: PropertyGenerationSpec[];
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

		return new Response(stream, {headers: sseHeaders()});
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

// Property-based generation flow
async function generatePropertyBasedContent(
	instructions: string,
	contentTypeId: string,
	strategy: GenerationStrategy,
	files: FileData[] | undefined,
	sendEvent: (event: string, data: any) => void,
	delay: (ms: number) => Promise<unknown>
) {
	// Check if instructions mention images
	const needsImages = /image|picture|photo|illustration|visual|pixel art|drawing|artwork/i.test(instructions);

	// Checklist with optional image generation step
	const checklist: ChecklistItem[] = [
		{label: "Analyzing instructions", status: "pending"},
		{label: "Generating content", status: "pending"},
	];

	if (needsImages) {
		checklist.push({label: "Generating images", status: "pending"});
	}

	checklist.push({label: "Populating properties", status: "pending"});

	sendEvent("checklist", {items: checklist});
	await delay(500);

	// Step 1: Analyze
	checklist[0].status = "running";
	sendEvent("checklist", {items: checklist});

	const propertyData = await analyzePropertyBasedContent(
		instructions,
		contentTypeId,
		strategy.dataProperties,
		files
	);

	checklist[0].status = "completed";
	sendEvent("checklist", {items: checklist});
	await delay(500);

	// Step 2: Content already generated in analysis
	checklist[1].status = "running";
	sendEvent("checklist", {items: checklist});

	checklist[1].status = "completed";
	sendEvent("checklist", {items: checklist});
	await delay(500);

	// Step 3: Generate images if needed
	if (needsImages && propertyData.imagePrompt) {
		const imageStepIndex = 2; // Third step when images are included
		checklist[imageStepIndex].status = "running";
		sendEvent("checklist", {items: checklist});

		try {
			// Determine visual style from instructions
			const visualStyle = instructions.toLowerCase().includes("pixel art") ? "flat-design" :
				instructions.toLowerCase().includes("illustration") ? "illustration" :
				instructions.toLowerCase().includes("3d") ? "3d-render" :
				"realistic-photo";

			// Generate image using existing function
			const imageResult = await generateImages(
				{ sections: { main: { imagePrompts: [propertyData.imagePrompt] } } },
				visualStyle as any,
				sendEvent
			);

			// Find the correct image property from schema (don't hard-code "featuredImage")
			const imageProperty = strategy.dataProperties.find(
				(prop) =>
					prop.type === "ContentReference" &&
					prop.allowedTypes &&
					(prop.allowedTypes.includes("ct-image") || prop.allowedTypes.includes("ct-image-block"))
			);

			// Add generated image URL to the correct property
			if (imageResult.sections.main?.images?.[0] && imageProperty) {
				propertyData[imageProperty.id] = imageResult.sections.main.images[0].url;
			}

			// Clean up temporary imagePrompt field
			delete propertyData.imagePrompt;
		} catch (error) {
			console.error("[Generate Page Stream] Image generation error:", error);
		}

		checklist[imageStepIndex].status = "completed";
		sendEvent("checklist", {items: checklist});
		await delay(500);
	}

	// Final step: Populate (send data to frontend)
	const finalStepIndex = checklist.length - 1;
	checklist[finalStepIndex].status = "running";
	sendEvent("checklist", {items: checklist});

	sendEvent("structure", {
		outlines: [], // No outlines for property-based
		data: propertyData
	});

	checklist[finalStepIndex].status = "completed";
	sendEvent("checklist", {items: checklist, isCompleted: true});
}

// Outline-based generation flow
async function generateOutlineBasedContent(
	instructions: string,
	contentTypeId: string,
	strategy: GenerationStrategy,
	files: FileData[] | undefined,
	sendEvent: (event: string, data: any) => void,
	delay: (ms: number) => Promise<unknown>
) {
	const checklist: ChecklistItem[] = [
		{label: "Analyzing instructions", status: "pending"},
		{label: "Generating text content", status: "pending"},
		{label: "Generating images", status: "pending"},
		{label: "Populating elements", status: "pending"},
	];

	sendEvent("checklist", {items: checklist});
	await delay(500);

	// Step 1: Analyze & create structure
	checklist[0].status = "running";
	sendEvent("checklist", {items: checklist});

	const analysis = await analyzeInstructions(instructions, contentTypeId, files);
	const outline = createSections(analysis.sections, "Page Content");

	const pageType = analysis.pageType;
	const sectionNames = analysis.sections.map(s => s.title);

	sendEvent("structure", {outlines: [outline]});

	checklist[0].status = "completed";
	sendEvent("checklist", {
		items: checklist,
		pageType,
		sections: sectionNames,
	});
	await delay(500);

	// Step 2: Generate text content
	checklist[1].status = "running";
	sendEvent("checklist", {
		items: checklist,
		pageType,
		sections: sectionNames,
	});

	const contentData = await generateContent(analysis, instructions);

	checklist[1].status = "completed";
	sendEvent("checklist", {
		items: checklist,
		pageType,
		sections: sectionNames,
	});
	await delay(500);

	// Step 3: Generate images with DALL-E
	checklist[2].status = "running";
	sendEvent("checklist", {
		items: checklist,
		pageType,
		sections: sectionNames,
	});

	const contentWithImages = await generateImages(contentData, analysis.visualStyle, sendEvent);

	checklist[2].status = "completed";
	sendEvent("checklist", {
		items: checklist,
		pageType,
		sections: sectionNames,
	});
	await delay(500);

	// Step 4: Populate elements
	checklist[3].status = "running";
	sendEvent("checklist", {
		items: checklist,
		pageType,
		sections: sectionNames,
	});

	const populatedOutline = populateElements(outline, contentWithImages);
	sendEvent("structure", {outlines: [populatedOutline]});

	checklist[3].status = "completed";
	sendEvent("checklist", {
		items: checklist,
		pageType,
		sections: sectionNames,
		isCompleted: true,
	});
}

// Content type detection
function determineGenerationStrategy(contentTypeId: string): GenerationStrategy {
	const contentType = getContentType(contentTypeId);

	if (!contentType) {
		throw new Error(`Content type ${contentTypeId} not found`);
	}

	const outlineProperties: PropertyGenerationSpec[] = [];
	const dataProperties: PropertyGenerationSpec[] = [];

	contentType.properties?.forEach((prop) => {
		if (prop.type === "outline") {
			outlineProperties.push({
				id: prop.id,
				name: prop.name,
				type: prop.type,
				required: prop.required,
			});
		} else {
			dataProperties.push({
				id: prop.id,
				name: prop.name,
				type: prop.type,
				required: prop.required,
				allowedTypes: prop.allowedTypes,
			});
		}
	});

	// Determine strategy based on which properties exist
	if (outlineProperties.length > 0 && dataProperties.length === 0) {
		return { type: "outline", outlineProperties, dataProperties };
	} else if (outlineProperties.length === 0 && dataProperties.length > 0) {
		return { type: "property", outlineProperties, dataProperties };
	} else {
		return { type: "mixed", outlineProperties, dataProperties };
	}
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

			try {
				// Determine generation strategy based on content type
				const strategy = determineGenerationStrategy(contentTypeId);

				console.log("[Generate Page Stream] Generation strategy:", {
					contentTypeId,
					strategyType: strategy.type,
					outlineCount: strategy.outlineProperties.length,
					dataCount: strategy.dataProperties.length,
				});

				// Route to appropriate generation flow
				if (strategy.type === "property") {
					await generatePropertyBasedContent(
						instructions,
						contentTypeId,
						strategy,
						files,
						sendEvent,
						delay
					);
				} else {
					// "outline" or "mixed" - use existing outline-based generation
					await generateOutlineBasedContent(
						instructions,
						contentTypeId,
						strategy,
						files,
						sendEvent,
						delay
					);
				}

				sendEvent("complete", {
					success: true,
					summary: `Page generated successfully.`,
				});

				console.log("[Generate Page Stream] Complete");
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
			content: `You are a web page planning expert.

${STRIDE_SHORT_CONTEXT}

UNDERSTANDING THE PAGE STRUCTURE:
A page consists of ONE outline containing MULTIPLE sections. Each section contains rows, which contain columns, which contain elements.

Structure hierarchy:
1. OUTLINE (ONE per page) - The top-level container for all content
   └─ Contains multiple SECTIONS (hero, features, pricing, etc.)

2. SECTION (MULTIPLE per outline) - Logical content blocks like "Hero", "Features", "Pricing"
   └─ Each section has a name and type
   └─ Contains ROWs

3. ROW (ONE or more per section) - Horizontal layout container
   └─ Contains COLUMNs

4. COLUMN (ONE or more per row) - Vertical content stacks
   └─ Number determined by the section's "columns" property
   └─ Content flows vertically within each column
   └─ Multiple columns sit side-by-side in a row
   └─ Contains ELEMENT references

5. ELEMENT - Individual content pieces (headings, text, buttons, images)
   └─ Stored in the outline's elements map
   └─ Referenced by ID in column.elements[]

CRITICAL: When the user asks for "a page with a hero, features, and CTA", you create ONE outline with THREE sections (hero, features, cta), NOT three separate outlines.

Available section types: hero, features, benefits, testimonials, pricing, cta, faq, content
Available element types: ct-heading, ct-text, ct-rich-text, ct-button, ct-input, ct-image, ct-product

${files && files.length > 0 ? 'IMPORTANT: Reference images have been provided. Analyze their visual style (realistic photography, illustration, 3D render, etc.) and maintain this style consistently throughout the page.' : ''}

COLUMN & LAYOUT GUIDELINES (from PAGE_GENERATION_RULES.md):
- Hero sections: "columns": 1 (full-width focus)
- Features section: "columns": 3 (or number of features for side-by-side layout)
- Benefits section: "columns": 2 or 3 (balanced visual weight)
- Testimonials section: "columns": 3 (social proof in grid)
- Pricing section: "columns": 3 or 4 (one column per pricing tier)
- CTA/FAQ/Content sections: "columns": 1 (single focus)

CRITICAL - COLUMN DETECTION:
The "columns" property is REQUIRED for EVERY section. When the user mentions a NUMBER of items, use that number as columns:
- "3 quotes" → testimonials section with "columns": 3
- "3 testimonials" → testimonials section with "columns": 3
- "4 features" → features section with "columns": 4
- "3 pricing tiers" → pricing section with "columns": 3
- "multi-column layout" → use "columns": 2 or 3 based on item count
- "side by side" → use "columns": 2 or more

Examples:
- "A section with 3 quotes" → {"type": "testimonials", "columns": 3}
- "Show 4 key features" → {"type": "features", "columns": 4}
- "3 pricing options" → {"type": "pricing", "columns": 3}

Respond with a JSON object describing the sections to create within ONE outline:
{
  "pageType": "landing-page" | "product-page" | "content-page" | "form-page",
  "sections": [
    {
      "type": "hero",
      "title": "Hero",
      "purpose": "Main hero section with headline and CTA",
      "columns": 1,
      "contentNeeds": {"headings": 1, "paragraphs": 1, "buttons": 1, "images": 1}
    },
    {
      "type": "features",
      "title": "Features",
      "purpose": "Three key features side by side",
      "columns": 3,
      "contentNeeds": {"headings": 0, "paragraphs": 0, "buttons": 0, "images": 0}
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
			sections: parsed.sections.map(s => ({
				title: s.title,
				type: s.type,
				columns: s.columns || 1,
			})),
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
All image prompts should match this visual style consistently. ${
			analysis.visualStyle === 'realistic-photo'
				? 'Use photorealistic photography. Describe real, photographable scenes with documentary-style photography. Focus on natural lighting, authentic moments, and realistic compositions.'
				: analysis.visualStyle === 'illustration'
				? 'Use illustrated, drawn style with artistic rendering and expressive details.'
				: analysis.visualStyle === '3d-render'
				? 'Use 3D rendered CGI style with clean, modern compositions and polished surfaces.'
				: analysis.visualStyle === 'flat-design'
				? 'Use flat, minimalist design with simple shapes, solid colors, and graphic elements.'
				: 'Use artistic, creative interpretations with expressive style and visual interest.'
		}`
		: '';

	try {
		const completion = await openai!.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: `You are a professional copywriter.

${STRIDE_SHORT_CONTEXT}

Tone: ${analysis.tone}
Target Audience: ${analysis.targetAudience}${visualStyleGuidance}

CONTENT STRUCTURE (from PAGE_GENERATION_RULES.md):

1. SECTION HEADINGS:
   Each section has ONE primary heading that serves as both the section title and the content heading.
   Make headings meaningful and descriptive.
   Example: Section "Features" → heading: "Built for Modern Teams"

2. HEADING HIERARCHY:
   - Hero section: Use h1 for main headline (ONE per page)
   - Other sections: The "heading" field becomes an h2
   - List items: The "title" field becomes an h3

3. CONTENT QUALITY:
   - Keep headings concise (under 60 characters)
   - Keep paragraphs readable (2-3 sentences)
   - Make CTAs action-oriented and specific ("Start Free Trial", "Download the Guide")
   - Include specific details from user instructions with concrete examples
   - Write for the target audience's knowledge level

4. MULTI-COLUMN SECTIONS:
   - When "columns" > 1, generate "listItems" to populate those columns
   - Generate 2-3x as many list items as there are columns for variety
   - Features/Benefits: {"title": "Short benefit-driven title", "description": "1-2 sentence detail"}
   - Testimonials: {"title": "Person Name / Role", "description": "The quote text as a complete testimonial"}
   - Each item will be displayed in its own column

5. IMAGE PROMPTS:
   - Provide detailed DALL-E prompts matching the visual style above
   - Include descriptive alt text for accessibility
   - Images should directly support the surrounding content

SECTION KEYS: Use the EXACT "title" field from each section as the key in your response.
Example: if section has "title": "Hero", use "Hero" as the key (case-sensitive).
If section has "title": "Key Features", use "Key Features" as the key.

Response format - JSON object mapping section titles to content:
{
  "sections": {
    "Hero": {
      "heading": "Transform Your Workflow with AI",
      "subheading": "Supporting text explaining the value proposition in 1-2 sentences.",
      "buttonText": "Start Free Trial",
      "buttonUrl": "#",
      "imagePrompts": [
        {"prompt": "Detailed DALL-E prompt matching visual style", "alt": "Descriptive alt text"}
      ]
    },
    "Features": {
      "heading": "Built for Modern Teams",
      "listItems": [
        {"title": "Real-Time Collaboration", "description": "Work together seamlessly with live updates across all devices."},
        {"title": "AI-Powered Insights", "description": "Get actionable recommendations based on your data patterns."},
        {"title": "Enterprise Security", "description": "Bank-level encryption with SOC 2 and GDPR compliance."},
        {"title": "Seamless Integrations", "description": "Connect with tools you already use daily."},
        {"title": "Smart Workflows", "description": "Automate repetitive tasks with customizable templates."},
        {"title": "Advanced Analytics", "description": "Track performance with powerful visualization tools."}
      ]
    },
    "Testimonials": {
      "heading": "What Runners Are Saying",
      "listItems": [
        {"title": "Anna S.", "description": "Participating in the Stride 10km race was an unforgettable experience! The route was stunning, and the support from the community was incredible."},
        {"title": "Erik L.", "description": "As a professional runner, I appreciated the organization and the challenge the course provided. It was both fun and competitive."},
        {"title": "Maria J.", "description": "It was my first 10km race, and the encouragement from other runners and organizers made it such a rewarding experience. Can't wait for next year!"}
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
	visualStyle?: VisualStyle,
	sendEvent?: (event: string, data: any) => void
): Promise<ContentResult> {
	const updatedSections: Record<string, SectionContent> = {};

	// If no OpenAI client, use placeholders for all images
	if (!openai) {
		console.warn("[Generate Page Stream] No OpenAI client configured, using placeholders for images");
		for (const [sectionKey, content] of Object.entries(contentData.sections)) {
			updatedSections[sectionKey] = {...content};
			if (content.imagePrompts && content.imagePrompts.length > 0) {
				updatedSections[sectionKey].images = content.imagePrompts.map(prompt => ({
					url: "https://placehold.co/1024x576/2563eb/ffffff?text=Image+Placeholder",
					alt: prompt.alt
				}));
				delete updatedSections[sectionKey].imagePrompts;
			}
		}
		return {sections: updatedSections};
	}

	// Count total images to generate
	let totalImages = 0;
	let currentImageIndex = 0;
	for (const content of Object.values(contentData.sections)) {
		if (content.imagePrompts) {
			totalImages += content.imagePrompts.length;
		}
	}

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

				console.log(`[Generate Page Stream] Generating image ${currentImageIndex}/${totalImages}`);

				// Use shared generateImage function
				const generatedImage = await generateImage(imagePrompt, visualStyle);
				generatedImages.push(generatedImage);
			}

			updatedSections[sectionKey].images = generatedImages;
			delete updatedSections[sectionKey].imagePrompts;
		}
	}

	return {sections: updatedSections};
}

// AI: Analyze instructions for property-based content types
async function analyzePropertyBasedContent(
	instructions: string,
	contentTypeId: string,
	properties: PropertyGenerationSpec[],
	files?: FileData[]
): Promise<Record<string, any>> {
	const contentType = getContentType(contentTypeId);

	const propertyDescriptions = properties
		.map(p => {
			const typeInfo = p.type === "ContentReference"
				? `${p.type} (references: ${p.allowedTypes?.join(", ") || "any"})`
				: p.type;
			const requiredFlag = p.required ? " [REQUIRED]" : "";
			return `- ${p.id} (${p.name}): ${typeInfo}${requiredFlag}`;
		})
		.join("\n");

	const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
		{
			role: "system",
			content: `You are a professional content writer creating content for a ${contentType?.displayName || contentType?.name} page.

${STRIDE_SHORT_CONTEXT}

CONTENT TYPE SCHEMA:
${propertyDescriptions}

PROPERTY TYPE GUIDELINES:
- String: Short text (titles, names, labels) - keep under 100 characters
- LongString: Longer text (descriptions, summaries) - 1-2 paragraphs
- XhtmlString: Rich formatted HTML content (articles, body content) - use semantic HTML tags
- ContentReference: Reference to another content item (leave as empty string for now)
- Boolean: true/false values
- DateTime: ISO date string (e.g., "2026-05-07T12:00:00Z")
- Int/Double: Numeric values

XHTMLSTRING FORMATTING:
- Use semantic HTML: <h2>, <h3>, <p>, <ul>, <ol>, <strong>, <em>
- Structure with proper headings and paragraphs
- Keep markup clean and valid
- Example: "<h2>Section Title</h2><p>First paragraph.</p><p>Second paragraph with <strong>emphasis</strong>.</p>"

CONTENT REFERENCE HANDLING:
- For properties like "author" or "seo" that are ContentReference type
- Leave these as empty string "" for now
- Focus on directly editable text properties

IMAGE GENERATION:
- If the user's instructions mention generating an image, include an "imagePrompt" field
- The imagePrompt should be a detailed DALL-E prompt describing the image to generate
- Include the visual style mentioned by the user (pixel art, illustration, photo, etc.)
- Example: {"prompt": "Pixel art style illustration of a frog wearing a wizard's hat with stars, whimsical and colorful", "alt": "Frog with wizard hat"}

Response format - JSON object with property values:
{
  "title": "Example Title Here",
  "subtitle": "Supporting subtitle text",
  "body": "<h2>Introduction</h2><p>Rich HTML content...</p>",
  "author": "",
  "seo": "",
  "imagePrompt": {"prompt": "Detailed DALL-E prompt if image requested", "alt": "Alt text"}
}`,
		},
	];

	// Add files if provided
	if (files && files.length > 0) {
		const content: any[] = [];
		if (instructions.trim()) {
			content.push({
				type: "text",
				text: `Generate content based on these instructions:\n\n${instructions}`,
			});
		} else {
			content.push({
				type: "text",
				text: `Generate content based on the provided images.`,
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
			content: `Generate content for:\n\n${instructions}`,
		});
	}

	try {
		const completion = await openai!.chat.completions.create({
			model: "gpt-4o",
			messages,
			temperature: 0.7,
			response_format: {type: "json_object"},
			max_tokens: 4000,
		});

		const result = completion.choices[0]?.message?.content?.trim() || "{}";
		const parsed = JSON.parse(result);

		console.log("[Generate Page Stream] Property-based content generated:", {
			propertyCount: Object.keys(parsed).length,
		});

		return parsed;
	} catch (error) {
		console.error("[Generate Page Stream] Property-based content generation error:", error);

		// Return minimal fallback with required properties
		const fallback: Record<string, any> = {};
		properties.forEach(prop => {
			if (prop.required) {
				fallback[prop.id] = prop.type === "String" ? "Untitled" : "";
			}
		});
		return fallback;
	}
}

// Create ONE outline with multiple sections in tree
function createSections(sections: SectionSpec[], pageTitle: string = "Page Content"): PageOutline {
	const outlineId = generateId("ol");
	const sectionNodes = sections.map((section, index) => {
		const sectionId = generateId("sec", index.toString());
		const rowId = generateId("row", index.toString());
		const title = section.title || section.type.charAt(0).toUpperCase() + section.type.slice(1);

		// Create columns based on spec (default to 1)
		const numColumns = section.columns || 1;
		const columns = Array.from({length: numColumns}, (_, colIndex) => ({
			id: generateId("col", `${index}-${colIndex}`),
			open: true,
			elements: []
		}));

		return {
			id: sectionId,
			name: title,
			sectionType: section.type,
			open: true,
			children: [
				{
					id: rowId,
					open: true,
					children: columns,
				},
			],
		};
	});

	return {
		id: outlineId,
		title: pageTitle,
		sectionType: "page",
		tree: sectionNodes,
		elements: {},
	};
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
	return createElement("ct-image-block", {
		image: {value: src},
	});
}

// Populate elements into a single outline with multiple sections
function populateElements(outline: PageOutline, contentData: ContentResult): PageOutline {
	const elements: Record<string, any> = {};
	const updatedTree = JSON.parse(JSON.stringify(outline.tree));

	console.log("[populateElements] Available content keys:", Object.keys(contentData.sections));
	console.log("[populateElements] Sections in tree:", updatedTree.map((s: any) => ({name: s.name, type: s.sectionType})));

	// Helper to add element and return its ID
	const addElement = (element: any): string => {
		const id = generateId("ele");
		elements[id] = element;
		return id;
	};

	// Process each section in the tree
	updatedTree.forEach((section: any, index: number) => {
		const sectionName = section.name;
		const sectionType = section.sectionType || "content";

		// Try multiple matching strategies
		let sectionContent =
			// 1. Exact name match
			contentData.sections[sectionName] ||
			// 2. Exact type match
			contentData.sections[sectionType] ||
			// 3. Case-insensitive name match
			contentData.sections[Object.keys(contentData.sections).find(k => k.toLowerCase() === sectionName.toLowerCase()) || ""] ||
			// 4. Case-insensitive type match
			contentData.sections[Object.keys(contentData.sections).find(k => k.toLowerCase() === sectionType.toLowerCase()) || ""];

		if (!sectionContent) {
			console.warn(`[populateElements] No content found for section "${sectionName}" (type: ${sectionType}), available keys:`, Object.keys(contentData.sections));
			return;
		}

		console.log(`[populateElements] Matched section "${sectionName}" to content, has:`, {
			heading: !!sectionContent.heading,
			paragraphs: sectionContent.paragraphs?.length,
			listItems: sectionContent.listItems?.length,
			images: sectionContent.images?.length,
		});

		// Get columns from first row of section
		const columns = section.children?.[0]?.children || [];
		const numColumns = columns.length;

		// If single column or no list items, put everything in first column
		if (numColumns === 1 || !sectionContent.listItems || sectionContent.listItems.length === 0) {
			const elementIds: string[] = [];

			// Heading
			if (sectionContent.heading) {
				elementIds.push(addElement(createHeadingElement(sectionContent.heading, sectionType === "hero" ? "h1" : "h2")));
			}

			// Subheading
			if (sectionContent.subheading) {
				elementIds.push(addElement(createTextElement(sectionContent.subheading)));
			}

			// Paragraphs - handle both array and single string
			if (sectionContent.paragraphs) {
				if (Array.isArray(sectionContent.paragraphs)) {
					sectionContent.paragraphs.forEach((para) => {
						elementIds.push(addElement(createTextElement(para)));
					});
				} else if (typeof sectionContent.paragraphs === 'string') {
					elementIds.push(addElement(createTextElement(sectionContent.paragraphs)));
				}
			}

			// List items (if any)
			sectionContent.listItems?.forEach((item) => {
				elementIds.push(addElement(createHeadingElement(item.title, "h3")));
				elementIds.push(addElement(createTextElement(item.description)));
			});

			// Button
			if (sectionContent.buttonText) {
				elementIds.push(addElement(createButtonElement(sectionContent.buttonText, sectionContent.buttonUrl)));
			}

			// Images
			sectionContent.images?.forEach((image) => {
				elementIds.push(addElement(createImageElement(image.url, image.alt)));
			});

			// Assign all to first column
			if (columns[0]) {
				columns[0].elements = elementIds.map((id) => ({id}));
			}
		} else {
			// Multi-column with list items - distribute list items across columns
			const sharedElementIds: string[] = [];

			// Heading and subheading go in first column only
			if (sectionContent.heading) {
				sharedElementIds.push(addElement(createHeadingElement(sectionContent.heading, sectionType === "hero" ? "h1" : "h2")));
			}

			if (sectionContent.subheading) {
				sharedElementIds.push(addElement(createTextElement(sectionContent.subheading)));
			}

			// Distribute list items across columns
			sectionContent.listItems.forEach((item, index) => {
				const colIndex = index % numColumns;
				const itemIds: string[] = [];

				itemIds.push(addElement(createHeadingElement(item.title, "h3")));
				itemIds.push(addElement(createTextElement(item.description)));

				// Add to the appropriate column
				if (!columns[colIndex].elements) {
					columns[colIndex].elements = [];
				}
				columns[colIndex].elements.push(...itemIds.map((id) => ({id})));
			});

			// Add shared elements to first column
			if (columns[0] && sharedElementIds.length > 0) {
				columns[0].elements = [
					...sharedElementIds.map((id) => ({id})),
					...(columns[0].elements || [])
				];
			}

			// Button and images in first column
			const extraElementIds: string[] = [];
			if (sectionContent.buttonText) {
				extraElementIds.push(addElement(createButtonElement(sectionContent.buttonText, sectionContent.buttonUrl)));
			}

			sectionContent.images?.forEach((image) => {
				extraElementIds.push(addElement(createImageElement(image.url, image.alt)));
			});

			if (columns[0] && extraElementIds.length > 0) {
				columns[0].elements.push(...extraElementIds.map((id) => ({id})));
			}
		}
	});

	return {...outline, tree: updatedTree, elements};
}
