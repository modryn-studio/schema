'use client';

import { useState, useEffect } from 'react';

interface Stage {
  label: string;
  duration?: number;
}

interface AnalysisProgressProps {
  isActive: boolean;
  title?: string;
  subtitle?: string;
  stages?: Stage[];
}

const defaultStages: Stage[] = [
  { label: 'Reading your description', duration: 1500 },
  { label: 'Understanding project scope', duration: 2000 },
  { label: 'Identifying buildable units', duration: 2500 },
  { label: 'Preparing next steps', duration: 1500 },
];

export function AnalysisProgress({ 
  isActive, 
  title = 'Analyzing',
  subtitle,
  stages = defaultStages 
}: AnalysisProgressProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setCurrentStage(0);
      setStageProgress(0);
      return;
    }

    // Progress within current stage
    const progressInterval = setInterval(() => {
      setStageProgress((prev) => {
        if (prev >= 100) return 100;
        // Slow down as we approach 100%
        const increment = Math.max(1, 8 - Math.floor(prev / 15));
        return Math.min(100, prev + increment);
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [isActive, currentStage]);

  useEffect(() => {
    if (!isActive) return;

    // Move to next stage when progress reaches 100%
    if (stageProgress >= 100 && currentStage < stages.length - 1) {
      const timeout = setTimeout(() => {
        setCurrentStage((prev) => prev + 1);
        setStageProgress(0);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isActive, stageProgress, currentStage]);

  // Calculate overall progress
  const overallProgress = Math.min(
    95, // Never show 100% until actually complete
    ((currentStage * 100 + stageProgress) / (stages.length * 100)) * 100
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Main progress bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-[#0A2540]">{title}</span>
          <span className="text-sm font-medium text-gray-500">
            {Math.round(overallProgress)}%
          </span>
        </div>
        
        {subtitle && (
          <p className="text-sm text-gray-500 -mt-1">{subtitle}</p>
        )}
        
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-[#1E4D8B] via-[#3B82F6] to-[#60A5FA] h-3 rounded-full transition-all duration-300 ease-out relative"
            style={{ width: `${overallProgress}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isComplete = index < currentStage;
          const isCurrent = index === currentStage;
          const isPending = index > currentStage;

          return (
            <div
              key={stage.label}
              className={`flex items-center gap-3 transition-all duration-300 ${
                isPending ? 'opacity-40' : 'opacity-100'
              }`}
            >
              {/* Status icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isComplete
                    ? 'bg-emerald-500'
                    : isCurrent
                    ? 'bg-[#3B82F6] animate-pulse'
                    : 'bg-gray-200'
                }`}
              >
                {isComplete ? (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isCurrent ? (
                  <div className="w-2 h-2 bg-white rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                )}
              </div>

              {/* Stage label */}
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  isComplete
                    ? 'text-emerald-600'
                    : isCurrent
                    ? 'text-[#0A2540]'
                    : 'text-gray-400'
                }`}
              >
                {stage.label}
                {isCurrent && (
                  <span className="inline-flex ml-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
