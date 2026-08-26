import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ClipboardCheck, Clock, Award, Play } from 'lucide-react';
import api from '../services/api';

export const Assessments: React.FC = () => {
  const navigate = useNavigate();
  
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssessments = async () => {
    try {
      const res = await api.get('/assessments');
      if (res.data.success) {
        setAssessments(res.data.assessments);
      }
    } catch (err) {
      console.error('Failed to load assessments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Skill Assessments</h1>
        <p className="text-slate-500 text-sm mt-1">
          Validate your progress. Completing assessments updates your overall skill scores and unlocks new path levels.
        </p>
      </div>

      {/* Assessments list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessments.map((a) => (
          <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start">
                <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 border border-brand-100">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-brand-600 uppercase bg-brand-50 px-2.5 py-1 rounded">
                  {a.type}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-4 leading-snug">{a.title}</h3>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                {a.description}
              </p>

              <div className="flex gap-4 mt-4">
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {a.duration} Minutes
                </span>
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />
                  {a._count?.questions || 3} Questions
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/assessments/${a.id}`)}
              className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2.5 text-xs font-bold text-white shadow-premium hover:bg-brand-600 transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Start Assessment
            </button>
          </div>
        ))}

        {/* Fallback info card */}
        {assessments.length === 0 && (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-xs font-semibold">
            No assessments currently active. Please complete onboarding.
          </div>
        )}
      </div>
    </div>
  );
};
