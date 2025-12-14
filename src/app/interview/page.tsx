'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { QuestionCard } from '@/components/QuestionCard';
import { AnswerInput } from '@/components/AnswerInput';
import { ProgressBar } from '@/components/ProgressBar';
import { LoadingScreen } from '@/components/LoadingSpinner';
import { SpecDisplay } from '@/components/SpecDisplay';

export default function InterviewPage() {
  const router = useRouter();
  const {
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
  } = useInterviewSession();

  const [aiGeneratedAnswer, setAiGeneratedAnswer] = useState<string | null>(null);
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
  const [generatedSpec, setGeneratedSpec] = useState<string | null>(null);
  const [specError, setSpecError] = useState<string | null>(null);

  const handleSubmit = (answer: string) => {
    saveAnswer(answer, false);
    setAiGeneratedAnswer(null);
  };

  const handleIDontKnow = async () => {
    try {
      const answer = await generateAIAnswer("I don't know");
      setAiGeneratedAnswer(answer);
    } catch {
      // Error is handled in the hook
    }
  };

  const handleAcceptAI = (answer: string) => {
    saveAnswer(answer, true);
    setAiGeneratedAnswer(null);
  };

  const handleGenerateSpec = async () => {
    setIsGeneratingSpec(true);
    setSpecError(null);

    try {
      const response = await fetch('/api/generate-spec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: session.answers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate spec');
      }

      const data = await response.json();
      setGeneratedSpec(data.spec);
    } catch (err) {
      setSpecError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGeneratingSpec(false);
    }
  };

  const handleStartOver = () => {
    reset();
    setGeneratedSpec(null);
    setSpecError(null);
    setAiGeneratedAnswer(null);
  };

  // Show generated spec
  if (generatedSpec) {
    // Extract project name from first answer (question 1 is always the project name)
    const projectNameAnswer = session.answers.find(a => a.question === "What's the name of your project?");
    const projectName = projectNameAnswer?.answer || 'project';

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-semibold text-gray-900">SpecifyThat</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <SpecDisplay spec={generatedSpec} onStartOver={handleStartOver} projectName={projectName} />
        </main>
      </div>
    );
  }

  // Show loading screen while generating spec
  if (isGeneratingSpec) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Image 
              src="/specifythat-logo.png" 
              alt="SpecifyThat" 
              width={120} 
              height={32}
              className="h-8 w-auto"
            />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <LoadingScreen message="Generating your spec... This may take a moment." />
        </main>
      </div>
    );
  }

  // Show completion screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href="/">
              <Image 
                src="/specifythat-logo.png" 
                alt="SpecifyThat" 
                width={120} 
                height={32}
                className="h-8 w-auto"
              />
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">✓</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Interview Complete!
              </h1>
              <p className="text-gray-600 max-w-lg mx-auto">
                You&apos;ve answered all {totalQuestions} questions. Ready to generate your project spec?
              </p>
            </div>

            {specError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-lg mx-auto">
                <p className="text-red-800">{specError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGenerateSpec}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
              >
                Generate My Spec →
              </button>
              <button
                onClick={handleStartOver}
                className="px-8 py-4 text-gray-600 border border-gray-300 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show current question
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image 
                src="/specifythat-logo.png" 
                alt="SpecifyThat" 
                width={120} 
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <button
              onClick={handleStartOver}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Start Over
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <ProgressBar
          progress={progress}
          currentQuestion={session.currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
        />

        {currentQuestion && (
          <>
            <QuestionCard
              question={currentQuestion}
              questionNumber={session.currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <AnswerInput
              onSubmit={handleSubmit}
              onIDontKnow={handleIDontKnow}
              onBack={goBack}
              isLoading={isLoading}
              canGoBack={session.currentQuestionIndex > 0}
              aiGeneratedAnswer={aiGeneratedAnswer}
              onAcceptAI={handleAcceptAI}
            />
          </>
        )}
      </main>
    </div>
  );
}
