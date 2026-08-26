import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, ShieldAlert, Award, ArrowLeft, CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';
import api from '../services/api';

export const AssessmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [timerActive, setTimerActive] = useState(false);

  const fetchAssessmentData = async () => {
    try {
      const res = await api.get(`/assessments/${id}`);
      if (res.data.success) {
        setAssessment(res.data.assessment);
        setTimeLeft(res.data.assessment.duration * 60);
        setTimerActive(true);
      }
    } catch (err) {
      console.error('Failed to load assessment questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessmentData();
  }, [id]);

  // Countdown timer thread
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft === 0 && timerActive) {
        handleSubmit(); // Auto submit on timeout
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, timerActive]);

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    setTimerActive(false);
    setSubmitting(true);
    try {
      const res = await api.post(`/assessments/${id}/submit`, { answers });
      if (res.data.success) {
        setResult(res.data.attempt);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit assessment grading.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <h3 className="font-bold text-slate-900">Assessment not found</h3>
        <Link to="/assessments" className="text-brand-500 hover:underline mt-2 inline-block">Return to list</Link>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (result) {
    const isPass = result.passed;
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6 fade-in">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 border border-brand-100">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Assessment Finished!</h1>
            <p className="text-xs text-slate-400 mt-1">{assessment.title}</p>
          </div>

          {/* Score details */}
          <div className="py-4">
            <div className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 border ${
              isPass ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <span className="text-3xl font-extrabold">{result.scorePercentage}%</span>
              <span className="text-xs font-semibold uppercase tracking-wider block">
                {isPass ? 'Pass' : 'Failed'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            {result.feedback?.summary}
          </p>

          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-6 py-2.5 text-xs font-bold text-white shadow-premium hover:bg-brand-600 transition-all"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Question Breakdown list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Question Breakdown</h3>
          <div className="space-y-4">
            {result.feedback?.questionBreakdown.map((item: any, idx: number) => (
              <div key={item.questionId} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 space-y-2">
                <div className="flex justify-between items-start gap-3">
                  <h4 className="text-xs font-semibold text-slate-700 leading-snug">
                    {idx + 1}. {item.questionText}
                  </h4>
                  {item.correct ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div className="p-2 bg-slate-50 rounded border border-slate-100 text-slate-600">
                    <span className="font-semibold text-slate-500 block mb-0.5">Your Answer:</span>
                    {item.userAnswer || 'No Answer'}
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100 text-slate-600">
                    <span className="font-semibold text-slate-500 block mb-0.5">Correct Answer:</span>
                    {item.correctAnswer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVE ASSESSMENT VIEW ---
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 fade-in">
      
      {/* Timer banner */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-lg shrink-0">
        <div>
          <h2 className="text-xs font-bold text-slate-100">{assessment.title}</h2>
          <span className="text-[10px] text-slate-400">Answer all questions to finalize assessment.</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          <Clock className="h-4 w-4 text-brand-400" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-6">
        {assessment.questions.map((q: any, idx: number) => (
          <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 leading-snug">
              Question {idx + 1}: {q.questionText}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {q.options?.map((opt: string) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectOption(q.id, opt)}
                    className={`px-4 py-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit footer */}
      <div className="flex justify-between items-center pt-4">
        <Link to="/assessments" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Cancel Test
        </Link>

        <button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length !== assessment.questions.length}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-6 py-2.5 text-xs font-bold text-white shadow-premium hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Grading Answers...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Submit Assessment
            </>
          )}
        </button>
      </div>

    </div>
  );
};
