<<<<<<< HEAD
import {openai} from "./openai";

export interface ImagePrompt {
	prompt: string;
	alt: string;
}

export interface GeneratedImage {
	url: string;
	alt: string;
}

export type VisualStyle = "realistic-photo" | "illustration" | "3d-render" | "flat-design" | "artistic" | "minimalist-graphic";

/**
 * Get DALL-E prompt prefix based on visual style
 */
function getStylePrefix(visualStyle?: VisualStyle): string {
	switch (visualStyle) {
		case "realistic-photo":
			return "Photorealistic photograph, professional photography, high resolution, sharp focus, natural lighting, realistic, documentary style, authentic, ";
		case "illustration":
			return "Hand-drawn illustration style, artistic, detailed illustration of ";
		case "3d-render":
			return "3D rendered CGI image, clean modern render, ";
		case "flat-design":
		case "minimalist-graphic":
			return "Flat design style, minimalist, simple shapes and colors, ";
		case "artistic":
			return "Artistic creative interpretation, expressive style, ";
		default:
			// Default to photorealistic when no style specified
			return "Photorealistic photograph, real photo, natural lighting, realistic, ";
	}
}

/**
 * Generate an image using DALL-E 3
 * Returns a temporary URL (expires in ~1 hour) or placeholder on error
 */
export async function generateImage(
	imagePrompt: ImagePrompt,
	visualStyle?: VisualStyle
): Promise<GeneratedImage> {
	if (!openai) {
		throw new Error("OpenAI API key not configured");
	}

	const stylePrefix = getStylePrefix(visualStyle);
	let enhancedPrompt = stylePrefix + imagePrompt.prompt;

	// For realistic photos or default (undefined), add explicit anti-3D-render instructions
	if (visualStyle === "realistic-photo" || !visualStyle) {
		enhancedPrompt += ". Real photograph only, documentary photography style";
	}

	console.log(`[Image Generation] Generating (${visualStyle || 'photo-default'}): "${enhancedPrompt.substring(0, 100)}..."`);

	try {
		const response = await openai.images.generate({
			model: "dall-e-3",
			prompt: enhancedPrompt,
			n: 1,
			size: "1024x1024",
			quality: "standard",
			style: "natural",
		});

		const imageUrl = response?.data?.[0]?.url;
		if (imageUrl) {
			console.log(`[Image Generation] Success - using temporary DALL-E URL (expires in ~1 hour)`);
			return {url: imageUrl, alt: imagePrompt.alt};
		} else {
			console.warn(`[Image Generation] No URL in response, using placeholder`);
			return {url: "https://placehold.co/1024x576/2563eb/ffffff?text=Image+Placeholder", alt: imagePrompt.alt};
		}
	} catch (error: any) {
		console.error(`[Image Generation] Error:`, error.message);
		return {url: "https://placehold.co/1024x576/2563eb/ffffff?text=Image+Placeholder", alt: imagePrompt.alt};
	}
}
=======
import {openai} from "./openai";

export interface ImagePrompt {
	prompt: string;
	alt: string;
}

export interface GeneratedImage {
	url: string;
	alt: string;
}

export type VisualStyle = "realistic-photo" | "illustration" | "3d-render" | "flat-design" | "artistic" | "minimalist-graphic";

/**
 * Get DALL-E prompt prefix based on visual style
 */
function getStylePrefix(visualStyle?: VisualStyle): string {
	switch (visualStyle) {
		case "realistic-photo":
			return "Photorealistic photograph, professional photography, high resolution, sharp focus, natural lighting, realistic, documentary style, authentic, ";
		case "illustration":
			return "Hand-drawn illustration style, artistic, detailed illustration of ";
		case "3d-render":
			return "3D rendered CGI image, clean modern render, ";
		case "flat-design":
		case "minimalist-graphic":
			return "Flat design style, minimalist, simple shapes and colors, ";
		case "artistic":
			return "Artistic creative interpretation, expressive style, ";
		default:
			// Default to photorealistic when no style specified
			return "Photorealistic photograph, real photo, natural lighting, realistic, ";
	}
}

/**
 * Generate an image using DALL-E 3
 * Returns a temporary URL (expires in ~1 hour) or placeholder on error
 */
export async function generateImage(
	imagePrompt: ImagePrompt,
	visualStyle?: VisualStyle
): Promise<GeneratedImage> {
	if (!openai) {
		throw new Error("OpenAI API key not configured");
	}

	const stylePrefix = getStylePrefix(visualStyle);
	let enhancedPrompt = stylePrefix + imagePrompt.prompt;

	// For realistic photos or default (undefined), add explicit anti-3D-render instructions
	if (visualStyle === "realistic-photo" || !visualStyle) {
		enhancedPrompt += ". Real photograph only, documentary photography style";
	}

	console.log(`[Image Generation] Generating (${visualStyle || 'photo-default'}): "${enhancedPrompt.substring(0, 100)}..."`);

	try {
		const response = await openai.images.generate({
			model: "dall-e-3",
			prompt: enhancedPrompt,
			n: 1,
			size: "1024x1024",
			quality: "standard",
			style: "natural",
		});

		const imageUrl = response?.data?.[0]?.url;
		if (imageUrl) {
			console.log(`[Image Generation] Success - using temporary DALL-E URL (expires in ~1 hour)`);
			return {url: imageUrl, alt: imagePrompt.alt};
		} else {
			console.warn(`[Image Generation] No URL in response, using placeholder`);
			return {url: "https://placehold.co/1024x576/2563eb/ffffff?text=Image+Placeholder", alt: imagePrompt.alt};
		}
	} catch (error: any) {
		console.error(`[Image Generation] Error:`, error.message);
		return {url: "https://placehold.co/1024x576/2563eb/ffffff?text=Image+Placeholder", alt: imagePrompt.alt};
	}
}
>>>>>>> origin/main
