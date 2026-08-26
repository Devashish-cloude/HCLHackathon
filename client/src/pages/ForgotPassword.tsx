import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export const ForgotPassword: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMsg(null);
    setResetLink(null);

    try {
      const res = await api.post('/auth/forgot-password', { email: data.email });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        if (res.data.resetLink) {
          setResetLink(res.data.resetLink); // Display reset link in development mode
        }
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.response?.data?.message || 'Something went wrong. Please check the email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl fade-in">
        {/* Header */}
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6">
            <ArrowLeft className="h-3 w-3" />
            Back to Login
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Forgot Password?</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {apiError && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
            {apiError}
          </div>
        )}

        {successMsg ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-green-800">Email Sent (Simulated)</h4>
                <p className="text-[11px] text-green-700 mt-1">{successMsg}</p>
              </div>
            </div>
            {resetLink && (
              <div className="p-3 border border-dashed border-brand-200 bg-brand-50/50 rounded-lg text-center">
                <p className="text-[10px] text-slate-500 mb-2 font-medium">Click this simulated development link to reset:</p>
                <Link to={resetLink.replace(window.location.origin, '')} className="text-xs font-bold text-brand-600 hover:underline break-all">
                  Reset My Password
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@email.com"
                  {...register('email')}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-premium hover:bg-brand-600 disabled:bg-brand-300 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
