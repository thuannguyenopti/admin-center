import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	})
	: null;

function buildPromptText(itemName, contentTypeId, tagTaxonomy, hasImage) {
	const taxonomyList = tagTaxonomy
		.map((t) => `  - "${t.name}" (slug: ${t.slug})`)
		.join("\n");
	const typeContext = contentTypeId ? `, content type: ${contentTypeId}` : "";
	const imageInstruction = hasImage
		? ` There is also a content thumbnail image attached: use it to infer visual themes (e.g. sport, nature, product type) and suggest tags that match. You may suggest 0–3 NEW tag names (short, title-case) for themes visible in the image that are not well covered by the existing list. Put those in newTagNames; put only existing slugs in existingSlugs.`
		: " Suggest only from the allowed list; set newTagNames to [].";
	return `You are a tagging assistant. Given a content item${hasImage ? " and its thumbnail image" : ""}, suggest tags that are taxonomically or thematically related.

Allowed tags (name and slug):
${taxonomyList}

Content item: name "${itemName}"${typeContext}.${imageInstruction}

Return valid JSON only, no other text:
{ "existingSlugs": ["slug1", "slug2"], "newTagNames": ["New Tag Name"] }
- existingSlugs: 0–5 slugs from the allowed list above only.
- newTagNames: 0–3 new tag names (short, title-case) for themes not covered, or [] if none.`;
}

function parseSuggestionsResponse(content, allowedSlugs) {
	const slugSet = new Set(allowedSlugs.map((t) => t.slug));
	let text = (content || "").trim();
	const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (codeMatch) text = codeMatch[1].trim();
	try {
		const parsed = JSON.parse(text);
		const existing = Array.isArray(parsed.existingSlugs)
			? parsed.existingSlugs.filter((s) => typeof s === "string" && slugSet.has(s))
			: [];
		const newNames = Array.isArray(parsed.newTagNames)
			? parsed.newTagNames.filter((s) => typeof s === "string" && s.trim().length > 0)
			: [];
		return {
			existingSlugs: [...new Set(existing)],
			newTagNames: [...new Set(newNames.map((s) => s.trim()))],
		};
	} catch {
		return { existingSlugs: [], newTagNames: [] };
	}
}

export async function POST(request) {
	try {
		if (!openai) {
			return NextResponse.json(
				{ error: "OpenAI API key not configured" },
				{ status: 500 }
			);
		}

		const body = await request.json();
		const { itemName, contentTypeId, tagTaxonomy, imageUrl } = body;

		if (!itemName || typeof itemName !== "string" || !itemName.trim()) {
			return NextResponse.json(
				{ error: "itemName is required and must be a non-empty string" },
				{ status: 400 }
			);
		}
		if (!Array.isArray(tagTaxonomy) || tagTaxonomy.length === 0) {
			return NextResponse.json(
				{ error: "tagTaxonomy must be a non-empty array of { name, slug }" },
				{ status: 400 }
			);
		}
		const validTaxonomy = tagTaxonomy.filter(
			(t) => t && typeof t.name === "string" && typeof t.slug === "string"
		);
		if (validTaxonomy.length === 0) {
			return NextResponse.json(
				{ error: "tagTaxonomy must contain objects with name and slug" },
				{ status: 400 }
			);
		}

		const hasImage =
			typeof imageUrl === "string" && imageUrl.trim().length > 0 && imageUrl.startsWith("http");
		const promptText = buildPromptText(
			itemName.trim(),
			contentTypeId && typeof contentTypeId === "string" ? contentTypeId : undefined,
			validTaxonomy,
			hasImage
		);

		const userContent = hasImage
			? [
				{ type: "text", text: promptText },
				{ type: "image_url", image_url: { url: imageUrl.trim() } },
			]
			: promptText;

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [{ role: "user", content: userContent }],
		});

		const content = completion.choices[0]?.message?.content;
		const { existingSlugs, newTagNames } = parseSuggestionsResponse(content, validTaxonomy);

		return NextResponse.json({
			suggestedSlugs: existingSlugs,
			suggestedNewNames: newTagNames,
		});
	} catch (error) {
		console.error("Tags suggest API Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
