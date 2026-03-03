import {NextResponse} from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		})
	: null;

function buildAutocompletePrompt(text: string, cursorPosition: number, context?: {fieldType?: string; contentType?: string}): string {
	const beforeCursor = text.substring(0, cursorPosition);
	const afterCursor = text.substring(cursorPosition);

	let systemPrompt = "You are an autocomplete assistant. Complete the sentence naturally and concisely based on the context.";

	if (context?.fieldType) {
		const fieldTypeInstructions: Record<string, string> = {
			title: "This is a page title. Keep completions short and impactful.",
			description: "This is a meta description. Write clear, descriptive text suitable for SEO.",
			content: "This is main content. Write naturally and informatively.",
		};
		systemPrompt += ` ${fieldTypeInstructions[context.fieldType] || ""}`;
	}

	return `${systemPrompt}

Text before cursor: "${beforeCursor}"
${afterCursor ? `Text after cursor: "${afterCursor}"` : ""}

Complete the sentence at the cursor position. Return ONLY the completion text that should be inserted, no explanations or quotes.`;
}

export async function POST(request: Request) {
	try {
		if (!openai) {
			return NextResponse.json({error: "OpenAI API key not configured"}, {status: 500});
		}

		const body = await request.json();
		const {text, cursorPosition, context} = body;

		// Validation
		if (!text || typeof text !== "string") {
			return NextResponse.json({error: "text is required and must be a string"}, {status: 400});
		}

		if (typeof cursorPosition !== "number" || cursorPosition < 0 || cursorPosition > text.length) {
			return NextResponse.json(
				{error: "cursorPosition must be a valid number within text length"},
				{status: 400}
			);
		}

		// Check minimum word count (at least 3 words)
		const wordCount = text.trim().split(/\s+/).length;
		if (wordCount < 3) {
			// Return empty suggestion for very short text
			const encoder = new TextEncoder();
			const stream = new ReadableStream({
				start(controller) {
					controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
					controller.close();
				},
			});
			return new Response(stream, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				},
			});
		}

		const promptText = buildAutocompletePrompt(text, cursorPosition, context);

		// Create streaming completion
		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: "You are an autocomplete assistant. Complete sentences naturally. Return ONLY the completion text, no explanations.",
				},
				{
					role: "user",
					content: promptText,
				},
			],
			stream: true,
			max_tokens: 50,
			temperature: 0.7,
		});

		// Create Server-Sent Events stream
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of completion) {
						const content = chunk.choices[0]?.delta?.content;
						if (content) {
							const data = JSON.stringify({type: "token", content});
							controller.enqueue(encoder.encode(`data: ${data}\n\n`));
						}
					}
					// Send done event
					controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
					controller.close();
				} catch (error) {
					console.error("Streaming error:", error);
					controller.error(error);
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("Autocomplete API Error:", error);
		return NextResponse.json({error: "Internal Server Error"}, {status: 500});
	}
}
