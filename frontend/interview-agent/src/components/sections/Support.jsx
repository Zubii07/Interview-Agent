
import React from 'react';

const Support = () => (
  <div className="max-w-3xl mx-auto px-6 py-20 text-gray-700">
    <button
      type="button"
      onClick={() => window.history.back()}
      className="mb-6 inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-200 hover:text-gray-900 hover:shadow-md active:scale-95"
      aria-label="Go back"
    >
      ← Back
    </button>
    <h2 className="text-4xl font-bold mb-6 text-center">Support</h2>
    <p className="mb-6 text-center">
      We're here to help! Whether you need technical assistance or have questions about using the AI Interview Assistant,
      reach out to our support team.
    </p>
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
      <h3 className="text-xl font-semibold mb-4">Contact Support</h3>
      <p>Email: <span className="text-purple-600 font-medium">zohaibrasheed983@gmail.com</span></p>
      <p className="mt-2">Response time: within 24 hours (Mon–Fri)</p>
    </div>
  </div>
);

export default Support;
