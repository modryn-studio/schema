import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AnalyzeProjectRequest, AnalysisResult } from '@/lib/types';
import { isGibberishInput } from '@/lib/sanitize';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Tool definition for structured output
const analyzeProjectTool: Anthropic.Messages.Tool = {
  name: 'analyze_project',
  description: 'Analyze a project description and determine if it is a single buildable unit or multiple buildable units.',
  input_schema: {
    type: 'object' as const,
    properties: {
      type: {
        type: 'string',
        enum: ['single', 'multiple'],
        description: 'Whether this is a single buildable unit or multiple buildable units',
      },
      summary: {
        type: 'string',
        description: 'For single units: A condensed 1-2 sentence description of what the project does and who it is for. Required when type is "single".',
      },
      units: {
        type: 'array',
        description: 'For multiple units: An array of 3-6 distinct buildable units. Required when type is "multiple".',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'Sequential ID starting from 1',
            },
            name: {
              type: 'string',
              description: 'Short name for the unit (3-6 words)',
            },
            description: {
              type: 'string',
              description: 'A 1-2 sentence description of this buildable unit',
            },
          },
          required: ['id', 'name', 'description'],
        },
      },
    },
    required: ['type'],
  },
};

function buildAnalysisPrompt(userInput: string): string {
  return `You are analyzing a project description to determine if it's ONE buildable unit or MULTIPLE buildable units.

**Definitions:**

- **ONE buildable unit**: A project that can be shipped in 2-14 days by one developer. It has a single core feature or purpose. Examples:
  - A CLI tool that does one thing
  - A simple CRUD app with auth
  - A landing page with a contact form
  - A basic API with 3-5 endpoints

- **MULTIPLE buildable units**: A project description that contains several distinct systems or features that should be built sequentially. Examples:
  - "A SaaS with auth, billing, dashboards, and mobile apps"
  - "An e-commerce platform with inventory, payments, shipping, and analytics"
  - Any project where the user lists 3+ major features that could each be shipped independently

**Your Task:**

Analyze the following project description and use the analyze_project tool to return your analysis.

<user_project_description>
${userInput}
</user_project_description>

**Instructions:**

1. Determine if this is ONE buildable unit or MULTIPLE.

2. If ONE buildable unit:
   - Condense the description to 1-2 clear sentences
   - Focus on: what it does, who it's for
   - Remove implementation details
   - Use the "summary" field

3. If MULTIPLE buildable units:
   - Extract 3-6 distinct buildable units
   - For each unit, provide:
     - A short name (3-6 words)
     - A 1-2 sentence description
   - Order them logically (what should be built first, second, etc.)
   - Focus on NATURAL breakpoints (not just arbitrary feature splits)
   - Use the "units" array

**Critical Rules:**
- If the description is short (under 200 chars) and mentions only 1-2 features, it's almost certainly SINGLE
- If the description lists 3+ distinct systems/features or uses words like "and", "also", "plus" to connect major features, consider MULTIPLE
- When in doubt, lean toward SINGLE (users can always add more detail)

Use the analyze_project tool now with your analysis.`;
}

function isClearlySimple(input: string): boolean {
  return (
    input.length < 200 &&
    !input.toLowerCase().includes(' and ') &&
    input.split('.').filter(s => s.trim()).length <= 2
  );
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: AnalyzeProjectRequest = await request.json();
    const { projectDescription, attachedDocContent } = body;

    // Combine description and doc content
    const fullInput = [
      projectDescription || '',
      attachedDocContent ? `\n\n--- Attached Document ---\n${attachedDocContent}` : ''
    ].join('').trim();

    if (!fullInput) {
      return NextResponse.json(
        { error: 'No project description provided' },
        { status: 400 }
      );
    }

    // Check for gibberish input
    if (isGibberishInput(fullInput)) {
      return NextResponse.json(
        { error: 'Please provide a meaningful project description. Your input appears to be random characters.' },
        { status: 400 }
      );
    }

    console.log('[AI Analysis] Input length:', fullInput.length);
    console.log('[AI Analysis] First 200 chars:', fullInput.slice(0, 200));

    // Call Claude API with tool use for structured output
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      tools: [analyzeProjectTool],
      tool_choice: { type: 'tool', name: 'analyze_project' },
      messages: [
        {
          role: 'user',
          content: buildAnalysisPrompt(fullInput),
        },
      ],
    });

    const duration = Date.now() - startTime;
    console.log(`[AI Analysis] API call took ${duration}ms`);

    // Extract tool use result
    const toolUseBlock = message.content.find(
      (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use'
    );

    if (!toolUseBlock) {
      console.error('[AI Analysis] No tool use block in response');
      throw new Error('AI did not return structured analysis');
    }

    const result = toolUseBlock.input as AnalysisResult;

    // Validate the result
    if (result.type === 'single') {
      if (!result.summary || typeof result.summary !== 'string') {
        throw new Error('Invalid single unit response: missing summary');
      }
      console.log('[AI Analysis] Result: single unit');
    } else if (result.type === 'multiple') {
      if (!('units' in result) || !Array.isArray(result.units) || result.units.length < 2) {
        throw new Error('Invalid multiple units response: missing or too few units');
      }
      console.log('[AI Analysis] Result: multiple units, count:', result.units.length);
    } else {
      throw new Error('Invalid response type: must be "single" or "multiple"');
    }

    return NextResponse.json({ result });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[AI Analysis] Error after ${duration}ms:`, error);

    // Get the original input for fallback logic
    let projectDescription = '';
    try {
      const body = await request.clone().json();
      projectDescription = body.projectDescription || '';
    } catch {
      // Ignore parse errors
    }

    // Smart fallback: only use for clearly simple inputs
    if (isClearlySimple(projectDescription)) {
      console.log('[AI Analysis] Using smart fallback for simple input');
      return NextResponse.json({
        result: {
          type: 'single',
          summary: projectDescription.trim(),
        } as AnalysisResult,
        fallback: true,
      });
    }

    // For complex inputs, return error
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
      { error: 'We couldn\'t analyze your project. Please try again or simplify your description.' },
      { status: 500 }
    );
  }
}
