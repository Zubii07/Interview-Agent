
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Sparkles, Users, Shield, ArrowRight } from 'lucide-react';

const AIInterviewStartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // If user is logged in, go to home
      navigate('/home');
    } else {
      // If not logged in, redirect to signup
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Master Your{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Interview
            </span>{' '}
            Skills
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Practice with our AI-powered interview system. Get personalized feedback, 
            improve your answers, and land your dream job with confidence.
          </p>
          
          {/* Quick Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
              <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Questions</h3>
              <p className="text-sm text-gray-600">Personalized questions based on your resume and job requirements</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Feedback</h3>
              <p className="text-sm text-gray-600">Instant evaluation and improvement suggestions for your answers</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600">Your data is encrypted and never shared with third parties</p>
            </div>
          </div>
          
          {/* Call to Action */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-8 mb-8 max-w-lg mx-auto">
            {!isAuthenticated ? (
              <>
                <p className="text-purple-800 font-medium mb-4">Ready to get started?</p>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center mb-3"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <p className="text-xs text-purple-600">
                  Already have an account? <button onClick={() => navigate('/login')} className="underline">Sign in</button>
                </p>
              </>
            ) : (
              <>
                <p className="text-purple-800 font-medium mb-4">Welcome back! Ready for your next interview?</p>
                <button
                  onClick={handleGetStarted}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center"
                >
                  Start Interview
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </>
            )}
          </div>
          {/* Explore Section Links */}
          <div className="mt-12 flex items-center justify-center space-x-4 text-sm">
            <button onClick={() => navigate('/Features')} className="text-purple-700 hover:underline">Features</button>
            <span className="text-gray-300">•</span>
            <button onClick={() => navigate('/HowItWorks')} className="text-purple-700 hover:underline">How it Works</button>
            <span className="text-gray-300">•</span>
            <button onClick={() => navigate('/Support')} className="text-purple-700 hover:underline">Support</button>
          </div>
        </div>
      </main>
    <Footer />
    </div>
  );
};

export default AIInterviewStartPage;
