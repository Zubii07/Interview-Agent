
import React from 'react';
import { Volume2 } from 'lucide-react';

/**
 * Reusable component for displaying interview instructions
 */
const InstructionsDisplay = ({ instructions }) => {
  if (!instructions) return null;

  const getInstructionText = () => {
    if (typeof instructions === 'string') {
      return instructions;
    }
    return instructions.description || instructions.message || 'Please follow the interview instructions.';
  };

  const getDuration = () => {
    if (typeof instructions === 'object' && instructions.estimated_duration) {
      return instructions.estimated_duration;
    }
    return null;
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
          <Volume2 className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">Instructions</h3>
          <p className="text-blue-800 text-sm">
            {getInstructionText()}
          </p>
          {getDuration() && (
            <p className="text-blue-600 text-xs mt-1">
              Estimated duration: {getDuration()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructionsDisplay;
