import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
	: null;

const SYSTEM_PROMPT = `You are a form UX expert. Analyze the provided form field list and return up to 5 actionable optimization suggestions.

Return a JSON object with this exact shape:
{
  "suggestions": [
    {
      "id": "unique-string",
      "type": "reorder" | "group" | "simplify_logic" | "ux_risk",
      "message": "Concise, specific suggestion (1-2 sentences)"
    }
  ]
}

Focus on:
- reorder: Fields that should appear earlier or later (e.g. put required fields first)
- group: Related fields that should be in a named section
- simplify_logic: Opportunities to reduce form complexity
- ux_risk: Things that may cause form abandonment (too many required fields in a row, ambiguous labels, etc.)

Be specific — mention actual field names from the list. Return only valid JSON.`;

export async function POST(req: NextRequest) {
	const { formSummary } = await req.json();

	if (!openai) {
		// Return empty suggestions if no API key configured
		return NextResponse.json({ suggestions: [] });
	}

	try {
		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			temperature: 0.3,
			response_format: { type: "json_object" },
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{
					role: "user",
					content: `Here are the fields in this form (top to bottom):\n\n${formSummary}\n\nProvide optimization suggestions.`,
				},
			],
		});

		const raw = response.choices[0]?.message?.content ?? "{}";
		const parsed = JSON.parse(raw);
		return NextResponse.json({ suggestions: parsed.suggestions ?? [] });
	} catch {
		return NextResponse.json({ suggestions: [] });
	}
}
