import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireOnboarding = true 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"></div>
          <p className="text-sm font-medium text-slate-500">Loading LearnPath AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireOnboarding && !user?.onboardingCompleted && location.pathname !== '/onboarding') {
    // Force onboarding if incomplete
    return <Navigate to="/onboarding" replace />;
  }

  if (user?.onboardingCompleted && location.pathname === '/onboarding') {
    // Prevent re-onboarding if already complete
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
