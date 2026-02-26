import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	})
	: null;

function describeTaxonomyTree(categoryTaxonomy) {
	if (!categoryTaxonomy || categoryTaxonomy.length === 0) {
		return "No existing categories.";
	}
	const byId = new Map(categoryTaxonomy.map((c) => [c.id, c]));
	const getPath = (cat) => {
		const path = [cat.name];
		let id = cat.parentId;
		while (id) {
			const p = byId.get(id);
			if (!p) break;
			path.unshift(p.name);
			id = p.parentId;
		}
		return path.join(" > ");
	};
	return categoryTaxonomy
		.map((c) => `  - "${c.name}" (slug: ${c.slug}) path: ${getPath(c)}`)
		.join("\n");
}

function buildPromptText(itemName, categoryTaxonomy) {
	const treeDesc = describeTaxonomyTree(categoryTaxonomy);
	const slugList =
		categoryTaxonomy.length > 0
			? categoryTaxonomy.map((c) => c.slug).join(", ")
			: "none";

	return `You are a taxonomy assistant. Given a content item (e.g. a page), suggest which existing categories from the list below fit this item.

Existing categories (name, slug, path):
${treeDesc}

Content item name: "${itemName}"

Return valid JSON only, no other text. Copy slug values exactly from the list above (lowercase, hyphenated).
{ "suggestedSlugs": ["exact-slug-1", "exact-slug-2"] }
- suggestedSlugs: 0–5 category slugs from the existing list that best categorise this item. Use only the exact slug strings shown above.`;
}

/**
 * Normalize slug for matching: lowercase, trim. Map from normalized -> canonical slug.
 */
function parseResponse(content, allowedSlugs) {
	const allowed = allowedSlugs || [];
	const lowerToCanonical = new Map(allowed.map((s) => [s.toLowerCase().trim(), s]));
	let text = (content || "").trim();
	const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (codeMatch) text = codeMatch[1].trim();
	try {
		const parsed = JSON.parse(text);
		const raw = Array.isArray(parsed.suggestedSlugs) ? parsed.suggestedSlugs : [];
		const suggestedSlugs = raw
			.filter((s) => typeof s === "string" && s.trim().length > 0)
			.map((s) => lowerToCanonical.get(s.trim().toLowerCase()))
			.filter(Boolean);
		return { suggestedSlugs: [...new Set(suggestedSlugs)] };
	} catch {
		return { suggestedSlugs: [] };
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
		const { itemName, categoryTaxonomy } = body;

		if (!itemName || typeof itemName !== "string" || !itemName.trim()) {
			return NextResponse.json(
				{ error: "itemName is required and must be a non-empty string" },
				{ status: 400 }
			);
		}
		const taxonomy = Array.isArray(categoryTaxonomy) ? categoryTaxonomy : [];
		const validTaxonomy = taxonomy.filter(
			(t) =>
				t &&
				typeof t.name === "string" &&
				typeof t.slug === "string" &&
				typeof t.id === "string"
		);
		const allowedSlugs = validTaxonomy.map((t) => t.slug);

		const promptText = buildPromptText(itemName.trim(), validTaxonomy);

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [{ role: "user", content: promptText }],
		});

		const responseContent = completion.choices[0]?.message?.content;
		const { suggestedSlugs } = parseResponse(responseContent, allowedSlugs);

		return NextResponse.json({
			suggestedSlugs: [...new Set(suggestedSlugs)] || [],
		});
	} catch (error) {
		console.error("Categories suggest-for-item API Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
