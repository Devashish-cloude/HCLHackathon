import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Play, Lock, Eye, BookOpen, Clock, RefreshCw, Milestone, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export const LearningPath: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchPathData = async () => {
    try {
      const res = await api.get('/learning-path');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load learning path', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPathData();
  }, []);

  const handleRegeneratePath = async () => {
    setRegenerating(true);
    try {
      const res = await api.post('/learning-path/generate');
      if (res.data.success) {
        fetchPathData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleStartModule = (moduleId: string | null) => {
    if (moduleId) {
      navigate(`/courses/${moduleId}`);
    } else {
      // If custom AI module not yet mapped to static, go to explore
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

  const { goal, estimatedDuration, overallProgress, timeInvested, currentFocus, phases } = data || {};

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Learning Path</h1>
          <p className="text-slate-500 text-sm mt-1">
            Your personalized roadmap to mastering {goal || 'Frontend Engineering'}. Progress steadily through foundational concepts.
          </p>
        </div>
        <button 
          onClick={handleRegeneratePath}
          disabled={regenerating}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-slate-400 ${regenerating ? 'animate-spin' : ''}`} />
          Regenerate Roadmap
        </button>
      </div>

      {/* Overview Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Overall Progress</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{overallProgress}%</h3>
            <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${overallProgress}%` }}></div>
            </div>
          </div>
          <CheckCircle className="h-8 w-8 text-brand-500 opacity-20" />
        </div>

        {/* Time Invested */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Time Invested</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{timeInvested}</h3>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Estimated 52h remaining to target role.</p>
          </div>
          <Clock className="h-8 w-8 text-brand-500 opacity-20" />
        </div>

        {/* Current Focus */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Current Focus</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1 truncate max-w-[180px]">{currentFocus}</h3>
            <button 
              onClick={() => {
                const activeModule = phases?.flatMap((p: any) => p.modules).find((m: any) => m.status === 'InProgress');
                handleStartModule(activeModule?.moduleId || null);
              }}
              className="text-[11px] font-bold text-brand-600 hover:underline mt-2 flex items-center gap-1"
            >
              Resume Module
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <Milestone className="h-8 w-8 text-brand-500 opacity-20" />
        </div>
      </div>

      {/* Curriculum Roadmap List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-6">Curriculum Roadmap</h3>

        <div className="space-y-8 relative pl-4 md:pl-8 before:absolute before:left-6 before:top-2 before:h-[90%] before:w-0.5 before:bg-slate-100 before:z-0">
          {phases?.map((phase: any, pIdx: number) => (
            <div key={phase.title} className="relative z-10 space-y-4">
              {/* Phase header pill */}
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <span className="flex h-6 w-16 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-600 border border-brand-100 uppercase shrink-0">
                  Phase {pIdx + 1}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{phase.title}</h4>
              </div>

              {/* Module cards nested inside phase */}
              <div className="grid grid-cols-1 gap-3 ml-2 md:ml-4">
                {phase.modules.map((mod: any) => {
                  const isCompleted = mod.status === 'Completed';
                  const isInProgress = mod.status === 'InProgress';
                  const isLocked = mod.status === 'Locked';

                  return (
                    <div 
                      key={mod.id} 
                      className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border transition-all ${
                        isInProgress
                          ? 'border-brand-500 bg-brand-50/10 shadow-sm'
                          : isLocked
                          ? 'border-slate-100 bg-slate-50/50 opacity-75'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-0.5 rounded-full p-1.5 h-fit ${
                          isCompleted
                            ? 'bg-green-50 text-green-600'
                            : isInProgress
                            ? 'bg-brand-100 text-brand-600 animate-pulse'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : isLocked ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4 fill-current" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            {mod.title}
                            {isCompleted && (
                              <span className="text-[9px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                100% Complete
                              </span>
                            )}
                            {isInProgress && (
                              <span className="text-[9px] font-bold bg-brand-500 text-white px-2 py-0.5 rounded-full">
                                Current Focus
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-xl">
                            {mod.description}
                          </p>
                        </div>
                      </div>

                      {/* Launch/Action button */}
                      <button
                        onClick={() => handleStartModule(mod.moduleId)}
                        disabled={isLocked}
                        className={`mt-4 md:mt-0 flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                          isCompleted
                            ? 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                            : isInProgress
                            ? 'bg-brand-500 text-white shadow-premium hover:bg-brand-600'
                            : isLocked
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {isCompleted ? 'Review' : isInProgress ? 'Continue' : isLocked ? 'Locked' : 'Start'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple Arrow icon helper
const ArrowRight: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2.5} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);
