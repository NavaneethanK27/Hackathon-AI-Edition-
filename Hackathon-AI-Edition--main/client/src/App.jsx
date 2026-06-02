import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Schedule from './pages/Schedule';
import AIAssistant from './pages/AIAssistant';
import QuizPage from './pages/QuizPage';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

const App = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  return (
    <>
      {user && <Navbar />}

      <div className={user ? 'md:pl-64' : ''}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/auth"
            element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard />
              ) : (
                <Navigate to="/auth" state={{ from: location }} replace />
              )
            }
          />
          <Route
            path="/onboarding"
            element={
              user ? (
                <Onboarding />
              ) : (
                <Navigate to="/auth" state={{ from: location }} replace />
              )
            }
          />
          <Route
            path="/tasks"
            element={
              user ? (
                <Tasks />
              ) : (
                <Navigate to="/auth" state={{ from: location }} replace />
              )
            }
          />
          <Route
            path="/schedule"
            element={
              user ? (
                <Schedule />
              ) : (
                <Navigate to="/auth" state={{ from: location }} replace />
              )
            }
          />
          <Route
            path="/ai-assistant"
            element={
              user ? (
                <AIAssistant />
              ) : (
                <Navigate to="/auth" state={{ from: location }} replace />
              )
            }
          />
          <Route
            path="/quiz"
            element={
              user ? (
                <QuizPage />
              ) : (
                <Navigate to="/auth" state={{ from: location }} replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              user ? (
                <Profile />
              ) : (
                <Navigate to="/auth" state={{ from: location }} replace />
              )
            }
          />
          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/auth'} replace />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
