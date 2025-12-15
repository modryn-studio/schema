import { Question } from './types';

export const questions: Question[] = [
  // Section 1: Project Title
  {
    id: 1,
    text: "What's the name of your project?",
    contextForAI: "Suggest a clear, memorable project name based on what the user wants to build. Keep it short (1-3 words), easy to spell, and memorable. Consider the project's core function when naming.",
    section: "Project Title",
    sectionNumber: 1,
    validation: {
      minLength: 2,
      maxLength: 50,
      sanitize: true,
    },
  },
  
  // Section 2: One-Paragraph Summary
  {
    id: 2,
    text: "Describe your project. What does it do and who is it for?",
    contextForAI: "Generate a concise summary that captures the project's core value proposition. Focus on: what problem it solves, who the target user is, and what makes it valuable. Keep it under 50 words.",
    section: "One-Paragraph Summary",
    sectionNumber: 2,
    allowFileUpload: true,
    fileTypes: ['.txt', '.md'],
    helpText: "You can write as much or as little as you want. You can also attach a doc if you have one.",
  },
  
  // Section 3: Primary Goal
  {
    id: 3,
    text: "What's the single most important outcome this project must achieve?",
    contextForAI: "Identify the primary goal based on the project description. This should be ONE clear, measurable outcome. Format: 'Enable [user] to [action] without [pain point]' or similar. Avoid listing multiple goals.",
    section: "Primary Goal",
    sectionNumber: 3,
  },
  
  // Section 4: Constraints (Part 1)
  {
    id: 4,
    text: "What are your hard constraints? (timeline, budget, team size, tech requirements)",
    contextForAI: "Suggest realistic constraints for a solo/small team project. Include: timeline (1-4 weeks typical), budget (minimal/bootstrapped), team size (1-2 people), and any obvious tech constraints based on the project type. Be specific and actionable.",
    section: "Constraints",
    sectionNumber: 4,
  },
  
  // Section 4: Constraints (Part 2)
  {
    id: 5,
    text: "Any deployment, hosting, or infrastructure requirements?",
    contextForAI: "Recommend simple, cost-effective deployment options. For web apps: Vercel/Netlify (frontend), Railway/Render (backend). For mobile: Expo for React Native. Always suggest free tier options first. Include scale assumptions (e.g., 1-100 users initially).",
    section: "Constraints",
    sectionNumber: 4,
  },
  
  // Section 5: In-Scope Requirements
  {
    id: 6,
    text: "List the core features that MUST be in version 1. What's absolutely essential?",
    contextForAI: "Based on the project description, list 5-8 essential features in concrete, testable language. Each feature should be: specific (not vague), testable (can verify it works), and necessary (MVP can't ship without it). Format as bullet points starting with 'The system must...'",
    section: "In-Scope Requirements",
    sectionNumber: 5,
  },
  
  // Section 6: Non-Goals
  {
    id: 7,
    text: "What features should we explicitly NOT build right now, even if they seem obvious?",
    contextForAI: "List 5-8 common feature-creep items for this type of project. Include: admin panels, analytics dashboards, user accounts (if not core), social features, multiple export formats, internationalization, native mobile apps, and advanced customization. Protect scope aggressively.",
    section: "Explicit Non-Goals",
    sectionNumber: 6,
  },
  
  // Section 7: Data Model (Part 1)
  {
    id: 8,
    text: "What are the main 'things' (entities) your system needs to track? (e.g., users, posts, products)",
    contextForAI: "Identify 2-4 core entities based on the project requirements. For each entity, define: name, key fields (id, created_at, plus 3-5 domain-specific fields), and any constraints. Keep it simple - only what's needed for v1.",
    section: "Data Model",
    sectionNumber: 7,
  },
  
  // Section 7: Data Model (Part 2)
  {
    id: 9,
    text: "What relationships exist between these entities? (e.g., 'a user has many posts')",
    contextForAI: "Map logical relationships between the entities mentioned. Use simple language: 'one-to-many' (a user has many posts), 'many-to-many' (posts have many tags, tags have many posts), or 'one-to-one'. Only include relationships that are essential for v1 functionality.",
    section: "Data Model",
    sectionNumber: 7,
  },
  
  // Section 8: Interfaces (Part 1)
  {
    id: 10,
    text: "Walk me through the main user flow. What actions does the user take from start to finish?",
    contextForAI: "Define the primary user journey from entry to completion. Format as numbered steps: 1. User lands on... 2. User clicks... etc. Focus on the happy path (everything goes right). Include 5-10 steps covering the core experience.",
    section: "Interfaces",
    sectionNumber: 8,
  },
  
  // Section 8: Interfaces (Part 2)
  {
    id: 11,
    text: "What backend APIs or external services will this project need?",
    contextForAI: "Identify necessary API endpoints based on the features and data model. List endpoints in REST format: 'POST /api/resource - Purpose'. Also identify any external services needed (payment processing, email, auth providers, AI APIs, etc.).",
    section: "Interfaces",
    sectionNumber: 8,
  },
  
  // Section 9: Execution Order
  {
    id: 12,
    text: "Do you have a preferred build sequence, or should I suggest one?",
    contextForAI: "Generate a logical build sequence for this project. Standard order: 1. Project setup (30min), 2. Data layer/types (1-2h), 3. API routes (2-4h), 4. Core UI components (3-4h), 5. Main pages/flows (3-4h), 6. Polish & error handling (2h), 7. Testing (2h), 8. Deploy (1h). Adjust times based on project complexity.",
    section: "Execution Order",
    sectionNumber: 9,
  },
  
  // Section 10-13: Success & Meta
  {
    id: 13,
    text: "How will you know this project is done? What are the success criteria?",
    contextForAI: "Create a checklist of 8-12 testable success criteria based on the requirements. Format as checkboxes: '[ ] Users can [action]'. Include: core feature completion, error handling, mobile responsiveness, deployment, and documentation. Each item should be binary (done or not done).",
    section: "Success Criteria",
    sectionNumber: 10,
  },
];

export const totalQuestions = questions.length;
