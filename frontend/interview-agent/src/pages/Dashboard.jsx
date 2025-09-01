import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import RoundCard from '../components/ui/RoundCard';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Hey{user?.name ? `, ${user.name}` : ''}, welcome back!</h1>
        </div>
        <p className="text-gray-600 mt-2">Email: {user?.email}</p>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <RoundCard 
            title="Round 1 (Basic / Initial)"
            description="Start with introductory questions about your background and experience."
            actionText="Start Round 1"
            onAction={() => navigate('/round1')}
          />
          <RoundCard 
            title="Round 2 (Technical)"
            description="Deep-dive technical questions tailored to your resume and JD."
            actionText="Start Round 2"
            onAction={() => {}}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
