import {NextResponse} from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
	try {
		const body = await request.json();
		const {messages} = body;

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: messages,
		});

		const content = completion.choices[0].message.content;

		return NextResponse.json({content});
	} catch (error) {
		console.error("OpenAI API Error:", error);
		return NextResponse.json({error: "Internal Server Error"}, {status: 500});
	}
}
