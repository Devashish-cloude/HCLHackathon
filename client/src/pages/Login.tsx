import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import api from '../services/api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/login', {
        email: data.email,
        password: data.password
      });

      if (res.data.success) {
        login(res.data.accessToken, res.data.refreshToken, res.data.user);
        
        // Redirect to origin page or onboarding/dashboard
        const from = location.state?.from?.pathname || (res.data.user.onboardingCompleted ? '/dashboard' : '/onboarding');
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl fade-in">
        {/* Logo and Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 font-bold text-white text-xl shadow-premium">
            L
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Welcome to LearnPath AI</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue your learning journey</p>
        </div>

        {/* API Error Notification */}
        {apiError && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="you@learnpath.ai"
                {...register('email')}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me and Forgot Password links */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="rounded border-slate-300 text-brand-500 focus:ring-brand-500"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-semibold text-brand-500 hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-premium hover:bg-brand-600 disabled:bg-brand-300 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-brand-500 hover:underline">
            Sign up
          </Link>
        </div>

        {/* Demo credentials notice */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <div className="rounded-lg bg-brand-50/50 p-3 text-[11px] text-brand-700">
            <span className="font-bold">Demo Account:</span> demo@learnpath.ai / Demo@123
          </div>
        </div>
      </div>
    </div>
  );
};
