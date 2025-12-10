import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	})
	: null;

export async function POST(request) {
	try {
		if (!openai) {
			return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
		}

		const body = await request.json();
		const { messages } = body;

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: messages,
		});

		const content = completion.choices[0].message.content;

		return NextResponse.json({ content });
	} catch (error) {
		console.error("OpenAI API Error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
