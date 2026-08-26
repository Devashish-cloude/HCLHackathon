import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckSquare, Square, ChevronRight, Trophy, Flame, CheckCircle, GraduationCap, ArrowRight, BookmarkPlus, Sparkles, Lock, ArrowUpRight } from 'lucide-react';
import api from '../services/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const [addedSuccessCourse, setAddedSuccessCourse] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTaskToggle = async (taskId: string, currentCompleted: boolean) => {
    setUpdatingTask(taskId);
    try {
      const res = await api.post('/dashboard/complete-task', {
        taskId,
        completed: !currentCompleted
      });
      if (res.data.success) {
        // Update local state
        setData((prev: any) => ({
          ...prev,
          todaysFocus: prev.todaysFocus.map((t: any) => 
            t.id === taskId ? { ...t, completed: !currentCompleted } : t
          ),
          // Increment streak if triggered on server
          user: {
            ...prev.user,
            streak: res.data.task.completed ? prev.user.streak + 1 : prev.user.streak
          }
        }));
        // Refetch to update general stats
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTask(null);
    }
  };

  const handleAddToPath = async (courseId: string, courseTitle: string) => {
    try {
      const res = await api.post(`/courses/${courseId}/enroll`);
      if (res.data.success) {
        fetchDashboardData();
        // Redirect to course experience page
        navigate(`/courses/${courseId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  const { user, stats, continueLearning, todaysFocus, learningPathNodes, recommendations } = data || {};

  return (
    <div className="space-y-6 fade-in relative">
      {addedSuccessCourse && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-green-800">Added to Learning Path!</h4>
            <p className="text-[10px] text-green-600 mt-0.5">"{addedSuccessCourse}" was added to your roadmap timeline.</p>
          </div>
        </div>
      )}
      {/* Greetings */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Good morning, {user?.name || 'Devashish'}.</h1>
        <p className="text-slate-500 text-sm mt-1">Here's what you should focus on today.</p>
      </div>

      {/* Continue Learning and Today's Focus Card Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden">
          {continueLearning && (
            <>
              {/* Image representation */}
              <div className="w-full md:w-48 h-36 rounded-xl bg-slate-100 overflow-hidden relative border border-slate-100 shrink-0">
                <img 
                  src={continueLearning.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=300"} 
                  alt={continueLearning.courseTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-slate-800 backdrop-blur">
                  ASYNC
                </div>
              </div>

              {/* Text metadata */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-brand-600 uppercase bg-brand-50 px-2 py-0.5 rounded">
                      Continue Learning
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      🕒 {continueLearning.durationRemaining}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{continueLearning.courseTitle}</h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed truncate-2-lines">
                    {continueLearning.courseDescription}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mt-4 md:mt-0">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span>{continueLearning.moduleTitle}</span>
                    <span>{continueLearning.progressPercentage}% Complete</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-500 rounded-full transition-all duration-500" 
                      style={{ width: `${continueLearning.progressPercentage}%` }}
                    ></div>
                  </div>
                  <button 
                    onClick={() => navigate(`/courses/${continueLearning.moduleId || continueLearning.courseId}`)}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-premium hover:bg-brand-600 transition-colors"
                  >
                    Continue Learning
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Today's Focus Checklist */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold text-xs">🎯</span>
              Today's Focus
            </h3>
            
            <div className="mt-4 space-y-3">
              {todaysFocus?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">All tasks complete! Try exploring new modules.</p>
              ) : (
                todaysFocus?.map((task: any) => (
                  <div 
                    key={task.id} 
                    onClick={() => handleTaskToggle(task.id, task.completed)}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors ${
                      task.completed ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'border-slate-100 bg-white'
                    }`}
                  >
                    <button 
                      type="button" 
                      disabled={updatingTask === task.id}
                      className="text-slate-400 hover:text-brand-500 shrink-0 mt-0.5"
                    >
                      {task.completed ? (
                        <CheckSquare className="h-4 w-4 text-brand-500" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-xs font-semibold text-slate-700 leading-snug ${task.completed ? 'line-through' : ''}`}>
                        {task.taskText}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {task.taskType} • {task.estimatedTime || '15m'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Frontend Engineering Path visual timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-900">{user?.careerGoal || 'Frontend Engineering'} Path</h3>
          <Link to="/learning-path" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:underline">
            View full roadmap
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Dynamic Horizontal Timeline Nodes matching screenshot */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 px-4 md:px-12 py-4">
          {/* Background connectors */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 hidden md:block -translate-y-1/2 z-0"></div>

          {learningPathNodes?.map((node: any, idx: number) => {
            const isCompleted = node.status === 'Completed';
            const isInProgress = node.status === 'InProgress';
            const isAvailable = node.status === 'Available';
            const isLocked = node.status === 'Locked';

            return (
              <div key={node.id} className="relative flex flex-col items-center z-10 w-full md:w-auto">
                <div 
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    isCompleted 
                      ? 'border-brand-500 bg-brand-500 text-white' 
                      : isInProgress
                      ? 'border-brand-500 bg-white text-brand-600 ring-4 ring-brand-50'
                      : isAvailable
                      ? 'border-brand-300 bg-white text-brand-600'
                      : 'border-slate-200 bg-slate-50 text-slate-300'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : isLocked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <div className={`h-2.5 w-2.5 rounded-full ${isInProgress ? 'bg-brand-500 animate-pulse' : 'bg-brand-300'}`}></div>
                  )}
                </div>
                
                {/* Node Text metadata */}
                <div className="mt-3 text-center">
                  <h4 className={`text-xs font-bold ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                    {node.title}
                  </h4>
                  <span className={`text-[10px] font-semibold mt-0.5 block ${
                    isCompleted ? 'text-green-600' : isInProgress ? 'text-brand-500 font-bold' : 'text-slate-400'
                  }`}>
                    {node.status === 'InProgress' ? 'In Progress' : node.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Stats cards and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {/* Progress Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center min-h-[140px] hover:shadow-md transition-shadow">
            <Trophy className="h-6 w-6 text-brand-500 mb-2" />
            <h3 className="text-3xl font-extrabold text-slate-900">{stats?.overallProgress || 42}%</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Overall Progress</p>
          </div>

          {/* Streak Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center min-h-[140px] hover:shadow-md transition-shadow">
            <Flame className="h-6 w-6 text-orange-500 mb-2" />
            <h3 className="text-3xl font-extrabold text-slate-900">{stats?.learningStreak || 14}d</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Learning Streak</p>
          </div>

          {/* Skills Mastered */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center min-h-[140px] hover:shadow-md transition-shadow">
            <GraduationCap className="h-6 w-6 text-brand-500 mb-2" />
            <h3 className="text-3xl font-extrabold text-slate-900">{stats?.skillsMastered || 12}</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Skills Mastered</p>
          </div>

          {/* Courses Completed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center min-h-[140px] hover:shadow-md transition-shadow">
            <CheckCircle className="h-6 w-6 text-emerald-500 mb-2" />
            <h3 className="text-3xl font-extrabold text-slate-900">{stats?.coursesCompleted || 3}</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Courses Completed</p>
          </div>
        </div>

        {/* Recommended For You */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-brand-500" />
              Recommended for you
            </h3>

            {recommendations?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">All caught up! Check again later.</p>
            ) : (
              recommendations?.map((rec: any) => (
                <div key={rec.id} className="space-y-4">
                  <div className="flex gap-4">
                    {/* Thumbnail representation */}
                    <div className="h-16 w-16 bg-slate-100 rounded-lg shrink-0 overflow-hidden border border-slate-100">
                      <img 
                        src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=200" 
                        alt="API representation" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Course • 10h Duration</p>
                    </div>
                  </div>

                  {/* Adaptive reason bubble */}
                  <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100 text-[11px] text-brand-700 leading-relaxed">
                    {rec.explanation}
                  </div>

                  <button 
                    onClick={() => handleAddToPath(rec.targetId, rec.title)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-4 py-2 text-xs font-bold text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <BookmarkPlus className="h-4 w-4" />
                    Add to Path
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
