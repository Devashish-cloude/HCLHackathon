import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Star, ArrowUpRight, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import api from '../services/api';

export const SkillAnalysis: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSkillData = async () => {
    try {
      const res = await api.get('/skills/analysis');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load skill analysis', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillData();
  }, []);

  const handleStartCourse = (courseId: string) => {
    if (courseId) {
      navigate(`/courses/${courseId}`);
    } else {
      // Go to explore page if no direct link
      navigate('/explore');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  const { overallProficiency, competencyBreakdown, gapAreas, recommendedNextStep } = data || {};

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Skill Analysis</h1>
        <p className="text-slate-500 text-sm mt-1">Career-oriented assessment and competency mapping.</p>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Competency breakdown (Left 2-columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overall Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-100 font-bold text-brand-700 text-xs">JB</span>
                <h3 className="text-base font-bold text-slate-900 mt-2">JavaScript Engineering</h3>
                <p className="text-xs text-slate-400 font-medium">Primary technical competency assessment</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded">
                Target: Advanced
              </span>
            </div>

            {/* Overall progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>Overall Proficiency</span>
                <span className="text-brand-600 font-bold">{overallProficiency}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-500 rounded-full transition-all duration-500" 
                  style={{ width: `${overallProficiency}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">Proficient Level achieved</span>
            </div>
          </div>

          {/* Competency List breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Competency Breakdown</h3>
            <div className="space-y-4">
              {competencyBreakdown?.map((skill: any) => (
                <div key={skill.skillId} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <span className="text-xs font-bold text-slate-700 w-36 shrink-0">{skill.name}</span>
                  <div className="flex-1 w-full flex items-center gap-4">
                    <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-500 rounded-full" 
                        style={{ width: `${skill.score}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 w-8 text-right">{skill.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Next Step block */}
          {recommendedNextStep && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Recommended Next Step</span>
              <div className="mt-4 flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100 shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{recommendedNextStep.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{recommendedNextStep.description}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded">
                        {recommendedNextStep.estimatedTime}
                      </span>
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded">
                        {recommendedNextStep.type}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleStartCourse(recommendedNextStep.courseId)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shrink-0 shadow-premium transition-all"
                >
                  Start Course
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Identified Gaps (Right 1-column) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            Identified Gap Areas
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
            Based on your recent assessments and code reviews, these areas require focus to reach your target Advanced level.
          </p>

          <div className="space-y-6">
            {gapAreas?.length === 0 ? (
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-xs font-semibold text-center">
                ✨ No skill gaps identified! You are matching all milestones.
              </div>
            ) : (
              gapAreas?.map((gap: any) => {
                const isCritical = gap.severity === 'Critical';
                return (
                  <div key={gap.skillName} className="space-y-2 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-800">{gap.skillName}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isCritical ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {gap.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {gap.evidence}
                    </p>
                    <div className="mt-2 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-600">
                      <span className="font-bold text-slate-800 block mb-0.5">Recommended Action:</span>
                      {gap.recommendation}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
