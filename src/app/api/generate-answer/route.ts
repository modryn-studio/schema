import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { GenerateAnswerRequest } from '@/lib/types';
import { questions } from '@/lib/questions';
import { isGibberishInput } from '@/lib/sanitize';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body: GenerateAnswerRequest = await request.json();
    const { question, conversationContext, userInput } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Check for gibberish user input (if provided)
    if (userInput && isGibberishInput(userInput)) {
      return NextResponse.json(
        { error: 'Please provide a meaningful response. Your input appears to be random characters.' },
        { status: 400 }
      );
    }

    // Find the question config to get AI context
    const questionConfig = questions.find(q => q.text === question);
    const aiContext = questionConfig?.contextForAI || 'Provide a helpful answer based on best practices.';

    // Build conversation history for context
    let conversationSummary = '';
    if (conversationContext && conversationContext.length > 0) {
      conversationSummary = conversationContext
        .map(a => `Q: ${a.question}\nA: ${a.answer}`)
        .join('\n\n');
    }

    const systemPrompt = `You are an expert software architect and product strategist helping someone create a project specification. 
Your role is to provide "top 0.1% thinking" - the kind of answer that a world-class engineer or product manager would give.

Guidelines:
- Be specific and actionable, not vague
- Use concrete examples when helpful
- Keep answers concise but complete
- Format with bullet points or numbered lists when appropriate
- Think about what would actually work in practice, not just theory

${aiContext}`;

    const userPrompt = `The user is building a project spec and needs help answering this question.

${conversationSummary ? `Here's what they've already answered:\n\n${conversationSummary}\n\n---\n\n` : ''}

Current question: "${question}"

The user said: "${userInput}"

Provide a high-quality answer that they can use directly in their spec. Be specific and actionable.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    // Extract text from response
    const textContent = message.content.find(block => block.type === 'text');
    const answer = textContent ? textContent.text : 'Unable to generate answer.';

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error generating answer:', error);
    
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your configuration.' },
          { status: 401 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate answer. Please try again.' },
      { status: 500 }
    );
  }
}
