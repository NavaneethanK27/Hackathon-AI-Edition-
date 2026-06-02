import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Schedule from './pages/Schedule';
import AIAssistant from './pages/AIAssistant';
import QuizPage from './pages/QuizPage';
import Profile from './pages/Profile';

// Components
import Navbar from './components/Navbar';
import { Cpu } from 'lucide-react';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090b11] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center text-brand-500 animate-spin">
          <Cpu className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 animate-pulse">
          Restoring StudyFlow session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If onboarding is not completed, redirect to /onboarding (unless they are already there)
  if (!user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If onboarding is completed and trying to go to /onboarding, redirect to /dashboard
  if (user.onboardingCompleted && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Workspace Layout Wrapper containing sidebar navigation
const WorkspaceLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090b11] text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      
      {/* Floating background gradient blobs */}
      <div className="floating-blob bg-brand-500 top-[-200px] left-[-200px]" />
      <div className="floating-blob bg-indigo-500 bottom-[-200px] right-[-200px]" style={{ animationDelay: '-12s' }} />

      {/* Main Sidebar Navbar */}
      <Navbar />

      {/* Primary Layout grid offset for sidebar */}
      <main className="md:pl-64 min-h-screen flex flex-col">
        <div className="flex-1 p-0.5 md:p-1.5">
          {children}
        </div>
      </main>

    </div>
  );
};

const App = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected Onboarding Page (No Sidebar Navbar) */}
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 dark:bg-[#090b11] relative overflow-hidden flex items-center justify-center py-10 px-4">
              <div className="floating-blob bg-brand-500 top-[-100px] left-[-100px]" />
              <div className="floating-blob bg-indigo-500 bottom-[-100px] right-[-100px]" style={{ animationDelay: '-12s' }} />
              <div className="z-10 w-full max-w-2xl">
                <Onboarding />
              </div>
            </div>
          </ProtectedRoute>
        } 
      />

      {/* Protected Workspace Pages (With Sidebar Navbar Layout) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <Dashboard />
            </WorkspaceLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <Tasks />
            </WorkspaceLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/schedule" 
        element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <Schedule />
            </WorkspaceLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/ai-assistant" 
        element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <AIAssistant />
            </WorkspaceLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/quizzes" 
        element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <QuizPage />
            </WorkspaceLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <WorkspaceLayout>
              <Profile />
            </WorkspaceLayout>
          </ProtectedRoute>
        } 
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
