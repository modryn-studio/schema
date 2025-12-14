// TypeScript interfaces for SpecifyThat

export interface Answer {
  question: string;
  answer: string;
  isAIGenerated: boolean;
}

export interface InterviewSession {
  id: string;
  currentQuestionIndex: number;
  answers: Answer[];
  status: 'in_progress' | 'completed';
  createdAt: Date;
}

export interface Question {
  id: number;
  text: string;
  contextForAI: string;
  section: string;
  sectionNumber: number;
}

export interface GenerateAnswerRequest {
  question: string;
  conversationContext: Answer[];
  userInput: string;
}

export interface GenerateAnswerResponse {
  answer: string;
}

export interface GenerateSpecRequest {
  answers: Answer[];
}

export interface GenerateSpecResponse {
  spec: string;
}
