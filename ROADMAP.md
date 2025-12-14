# Schema - Build Roadmap

**Status**: Pre-Build Planning  
**Timeline**: 48 hours max  
**Current Date**: December 13, 2025

---

## Tech Stack (Confirmed)

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Provider**: Claude (Anthropic API)
- **Deployment**: Vercel
- **State Management**: React hooks (browser memory only)

---

## File Structure

```
schema/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Homepage (start interview)
│   │   ├── interview/
│   │   │   └── page.tsx              # Interview conversation UI
│   │   ├── result/
│   │   │   └── page.tsx              # Final spec display
│   │   └── api/
│   │       ├── generate-answer/
│   │       │   └── route.ts          # AI gap-filling endpoint
│   │       └── generate-spec/
│   │           └── route.ts          # Final spec generation
│   ├── components/
│   │   ├── QuestionCard.tsx          # Single question display
│   │   ├── AnswerInput.tsx           # Text input + buttons
│   │   ├── ProgressBar.tsx           # Visual progress indicator
│   │   ├── LoadingSpinner.tsx        # AI loading state
│   │   └── SpecDisplay.tsx           # Final spec with copy button
│   ├── lib/
│   │   ├── questions.ts              # Question list (hardcoded)
│   │   ├── types.ts                  # TypeScript interfaces
│   │   └── specTemplate.ts           # Spec generation logic
│   └── hooks/
│       └── useInterviewSession.ts    # Session state management
├── public/
├── .env.local                         # API key (gitignored)
├── .env.example                       # Template for API key
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Question List (Mapped to Spec Sections)

### Section 1: Project Title
**Q1**: "What's the name of your project?"
- AI Context: "Suggest a clear, memorable project name based on what the user wants to build."

### Section 2: One-Paragraph Summary
**Q2**: "Describe your project in 1-2 sentences. What does it do and who is it for?"
- AI Context: "Generate a concise summary that captures the project's core value proposition."

### Section 3: Primary Goal
**Q3**: "What's the single most important outcome this project must achieve?"
- AI Context: "Identify the primary goal based on the project description, focusing on the core problem being solved."

### Section 4: Constraints
**Q4**: "What are your hard constraints? (e.g., timeline, budget, team size, tech stack requirements)"
- AI Context: "Suggest realistic constraints for a solo/small team project: 2-4 week timeline, minimal budget, common tech stack."

**Q5**: "Are there any deployment or hosting requirements?"
- AI Context: "Recommend Vercel/Netlify for frontend, Render/Railway for backend, with free tier constraints."

### Section 5: In-Scope Requirements
**Q6**: "List the core features that MUST be in version 1. What's essential?"
- AI Context: "Based on the project description, list 5-8 essential features in concrete, testable language."

### Section 6: Explicit Non-Goals
**Q7**: "What features should we explicitly NOT build right now, even if they seem obvious?"
- AI Context: "List common feature creep items for this type of project (user accounts, admin panels, analytics, etc.)."

### Section 7: Data Model
**Q8**: "What are the main 'things' your system needs to track? (e.g., users, posts, products)"
- AI Context: "Identify 2-4 core entities based on the project requirements and define their key fields."

**Q9**: "What relationships exist between these things? (e.g., a user has many posts)"
- AI Context: "Map logical relationships between entities (one-to-many, many-to-many)."

### Section 8: Interfaces
**Q10**: "What user actions need to happen? Walk me through the main user flow."
- AI Context: "Define the primary user journey from entry to completion, listing each key interaction."

**Q11**: "What backend APIs or external services does this need?"
- AI Context: "Identify necessary API endpoints based on features, following REST conventions."

### Section 9: Execution Order
**Q12**: "Do you have a preferred build sequence, or should I suggest one?"
- AI Context: "Generate a logical build sequence: setup → data layer → API → UI → polish → deploy."

### Section 10-13: Meta Questions
**Q13**: "How will you know this project is done? What's the success criteria?"
- AI Context: "Create a checklist of testable success criteria based on the requirements."

**Total Questions**: 13 (maps 1:1 to spec sections)

---

## API Endpoint Specifications

### POST /api/generate-answer

**Purpose**: Fill knowledge gaps when user clicks "I don't know"

**Input**:
```typescript
{
  question: string;              // Current question text
  conversationContext: Array<{   // All previous Q&As
    question: string;
    answer: string;
    isAIGenerated: boolean;
  }>;
  userInput: string;             // User's "I don't know" or partial answer
}
```

**Process**:
1. Build prompt with conversation context
2. Call Claude API with structured prompt
3. Return AI-generated answer

**Output**:
```typescript
{
  answer: string;                // AI-generated response
}
```

**Error Handling**:
- API key invalid → User-friendly message
- Rate limit → Retry after delay
- Network error → Show retry button

---

### POST /api/generate-spec

**Purpose**: Convert all answers into final ChatGPT-style spec

**Input**:
```typescript
{
  answers: Array<{
    question: string;
    answer: string;
    isAIGenerated: boolean;
  }>;
}
```

**Process**:
1. Map answers to spec sections (1-13)
2. Call Claude API to format into structured spec
3. Return formatted markdown

**Output**:
```typescript
{
  spec: string;                  // Complete markdown spec
}
```

---

## Build Sequence (Detailed)

### Phase 1: Setup (1 hour)
- [ ] Initialize Next.js with TypeScript and Tailwind
- [ ] Set up project structure (folders, files)
- [ ] Create .env.local with API key
- [ ] Install dependencies (@anthropic-ai/sdk)
- [ ] Configure tailwind.config.ts
- [ ] Test dev server runs

**Commands**:
```bash
npx create-next-app@latest schema --typescript --tailwind --app
cd schema
npm install @anthropic-ai/sdk
```

---

### Phase 2: Question List & Types (1 hour)
- [ ] Create `lib/types.ts` with all TypeScript interfaces
- [ ] Create `lib/questions.ts` with 13 hardcoded questions
- [ ] Map each question to spec section
- [ ] Write AI context for each question
- [ ] Export question array

---

### Phase 3: State Management (1.5 hours)
- [ ] Create `hooks/useInterviewSession.ts`
- [ ] Implement session state (answers, current index, status)
- [ ] Add methods: nextQuestion, saveAnswer, reset
- [ ] Handle "I don't know" flow
- [ ] Generate UUID for session ID

---

### Phase 4: API Routes (3 hours)
- [ ] Create `/api/generate-answer/route.ts`
  - Build Claude prompt with context
  - Handle API errors gracefully
  - Return structured response
- [ ] Create `/api/generate-spec/route.ts`
  - Map answers to spec sections
  - Generate final formatted spec
  - Handle edge cases (missing answers)
- [ ] Test both endpoints with Postman/curl

---

### Phase 5: UI Components (4 hours)
- [ ] `QuestionCard.tsx` - Display question with section context
- [ ] `AnswerInput.tsx` - Text area + "Next" + "I don't know" buttons
- [ ] `ProgressBar.tsx` - Visual indicator (X of 13 questions)
- [ ] `LoadingSpinner.tsx` - Show during AI calls
- [ ] `SpecDisplay.tsx` - Formatted spec + copy button
- [ ] Mobile-responsive styling (test on 375px width)

---

### Phase 6: Pages (4 hours)
- [ ] **Homepage** (`app/page.tsx`)
  - Hero section with title and description
  - "Start New Spec" button
  - Link to /interview
- [ ] **Interview Page** (`app/interview/page.tsx`)
  - Use `useInterviewSession` hook
  - Show QuestionCard and AnswerInput
  - Handle navigation between questions
  - Call generate-answer API on "I don't know"
  - Redirect to /result when complete
- [ ] **Result Page** (`app/result/page.tsx`)
  - Display SpecDisplay component
  - Read answers from session state
  - Call generate-spec API on mount
  - Show loading state during generation
  - "Start Over" button (clear session, go to /)

---

### Phase 7: Spec Generation Logic (2 hours)
- [ ] Create `lib/specTemplate.ts`
- [ ] Write template function that maps answers to sections
- [ ] Format as markdown matching schema-spec.md structure
- [ ] Handle optional sections gracefully
- [ ] Test with sample answers

---

### Phase 8: Polish & Error Handling (2 hours)
- [ ] Add loading states for all async operations
- [ ] Error boundaries for unexpected crashes
- [ ] User-friendly error messages (not raw API errors)
- [ ] Empty state handling (no answers yet)
- [ ] Copy button feedback ("Copied!")
- [ ] Keyboard navigation (Enter to submit)
- [ ] Focus management

---

### Phase 9: Testing (2 hours)
- [ ] Test full flow: start → answer all questions → generate spec
- [ ] Test "I don't know" flow for each question
- [ ] Test mobile responsive on Chrome DevTools (iPhone SE, Pixel)
- [ ] Test copy to clipboard on different browsers
- [ ] Test error scenarios (invalid API key, network failure)
- [ ] Test edge cases (empty answers, special characters)
- [ ] Fix console errors/warnings

---

### Phase 10: README & Documentation (1 hour)
- [ ] Write clear README with:
  - Project description
  - Features list
  - Tech stack
  - Setup instructions (clone, install, env vars)
  - Run locally instructions
  - Deploy to Vercel instructions
  - Known limitations
- [ ] Create .env.example file
- [ ] Add comments to complex code sections
- [ ] Remove unused code/imports

---

### Phase 11: Deployment (1 hour)
- [ ] Push to GitHub repository
- [ ] Connect to Vercel
- [ ] Add ANTHROPIC_API_KEY environment variable
- [ ] Deploy and test live URL
- [ ] Fix any production-only issues
- [ ] Verify mobile functionality on real devices

---

## Success Checklist

Before marking as "complete":

- [ ] New users can start interview without login
- [ ] All 13 questions display in order
- [ ] User can type answers and proceed
- [ ] "I don't know" triggers AI generation (tested on 3+ questions)
- [ ] AI-generated answers are reasonable and context-aware
- [ ] Complete interview generates proper spec
- [ ] Spec follows exact structure of schema-spec.md (sections 1-13)
- [ ] Copy button works reliably
- [ ] Works on mobile (iPhone Safari, Android Chrome)
- [ ] Deployed on Vercel with working URL
- [ ] No console errors in normal flow
- [ ] Error messages are helpful (not "Error 500")
- [ ] README is complete and accurate

---

## Time Budget

| Phase | Estimated Time | Buffer |
|-------|---------------|--------|
| Setup | 1h | 0.5h |
| Questions & Types | 1h | 0.5h |
| State Management | 1.5h | 0.5h |
| API Routes | 3h | 1h |
| UI Components | 4h | 1h |
| Pages | 4h | 1h |
| Spec Logic | 2h | 0.5h |
| Polish | 2h | 1h |
| Testing | 2h | 1h |
| README | 1h | 0.5h |
| Deployment | 1h | 0.5h |
| **Total** | **22.5h** | **8.5h** |
| **Grand Total** | **31 hours** (well within 48h limit) |

---

## Risk Mitigation

### Risk 1: API Key Budget ($10)
- **Mitigation**: Use Claude 3.5 Sonnet (efficient, cheaper than Opus)
- **Monitoring**: Log API call counts during testing
- **Fallback**: Provide manual input if key exhausted

### Risk 2: AI Response Quality
- **Mitigation**: Write clear, structured prompts with examples
- **Testing**: Test "I don't know" on all 13 questions
- **Fallback**: User can edit AI answers before proceeding

### Risk 3: Mobile Responsiveness
- **Mitigation**: Test early and often on mobile viewport
- **Tools**: Chrome DevTools + real device testing
- **Focus**: Text input usability on small screens

### Risk 4: Session State Loss
- **Mitigation**: Clear warnings on page refresh
- **Enhancement**: Consider localStorage backup (if time permits)
- **Documentation**: Document limitation in README

---

## Next Steps

1. **Review this roadmap** - Does this match your vision?
2. **Approve to proceed** - Say "approved" or suggest changes
3. **Build execution** - I'll work through phases sequentially
4. **Progress updates** - I'll report after each major phase

**Estimated completion**: Within 48 hours of starting Phase 1

---

## Notes

- This roadmap follows the spec's execution order (Section 9) with added detail
- All non-goals from spec are respected (no user accounts, no saving, etc.)
- Question list maps 1:1 to spec sections for consistency
- Build sequence is optimized to prevent rework
- Time budget includes generous buffer for debugging

Ready to build when you give the green light. 🚀
