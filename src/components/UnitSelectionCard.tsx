'use client';

import { BuildableUnit } from '@/lib/types';

interface UnitSelectionCardProps {
  unit: BuildableUnit;
  onSelect: () => void;
}

export function UnitSelectionCard({ unit, onSelect }: UnitSelectionCardProps) {
  return (
    <button
      onClick={onSelect}
      className="w-full p-6 bg-white border-2 border-gray-200 rounded-2xl text-left hover:border-[#3B82F6] hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 group"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#1E4D8B] to-[#3B82F6] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
          {unit.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg text-[#0A2540] group-hover:text-[#1E4D8B] transition-colors">
            {unit.name}
          </div>
          <div className="text-gray-600 mt-1 leading-relaxed">
            {unit.description}
          </div>
        </div>
        <div className="flex-shrink-0 text-gray-400 group-hover:text-[#3B82F6] group-hover:translate-x-1 transition-all duration-200">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}
