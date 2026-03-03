import {NextResponse} from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		})
	: null;

interface GrammarError {
	type: "grammar" | "spelling";
	start: number;
	end: number;
	message: string;
	suggestion: string;
	severity?: "error" | "warning" | "info";
	errorText?: string; // The actual text that has the error
}

interface GrammarCheckResponse {
	errors: GrammarError[];
}

function buildProofreadingPrompt(text: string): string {
	// Add character position markers to help the AI count correctly
	const textWithPositions = text.split('').map((char, i) => `${char}[${i}]`).join('');

	return `You are a professional proofreading assistant. Analyze the following text for grammar and spelling errors.

Text to check: "${text}"

Character positions (for reference): ${textWithPositions}

Return ONLY valid JSON in this exact format (no markdown code blocks):
{
  "errors": [
    {
      "type": "grammar",
      "start": 5,
      "end": 8,
      "errorText": "are",
      "message": "Subject-verb agreement error",
      "suggestion": "is",
      "severity": "error"
    }
  ]
}

CRITICAL RULES FOR CHARACTER POSITIONS:
1. Count characters from position 0 (first character is 0, second is 1, etc.)
2. "start" is the index of the FIRST character of the error (NOT any leading spaces)
3. "end" is the index AFTER the LAST character (so text[start:end] extracts the error)
4. "errorText" must be EXACTLY what appears at text[start:end] - the exact erroneous text
5. Do NOT include leading or trailing spaces in start/end positions
6. Use the character position reference above to count accurately
7. The "suggestion" field must contain ONLY the corrected word/phrase
8. Do NOT include surrounding context in the suggestion

Examples with counting:

Example 1 - Single word error:
Text: "This are wrong"
Positions: T[0]h[1]i[2]s[3] [4]a[5]r[6]e[7] [8]w[9]...
Error: "are" is at positions 5-8 (the word "are" starts at 5, ends at 8)
Response: {"errors": [{"type": "grammar", "start": 5, "end": 8, "errorText": "are", "message": "Subject-verb agreement", "suggestion": "is"}]}

Example 2 - Multi-word error (two words becoming one):
Text: "world wide web"
Positions: w[0]o[1]r[2]l[3]d[4] [5]w[6]i[7]d[8]e[9] [10]w[11]...
Error: "world wide" (two words at positions 0-10)
Important: Do NOT include the trailing space! Positions 0-9 covers "world wid", but we need 0-10 to get "world wide"
Response: {"errors": [{"type": "spelling", "start": 0, "end": 10, "errorText": "world wide", "message": "Should be one word", "suggestion": "worldwide"}]}

Example 3 - Error not at start:
Text: "Join users world wide today"
Positions: J[0]o[1]i[2]n[3] [4]u[5]s[6]e[7]r[8]s[9] [10]w[11]o[12]r[13]l[14]d[15] [16]w[17]i[18]d[19]e[20] [21]...
Error: "world wide" at positions 11-21
Response: {"errors": [{"type": "spelling", "start": 11, "end": 21, "errorText": "world wide", "message": "Should be one word", "suggestion": "worldwide"}]}

Common errors to check:
- Spelling mistakes (e.g., "teh" → "the")
- Two words that should be one (e.g., "world wide" → "worldwide")
- Subject-verb agreement (e.g., "they was" → "they were")
- Wrong word form (e.g., "good" when "well" is needed)

If no errors found, return {"errors": []}
Return ONLY the JSON object, no explanations`;
}

function parseProofreadingResponse(content: string | null | undefined, originalText: string): GrammarError[] {
	if (!content) return [];

	let text = content.trim();

	// Remove markdown code blocks if present
	const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (codeMatch) {
		text = codeMatch[1].trim();
	}

	try {
		const parsed = JSON.parse(text);

		if (!parsed || typeof parsed !== "object") {
			return [];
		}

		const errors = Array.isArray(parsed.errors) ? parsed.errors : [];

		// Validate and normalize each error
		return errors
			.filter((err: any) => {
				return (
					err &&
					typeof err === "object" &&
					(err.type === "grammar" || err.type === "spelling") &&
					typeof err.start === "number" &&
					typeof err.end === "number" &&
					typeof err.message === "string" &&
					typeof err.suggestion === "string" &&
					err.start >= 0 &&
					err.end > err.start
				);
			})
			.map((err: any) => {
				let start = err.start;
				let end = err.end;
				const errorText = err.errorText?.trim();

				// Validate positions match the error text
				if (errorText) {
					const extractedText = originalText.substring(start, end);

					// If positions don't match, try to find the correct positions
					if (extractedText !== errorText && extractedText.trim() === errorText) {
						// Positions include leading/trailing spaces - adjust them
						const trimStart = extractedText.length - extractedText.trimStart().length;
						const trimEnd = extractedText.length - extractedText.trimEnd().length;
						start += trimStart;
						end -= trimEnd;

						console.log(`Adjusted positions for "${errorText}": ${err.start}-${err.end} → ${start}-${end}`);
					} else if (extractedText !== errorText) {
						// Positions are completely wrong - try to find the error text
						const foundIndex = originalText.indexOf(errorText, Math.max(0, start - 10));
						if (foundIndex !== -1) {
							start = foundIndex;
							end = foundIndex + errorText.length;
							console.log(`Corrected positions for "${errorText}": ${err.start}-${err.end} → ${start}-${end}`);
						} else {
							console.warn(`Could not verify positions for error: "${errorText}" not found near position ${start}`);
						}
					}
				}

				return {
					type: err.type,
					start: start,
					end: end,
					message: err.message.trim(),
					suggestion: err.suggestion.trim(),
					severity: err.severity || "error",
					errorText: errorText,
				};
			});
	} catch (error) {
		console.error("Failed to parse proofreading response:", error);
		return [];
	}
}

export async function POST(request: Request) {
	try {
		if (!openai) {
			return NextResponse.json({error: "OpenAI API key not configured"}, {status: 500});
		}

		const body = await request.json();
		const {text} = body;

		// Validation
		if (!text || typeof text !== "string" || !text.trim()) {
			return NextResponse.json(
				{error: "text is required and must be a non-empty string"},
				{status: 400}
			);
		}

		// Skip check for very short text
		if (text.trim().length < 10) {
			return NextResponse.json({errors: []});
		}

		const promptText = buildProofreadingPrompt(text.trim());

		console.log("Proofreading request for text:", text.trim());

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [{role: "user", content: promptText}],
			temperature: 0.3, // Lower temperature for consistent grammar checking
		});

		const content = completion.choices[0]?.message?.content;
		console.log("OpenAI response:", content);

		const errors = parseProofreadingResponse(content, text.trim());
		console.log("Parsed errors:", errors);

		return NextResponse.json({errors});
	} catch (error) {
		console.error("Proofreading API Error:", error);
		return NextResponse.json({error: "Internal Server Error"}, {status: 500});
	}
}
