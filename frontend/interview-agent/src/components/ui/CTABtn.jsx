import React from 'react';

const CTABtn = ({ disabled, onClick, text = "Start AI Interview" }) => (
  <div className="text-center">
    <button 
      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      disabled={disabled}
      onClick={onClick}
    >
      <span>{text}</span>
      <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </button>
    {disabled && <p className="text-gray-500 mt-4">Please upload your resume and add job description to continue</p>}
  </div>
);

export default CTABtn;
