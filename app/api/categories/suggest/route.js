import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		})
	: null;

function buildPromptText(categoryTaxonomy) {
	const taxonomyList = categoryTaxonomy
		.map((t) => `  - "${t.name}" (slug: ${t.slug})`)
		.join("\n");
	return `You are a taxonomy assistant. Suggest new category names that fit the existing category taxonomy below. Categories are used to organise content (e.g. in a CMS). Suggest 4–8 new category names that are distinct from existing ones and would be useful for organising content. Return short, title-case names.

Existing categories (name and slug):
${taxonomyList}

Return valid JSON only, no other text:
{ "suggestedNewNames": ["Category One", "Category Two", "Category Three"] }
- suggestedNewNames: 4–8 new category names (short, title-case), or [] if the taxonomy is already comprehensive.`;
}

function parseSuggestionsResponse(content) {
	let text = (content || "").trim();
	const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (codeMatch) text = codeMatch[1].trim();
	try {
		const parsed = JSON.parse(text);
		const newNames = Array.isArray(parsed.suggestedNewNames)
			? parsed.suggestedNewNames.filter(
					(s) => typeof s === "string" && s.trim().length > 0
				)
			: [];
		return { suggestedNewNames: [...new Set(newNames.map((s) => s.trim()))] };
	} catch {
		return { suggestedNewNames: [] };
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
		const { categoryTaxonomy } = body;

		if (!Array.isArray(categoryTaxonomy) || categoryTaxonomy.length === 0) {
			return NextResponse.json(
				{ error: "categoryTaxonomy must be a non-empty array of { name, slug }" },
				{ status: 400 }
			);
		}
		const validTaxonomy = categoryTaxonomy.filter(
			(t) => t && typeof t.name === "string" && typeof t.slug === "string"
		);
		if (validTaxonomy.length === 0) {
			return NextResponse.json(
				{
					error: "categoryTaxonomy must contain objects with name and slug",
				},
				{ status: 400 }
			);
		}

		const promptText = buildPromptText(validTaxonomy);

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [{ role: "user", content: promptText }],
		});

		const content = completion.choices[0]?.message?.content;
		const { suggestedNewNames } = parseSuggestionsResponse(content);

		return NextResponse.json({
			suggestedNewNames: suggestedNewNames || [],
		});
	} catch (error) {
		console.error("Categories suggest API Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
