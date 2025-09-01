
import React from "react";

export default function InterviewProgressBar({ current = 0, total = 5 }) {
  const pct = total ? Math.round((current / total) * 100) : 0;
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Round 1 - Voice Interview
      </h1>
      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
        <span>Question {current} of {total}</span>
        <div className="w-32 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          ></div>
        </div>
        <span>({pct}%)</span>
      </div>
    </div>
  );
}
