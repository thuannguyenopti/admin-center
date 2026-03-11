import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	})
	: null;

const MAX_DEPTH = 4;

/**
 * Build a tree description for the prompt (existing categories with depth/path).
 */
function describeTaxonomyTree(categoryTaxonomy) {
	if (!categoryTaxonomy || categoryTaxonomy.length === 0) {
		return "No existing categories (all suggestions should be root-level, parentSlug: null).";
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
	const lines = categoryTaxonomy.map(
		(c) => `  - "${c.name}" (slug: ${c.slug}) path: ${getPath(c)}`
	);
	return lines.join("\n");
}

/**
 * Build content context description (content items and their category slugs).
 */
function describeContentContext(contentContext) {
	if (!contentContext || contentContext.length === 0) {
		return "No content context provided.";
	}
	const lines = contentContext.slice(0, 100).map((item) => {
		const type = item.baseType ? ` [${item.baseType}]` : "";
		const cats = (item.categorySlugs || []).length
			? ` categories: ${item.categorySlugs.join(", ")}`
			: " (uncategorised)";
		return `  - "${item.name}"${type}${cats}`;
	});
	return lines.join("\n");
}

function buildPromptText(categoryTaxonomy, contentContext) {
	const hasTaxonomy = categoryTaxonomy && categoryTaxonomy.length > 0;
	const hasContent = contentContext && contentContext.length > 0;
	const treeDesc = describeTaxonomyTree(categoryTaxonomy);
	const contentDesc = describeContentContext(contentContext);
	const existingSlugs =
		hasTaxonomy
			? categoryTaxonomy.map((c) => c.slug).join(", ")
			: "none";

	if (!hasTaxonomy && !hasContent) {
		// No taxonomy and no content: generate general CMS categories
		return `You are a taxonomy assistant for a CMS. Suggest useful categories for organizing content in a content management system.

Rules:
- Maximum depth is ${MAX_DEPTH} levels (root = level 1, then 2, 3, 4).
- New categories can reference another suggested category as parent using parentSlug, or be root-level (parentSlug: null).
- Suggest a mix of root-level and child categories to create a useful taxonomy structure.
- Use short, title-case names. Slugs must be lowercase, hyphenated, no spaces.
- Suggest categories that would be commonly useful for a CMS: topic areas, content types, organizational themes, etc.

Return valid JSON only, no other text:
{
  "suggestedCategories": [
    { "name": "Category Name", "slug": "category-slug", "parentSlug": null },
    { "name": "Child Category", "slug": "child-category", "parentSlug": "category-slug" }
  ]
}
- suggestedCategories: array of 8–15 new categories. Each has name (title-case), slug (lowercase-hyphenated), parentSlug (null for root, or another suggested slug for child categories). Order can be any; parents may appear after children.`;
	}

	return `You are a taxonomy assistant for a CMS. Suggest new categories that fit the existing taxonomy and the content that will be organised under them.

Rules:
- Maximum depth is ${MAX_DEPTH} levels (root = level 1, then 2, 3, 4).
- New categories must reference an existing category as parent using parentSlug, or be root-level (parentSlug: null).
- parentSlug must be either null or one of the existing category slugs listed below. Do not invent new parent slugs.
- Suggest a mix of root-level and child categories so the taxonomy is useful and covers the content themes.
- Use short, title-case names. Slugs must be lowercase, hyphenated, no spaces.
- Infer categories from: (1) existing taxonomy gaps, (2) content names and types, (3) how content is currently categorised. Suggest categories that would help organise the given content and extend the tree up to ${MAX_DEPTH} levels where it makes sense.

Existing categories (name, slug, path):
${treeDesc}

Content to organise (name, type, current category slugs):
${contentDesc}

Existing category slugs (use only these for parentSlug, or null for root): ${existingSlugs}

Return valid JSON only, no other text:
{
  "suggestedCategories": [
    { "name": "Category Name", "slug": "category-slug", "parentSlug": null },
    { "name": "Child Category", "slug": "child-category", "parentSlug": "category-slug" }
  ]
}
- suggestedCategories: array of 6–20 new categories. Each has name (title-case), slug (lowercase-hyphenated), parentSlug (null for root, or an existing slug from the list above). Order can be any; parents may appear after children.`;
}

function parseSuggestionsResponse(content, allowedParentSlugs) {
	const slugSet = new Set(allowedParentSlugs || []);
	let text = (content || "").trim();
	const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (codeMatch) text = codeMatch[1].trim();
	try {
		const parsed = JSON.parse(text);
		const raw = Array.isArray(parsed.suggestedCategories)
			? parsed.suggestedCategories
			: [];
		const suggestedCategories = raw
			.filter(
				(item) =>
					item &&
					typeof item.name === "string" &&
					typeof item.slug === "string" &&
					item.name.trim().length > 0 &&
					item.slug.trim().length > 0
			)
			.map((item) => ({
				name: item.name.trim(),
				slug: item.slug
					.trim()
					.toLowerCase()
					.replace(/\s+/g, "-")
					.replace(/[^a-z0-9-]/g, ""),
				parentSlug:
					item.parentSlug == null || item.parentSlug === ""
						? null
						: slugSet.has(String(item.parentSlug).trim())
							? String(item.parentSlug).trim()
							: null,
			}));
		return { suggestedCategories };
	} catch {
		return { suggestedCategories: [] };
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
		const { categoryTaxonomy, contentContext } = body;

		const taxonomy = Array.isArray(categoryTaxonomy) ? categoryTaxonomy : [];
		const validTaxonomy = taxonomy.filter(
			(t) =>
				t &&
				typeof t.name === "string" &&
				typeof t.slug === "string" &&
				typeof t.id === "string"
		);
		const content = Array.isArray(contentContext) ? contentContext : [];
		const validContent = content.filter(
			(c) => c && typeof c.name === "string" && Array.isArray(c.categorySlugs)
		);

		const allowedParentSlugs = validTaxonomy.map((t) => t.slug);
		const promptText = buildPromptText(validTaxonomy, validContent);

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [{ role: "user", content: promptText }],
		});

		const responseContent = completion.choices[0]?.message?.content;
		const { suggestedCategories } = parseSuggestionsResponse(
			responseContent,
			allowedParentSlugs
		);

		return NextResponse.json({
			suggestedCategories: suggestedCategories || [],
		});
	} catch (error) {
		console.error("Categories suggest API Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
