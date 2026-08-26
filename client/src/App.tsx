import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages import
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { LearningPath } from './pages/LearningPath';
import { CourseExperience } from './pages/CourseExperience';
import { SkillAnalysis } from './pages/SkillAnalysis';
import { AIMentor } from './pages/AIMentor';
import { Explore } from './pages/Explore';
import { Progress } from './pages/Progress';
import { Assessments } from './pages/Assessments';
import { AssessmentDetail } from './pages/AssessmentDetail';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Onboarding Flow (Requires Auth, but onboarding is incomplete) */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />

            {/* Main Application Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/learning-path" 
              element={
                <ProtectedRoute>
                  <Layout><LearningPath /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses/:id" 
              element={
                <ProtectedRoute>
                  <Layout><CourseExperience /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/skill-analysis" 
              element={
                <ProtectedRoute>
                  <Layout><SkillAnalysis /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-mentor" 
              element={
                <ProtectedRoute>
                  <Layout><AIMentor /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-mentor/:conversationId" 
              element={
                <ProtectedRoute>
                  <Layout><AIMentor /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/explore" 
              element={
                <ProtectedRoute>
                  <Layout><Explore /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/progress" 
              element={
                <ProtectedRoute>
                  <Layout><Progress /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assessments" 
              element={
                <ProtectedRoute>
                  <Layout><Assessments /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assessments/:id" 
              element={
                <ProtectedRoute>
                  <Layout><AssessmentDetail /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Layout><Profile /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Layout><Settings /></Layout>
                </ProtectedRoute>
              } 
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
