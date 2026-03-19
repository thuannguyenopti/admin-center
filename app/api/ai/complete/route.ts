import {NextResponse} from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		})
	: null;

export async function POST(request: Request) {
	try {
		if (!openai) {
			console.error("[Auto-complete API] OpenAI client not initialized - check OPENAI_API_KEY env variable");
			return NextResponse.json({error: "OpenAI API key not configured"}, {status: 500});
		}

		const body = await request.json();
		const {text, maxTokens = 50} = body;

		console.log("[Auto-complete API] Request received:", {
			textLength: text?.length,
			text: text?.substring(0, 100),
		});

		// Validation
		if (!text || typeof text !== "string") {
			return NextResponse.json(
				{error: "text is required and must be a string"},
				{status: 400}
			);
		}

		console.log("[Auto-complete API] Calling OpenAI for completion");

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: "You are a helpful writing assistant. Complete the user's sentence naturally and concisely. Return only the completion text, no explanations.",
				},
				{
					role: "user",
					content: `Complete this sentence: "${text}"`,
				},
			],
			temperature: 0.7,
			max_tokens: maxTokens,
		});

		const completionText = completion.choices[0]?.message?.content?.trim() || "";
		console.log("[Auto-complete API] Completion:", completionText);

		return NextResponse.json({completion: completionText});
	} catch (error) {
		console.error("[Auto-complete API] Error occurred:", error);
		if (error instanceof Error) {
			console.error("[Auto-complete API] Error message:", error.message);
		}
		return NextResponse.json({error: "Internal Server Error"}, {status: 500});
	}
}
