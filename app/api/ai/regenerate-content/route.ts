/**
 * API endpoint for AI-powered content regeneration
 * Regenerates text, images, or both for a content instance based on user instructions
 */

import OpenAI from "openai";
import type { ContentInstance } from "@/app/db/cmpInitialData";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
	: null;

const COMPANY_CONTEXT = `Stride is a professional sports event company that organizes and manages endurance running events, triathlons, and athletic competitions. We provide comprehensive event management services including race logistics, participant registration, timing systems, and post-race experiences. Our events range from 5K community runs to ultramarathons and IRONMAN-distance triathlons, welcoming participants of all abilities from first-time runners to competitive athletes. We're known for creating well-organized, inclusive sporting events that combine athletic challenge with community building.`;

const EVENT_PHOTOGRAPHY_CONTEXT = `Organized race event photography: professional race setting with branded signage, timing equipment, participant bibs, event tents/infrastructure, race course markers, and support stations. Shows diverse participants - mix of casual runners, age-groupers, and competitive athletes - in motion during a sanctioned sporting event. Captures the inclusive, community atmosphere of organized endurance sports with participants of varying fitness levels and abilities.`;

type RegenerationType = "text" | "images" | "both";

interface RegenerateContentRequest {
	contentInstance: ContentInstance;
	regenerationType: RegenerationType;
	customPrompt: string;
	imageGuidelines?: string;
}

export async function POST(request: Request) {
	if (!openai) {
		return Response.json(
			{ error: "OpenAI API key not configured" },
			{ status: 500 }
		);
	}

	try {
		const body = await request.json() as RegenerateContentRequest;
		const { contentInstance, regenerationType, customPrompt, imageGuidelines } = body;

		if (!contentInstance) {
			return Response.json(
				{ error: "Content instance is required" },
				{ status: 400 }
			);
		}

		console.log(`[Regenerate Content] Starting regeneration for ${contentInstance.id} (type: ${regenerationType})`);

		// Clone the instance to avoid mutation
		const updatedInstance: ContentInstance = {
			...contentInstance,
			fields: { ...contentInstance.fields },
			modifiedAt: new Date().toISOString(),
		};

		// Regenerate based on type
		if (regenerationType === "text" || regenerationType === "both") {
			await regenerateTextFields(updatedInstance, customPrompt);
		}

		if (regenerationType === "images" || regenerationType === "both") {
			await regenerateImageFields(updatedInstance, customPrompt, imageGuidelines);
		}

		console.log(`[Regenerate Content] Successfully regenerated ${contentInstance.id}`);

		return Response.json({ contentInstance: updatedInstance });

	} catch (error) {
		console.error("[Regenerate Content] Error occurred:", error);
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal Server Error" },
			{ status: 500 }
		);
	}
}

// Regenerate text fields (headline, body, description, etc.)
async function regenerateTextFields(
	contentInstance: ContentInstance,
	customPrompt: string
): Promise<void> {
	const fields = contentInstance.fields;

	// Determine what text fields exist
	const hasHeadline = "headline" in fields;
	const hasTitle = "title" in fields;
	const hasSubheadline = "subheadline" in fields;
	const hasDescription = "description" in fields;
	const hasBody = "body" in fields;
	const hasSubjectLine = "subject_line" in fields;
	const hasPreheader = "preheader" in fields;

	// Build context about current content
	const currentContent = {
		headline: fields.headline || fields.title || "",
		subheadline: fields.subheadline || "",
		description: fields.description || fields.excerpt || "",
		body: fields.body || "",
		subject_line: fields.subject_line || "",
		preheader: fields.preheader || "",
	};

	try {
		const completion = await openai!.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: `You are a professional content writer for Stride, a professional sports event company.

Company Background: ${COMPANY_CONTEXT}

Guidelines:
- Maintain the same general topic and purpose as the original content
- Apply the user's custom instructions to improve the content
- Keep the tone professional but friendly
- Focus on benefits and value to athletes/participants
- Preserve HTML formatting if body content has it

Respond with a JSON object containing the regenerated fields:
{
  "headline": "Main headline or title",
  "subheadline": "Supporting subheadline (if applicable)",
  "description": "Brief description or excerpt",
  "body": "Full body content (preserve HTML if present)",
  "subject_line": "Email subject line (if applicable)",
  "preheader": "Email preheader (if applicable)"
}`,
				},
				{
					role: "user",
					content: `Current content:
${JSON.stringify(currentContent, null, 2)}

Custom instructions: ${customPrompt || "Improve and refine the content while maintaining the core message."}

Please regenerate the text fields according to the custom instructions.`,
				},
			],
			temperature: 0.7,
			response_format: { type: "json_object" },
			max_tokens: 2000,
		});

		const result = completion.choices[0]?.message?.content?.trim() || "{}";
		const parsed = JSON.parse(result);

		// Update only the fields that exist in the original
		if (hasHeadline) fields.headline = parsed.headline || fields.headline;
		if (hasTitle) fields.title = parsed.headline || fields.title;
		if (hasSubheadline) fields.subheadline = parsed.subheadline || fields.subheadline;
		if (hasDescription) fields.description = parsed.description || fields.description;
		if (hasBody) fields.body = parsed.body || fields.body;
		if (hasSubjectLine) fields.subject_line = parsed.subject_line || fields.subject_line;
		if (hasPreheader) fields.preheader = parsed.preheader || fields.preheader;

		// Also update excerpt if it exists (derived from description)
		if ("excerpt" in fields) {
			fields.excerpt = parsed.description?.slice(0, 150) + "..." || fields.excerpt;
		}

		console.log("[Regenerate Content] Text fields regenerated successfully");
	} catch (error) {
		console.error("[Regenerate Content] Text regeneration error:", error);
		throw new Error("Failed to regenerate text content");
	}
}

// Regenerate image fields
async function regenerateImageFields(
	contentInstance: ContentInstance,
	customPrompt: string,
	imageGuidelines?: string
): Promise<void> {
	const fields = contentInstance.fields;

	// Find all image fields (hero_image, image, cover_image, etc.)
	const imageFieldNames = Object.keys(fields).filter(key =>
		key.includes("image") && typeof fields[key] === "string" && fields[key].startsWith("http")
	);

	if (imageFieldNames.length === 0) {
		console.log("[Regenerate Content] No image fields found to regenerate");
		return;
	}

	// Use headline or title for image context
	const contentHeadline = fields.headline || fields.title || "content";
	const imageContext = customPrompt
		? `${contentHeadline}. Custom instructions: ${customPrompt}`
		: contentHeadline;

	try {
		// Regenerate each image field
		for (const fieldName of imageFieldNames) {
			const newImageUrl = await generateImage(
				`Photograph related to ${imageContext}`,
				contentHeadline,
				EVENT_PHOTOGRAPHY_CONTEXT,
				imageGuidelines
			);
			fields[fieldName] = newImageUrl;
			console.log(`[Regenerate Content] Regenerated ${fieldName}`);
		}

		console.log(`[Regenerate Content] Successfully regenerated ${imageFieldNames.length} image(s)`);
	} catch (error) {
		console.error("[Regenerate Content] Image regeneration error:", error);
		throw new Error("Failed to regenerate images");
	}
}

// Generate image using DALL-E 3 (same as generate-brief-content)
async function generateImage(
	subjectPrompt: string,
	altText: string,
	backgroundContext: string = "",
	imageGuidelines?: string
): Promise<string> {
	try {
		const cameraSpecs = "RAW photo, unedited, taken with Sony A7R IV, 85mm lens, f/2.8, ISO 200, natural lighting, realistic dynamic range";
		const imperfections = "slight motion blur, subtle lens distortion, mild chromatic aberration, uneven lighting, natural shadows, minor focus imperfections";
		const composition = "candid shot, casual composition, off-center framing, natural perspective";

		const defaultSubjectAppearance = "diverse group of runners, mix of ages and fitness levels, some competitive athletes and some casual participants, healthy appearance, wearing race shirts with bib numbers, proper athletic clothing, race day attire, technical running shirts, athletic jerseys, varied body types representing recreational to competitive runners";
		const subjectAppearance = imageGuidelines || defaultSubjectAppearance;

		const negatives = "not a painting, not stylized, not digital art, not illustration, not CGI, not rendered, no cinematic lighting, no exaggerated colors, no hyperreal glow, no fantasy atmosphere, no HDR, no color grading, no artistic interpretation, no ultra skinny people, no unrealistic body types, no extreme thinness";

		const enhancedPrompt = `${cameraSpecs}. ${composition}. Subject: ${subjectPrompt}, ${subjectAppearance}. Background/Context: ${backgroundContext || "generic outdoor setting"}. ${imperfections}. ${negatives}`;

		console.log(`[Regenerate Content] Generating image: "${enhancedPrompt.substring(0, 120)}..."`);

		const response = await openai!.images.generate({
			model: "dall-e-3",
			prompt: enhancedPrompt,
			n: 1,
			size: "1024x1024",
			quality: "standard",
			style: "natural",
		});

		const imageUrl = response?.data?.[0]?.url;
		if (imageUrl) {
			return imageUrl;
		}
	} catch (error: any) {
		console.error(`[Regenerate Content] Image generation error:`, error.message);
	}

	// Fallback to placeholder
	const seed = altText.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
	return `https://picsum.photos/seed/${seed}-${Date.now()}/1024/1024`;
}
