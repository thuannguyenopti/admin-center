import {NextResponse} from "next/server";
import OpenAI from "openai";

// Keep OpenAI client for future auto-completion features
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
	errorText?: string;
}

interface LanguageToolMatch {
	message: string;
	shortMessage: string;
	offset: number;
	length: number;
	replacements: Array<{ value: string }>;
	rule: {
		id: string;
		description: string;
		issueType: string;
		category: { id: string; name: string };
	};
	context: {
		text: string;
		offset: number;
		length: number;
	};
}

interface LanguageToolResponse {
	matches: LanguageToolMatch[];
}

async function checkWithLanguageTool(text: string): Promise<GrammarError[]> {
	console.log("[LanguageTool] Calling LanguageTool API for text:", text);

	try {
		const response = await fetch("https://api.languagetool.org/v2/check", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Accept": "application/json",
			},
			body: new URLSearchParams({
				text: text,
				language: "en-US",
				enabledOnly: "false",
			}),
		});

		if (!response.ok) {
			console.error("[LanguageTool] API error:", response.statusText);
			return [];
		}

		const data: LanguageToolResponse = await response.json();
		console.log("[LanguageTool] Raw response:", JSON.stringify(data, null, 2));

		// Transform LanguageTool matches to our GrammarError format
		const errors: GrammarError[] = data.matches
			.filter((match) => match.replacements.length > 0) // Only errors with suggestions
			.map((match) => {
				const start = match.offset;
				const end = match.offset + match.length;
				const errorText = text.substring(start, end);
				const suggestion = match.replacements[0].value;

				// Determine type based on rule category
				const type: "grammar" | "spelling" =
					match.rule.category.id === "TYPOS" || match.rule.issueType === "misspelling"
						? "spelling"
						: "grammar";

				// Map severity
				let severity: "error" | "warning" | "info" = "error";
				if (match.rule.issueType === "style" || match.rule.issueType === "typographical") {
					severity = "warning";
				}

				return {
					type,
					start,
					end,
					message: match.message,
					suggestion,
					severity,
					errorText,
				};
			});

		console.log("[LanguageTool] Transformed errors:", JSON.stringify(errors, null, 2));
		return errors;
	} catch (error) {
		console.error("[LanguageTool] Error calling API:", error);
		return [];
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {text} = body;

		console.log("[Proofreading API] Request received:", {
			textLength: text?.length,
			text: text?.substring(0, 100),
		});

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

		console.log("[Proofreading API] Using LanguageTool for grammar checking");
		const errors = await checkWithLanguageTool(text.trim());

		console.log("[Proofreading API] Returning", errors.length, "errors to client");
		return NextResponse.json({errors});
	} catch (error) {
		console.error("[Proofreading API] Error occurred:", error);
		if (error instanceof Error) {
			console.error("[Proofreading API] Error message:", error.message);
			console.error("[Proofreading API] Error stack:", error.stack);
		}
		return NextResponse.json({error: "Internal Server Error"}, {status: 500});
	}
}
