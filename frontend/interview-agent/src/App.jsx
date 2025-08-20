import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Marketing from './pages/Marketing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AuthRoute from './routes/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import HowItWorks from './components/sections/HowItWorks';
import Features from './components/sections/Features';
import Support from './components/sections/Support';



export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Marketing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/features" element={<Features />} />
          <Route path="/support" element={<Support />} />

          <Route element={<AuthRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<Marketing />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
