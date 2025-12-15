'use client';

import { useState, useRef, useEffect } from 'react';
import { QuestionValidation } from '@/lib/types';
import { validateAnswer, applySanitization, validateMeaningfulInput } from '@/lib/sanitize';
import { Sparkles } from 'lucide-react';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  onIDontKnow: () => void;
  onBack?: () => void;
  isLoading: boolean;
  canGoBack: boolean;
  aiGeneratedAnswer?: string | null;
  onAcceptAI?: (answer: string) => void;
  // File upload props (for Q2)
  allowFileUpload?: boolean;
  fileTypes?: string[];
  helpText?: string;
  attachedFile?: File | null;
  onFileChange?: (file: File | null) => void;
  // Validation props
  validation?: QuestionValidation;
  questionId?: number;
  // Initial value (from ideation mode)
  initialValue?: string | null;
}

export function AnswerInput({ 
  onSubmit, 
  onIDontKnow, 
  onBack,
  isLoading, 
  canGoBack,
  aiGeneratedAnswer,
  onAcceptAI,
  allowFileUpload,
  fileTypes,
  helpText,
  attachedFile,
  onFileChange,
  validation,
  questionId,
  initialValue,
}: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If AI generated an answer, pre-fill it for editing
  useEffect(() => {
    if (aiGeneratedAnswer) {
      setAnswer(aiGeneratedAnswer);
      setValidationError(null);
    }
  }, [aiGeneratedAnswer]);

  // Pre-fill from initialValue (ideation mode)
  useEffect(() => {
    if (initialValue) {
      setAnswer(initialValue);
      setValidationError(null);
    }
  }, [initialValue]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Clear validation error when answer changes (only if it becomes valid)
  useEffect(() => {
    if (validationError && answer.trim()) {
      // Check both gibberish and question-specific validation
      const gibberishError = validateMeaningfulInput(answer);
      const questionError = validateAnswer(answer, validation);
      if (!gibberishError && !questionError) {
        setValidationError(null);
      }
    }
  }, [answer, validation, validationError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate for gibberish first (if there's text input)
    if (answer.trim() && !attachedFile) {
      const gibberishError = validateMeaningfulInput(answer);
      if (gibberishError) {
        setValidationError(gibberishError);
        return;
      }
    }
    
    // Validate against question-specific rules
    const error = validateAnswer(answer, validation);
    if (error) {
      setValidationError(error);
      return;
    }
    
    // Allow submit if we have text OR a file (for Q2)
    if ((answer.trim() || attachedFile) && !isLoading) {
      // Apply sanitization if needed
      const sanitized = applySanitization(answer.trim(), validation, questionId);
      onSubmit(sanitized);
      setAnswer('');
      setValidationError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      
      // Validate for gibberish first (if there's text input)
      if (answer.trim() && !attachedFile) {
        const gibberishError = validateMeaningfulInput(answer);
        if (gibberishError) {
          setValidationError(gibberishError);
          return;
        }
      }
      
      // Validate against question-specific rules
      const error = validateAnswer(answer, validation);
      if (error) {
        setValidationError(error);
        return;
      }
      
      if ((answer.trim() || attachedFile) && !isLoading) {
        const sanitized = applySanitization(answer.trim(), validation, questionId);
        onSubmit(sanitized);
        setAnswer('');
        setValidationError(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Please upload a file under 10MB.');
        e.target.value = '';
        return;
      }
      
      onFileChange?.(file);
    } else {
      onFileChange?.(null);
    }
  };

  const handleRemoveFile = () => {
    onFileChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAcceptAI = () => {
    if (aiGeneratedAnswer && onAcceptAI) {
      const sanitized = applySanitization(answer || aiGeneratedAnswer, validation, questionId);
      onAcceptAI(sanitized);
      setAnswer('');
      setValidationError(null);
    }
  };

  // Calculate character count for validation feedback
  const charCount = answer.trim().length;
  const showCharCount = validation?.maxLength || validation?.minLength;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Help text for Q2 */}
      {helpText && (
        <p className="text-gray-600 text-sm">{helpText}</p>
      )}

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer here..."
          disabled={isLoading}
          rows={5}
          maxLength={validation?.maxLength ? validation.maxLength + 10 : undefined}
          className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] resize-none disabled:bg-gray-50 disabled:text-gray-500 text-[#0A2540] placeholder-gray-400 font-medium transition-all duration-200 ${
            validationError ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-gray-200'
          }`}
        />
        {aiGeneratedAnswer && (
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Suggested
            </span>
          </div>
        )}
      </div>

      {/* Validation feedback row */}
      {(validationError || showCharCount) && (
        <div className="flex items-center justify-between text-sm">
          {validationError ? (
            <p className="text-red-600 font-medium">{validationError}</p>
          ) : (
            <div />
          )}
          {showCharCount && (
            <p className={`font-medium ${
              validation?.maxLength && charCount > validation.maxLength
                ? 'text-red-600'
                : validation?.minLength && charCount < validation.minLength
                ? 'text-amber-600'
                : 'text-gray-500'
            }`}>
              {charCount}{validation?.maxLength ? ` / ${validation.maxLength}` : ''} characters
            </p>
          )}
        </div>
      )}

      {/* File upload section for Q2 */}
      {allowFileUpload && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500 font-medium">or attach a document</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          
          {attachedFile ? (
            <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#0A2540] truncate">{attachedFile.name}</p>
                <p className="text-sm text-gray-500">{(attachedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="flex-shrink-0 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#3B82F6] hover:bg-blue-50/50 transition-all duration-200">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-gray-600 font-medium">
                Click to upload {fileTypes?.join(' or ')} file
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept={fileTypes?.join(',')}
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="px-5 py-3 text-gray-600 hover:text-[#0A2540] hover:bg-gray-100 rounded-xl transition-all duration-200 disabled:opacity-50 font-medium"
          >
            ← Back
          </button>
        )}
        
        <div className="flex-1" />
        
        {aiGeneratedAnswer ? (
          <button
            type="button"
            onClick={handleAcceptAI}
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 font-bold"
          >
            Accept & Continue
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onIDontKnow}
              disabled={isLoading || answer.trim().length > 0 || !!attachedFile}
              className="px-5 py-3 text-purple-600 border-2 border-purple-300 rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingDots />
                  Thinking...
                </span>
              ) : (
                "I don't know"
              )}
            </button>
            
            <button
              type="submit"
              disabled={isLoading || (!answer.trim() && !attachedFile)}
              className="group px-8 py-3 bg-gradient-to-r from-[#1E4D8B] to-[#3B82F6] text-white rounded-xl hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              Next <span className="inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>
            </button>
          </>
        )}
      </div>

      <p className="text-sm text-gray-500 text-center font-medium">
        Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-bold">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-bold">Enter</kbd> to submit
      </p>
    </form>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  );
}
