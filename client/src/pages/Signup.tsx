import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, Loader2 } from 'lucide-react';
import api from '../services/api';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms & conditions' })
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const Signup: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVal, setPasswordVal] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema)
  });

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: 'None', color: 'bg-slate-100', width: 'w-0' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 1: return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
      case 2: return { label: 'Fair', color: 'bg-orange-400', width: 'w-2/4' };
      case 3: return { label: 'Good', color: 'bg-blue-400', width: 'w-3/4' };
      case 4: return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
      default: return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
    }
  };

  const strength = getPasswordStrength(passwordVal);

  const onSubmit = async (data: SignupFormValues) => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      // 1. Post to signup
      const signupRes = await api.post('/auth/signup', {
        email: data.email,
        password: data.password
      });

      if (signupRes.data.success) {
        // 2. Perform mock login or login with returned tokens
        login(signupRes.data.accessToken, signupRes.data.refreshToken, {
          id: signupRes.data.user.id,
          email: signupRes.data.user.email,
          onboardingCompleted: false,
          name: data.name
        });
        
        // Onboarding redirect
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl fade-in">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 font-bold text-white text-xl shadow-premium">
            L
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Create Account</h2>
          <p className="mt-1 text-sm text-slate-500">Get your personalized AI learning roadmap</p>
        </div>

        {apiError && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="John Doe"
                {...register('name')}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="john@learnpath.ai"
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
                onChange={(e) => {
                  register('password').onChange(e);
                  setPasswordVal(e.target.value);
                }}
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
            
            {/* Password strength indicator */}
            {passwordVal && (
              <div className="mt-2">
                <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1 font-semibold">
                  <span>Strength: {strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}></div>
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms checkbox */}
          <div>
            <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
              <input
                type="checkbox"
                {...register('terms')}
                className="mt-0.5 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
              />
              <span>
                I agree to the{' '}
                <a href="#terms" className="font-semibold text-brand-500 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="font-semibold text-brand-500 hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.terms && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.terms.message}</p>
            )}
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
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-500 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};
