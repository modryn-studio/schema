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

export interface QuestionValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  sanitize?: boolean;
}

export interface Question {
  id: number;
  text: string;
  contextForAI: string;
  section: string;
  sectionNumber: number;
  allowFileUpload?: boolean;
  fileTypes?: string[];
  helpText?: string;
  validation?: QuestionValidation;
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

// Q2 Analysis Types
export interface BuildableUnit {
  id: number;
  name: string;
  description: string;
}

export interface AnalysisResultSingle {
  type: 'single';
  summary: string;
}

export interface AnalysisResultMultiple {
  type: 'multiple';
  units: BuildableUnit[];
}

export type AnalysisResult = AnalysisResultSingle | AnalysisResultMultiple;

export interface AnalyzeProjectRequest {
  projectDescription: string;
  attachedDocContent?: string;
}

export interface AnalyzeProjectResponse {
  result: AnalysisResult;
  error?: string;
}

// Extended session state for Q2 analysis
export interface InterviewSessionExtended extends InterviewSession {
  projectSummary: string;
  wasMultiUnit: boolean;
  selectedUnitId: number | null;
  allUnits?: BuildableUnit[];
}

// Ideation Mode Types (for Q2 "I don't know")
export interface IdeationAnswers {
  problemFrustration?: string;
  targetUser?: string;
  category?: string;
}

export interface GenerateProjectDescriptionRequest {
  ideationAnswers: IdeationAnswers;
}

export interface GenerateProjectDescriptionResponse {
  projectDescription: string;
  error?: string;
}
