# SpecifyThat AI Analysis Implementation Guide

## Overview

This guide details how to implement the AI analysis step for Question 2 in SpecifyThat. This is the **most critical technical component** of the app — it determines whether the user's project is one buildable unit or multiple, and extracts/condenses accordingly.

---

## High-Level Flow

```
User submits Q2 answer (text + optional doc)
    ↓
Frontend sends to /api/analyze-project
    ↓
Backend calls Claude/GPT with structured prompt
    ↓
AI returns JSON: {type, summary, units}
    ↓
Backend validates response
    ↓
Frontend receives response and routes user:
    - If "single" → continue to Q3
    - If "multiple" → show unit selection UI
```

---

## Part 1: Frontend Implementation

### File: `app/interview/page.tsx` (or equivalent)

#### State Management

```typescript
// Interview state
const [currentQuestion, setCurrentQuestion] = useState(1);
const [answers, setAnswers] = useState({
  projectName: '',
  projectDescription: '',
  attachedDoc: null as File | null,
});

// Q2 analysis state
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [analysisResult, setAnalysisResult] = useState<{
  type: 'single' | 'multiple';
  summary?: string;
  units?: Array<{
    id: number;
    name: string;
    description: string;
  }>;
} | null>(null);

const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
```

#### Q2 UI Component

```typescript
// Question 2: Project Description
{currentQuestion === 2 && (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold">
      Describe your project. What does it do and who is it for?
    </h2>
    
    <p className="text-gray-600">
      You can write as much or as little as you want. 
      You can also attach a doc if you have one.
    </p>
    
    {/* Text Input */}
    <textarea
      value={answers.projectDescription}
      onChange={(e) => setAnswers({
        ...answers,
        projectDescription: e.target.value
      })}
      placeholder="Describe your project here..."
      className="w-full h-48 p-4 border rounded-lg"
      disabled={isAnalyzing}
    />
    
    {/* File Upload */}
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Or attach a document (optional)
      </label>
      <input
        type="file"
        accept=".pdf,.txt,.md"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          setAnswers({ ...answers, attachedDoc: file });
        }}
        disabled={isAnalyzing}
        className="block w-full text-sm"
      />
      {answers.attachedDoc && (
        <p className="text-sm text-gray-600">
          Attached: {answers.attachedDoc.name}
        </p>
      )}
    </div>
    
    {/* Next Button */}
    <button
      onClick={handleQ2Submit}
      disabled={
        isAnalyzing || 
        (!answers.projectDescription && !answers.attachedDoc)
      }
      className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
    >
      {isAnalyzing ? 'Analyzing...' : 'Next'}
    </button>
  </div>
)}
```

#### Q2 Submit Handler

```typescript
const handleQ2Submit = async () => {
  setIsAnalyzing(true);
  
  try {
    // Prepare request body
    const formData = new FormData();
    formData.append('projectDescription', answers.projectDescription);
    
    if (answers.attachedDoc) {
      formData.append('attachedDoc', answers.attachedDoc);
    }
    
    // Call analysis API
    const response = await fetch('/api/analyze-project', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Analysis failed');
    }
    
    const result = await response.json();
    setAnalysisResult(result);
    
    // If single unit, proceed to Q3 automatically
    if (result.type === 'single') {
      setCurrentQuestion(3);
    }
    
    // If multiple units, stay on Q2 and show unit selection
    // (handled by conditional rendering below)
    
  } catch (error) {
    console.error('Analysis error:', error);
    alert('Failed to analyze project. Please try again.');
  } finally {
    setIsAnalyzing(false);
  }
};
```

#### Unit Selection UI (shown if multiple units detected)

```typescript
// Show unit selection if analysis returned multiple units
{analysisResult?.type === 'multiple' && !selectedUnit && (
  <div className="space-y-4 mt-8">
    <h2 className="text-2xl font-bold">
      I found {analysisResult.units?.length} buildable units in your project:
    </h2>
    
    <p className="text-gray-600">
      Which one do you want to spec first?
      <br />
      <span className="text-sm">(You can come back and spec the others later.)</span>
    </p>
    
    <div className="space-y-3">
      {analysisResult.units?.map((unit) => (
        <button
          key={unit.id}
          onClick={() => {
            setSelectedUnit(unit.id);
            // Store the selected unit's description as the project summary
            setAnswers({
              ...answers,
              projectDescription: unit.description
            });
            // Proceed to Q3
            setCurrentQuestion(3);
          }}
          className="w-full p-4 border rounded-lg text-left hover:border-blue-500 hover:bg-blue-50"
        >
          <div className="font-bold text-lg">{unit.id}. {unit.name}</div>
          <div className="text-gray-600 mt-1">{unit.description}</div>
        </button>
      ))}
    </div>
  </div>
)}
```

---

## Part 2: Backend API Implementation

### File: `app/api/analyze-project/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const projectDescription = formData.get('projectDescription') as string;
    const attachedDoc = formData.get('attachedDoc') as File | null;
    
    // Extract text from attached doc if present
    let docContent = '';
    if (attachedDoc) {
      docContent = await extractTextFromFile(attachedDoc);
    }
    
    // Combine description and doc content
    const fullInput = [
      projectDescription || '',
      docContent ? `\n\n--- Attached Document ---\n${docContent}` : ''
    ].join('').trim();
    
    if (!fullInput) {
      return NextResponse.json(
        { error: 'No project description provided' },
        { status: 400 }
      );
    }
    
    // Call Claude API with structured prompt
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: buildAnalysisPrompt(fullInput)
        }
      ]
    });
    
    // Extract JSON from response
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');
    
    const result = parseAIResponse(responseText);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze project' },
      { status: 500 }
    );
  }
}

// Helper: Extract text from uploaded file
async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const text = new TextDecoder().decode(buffer);
  
  // Basic text extraction (works for .txt and .md)
  // For PDF, you'd need a library like pdf-parse
  if (file.name.endsWith('.pdf')) {
    // TODO: Implement PDF parsing
    // For now, return a placeholder
    return '[PDF content - implement PDF parsing]';
  }
  
  return text;
}

// Helper: Build the analysis prompt
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

Analyze the following project description and return a JSON response.

**Project Description:**
${userInput}

**Instructions:**

1. Determine if this is ONE buildable unit or MULTIPLE.

2. If ONE buildable unit:
   - Condense the description to 1-2 clear sentences
   - Focus on: what it does, who it's for
   - Remove implementation details

3. If MULTIPLE buildable units:
   - Extract 3-6 distinct buildable units
   - For each unit, provide:
     - A short name (3-6 words)
     - A 1-2 sentence description
   - Order them logically (what should be built first, second, etc.)
   - Focus on NATURAL breakpoints (not just arbitrary feature splits)

**Return JSON in this exact format:**

If single unit:
{
  "type": "single",
  "summary": "A CLI tool that screenshots the terminal and uploads to Imgur for quick sharing."
}

If multiple units:
{
  "type": "multiple",
  "units": [
    {
      "id": 1,
      "name": "User auth + basic project list",
      "description": "MVP foundation with user login and basic project CRUD operations."
    },
    {
      "id": 2,
      "name": "Team workspaces",
      "description": "Multi-user support with team creation and member invitations."
    }
  ]
}

**Critical Rules:**
- Return ONLY valid JSON, no other text
- Use double quotes for all strings
- Ensure "type" is exactly "single" or "multiple"
- If single, include "summary" field
- If multiple, include "units" array with 3-6 items
- Each unit must have "id" (number), "name" (string), and "description" (string)

Return your JSON response now:`;
}

// Helper: Parse AI response and validate JSON
function parseAIResponse(responseText: string): any {
  // Strip markdown code fences if present
  let jsonText = responseText.trim();
  jsonText = jsonText.replace(/^```json\n?/i, '');
  jsonText = jsonText.replace(/\n?```$/i, '');
  jsonText = jsonText.trim();
  
  // Parse JSON
  const parsed = JSON.parse(jsonText);
  
  // Validate structure
  if (parsed.type === 'single') {
    if (!parsed.summary || typeof parsed.summary !== 'string') {
      throw new Error('Invalid single unit response: missing summary');
    }
  } else if (parsed.type === 'multiple') {
    if (!Array.isArray(parsed.units) || parsed.units.length < 2) {
      throw new Error('Invalid multiple units response: missing or too few units');
    }
    
    // Validate each unit
    parsed.units.forEach((unit: any, index: number) => {
      if (typeof unit.id !== 'number') {
        throw new Error(`Unit ${index} missing valid id`);
      }
      if (!unit.name || typeof unit.name !== 'string') {
        throw new Error(`Unit ${index} missing valid name`);
      }
      if (!unit.description || typeof unit.description !== 'string') {
        throw new Error(`Unit ${index} missing valid description`);
      }
    });
  } else {
    throw new Error('Invalid response type: must be "single" or "multiple"');
  }
  
  return parsed;
}
```

---

## Part 3: Error Handling & Edge Cases

### Common Failure Modes

#### 1. AI returns malformed JSON

**Solution:** Wrap JSON parsing in try-catch, return user-friendly error

```typescript
try {
  const result = parseAIResponse(responseText);
  return NextResponse.json(result);
} catch (error) {
  console.error('JSON parse error:', error);
  
  // Fallback: treat as single unit
  return NextResponse.json({
    type: 'single',
    summary: projectDescription.slice(0, 200) // Truncate to 200 chars
  });
}
```

#### 2. User uploads very large doc (>10MB)

**Solution:** Add file size validation in frontend

```typescript
<input
  type="file"
  accept=".pdf,.txt,.md"
  onChange={(e) => {
    const file = e.target.files?.[0];
    
    if (file && file.size > 10 * 1024 * 1024) { // 10MB
      alert('File too large. Please upload a file under 10MB.');
      e.target.value = ''; // Clear input
      return;
    }
    
    setAnswers({ ...answers, attachedDoc: file || null });
  }}
/>
```

#### 3. AI detects 10+ buildable units

**Solution:** Cap units at 6 in the prompt, or handle large lists in UI

```typescript
// In buildAnalysisPrompt():
// "Extract 3-6 distinct buildable units (no more than 6)"

// In frontend, if units.length > 6:
{analysisResult.units?.slice(0, 6).map((unit) => (
  // Render unit...
))}
```

#### 4. User submits empty description and no doc

**Solution:** Disable submit button until input exists

```typescript
<button
  onClick={handleQ2Submit}
  disabled={
    isAnalyzing || 
    (!answers.projectDescription && !answers.attachedDoc)
  }
>
  Next
</button>
```

#### 5. API key missing or invalid

**Solution:** Check for API key on startup

```typescript
// In route.ts
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not set');
  return NextResponse.json(
    { error: 'Server configuration error' },
    { status: 500 }
  );
}
```

---

## Part 4: Testing Strategy

### Test Cases

#### Test 1: Single unit (simple idea)

**Input:**
```
"A CLI tool that takes a screenshot of my terminal and uploads it to Imgur."
```

**Expected Output:**
```json
{
  "type": "single",
  "summary": "A CLI tool that screenshots the terminal and uploads to Imgur for quick sharing."
}
```

---

#### Test 2: Multiple units (vision doc)

**Input:**
```
"I want to build a project management SaaS for small teams. It will have:
- User authentication and team workspaces
- Real-time task collaboration
- Kanban boards and Gantt charts
- Time tracking and reporting
- Integrations with Slack and GitHub
- Mobile apps for iOS and Android
- Admin dashboard for user management
- Billing with Stripe"
```

**Expected Output:**
```json
{
  "type": "multiple",
  "units": [
    {
      "id": 1,
      "name": "User auth + basic task list",
      "description": "MVP with login and simple task CRUD operations."
    },
    {
      "id": 2,
      "name": "Team workspaces",
      "description": "Multi-user support with team creation and invitations."
    },
    {
      "id": 3,
      "name": "Kanban boards",
      "description": "Visual task management with drag-and-drop columns."
    },
    {
      "id": 4,
      "name": "Time tracking",
      "description": "Track time spent on tasks with reporting."
    },
    {
      "id": 5,
      "name": "Integrations",
      "description": "Connect to Slack and GitHub for notifications and syncing."
    },
    {
      "id": 6,
      "name": "Mobile apps",
      "description": "iOS and Android native clients."
    }
  ]
}
```

---

#### Test 3: Ambiguous case (2-3 features)

**Input:**
```
"A personal finance tracker where I can log expenses and set budgets."
```

**Expected Output:**
```json
{
  "type": "single",
  "summary": "A personal finance tracker for logging expenses and setting budgets."
}
```

**Why single?** These two features (expense logging + budgets) are tightly coupled and can be built together in one unit.

---

#### Test 4: Attached doc (PDF/TXT)

**Input:**
- Empty text field
- Attached `vision.txt` containing multi-page project description

**Expected Output:**
- Same as Test 2 (multiple units extracted from doc)

---

### Manual Testing Checklist

- [ ] Single unit: short description → condenses correctly
- [ ] Multiple units: long description → extracts 3-6 units
- [ ] Attached .txt file → parses correctly
- [ ] Attached .md file → parses correctly
- [ ] Attached .pdf file → parses correctly (if PDF parsing implemented)
- [ ] Empty description + no doc → submit button disabled
- [ ] Very long description (5000+ words) → doesn't timeout
- [ ] Malformed response from AI → graceful fallback
- [ ] API key missing → clear error message
- [ ] Network error → user-friendly error message

---

## Part 5: Performance Optimization

### Expected Latency

- **Text-only analysis:** 2-5 seconds
- **With attached doc:** 5-10 seconds (depends on doc size)

### Optimization Strategies

#### 1. Show progress indicator

```typescript
{isAnalyzing && (
  <div className="flex items-center space-x-2">
    <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent" />
    <span>Analyzing your project...</span>
  </div>
)}
```

#### 2. Truncate very long inputs

```typescript
// In buildAnalysisPrompt(), before sending to AI:
const truncatedInput = userInput.length > 10000 
  ? userInput.slice(0, 10000) + '\n\n[Content truncated...]'
  : userInput;
```

#### 3. Cache analysis results (optional)

```typescript
// If user goes back and forth between Q2 and Q3,
// don't re-analyze. Store result in state:
const [cachedAnalysis, setCachedAnalysis] = useState<any>(null);

// In handleQ2Submit:
if (cachedAnalysis) {
  setAnalysisResult(cachedAnalysis);
  return;
}
```

---

## Part 6: Environment Variables

### Required in `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### Setup Instructions:

1. Get API key from https://console.anthropic.com
2. Create `.env.local` in project root
3. Add `ANTHROPIC_API_KEY=your_key_here`
4. Restart Next.js dev server

---

## Part 7: Dependencies

### Install Anthropic SDK:

```bash
npm install @anthropic-ai/sdk
```

### For PDF parsing (optional):

```bash
npm install pdf-parse
```

Then update `extractTextFromFile()`:

```typescript
import pdfParse from 'pdf-parse';

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  
  if (file.name.endsWith('.pdf')) {
    const data = await pdfParse(Buffer.from(buffer));
    return data.text;
  }
  
  // For .txt and .md
  const text = new TextDecoder().decode(buffer);
  return text;
}
```

---

## Part 8: Monitoring & Debugging

### Add logging for debugging:

```typescript
// In route.ts, before calling Claude:
console.log('[AI Analysis] Input length:', fullInput.length);
console.log('[AI Analysis] First 200 chars:', fullInput.slice(0, 200));

// After receiving response:
console.log('[AI Analysis] Response type:', result.type);
if (result.type === 'multiple') {
  console.log('[AI Analysis] Units found:', result.units.length);
}
```

### Track API usage:

```typescript
// In route.ts:
const startTime = Date.now();

const message = await anthropic.messages.create({
  // ...
});

const duration = Date.now() - startTime;
console.log(`[AI Analysis] API call took ${duration}ms`);
```

---

## Part 9: Security Considerations

### 1. Rate limiting

**Problem:** User could spam the API and rack up costs.

**Solution:** Add rate limiting per IP or session.

```typescript
// Simple in-memory rate limiter (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetAt) {
    // Reset limit
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 }); // 1 min window
    return true;
  }
  
  if (limit.count >= 5) {
    return false; // Exceeded 5 requests per minute
  }
  
  limit.count++;
  return true;
}

// In route.ts:
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute.' },
      { status: 429 }
    );
  }
  
  // Continue...
}
```

### 2. Input sanitization

**Problem:** User could upload malicious file or inject code.

**Solution:** Validate file types and sanitize text.

```typescript
// Validate file type
const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf'];
if (attachedDoc && !allowedTypes.includes(attachedDoc.type)) {
  return NextResponse.json(
    { error: 'Invalid file type. Only .txt, .md, and .pdf allowed.' },
    { status: 400 }
  );
}

// Sanitize text (remove potential injection attempts)
function sanitizeInput(text: string): string {
  // Remove null bytes
  return text.replace(/\0/g, '');
}
```

### 3. API key protection

**Problem:** API key exposed in client-side code.

**Solution:** Keep API calls server-side only (already doing this).

**Verification:**
- API key is in `.env.local` (never committed)
- All AI calls happen in `/api/` routes (server-side)
- Frontend never sees the API key

---

## Part 10: Deployment Checklist

Before deploying to Vercel:

- [ ] Environment variable `ANTHROPIC_API_KEY` set in Vercel dashboard
- [ ] Rate limiting implemented (or acceptable risk for MVP)
- [ ] Error handling tested (malformed responses, network failures)
- [ ] File size limits validated
- [ ] PDF parsing working (if implemented)
- [ ] All test cases passing
- [ ] Logging configured for production (e.g., Sentry, LogRocket)
- [ ] Response times acceptable (<10 seconds for analysis)

---

## Summary

**This implementation provides:**
- Robust AI analysis with structured prompts
- Graceful error handling for edge cases
- Clear separation of single vs. multiple unit projects
- Efficient frontend/backend architecture
- Security considerations (rate limiting, input sanitization)
- Performance monitoring and debugging

**Build time estimate:** 6-8 hours
- Frontend UI: 2 hours
- Backend API: 3 hours
- Testing & debugging: 2-3 hours

**Ship it.**