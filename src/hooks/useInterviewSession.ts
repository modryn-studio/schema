'use client';

import { useState, useCallback } from 'react';
import { InterviewSession, Answer, AnalysisResult, BuildableUnit } from '@/lib/types';
import { questions, totalQuestions } from '@/lib/questions';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Interview modes
export type InterviewMode = 'interview' | 'ideation';

interface ExtendedSession extends InterviewSession {
  projectSummary: string;
  wasMultiUnit: boolean;
  selectedUnitId: number | null;
  allUnits?: BuildableUnit[];
  deferredQ1: boolean; // True if user clicked "I don't know" on Q1
}

export function useInterviewSession() {
  const [session, setSession] = useState<ExtendedSession>({
    id: generateUUID(),
    currentQuestionIndex: 0,
    answers: [],
    status: 'in_progress',
    createdAt: new Date(),
    projectSummary: '',
    wasMultiUnit: false,
    selectedUnitId: null,
    allUnits: undefined,
    deferredQ1: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Q2 analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showUnitSelection, setShowUnitSelection] = useState(false);
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  
  // Ideation mode state
  const [mode, setMode] = useState<InterviewMode>('interview');

  const currentQuestion = questions[session.currentQuestionIndex];
  const isComplete = session.currentQuestionIndex >= totalQuestions;
  const progress = Math.round((session.currentQuestionIndex / totalQuestions) * 100);

  const saveAnswer = useCallback((answer: string, isAIGenerated: boolean = false) => {
    if (!currentQuestion) return;

    const newAnswer: Answer = {
      question: currentQuestion.text,
      answer: answer,
      isAIGenerated,
    };

    setSession(prev => ({
      ...prev,
      answers: [...prev.answers, newAnswer],
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      status: prev.currentQuestionIndex + 1 >= totalQuestions ? 'completed' : 'in_progress',
    }));
    
    setError(null);
  }, [currentQuestion]);

  const generateAIAnswer = useCallback(async (userInput: string = "I don't know"): Promise<string> => {
    if (!currentQuestion) return '';
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion.text,
          conversationContext: session.answers,
          userInput,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate answer');
      }
      
      const data = await response.json();
      return data.answer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestion, session.answers]);

  const reset = useCallback(() => {
    setSession({
      id: generateUUID(),
      currentQuestionIndex: 0,
      answers: [],
      status: 'in_progress',
      createdAt: new Date(),
      projectSummary: '',
      wasMultiUnit: false,
      selectedUnitId: null,
      allUnits: undefined,
      deferredQ1: false,
    });
    setError(null);
    setIsLoading(false);
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setShowUnitSelection(false);
    setIsGeneratingName(false);
    setMode('interview');
  }, []);

  // Enter ideation mode (for Q2 "I don't know")
  const enterIdeationMode = useCallback(() => {
    setMode('ideation');
  }, []);

  // Exit ideation mode and use generated description
  const exitIdeationMode = useCallback((projectDescription: string) => {
    setMode('interview');
    // The description will be passed to analyzeProject by the UI
    return projectDescription;
  }, []);

  // Cancel ideation mode and return to Q2 input
  const cancelIdeationMode = useCallback(() => {
    setMode('interview');
  }, []);

  // Defer Q1 (project name) until after Q2 when we have context
  const deferQ1 = useCallback(() => {
    if (!currentQuestion || currentQuestion.id !== 1) return;

    // Save a placeholder answer for Q1
    const placeholderAnswer: Answer = {
      question: currentQuestion.text,
      answer: '', // Will be filled after Q2
      isAIGenerated: true,
    };

    setSession(prev => ({
      ...prev,
      answers: [...prev.answers, placeholderAnswer],
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      deferredQ1: true,
    }));
  }, [currentQuestion]);

  // Generate project name based on description (called after Q2)
  const generateProjectName = useCallback(async (projectDescription: string): Promise<string> => {
    setIsGeneratingName(true);
    
    try {
      const response = await fetch('/api/generate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: "What's the name of your project?",
          conversationContext: [
            {
              question: "Describe your project. What does it do and who is it for?",
              answer: projectDescription,
              isAIGenerated: false,
            }
          ],
          userInput: "I don't know - please suggest a name based on the project description",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate project name');
      }

      const data = await response.json();
      return data.answer;
    } catch (err) {
      console.error('Failed to generate project name:', err);
      return 'Untitled Project'; // Fallback
    } finally {
      setIsGeneratingName(false);
    }
  }, []);

  // Update Q1 answer (used after generating name)
  const updateQ1Answer = useCallback((projectName: string) => {
    setSession(prev => {
      const updatedAnswers = [...prev.answers];
      // Q1 is always the first answer
      if (updatedAnswers.length > 0) {
        updatedAnswers[0] = {
          ...updatedAnswers[0],
          answer: projectName,
        };
      }
      return {
        ...prev,
        answers: updatedAnswers,
        deferredQ1: false,
      };
    });
  }, []);

  const goBack = useCallback(() => {
    if (session.currentQuestionIndex > 0) {
      // If going back from Q3 and we had multi-unit selection, show it again
      if (session.currentQuestionIndex === 2 && session.wasMultiUnit) {
        setShowUnitSelection(true);
        return;
      }
      
      // If going back from unit selection, clear analysis and go back to Q2 input
      if (showUnitSelection) {
        setShowUnitSelection(false);
        setAnalysisResult(null);
        // Clear multi-unit state
        setSession(prev => ({
          ...prev,
          wasMultiUnit: false,
          allUnits: undefined,
        }));
        return;
      }
      
      setSession(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
        answers: prev.answers.slice(0, -1),
        status: 'in_progress',
        // Clear project summary if going back past Q2
        ...(prev.currentQuestionIndex === 2 ? {
          projectSummary: '',
          wasMultiUnit: false,
          selectedUnitId: null,
          allUnits: undefined,
        } : {}),
      }));
    }
  }, [session.currentQuestionIndex, session.wasMultiUnit, showUnitSelection]);

  // Analyze project description (Q2)
  const analyzeProject = useCallback(async (
    projectDescription: string,
    attachedDocContent?: string
  ): Promise<AnalysisResult> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectDescription,
          attachedDocContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze project');
      }

      const data = await response.json();
      const result: AnalysisResult = data.result;
      
      setAnalysisResult(result);

      // Get the summary for name generation
      const summaryForName = result.type === 'single' 
        ? result.summary 
        : projectDescription; // Use raw description for multi-unit

      if (result.type === 'single') {
        // Single unit: save the condensed summary and proceed
        const newAnswer: Answer = {
          question: currentQuestion?.text || '',
          answer: result.summary,
          isAIGenerated: true,
        };

        setSession(prev => ({
          ...prev,
          answers: [...prev.answers, newAnswer],
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          projectSummary: result.summary,
          wasMultiUnit: false,
          selectedUnitId: null,
        }));

        // If Q1 was deferred, generate name now
        if (session.deferredQ1) {
          generateProjectName(summaryForName).then(name => {
            updateQ1Answer(name);
          });
        }
      } else {
        // Multiple units: show unit selection UI
        setShowUnitSelection(true);
        setSession(prev => ({
          ...prev,
          allUnits: result.units,
          wasMultiUnit: true,
        }));
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentQuestion, session.deferredQ1, generateProjectName, updateQ1Answer]);

  // Select a unit from multi-unit analysis
  const selectUnit = useCallback((unit: BuildableUnit) => {
    if (!currentQuestion) return;

    const newAnswer: Answer = {
      question: currentQuestion.text,
      answer: unit.description,
      isAIGenerated: true,
    };

    setSession(prev => ({
      ...prev,
      answers: [...prev.answers, newAnswer],
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      projectSummary: unit.description,
      selectedUnitId: unit.id,
    }));

    setShowUnitSelection(false);

    // If Q1 was deferred, generate name based on selected unit
    if (session.deferredQ1) {
      generateProjectName(unit.description).then(name => {
        updateQ1Answer(name);
      });
    }
  }, [currentQuestion, session.deferredQ1, generateProjectName, updateQ1Answer]);

  return {
    session,
    currentQuestion,
    isComplete,
    progress,
    isLoading,
    error,
    saveAnswer,
    generateAIAnswer,
    reset,
    goBack,
    totalQuestions,
    // Q2 analysis exports
    isAnalyzing,
    analysisResult,
    showUnitSelection,
    analyzeProject,
    selectUnit,
    // Deferred Q1 exports
    deferQ1,
    isGeneratingName,
    // Ideation mode exports
    mode,
    enterIdeationMode,
    exitIdeationMode,
    cancelIdeationMode,
  };
}
