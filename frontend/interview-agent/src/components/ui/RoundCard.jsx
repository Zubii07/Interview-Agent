import React from 'react';

export default function RoundCard({ title, description, actionText, onAction }) {
  return (
    <div className="rounded-2xl shadow-lg p-6 bg-white border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-gray-600 mt-2">{description}</p>}
      {actionText && (
        <button
          onClick={onAction}
          className="mt-4 bg-indigo-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
