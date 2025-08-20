
import React from 'react';

const Features = () => (
  <div className="max-w-6xl mx-auto px-6 py-20 text-gray-700">
    <button
      type="button"
      onClick={() => window.history.back()}
      className="mb-6 inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-200 hover:text-gray-900 hover:shadow-md active:scale-95"
      aria-label="Go back"
    >
      ← Back
    </button>
    <h2 className="text-4xl font-bold mb-12 text-center">Key Features</h2>
    <div className="grid md:grid-cols-2 gap-8">
      <ul className="space-y-6">
        <li>🎤 Voice-based AI interviewer experience</li>
        <li>📄 Resume & Job Description parsing and understanding</li>
        <li>🔍 Smart question generation tailored to your profile</li>
        <li>🧠 Two-stage interview (Intro + Technical)</li>
        <li>📊 Instant feedback and scoring</li>
      </ul>
      <ul className="space-y-6">
        <li>📅 Auto-scheduling for Round 2</li>
        <li>💬 Real-time voice transcription & analysis</li>
        <li>🎯 Personality & confidence evaluation</li>
        <li>🛡️ Secure data handling and privacy</li>
        <li>🌐 Easy to use from browser or mobile</li>
      </ul>
    </div>
  </div>
);

export default Features;
