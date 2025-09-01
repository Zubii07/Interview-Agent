import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Collapsible evaluations list and optional summary panel
 * @param {Array} history - [{ questionId, question, transcript, evaluation }]
 * @param {Object|null} summary - Optional final summary JSON
 */
export default function EvaluationDropdown({ history = [], summary = null }) {
  const [open, setOpen] = useState(true);

  const items = useMemo(() => Array.isArray(history) ? history : [], [history]);

  if (!items.length && !summary) return null;

  return (
    <div className="bg-white rounded-2xl shadow border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="font-semibold text-gray-900">Feedback</div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Per-question feedback */}
          {items.map((it, idx) => {
            const ev = it?.evaluation || {};
            const score = ev?.score ?? ev?.overall_score ?? ev?.rating;
            const improvements = ev?.improvements || ev?.areas_to_improve || [];
            const criteria = ev?.criteria_met || ev?.criteria || [];
            const pass = ev?.pass ?? ev?.passed ?? undefined;
            return (
              <div key={`${it.questionId}-${idx}`} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-800">Q{idx + 1}. {it.question}</div>
                  {pass === undefined ? null : (
                    pass ? (
                      <span className="inline-flex items-center text-green-700 text-xs"><CheckCircle2 className="w-4 h-4 mr-1" /> Good</span>
                    ) : (
                      <span className="inline-flex items-center text-red-600 text-xs"><AlertCircle className="w-4 h-4 mr-1" /> Improve</span>
                    )
                  )}
                </div>
                {typeof score !== 'undefined' && (
                  <div className="text-xs text-gray-600 mt-1">Score: {score}</div>
                )}
                {it.transcript && (
                  <div className="mt-2 text-xs">
                    <div className="text-gray-500">Transcript</div>
                    <div className="mt-1 p-2 bg-gray-50 rounded border text-gray-700 whitespace-pre-wrap">{it.transcript}</div>
                  </div>
                )}
                {criteria?.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500">Criteria met</div>
                    <ul className="list-disc ml-5 text-sm text-gray-700">
                      {criteria.map((c, i) => (<li key={i}>{c}</li>))}
                    </ul>
                  </div>
                )}
                {improvements?.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500">Improvements</div>
                    <ul className="list-disc ml-5 text-sm text-gray-700">
                      {improvements.map((c, i) => (<li key={i}>{c}</li>))}
                    </ul>
                  </div>
                )}
                {ev?.feedback && (
                  <div className="mt-2 text-sm text-gray-700">
                    <div className="text-xs text-gray-500">Feedback</div>
                    <p className="mt-1">{ev.feedback}</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Final summary */}
          {summary && (
            <div className="border rounded-lg p-3 bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div className="font-medium text-green-900">Round Summary</div>
                {typeof summary.pass !== 'undefined' && (
                  summary.pass ? (
                    <span className="inline-flex items-center text-green-800 text-xs"><CheckCircle2 className="w-4 h-4 mr-1" /> Passed</span>
                  ) : (
                    <span className="inline-flex items-center text-red-700 text-xs"><AlertCircle className="w-4 h-4 mr-1" /> Failed</span>
                  )
                )}
              </div>
              {typeof summary.overall_score !== 'undefined' && (
                <div className="text-xs text-green-800 mt-1">Overall score: {summary.overall_score}</div>
              )}
              {summary?.highlights && (
                <div className="mt-2">
                  <div className="text-xs text-green-900">Highlights</div>
                  <ul className="list-disc ml-5 text-sm text-green-900">
                    {summary.highlights.map((h, i) => (<li key={i}>{h}</li>))}
                  </ul>
                </div>
              )}
              {summary?.improvements && (
                <div className="mt-2">
                  <div className="text-xs text-green-900">Improvements</div>
                  <ul className="list-disc ml-5 text-sm text-green-900">
                    {summary.improvements.map((h, i) => (<li key={i}>{h}</li>))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
