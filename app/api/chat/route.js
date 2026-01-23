import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
  : null;

const systemPrompt = `
You are Opal, an AI assistant for Optimizely products. You help users with:
- Content Management System (CMS) questions
- A/B testing and experimentation
- Content optimization strategies
- Feature flagging and rollouts
- Analytics and reporting
- General questions and tasks

Be helpful, concise, and conversational. When discussing Optimizely features, provide accurate and practical guidance. For general questions outside Optimizely, respond helpfully like a standard AI assistant.
`;


export async function POST(request) {
  try {
    if (!openai) {
      return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const body = await request.json();
    const userMessage = body.userMessage;

    if (typeof userMessage !== 'string' || userMessage.trim() === '') {
      return Response.json({ error: 'Invalid userMessage' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    });

    return Response.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Error communicating with OpenAI' }, { status: 500 });
  }
}
