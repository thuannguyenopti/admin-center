import {NextResponse} from "next/server";
import OpenAI from "openai";
import {STRIDE_COMPANY_CONTEXT} from "../../ai-context";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		})
	: null;

interface PageField {
	fieldId: string;
	fieldLabel: string;
	text: string;
}

async function analyzePageFields(fields: PageField[]) {
	if (!openai) {
		return NextResponse.json({error: "OpenAI API key not configured"}, {status: 500});
	}

	console.log("[Brand Tone API] Analyzing page fields:", fields.map(f => ({ id: f.fieldId, label: f.fieldLabel })));

	// Create a mapping for reference
	const fieldsList = fields.map((f) => `Field ID: "${f.fieldId}"\nLabel: ${f.fieldLabel}\nText: ${f.text}`).join("\n\n---\n\n");

	const completion = await openai.chat.completions.create({
		model: "gpt-4o",
		messages: [
			{
				role: "system",
				content: `You are a brand voice expert analyzing content for Stride, a premium running event organizer.

${STRIDE_COMPANY_CONTEXT}

Analyze the provided page content against Stride's brand voice and messaging guidelines above.

Respond with a JSON object containing:
{
  "score": <number 0-100>,
  "issues": [
    {
      "fieldId": "EXACT field ID from the input (use the exact string provided after 'Field ID:')",
      "fieldLabel": "human-readable field name",
      "type": "tone" | "voice" | "clarity" | "style",
      "severity": "high" | "medium" | "low",
      "message": "Description of the issue",
      "original": "The problematic text snippet from that field",
      "suggestion": "Suggested replacement text for that field"
    }
  ],
  "summary": "Brief overall assessment of the page",
  "strengths": ["List of things done well across all fields"]
}

CRITICAL: You MUST use the exact fieldId string provided in the input. Do not create new IDs or modify them.`,
			},
			{
				role: "user",
				content: `Analyze this page content for brand tone:\n\n${fieldsList}`,
			},
		],
		temperature: 0.3,
		response_format: {type: "json_object"},
	});

	const result = completion.choices[0]?.message?.content?.trim() || "{}";
	console.log("[Brand Tone API] Page analysis complete");

	const analysis = JSON.parse(result);

	return NextResponse.json({
		score: analysis.score || 0,
		issues: analysis.issues || [],
		summary: analysis.summary || "Analysis complete",
		strengths: analysis.strengths || [],
	});
}

export async function POST(request: Request) {
	try {
		if (!openai) {
			console.error("[Brand Tone API] OpenAI client not initialized - check OPENAI_API_KEY env variable");
			return NextResponse.json({error: "OpenAI API key not configured"}, {status: 500});
		}

		const body = await request.json();
		const {text, context = "property", fields} = body;

		console.log("[Brand Tone API] Request received:", {
			textLength: text?.length,
			context,
			fieldsCount: fields?.length,
		});

		// Handle field-level page analysis
		if (context === "page" && fields && Array.isArray(fields)) {
			return await analyzePageFields(fields);
		}

		// Validation for single text analysis
		if (!text || typeof text !== "string") {
			return NextResponse.json(
				{error: "text is required and must be a string"},
				{status: 400}
			);
		}

		console.log("[Brand Tone API] Calling OpenAI for brand tone analysis");

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: `You are a brand voice expert analyzing content for Stride, a premium running event organizer.

${STRIDE_COMPANY_CONTEXT}

Analyze the provided text against Stride's brand voice and messaging guidelines above.

Respond with a JSON object containing:
{
  "score": <number 0-100>,
  "issues": [
    {
      "type": "tone" | "voice" | "clarity" | "style",
      "severity": "high" | "medium" | "low",
      "message": "Description of the issue",
      "original": "The problematic text snippet",
      "suggestion": "Suggested replacement text"
    }
  ],
  "summary": "Brief overall assessment",
  "strengths": ["List of things done well"]
}`,
				},
				{
					role: "user",
					content: `Analyze this ${context === "page" ? "page content" : "text"} for brand tone:\n\n${text}`,
				},
			],
			temperature: 0.3,
			response_format: {type: "json_object"},
		});

		const result = completion.choices[0]?.message?.content?.trim() || "{}";
		console.log("[Brand Tone API] Analysis complete");

		const analysis = JSON.parse(result);

		return NextResponse.json({
			score: analysis.score || 0,
			issues: analysis.issues || [],
			summary: analysis.summary || "Analysis complete",
			strengths: analysis.strengths || [],
		});
	} catch (error) {
		console.error("[Brand Tone API] Error occurred:", error);
		if (error instanceof Error) {
			console.error("[Brand Tone API] Error message:", error.message);
		}
		return NextResponse.json({error: "Internal Server Error"}, {status: 500});
	}
}
