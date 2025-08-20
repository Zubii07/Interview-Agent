
import React from 'react';

const HowItWorks = () => (
  <div className="max-w-4xl mx-auto px-6 py-20 text-gray-700">
    <button
      type="button"
      onClick={() => window.history.back()}
      className="mb-6 inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-200 hover:text-gray-900 hover:shadow-md active:scale-95"
      aria-label="Go back"
    >
      ← Back
    </button>
    <h2 className="text-4xl font-bold mb-8 text-center">How It Works</h2>
    <ol className="space-y-6 list-decimal list-inside">
      <li>
        <strong>Upload Resume and Job Description:</strong> The candidate uploads their resume (PDF/DOC) and a job description.
      </li>
      <li>
        <strong>AI-Powered Voice Interview:</strong> The system starts a voice-based interview where AI asks questions, and the candidate responds using voice.
      </li>
      <li>
        <strong>Round 1 – Introductory Assessment:</strong> AI assesses the candidate’s experience, background, and overall suitability.
      </li>
      <li>
        <strong>Round 2 – Technical Assessment:</strong> If Round 1 is passed, the system schedules and conducts a technical round focused on skills and role-fit.
      </li>
      <li>
        <strong>Final Review:</strong> AI evaluates answers, tone, and confidence, generating a report on candidate performance.
      </li>
    </ol>
  </div>
);

export default HowItWorks;
