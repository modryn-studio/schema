import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { GenerateProjectDescriptionRequest, IdeationAnswers } from '@/lib/types';
import { isGibberishInput } from '@/lib/sanitize';

const anthropic = new Anthropic();

function buildIdeationPrompt(answers: IdeationAnswers): string {
  const parts: string[] = [];
  
  if (answers.problemFrustration) {
    parts.push(`Problem/Frustration: ${answers.problemFrustration}`);
  }
  if (answers.targetUser) {
    parts.push(`Target User: ${answers.targetUser}`);
  }
  if (answers.category) {
    parts.push(`Category: ${answers.category}`);
  }

  return `You are a product design expert helping someone crystallize their project idea into a clear description.

Based on the discovery answers below, generate a concise, clear project description suitable for a software specification document. Be creative and generous in your interpretation - even vague ideas can become software projects.

<discovery_answers>
${parts.join('\n')}
</discovery_answers>

Requirements:
1. Write 2-4 sentences that clearly describe what the project does and who it's for
2. Make reasonable assumptions to fill gaps and create a coherent software project concept
3. Focus on the core value proposition
4. Avoid jargon or buzzwords
5. Write in a direct, professional tone

Format: Just output the project description, no preamble or explanation.`;
}

export async function POST(request: Request) {
  try {
    const body: GenerateProjectDescriptionRequest = await request.json();
    const { ideationAnswers } = body;

    // Validate we have at least some input
    if (!ideationAnswers.problemFrustration && !ideationAnswers.targetUser && !ideationAnswers.category) {
      return NextResponse.json(
        { error: 'At least one discovery answer is required' },
        { status: 400 }
      );
    }

    // Check for gibberish inputs
    const inputs = [
      ideationAnswers.problemFrustration,
      ideationAnswers.targetUser,
      ideationAnswers.category
    ].filter(Boolean);

    const allGibberish = inputs.every(input => isGibberishInput(input || ''));
    if (allGibberish) {
      return NextResponse.json(
        { error: 'Please provide meaningful answers. The inputs appear to contain random characters.' },
        { status: 400 }
      );
    }

    const prompt = buildIdeationPrompt(ideationAnswers);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Failed to generate project description' },
        { status: 500 }
      );
    }

    const generatedText = textContent.text.trim();

    return NextResponse.json({
      projectDescription: generatedText,
    });
  } catch (error) {
    console.error('Generate project description error:', error);
    return NextResponse.json(
      { error: 'Failed to generate project description' },
      { status: 500 }
    );
  }
}
