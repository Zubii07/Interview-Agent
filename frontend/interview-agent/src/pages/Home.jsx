import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ResumeUploadCard from '../components/ui/ResumeUploadCard';
import JDCard from '../components/ui/JDCard';
import CTABtn from '../components/ui/CTABtn';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../hooks/useResume';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { round1Service } from '../services/round1Service';

export default function Home() {
  const { data, loading, error, upload, fetch } = useResume();
  const toast = useToast();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [jdUploaded, setJdUploaded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = async () => {
    // Ensure user is authenticated
    if (!localStorage.getItem('ia_access_token')) {
      toast?.warning?.('Please log in to start the interview');
      navigate('/login');
      return;
    }

    // Ensure both are sent to backend before starting interview
    const formData = new FormData();
    if (resumeFile) {
      formData.append('resume', resumeFile);
      // Fallback key some backends use
      formData.append('file', resumeFile);
    }
    const jdTrimmed = jobDescription?.trim();
    if (jdTrimmed) {
      formData.append('job_description', jdTrimmed);
      // Fallback key some backends use
      formData.append('jd', jdTrimmed);
    }
    try {
      await upload(formData);
  // Start the interview round now so Round1 can rehydrate immediately
  try { await round1Service.startRound(); } catch (_) {}
  navigate('/round1');
    } catch (e) {
    }
  };

  // Fetch already uploaded resume/JD on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await fetch();
        // Handle null (not uploaded yet)
        if (result) {
          // Expecting shape: { resumeUrl?, resumeName?, jdText? }
          const jd = result?.jdText || result?.jd || '';
          if (jd) {
            setJobDescription(jd);
            setJdUploaded(true);
          }
          if (result?.resumeName || result?.resumeUrl) {
            setResumeUploaded(true);
          }
          // If both already present, inform the user
          if ((result?.resumeName || result?.resumeUrl) && jd) {
            toast.info('Resume & JD alredy uploaded');
          }
        } else {
          setJdUploaded(false);
          setResumeUploaded(false);
        }
      } catch (_) {
      }
    })();
  }, []);

  // No auto-upload; upload occurs when user clicks Start

  const onJDChange = (val) => {
    setJobDescription(val);
    const trimmed = val?.trim();
    setJdUploaded(!!trimmed);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
  <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Ready for Your AI Interview</h1>
  <p className="text-gray-600 mb-8">Hey{user?.name ? `, ${user.name}` : ''}, welcome back.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ResumeUploadCard
              onParsedText={(text) => setResumeUploaded(!!text)}
              onFileSelected={setResumeFile}
              loading={loading}
              error={error}
            />
          </div>
          <div>
            <JDCard jobDescription={jobDescription} setJobDescription={onJDChange} />
          </div>
        </div>

        <div className="mt-10">
          <CTABtn
            disabled={!(resumeUploaded && jdUploaded)}
            onClick={handleStart}
            text="Start AI Interview"
          />
          {error && (
            <p className="text-red-500 text-sm mt-3">{typeof error === 'string' ? error : 'Failed to sync resume/JD.'}</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
