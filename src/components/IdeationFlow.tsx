'use client';

import { useState } from 'react';
import { IdeationAnswers } from '@/lib/types';
import { 
  Zap, 
  ShoppingCart, 
  GraduationCap, 
  Users, 
  Dumbbell, 
  Gamepad2, 
  DollarSign, 
  Wrench, 
  Sparkles,
  type LucideIcon 
} from 'lucide-react';

interface IdeationFlowProps {
  onComplete: (projectDescription: string) => void;
  onCancel: () => void;
}

// Predefined categories for Step 3
const CATEGORIES: { id: string; label: string; icon: LucideIcon; color: string }[] = [
  { id: 'productivity', label: 'Productivity', icon: Zap, color: 'text-orange-500' },
  { id: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart, color: 'text-violet-500' },
  { id: 'education', label: 'Education', icon: GraduationCap, color: 'text-blue-500' },
  { id: 'social', label: 'Social / Community', icon: Users, color: 'text-pink-500' },
  { id: 'health', label: 'Health & Fitness', icon: Dumbbell, color: 'text-emerald-500' },
  { id: 'entertainment', label: 'Entertainment', icon: Gamepad2, color: 'text-indigo-500' },
  { id: 'finance', label: 'Finance', icon: DollarSign, color: 'text-green-600' },
  { id: 'developer', label: 'Developer Tools', icon: Wrench, color: 'text-slate-600' },
  { id: 'other', label: 'Other', icon: Sparkles, color: 'text-purple-500' },
];

const IDEATION_STEPS = [
  {
    id: 1,
    question: "What problem frustrates you that you wish had a better solution?",
    placeholder: "e.g., 'Small business owners spend hours manually tracking inventory'",
    field: 'problemFrustration' as const,
    helpText: "Think about daily frustrations you or others face",
    type: 'text' as const,
  },
  {
    id: 2,
    question: "Who will use this?",
    placeholder: "e.g., 'Small retail businesses with 10-100 products'",
    field: 'targetUser' as const,
    helpText: "Be specific: parents, students, developers, small business owners, etc.",
    type: 'text' as const,
  },
  {
    id: 3,
    question: "What category does this fit into?",
    placeholder: "e.g., 'productivity tool', 'e-commerce', 'education'",
    field: 'category' as const,
    helpText: "Select a category or type your own",
    type: 'category' as const,
  },
];

export function IdeationFlow({ onComplete, onCancel }: IdeationFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<IdeationAnswers>({});
  const [currentInput, setCurrentInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generated description preview state
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
  const [editedDescription, setEditedDescription] = useState('');

  const step = IDEATION_STEPS[currentStep];
  const isLastStep = currentStep === IDEATION_STEPS.length - 1;
  const progress = ((currentStep + 1) / IDEATION_STEPS.length) * 100;
  const isCategoryStep = step?.type === 'category';

  const handleCategorySelect = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (categoryId === 'other') {
      setSelectedCategory('other');
      setCurrentInput('');
    } else {
      setSelectedCategory(categoryId);
      setCurrentInput(category?.label || '');
    }
  };

  const handleNext = () => {
    // For category step, use selected category or custom input
    const value = isCategoryStep 
      ? (selectedCategory === 'other' ? currentInput.trim() : currentInput.trim())
      : currentInput.trim();
    
    if (!value && !isCategoryStep) return;
    if (isCategoryStep && !selectedCategory && !currentInput.trim()) return;

    const newAnswers = {
      ...answers,
      [step.field]: value || undefined,
    };
    setAnswers(newAnswers);
    setCurrentInput('');
    setSelectedCategory(null);

    if (isLastStep) {
      generateDescription(newAnswers);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    // If viewing generated description, go back to last step
    if (generatedDescription) {
      setGeneratedDescription(null);
      setEditedDescription('');
      return;
    }
    
    if (currentStep > 0) {
      const previousStep = IDEATION_STEPS[currentStep - 1];
      setCurrentInput(answers[previousStep.field] || '');
      setSelectedCategory(null);
      setCurrentStep(prev => prev - 1);
    } else {
      onCancel();
    }
  };

  const handleSkip = () => {
    setSelectedCategory(null);
    setCurrentInput('');
    
    if (isLastStep) {
      generateDescription(answers);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const generateDescription = async (finalAnswers: IdeationAnswers) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-project-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ideationAnswers: finalAnswers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate description');
      }

      const data = await response.json();
      // Show preview instead of auto-completing
      setGeneratedDescription(data.projectDescription);
      setEditedDescription(data.projectDescription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle accepting the generated description
  const handleAcceptDescription = () => {
    onComplete(editedDescription.trim() || generatedDescription || '');
  };

  // Has at least one answer (can generate even if skipping some)
  const hasAnyAnswer = Object.values(answers).some(v => v) || currentInput.trim() || selectedCategory;

  if (isGenerating) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="mt-6 text-lg font-medium text-[#0A2540]">
              Creating your project description...
            </p>
            <p className="mt-2 text-gray-500 text-center max-w-md">
              Based on your answers, we&apos;re crafting a clear description for your project.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show generated description for review
  if (generatedDescription) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0A2540]">Here&apos;s your project description</h2>
                <p className="text-sm text-gray-500">Review and edit if needed, then continue</p>
              </div>
            </div>
          </div>

          {/* Editable description */}
          <div className="p-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Project Description
            </label>
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full min-h-[160px] p-4 text-base text-[#0A2540] bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 resize-none"
            />
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI-generated based on your answers. Feel free to tweak it.
            </p>
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#0A2540] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to questions
            </button>

            <button
              onClick={handleAcceptDescription}
              disabled={!editedDescription.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200"
            >
              Use This Description
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0A2540]">Let&apos;s discover your project</h2>
              <p className="text-sm text-gray-500">Answer a few quick questions to shape your idea</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Step {currentStep + 1} of {IDEATION_STEPS.length}</p>
        </div>

        {/* Question */}
        <div className="p-8">
          <h3 className="text-xl font-medium text-[#0A2540] mb-2">{step.question}</h3>
          <p className="text-sm text-gray-500 mb-6">{step.helpText}</p>

          {isCategoryStep ? (
            // Category selection UI
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map((category) => {
                  const IconComponent = category.icon;
                  return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 mb-1 ${category.color}`} />
                    <span className={`text-sm font-medium ${
                      selectedCategory === category.id ? 'text-blue-700' : 'text-[#0A2540]'
                    }`}>
                      {category.label}
                    </span>
                  </button>
                  );
                })}
              </div>
              
              {selectedCategory === 'other' && (
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Describe your category..."
                  className="w-full p-4 text-base text-[#0A2540] bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                  autoFocus
                />
              )}
            </div>
          ) : (
            // Text input for other steps
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={step.placeholder}
              className="w-full min-h-[120px] p-4 text-base text-[#0A2540] bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 resize-none"
              autoFocus
            />
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#0A2540] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>

          <div className="flex items-center gap-3">
            {hasAnyAnswer && (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                {isLastStep ? 'Generate now' : 'Skip'}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isCategoryStep 
                ? (!selectedCategory || (selectedCategory === 'other' && !currentInput.trim()))
                : !currentInput.trim()
              }
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
            >
              {isLastStep ? 'Generate Description' : 'Next'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
