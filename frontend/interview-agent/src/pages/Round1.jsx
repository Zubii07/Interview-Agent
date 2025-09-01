import React from "react";
import { useRound1 } from '../hooks/useRound1';
import QuestionAudioPlayer from '../components/shared/QuestionAudioPlayer';
import AnswerRecorder from '../components/shared/AnswerRecorder';
import InterviewProgressBar from '../components/shared/InterviewProgressBar';
import EvaluationDropdown from '../components/shared/EvaluationDropdown';
import { Volume2 } from 'lucide-react';

export default function Round1() {
  const { phase, currentQuestion, progress, history, summary, error, start, submit, retry } = useRound1();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <InterviewProgressBar current={progress.current} total={progress.total} />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
              <Volume2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Instructions</h3>
              <ul className="list-disc ml-5 text-sm text-blue-800 space-y-1">
                <li>Use concrete examples and metrics in your answers.</li>
                <li>Answer the exact question asked before adding context.</li>
                <li>Structure your response: Situation, Task, Action, Result.</li>
                <li>Keep answers focused, maximum ~90 seconds per answer.</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {phase === "idle" && (
          <div className="text-center">
            <button 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              onClick={start}
            >
              Start Interview
            </button>
          </div>
        )}

        {phase === "starting" && (
          <div className="text-center">
            <div className="text-gray-600">Initializing interview...</div>
          </div>
        )}

        {(phase === "asking" || phase === "submitting") && currentQuestion && (
          <QuestionAudioPlayer src={currentQuestion.audioUrl} text={currentQuestion.text} />
        )}

        {(phase === "asking" || phase === "recording") && currentQuestion && (
          <AnswerRecorder
            disabled={phase === "submitting"}
            onSubmit={(blob) => submit(blob)}
          />
        )}

        {phase === "submitting" && (
          <div className="text-center">
            <div className="text-gray-600">Processing your answer...</div>
          </div>
        )}

        {(history.length > 0 || summary) && (
          <EvaluationDropdown history={history} summary={summary?.result || summary} />
        )}

        {phase === "finished" && (
          <div className="p-4 border rounded bg-green-50 border-green-200">
            <div className="font-medium text-green-900">🎉 Round 1 Complete!</div>
            <div className="text-sm text-green-800 mt-1">
              Review your detailed summary and feedback above. Good luck with the next steps!
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={retry} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                Retry Round 1
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
