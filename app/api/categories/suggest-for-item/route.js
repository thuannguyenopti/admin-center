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
	const hasTaxonomy = categoryTaxonomy && categoryTaxonomy.length > 0;

	if (!hasTaxonomy) {
		// No taxonomy: suggest new categories for this item
		return `You are a taxonomy assistant. Given a content item, suggest appropriate categories that would help organize it in a CMS.

Content item name: "${itemName}"

Suggest 2–5 category names (short, title-case) that would be appropriate for organizing this content.

Return valid JSON only, no other text:
{ "suggestedSlugs": [], "suggestedNewCategories": ["Category Name 1", "Category Name 2"] }
- suggestedSlugs: [] (no existing taxonomy)
- suggestedNewCategories: array of 2–5 category names (short, title-case)`;
	}

	const treeDesc = describeTaxonomyTree(categoryTaxonomy);
	const slugList = categoryTaxonomy.map((c) => c.slug).join(", ");

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
 * Also handles new category suggestions when no taxonomy exists.
 */
function parseResponse(content, allowedSlugs, hasTaxonomy) {
	const allowed = allowedSlugs || [];
	const lowerToCanonical = new Map(allowed.map((s) => [s.toLowerCase().trim(), s]));
	let text = (content || "").trim();
	const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (codeMatch) text = codeMatch[1].trim();
	try {
		const parsed = JSON.parse(text);

		// Handle existing taxonomy slugs
		const rawSlugs = Array.isArray(parsed.suggestedSlugs) ? parsed.suggestedSlugs : [];
		const suggestedSlugs = rawSlugs
			.filter((s) => typeof s === "string" && s.trim().length > 0)
			.map((s) => lowerToCanonical.get(s.trim().toLowerCase()))
			.filter(Boolean);

		// Handle new category names (when no taxonomy)
		const rawNewCategories = Array.isArray(parsed.suggestedNewCategories) ? parsed.suggestedNewCategories : [];
		const suggestedNewCategories = rawNewCategories
			.filter((s) => typeof s === "string" && s.trim().length > 0)
			.map((s) => s.trim());

		return {
			suggestedSlugs: [...new Set(suggestedSlugs)],
			suggestedNewCategories: hasTaxonomy ? [] : [...new Set(suggestedNewCategories)]
		};
	} catch {
		return { suggestedSlugs: [], suggestedNewCategories: [] };
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
		const hasTaxonomy = validTaxonomy.length > 0;
		const allowedSlugs = validTaxonomy.map((t) => t.slug);

		const promptText = buildPromptText(itemName.trim(), validTaxonomy);

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [{ role: "user", content: promptText }],
		});

		const responseContent = completion.choices[0]?.message?.content;
		const { suggestedSlugs, suggestedNewCategories } = parseResponse(responseContent, allowedSlugs, hasTaxonomy);

		return NextResponse.json({
			suggestedSlugs: [...new Set(suggestedSlugs)] || [],
			...(suggestedNewCategories.length > 0 && { suggestedNewCategories })
		});
	} catch (error) {
		console.error("Categories suggest-for-item API Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
