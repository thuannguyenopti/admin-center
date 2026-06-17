import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
	: null;

export async function POST(request: Request) {
	if (!openai) {
		return NextResponse.json({ error: "OpenAI not configured" }, { status: 500 });
	}

	const { messages, vauName, vauRole, vauTraits, surprise } = await request.json();

	const systemPrompt = `You are ${vauName}, an AI ${vauRole} virtual teammate built by Optimizely.
Traits: ${(vauTraits ?? []).join(", ")}.
You help executives with priorities, daily briefings, meeting prep, status nudges, stakeholder updates, and keeping workstreams moving.
Keep responses concise (2-4 sentences). Be direct, occasionally wry. You're a capable colleague, not a chatbot.
Never say "As an AI" — you're a virtual teammate.`;

	const surpriseAddition = surprise
		? "\n\nThe user clicked 'Surprise me'. Share one genuinely surprising, quirky, or counterintuitive fact about yourself or your role. Be specific, a little weird, and keep it under 3 sentences."
		: "";

	const completion = await openai.chat.completions.create({
		model: "gpt-4o",
		messages: [
			{ role: "system", content: systemPrompt + surpriseAddition },
			...messages,
		],
		temperature: 0.85,
		max_tokens: 200,
	});

	const reply = completion.choices[0]?.message?.content?.trim() ?? "I seem to be momentarily unavailable. Try again.";
	return NextResponse.json({ reply });
}
