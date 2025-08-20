import React from 'react';
import { ClipboardList } from 'lucide-react';

const JobDescriptionCard = ({ jobDescription, setJobDescription }) => (
  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
    <div className="flex items-center mb-6">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-4">
        <ClipboardList className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900">Job Description</h3>
    </div>
    <div className="space-y-4">
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the job requirements, responsibilities, and qualifications here..."
        className="w-full h-64 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700"
      />
      <p className="text-sm text-gray-500">
        Include key requirements, skills, and responsibilities for the best interview preparation
      </p>
    </div>
  </div>
);

export default JobDescriptionCard;
