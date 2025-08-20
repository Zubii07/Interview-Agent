
import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, X } from 'lucide-react';

const ResumeUploadCard = ({ onParsedText, onFileSelected, loading: externalLoading = false, error: externalError = '' }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync external loading/error (from parent) with local state for display
  useEffect(() => {
    if (externalError) setError(typeof externalError === 'string' ? externalError : 'Something went wrong');
  }, [externalError]);
  useEffect(() => {
    if (externalLoading !== undefined) setLoading(externalLoading);
  }, [externalLoading]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setResumeFile(file);
    setError('');
    if (file) {
  await parseResume(file);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    setResumeFile(file);
    setError('');
    if (file) {
  await parseResume(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    setResumeFile(null);
    setError('');
  if (onParsedText) onParsedText('');
  if (onFileSelected) onFileSelected(null);
  };

  const parseResume = async (file) => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
  // For now, just notify parent about selected file; server-side parsing happens in parent service
  const text = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  if (onParsedText) onParsedText(text);
  if (onFileSelected) onFileSelected(file);
    } catch (err) {
      setError('Failed to parse resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mr-4">
          <FileText className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Upload Resume</h3>
      </div>

      {!resumeFile ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            isDragging
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">Drag and drop your resume here</p>
          <p className="text-gray-500 mb-6">PDF or DOC format accepted</p>
          <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 cursor-pointer">
            <span>Choose File</span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
          </label>
        </div>
      ) : (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{resumeFile.name}</p>
                <p className="text-sm text-gray-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                {loading && <p className="text-sm text-blue-600">Processing...</p>}
              </div>
            </div>
            <button onClick={removeFile} className="text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default ResumeUploadCard;
