import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
  : null;

// Base system prompt
const baseSystemPrompt = `
You are Opal, an AI assistant for Optimizely products. You help users with:
- Content Management System (CMS) questions
- A/B testing and experimentation
- Content optimization strategies
- Feature flagging and rollouts
- Analytics and reporting
- General questions and tasks

Be helpful, concise, and conversational. When discussing Optimizely features, provide accurate and practical guidance. For general questions outside Optimizely, respond helpfully like a standard AI assistant.
`;

// Build a dynamic system prompt that includes context
function buildSystemPrompt(context) {
  if (!context) {
    return baseSystemPrompt;
  }

  const { currentPage, availableFeatures, opalCapabilities } = context;

  let contextSection = '';
  
  // Add current page context
  if (currentPage) {
    contextSection += `
CURRENT USER CONTEXT:
- The user is currently on: ${currentPage.pageName}
- Product area: ${currentPage.productArea}
- Page path: ${currentPage.path}
${currentPage.pageDescription ? `- Page description: ${currentPage.pageDescription}` : ''}
`;
  }

  // Add available features
  if (availableFeatures && availableFeatures.length > 0) {
    contextSection += `
AVAILABLE FEATURES IN THIS AREA:
${availableFeatures.map(f => `- ${f}`).join('\n')}
`;
  }

  // Add Opal capabilities
  if (opalCapabilities && opalCapabilities.length > 0) {
    contextSection += `
YOUR CAPABILITIES (what you can help with):
${opalCapabilities.map(c => `- ${c}`).join('\n')}
`;
  }

  // Combine base prompt with context
  return `${baseSystemPrompt}
${contextSection}

INSTRUCTIONS:
- Use the current context to provide more relevant and specific answers.
- If the user asks about features, refer to the available features in their current area.
- When suggesting actions, consider what page the user is on.
- If the user seems lost or asks for help navigating, guide them using the available features.
- Be proactive in suggesting relevant features based on the user's context.
`;
}


export async function POST(request) {
  try {
    const body = await request.json();
    const userMessage = body.userMessage;
    const context = body.context;
    const experimentContext = body.experimentContext;

    if (typeof userMessage !== 'string' || userMessage.trim() === '') {
      return Response.json({ error: 'Invalid userMessage' }, { status: 400 });
    }

    // Experiment results summary: return structured steps + summary without calling OpenAI
    if (
      experimentContext?.optimizationId &&
      experimentContext?.requestSummary
    ) {
      try {
        const { getExperimentSummary } = await import('./experimentSummary');
        const { steps, summary } = getExperimentSummary(experimentContext.optimizationId);
        return Response.json({ steps, summary });
      } catch (summaryError) {
        console.error('Experiment summary failed:', summaryError);
        return Response.json(
          { error: summaryError?.message || 'Failed to generate experiment summary' },
          { status: 500 }
        );
      }
    }

    if (!openai) {
      return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Build dynamic system prompt with context
    const systemPrompt = buildSystemPrompt(context);

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
