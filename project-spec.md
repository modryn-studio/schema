# Project Spec: SpecifyThat (Execution-First)

This is not a brainstorming doc. This is a **build contract**.

------------------------------------------------------------------------

## 1. Project Title

**SpecifyThat**

------------------------------------------------------------------------

## 2. One-Paragraph Summary

SpecifyThat is a conversational spec generator for developers who struggle to turn ideas into executable build instructions. It conducts a targeted interview, asking specific questions about the project. When users don't know an answer, SpecifyThat provides "top 0.1% thinking" to fill gaps. At the end, it outputs a clear, ChatGPT-style spec that can be implemented immediately. Success means a developer goes from vague idea to building in under 30 minutes.

------------------------------------------------------------------------

## 3. Primary Goal

Convert a raw idea into a build-ready spec without over-thinking or delay.

------------------------------------------------------------------------

## 4. Constraints (Hard Rules)

These are **non-negotiable**.

- **Timebox**: 48 hours max
- **User model**: Anyone (public, no login required)
- **Auth**: None
- **Data storage**: Browser only (no backend database) - conversation state stored in browser memory during session
- **Deployment target**: Vercel (Next.js app)
- **Scale assumptions**: 1-100 users in first week

If it's not listed here, it does not exist.

------------------------------------------------------------------------

## 5. In-Scope Requirements

Concrete, testable requirements only.

- The system must present questions to the user one at a time in a conversational format
- The system must allow users to answer questions via text input
- The system must accept "I don't know" as a valid answer
- When user says "I don't know", the system must call Claude/GPT API to generate a "top 0.1% thinking" answer based on conversation context
- The system must output a final spec in ChatGPT test-project format
- The spec output must be copyable (copy button or select-all friendly)
- The interview must complete in under 30 minutes for the user
- The system must store conversation state in browser memory during the session
- The system must be mobile-responsive (usable on phone browsers)

------------------------------------------------------------------------

## 6. Explicit Non-Goals (Critical)

What we are **not building**, even if it seems obvious:

- No user accounts or login
- No saving/loading previous specs
- No editing a spec after it's generated
- No collaboration features (multiple users on same spec)
- No database or backend API
- No example library or template gallery
- No export to PDF/Word/etc (just plaintext copy)
- No native mobile app (iOS/Android) - web only, but must work on mobile browsers
- No fully AI-driven conversation - questions are pre-defined, AI only fills gaps

This section protects scope.

------------------------------------------------------------------------

## 7. Data Model

### Entity: Interview Session

- **id**: string (generated client-side, e.g., UUID)
- **fields**:
  - `currentQuestionIndex`: number (tracks which question user is on)
  - `answers`: array of objects `[{ question: string, answer: string, isAIGenerated: boolean }]`
  - `status`: string (enum: "in_progress", "completed")
  - `createdAt`: timestamp
- **relationships**: None (single-session, no persistence)
- **constraints**: 
  - Session exists only in browser memory
  - Cleared on page refresh
  - One active session per browser tab

### Entity: Question

- **id**: number (sequential index)
- **fields**:
  - `text`: string (the question to ask)
  - `contextForAI`: string (what to tell the AI if user says "I don't know")
  - `section`: string (which part of spec this maps to, e.g., "title", "summary", "constraints")
- **relationships**: None (static list)
- **constraints**:
  - Questions are hardcoded in the app
  - Questions asked in fixed order

### Entity: Generated Spec

- **id**: None (ephemeral, generated on demand)
- **fields**:
  - `fullText`: string (the complete ChatGPT-style spec)
  - `generatedAt`: timestamp
- **relationships**: Created from Interview Session answers
- **constraints**:
  - Generated once when user completes interview
  - Not stored, only displayed

------------------------------------------------------------------------

## 8. Interfaces

### Backend (API Routes)

- **POST /api/generate-answer**
  - Purpose: When user says "I don't know", send question context to Claude/GPT and return AI-generated answer
  - Input: `{ question: string, conversationContext: array, userInput: string }`
  - Output: `{ answer: string }`

- **POST /api/generate-spec**
  - Purpose: Takes all answers and generates final ChatGPT-style spec
  - Input: `{ answers: array }`
  - Output: `{ spec: string }`

### Frontend (User Actions)

- User lands on homepage and clicks "Start New Spec"
- User reads a question
- User types an answer and clicks "Next"
- User clicks "I don't know" button (triggers AI generation)
- User sees AI-generated answer, can accept it or modify it
- User proceeds through all questions sequentially
- User reaches end and sees "Generate Spec" button
- User clicks "Generate Spec" and sees final output
- User clicks "Copy to Clipboard" to copy the spec

------------------------------------------------------------------------

## 9. Execution Order (Recommended)

High-level build sequence to prevent thrashing.

1. **Set up Next.js project structure** (30 min)
   - Initialize Next.js app
   - Set up Tailwind CSS
   - Create basic file structure

2. **Define question list** (2 hours)
   - Write out all questions in fixed order
   - Map questions to spec sections
   - Write AI context for each question

3. **Build interview UI** (4 hours)
   - Question display component
   - Answer input field
   - "Next" and "I don't know" buttons
   - Progress indicator
   - Mobile-responsive layout

4. **Implement state management** (2 hours)
   - Track current question index
   - Store answers array in React state
   - Handle navigation between questions

5. **Build AI integration** (4 hours)
   - POST /api/generate-answer route
   - Connect to Claude/OpenAI API
   - Handle API errors gracefully
   - Display AI-generated answers

6. **Build spec generation** (3 hours)
   - POST /api/generate-spec route
   - Template for ChatGPT-style output
   - Format answers into structured spec

7. **Build results page** (2 hours)
   - Display final spec
   - Copy to clipboard button
   - "Start over" option

8. **Polish and test** (3 hours)
   - Test full flow on mobile
   - Fix styling issues
   - Add loading states
   - Handle edge cases

9. **Deploy to Vercel** (1 hour)
   - Connect GitHub repo
   - Set environment variables (API key)
   - Deploy and test live

**Total: ~21 hours** (leaves buffer for debugging)

------------------------------------------------------------------------

## 10. Success Criteria

Define how you know this is done.

- [ ] New users can start an interview without login
- [ ] Users can answer questions and proceed through the full interview
- [ ] "I don't know" button triggers AI generation and displays answer
- [ ] Users can complete the interview and generate a spec
- [ ] Generated spec is in ChatGPT test-project format (clear, actionable, specific)
- [ ] Copy button successfully copies spec to clipboard
- [ ] App works on mobile browsers (iPhone/Android)
- [ ] App is deployed live on Vercel with working URL
- [ ] No console errors in normal usage flow
- [ ] API calls handle errors gracefully (show user-friendly messages)

If all are true → ship.

------------------------------------------------------------------------

## 11. Quality Bar

Short checklist for minimum quality standards.

- [ ] Clean project structure (components, API routes, utils organized logically)
- [ ] No unused code or commented-out blocks
- [ ] Clear README with:
  - What SpecifyThat does
  - How to run it locally
  - How to deploy it
  - Environment variables needed (API key)
- [ ] Known limitations documented in README
- [ ] Mobile-responsive (tested on at least one phone)
- [ ] Loading states for AI calls (user knows something is happening)
- [ ] Error messages are helpful (not just "Error occurred")

------------------------------------------------------------------------

## 12. Stop Condition

Explicitly define when to stop.

> **When all success criteria are met and 48 hours have elapsed, stop and ship.**
> 
> If success criteria are met before 48 hours, ship early.
> 
> If 48 hours pass and criteria aren't met, ship anyway with a "Known Limitations" section in the README documenting what's incomplete.

------------------------------------------------------------------------

## 13. Notes to Future Me

If I feel the urge to:
- **Add features** → check Non-Goals
- **Make it fully AI-driven** → check Constraints (structured interview with AI fallback only)
- **Add user accounts or saving specs** → check Non-Goals
- **Perfect the UI endlessly** → check Timebox (48 hours, then ship)
- **Rethink the question list mid-build** → check Primary Goal (convert idea to spec without overthinking)
- **Add export formats or templates** → check Non-Goals

Specs exist to remove decisions, not add them.

The goal is to ship something that works for ONE person (me) in 48 hours. If 10 other people use it, that's a win.