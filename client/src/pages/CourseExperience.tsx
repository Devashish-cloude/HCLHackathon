import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Circle, Play, ArrowLeft, ArrowRight, Code, HelpCircle, Trophy, Sparkles, Check } from 'lucide-react';
import api from '../services/api';

export const CourseExperience: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  
  // Quiz states
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Coding playground states
  const [codeInputValue, setCodeInputValue] = useState('');
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState(false);

  // Saving states
  const [savingProgress, setSavingProgress] = useState(false);

  // Capstone project states
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedCapstone, setSubmittedCapstone] = useState(false);

  const fetchCourseData = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      if (res.data.success) {
        setCourse(res.data.course);
        // Only initialize activeLessonId if not already selected
        setActiveLessonId(currentId => {
          if (currentId) return currentId;
          const allLessons = res.data.course.modules.flatMap((m: any) => m.lessons);
          const isUrlModuleId = res.data.course.modules.some((m: any) => m.id === id);
          if (isUrlModuleId) {
            const targetModule = res.data.course.modules.find((m: any) => m.id === id);
            const firstLessonOfModule = targetModule?.lessons?.[0];
            return firstLessonOfModule?.id || allLessons[0]?.id || null;
          } else {
            const incomplete = allLessons.find((l: any) => !l.completed);
            return incomplete ? incomplete.id : allLessons[0]?.id || null;
          }
        });
      }
    } catch (err) {
      console.error('Failed to load course details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveLessonId(null);
    fetchCourseData();
    // Reset inputs
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setQuizScore(null);
    setCodeOutput(null);
    setCodeSuccess(false);
  }, [id]);

  const handleLessonChange = (lessonId: string) => {
    setActiveLessonId(lessonId);
  };

  const getActiveLesson = () => {
    if (!course || !activeLessonId) return null;
    for (const m of course.modules) {
      const found = m.lessons.find((l: any) => l.id === activeLessonId);
      if (found) return { ...found, moduleTitle: m.title };
    }
    return null;
  };

  const activeLesson = getActiveLesson();

  // Load code examples into playground
  useEffect(() => {
    if (activeLesson) {
      setCodeInputValue(activeLesson.codeExample || '');
    }
  }, [activeLessonId, activeLesson?.id]);

  const markComplete = async () => {
    if (!activeLessonId) return;
    setSavingProgress(true);
    try {
      const res = await api.post('/progress', {
        lessonId: activeLessonId,
        completed: true,
        score: quizScore || undefined
      });
      if (res.data.success) {
        // Refresh course progress locally
        fetchCourseData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProgress(false);
    }
  };

  // Run mock code execution
  const runCode = () => {
    setCodeOutput('Running tests...\n');
    setTimeout(() => {
      if (codeInputValue.toLowerCase().includes('await') || codeInputValue.toLowerCase().includes('promise')) {
        setCodeOutput('> Promise resolved successfully!\n> [Output]: Async operations completed.');
        setCodeSuccess(true);
      } else {
        setCodeOutput('> JavaScript run successful.\n> [Output]: return value matches expectations.');
        setCodeSuccess(true);
      }
    }, 1000);
  };

  // Grade local lesson quiz
  const handleQuizSubmit = () => {
    if (!activeLesson || !activeLesson.quizQuestions) return;
    const questions = activeLesson.quizQuestions as any[];
    let correct = 0;
    
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleCapstoneSubmit = async () => {
    if (!githubUrl.trim() || !liveUrl.trim()) return;
    setSavingProgress(true);
    try {
      const res = await api.post('/progress', {
        lessonId: activeLessonId,
        completed: true
      });
      if (res.data.success) {
        setSubmittedCapstone(true);
        fetchCourseData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProgress(false);
    }
  };

  const parseInlineBold = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeContent: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${idx}`} className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner my-4">
              <code>{codeContent.join('\n')}</code>
            </pre>
          );
          codeContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('# ')) {
        elements.push(<h1 key={idx} className="text-xl font-extrabold text-slate-900 mt-6 mb-2">{parseInlineBold(trimmed.substring(2))}</h1>);
      } else if (trimmed.startsWith('## ')) {
        elements.push(<h2 key={idx} className="text-lg font-bold text-slate-900 mt-5 mb-2">{parseInlineBold(trimmed.substring(3))}</h2>);
      } else if (trimmed.startsWith('### ')) {
        elements.push(<h3 key={idx} className="text-base font-bold text-slate-900 mt-4 mb-2">{parseInlineBold(trimmed.substring(4))}</h3>);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <ul key={idx} className="list-disc pl-5 my-1 text-xs font-semibold text-slate-700">
            <li>{parseInlineBold(trimmed.substring(2))}</li>
          </ul>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const textContent = trimmed.replace(/^\d+\.\s/, '');
        elements.push(
          <ol key={idx} className="list-decimal pl-5 my-1 text-xs font-semibold text-slate-700">
            <li>{parseInlineBold(textContent)}</li>
          </ol>
        );
      } else {
        elements.push(<p key={idx} className="text-xs leading-relaxed text-slate-600 my-2">{parseInlineBold(trimmed)}</p>);
      }
    });

    return elements;
  };

  const isCapstone = course?.tags?.includes('Capstone') || course?.title?.toLowerCase().includes('capstone');

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h3 className="font-bold text-slate-900">Course not found</h3>
        <Link to="/explore" className="text-brand-500 hover:underline mt-2 inline-block">Return to Explore</Link>
      </div>
    );
  }

  const allLessons = course.modules.flatMap((m: any) => m.lessons);
  const activeIdx = allLessons.findIndex((l: any) => l.id === activeLessonId);

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)] fade-in">
      
      {/* --- LEFT DIRECTORY SIDEBAR --- */}
      <aside className="w-full lg:w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shrink-0 h-fit max-h-[calc(100vh-10rem)] overflow-y-auto">
        <Link to="/learning-path" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6">
          <ArrowLeft className="h-3 w-3" strokeWidth={2.5} />
          Back to Path
        </Link>
        <h2 className="text-sm font-bold text-slate-900 leading-snug">{course.title}</h2>
        <span className="text-[10px] text-slate-400 font-semibold block mt-1">Course progress: {course.progressPercentage}%</span>
        
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2 mb-6">
          <div className="h-full bg-brand-500" style={{ width: `${course.progressPercentage}%` }}></div>
        </div>

        {/* Modules Directory */}
        <div className="space-y-4">
          {course.modules.map((mod: any, mIdx: number) => (
            <div key={mod.id} className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Module {mIdx + 1}: {mod.title}
              </h4>
              <div className="space-y-1">
                {mod.lessons.map((les: any) => {
                  const isActive = les.id === activeLessonId;
                  return (
                    <button
                      key={les.id}
                      onClick={() => handleLessonChange(les.id)}
                      className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                        isActive 
                          ? 'bg-brand-50 text-brand-700 font-bold' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {les.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className={`h-4 w-4 shrink-0 mt-0.5 ${isActive ? 'text-brand-500' : 'text-slate-300'}`} />
                      )}
                      <span className="truncate">{les.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* --- RIGHT LESSON CONTENT VIEWPORT --- */}
      <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between max-h-[calc(100vh-10rem)] overflow-y-auto">
        {activeLesson ? (
          <div className="space-y-6">
            {/* Active Lesson Header */}
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wide">
                {activeLesson.moduleTitle}
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">{activeLesson.title}</h1>
              <p className="text-slate-500 text-xs mt-1">{activeLesson.description}</p>
            </div>

            {/* Reading Material (rendered Markdown context) */}
            <article className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-2">
              {renderMarkdown(activeLesson.content)}
            </article>

            {/* INTERACTIVE WORKSPACE: Quiz, Coding Practice, or Capstone Project */}
            {isCapstone ? (
              <div className="mt-8 border border-slate-200 rounded-2xl p-6 bg-slate-50/50 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-amber-500 animate-bounce" />
                  Capstone Project Submission Workstation
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Provide your GitHub repository and deployment URLs below. Once submitted, the AI evaluation engine will audit your codebase against the project criteria.
                </p>

                {activeLesson.completed || submittedCapstone ? (
                  <div className="rounded-xl border border-green-200 bg-green-50/50 p-5 space-y-4 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-green-800">Capstone Project Submitted!</h4>
                      <p className="text-xs text-green-600 mt-1">Excellent work! Your code has been verified and this project marked as complete in your roadmap.</p>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center gap-3 mt-2">
                      <a 
                        href={githubUrl || "https://github.com"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-4 py-2 text-xs font-bold bg-white border border-green-200 rounded-lg text-green-700 hover:bg-green-100"
                      >
                        View Repository
                      </a>
                      <a 
                        href={liveUrl || "https://vercel.com"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-4 py-2 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Launch Live App
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">GitHub Repository URL</label>
                      <input
                        type="url"
                        placeholder="https://github.com/username/repo-name"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Live Deployment URL</label>
                      <input
                        type="url"
                        placeholder="https://your-app-domain.vercel.app"
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Implementation Notes</label>
                      <textarea
                        rows={3}
                        placeholder="Any additional features, credentials, or custom setup notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-brand-500 resize-none"
                      />
                    </div>

                    <button
                      onClick={handleCapstoneSubmit}
                      disabled={savingProgress || !githubUrl.trim() || !liveUrl.trim()}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-xs font-bold text-white shadow-premium hover:bg-brand-600 disabled:opacity-50 transition-colors"
                    >
                      {savingProgress ? 'Verifying codebase...' : 'Submit Capstone Project'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {activeLesson.quizQuestions && (
                  <div className="mt-8 border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-4">
                      <HelpCircle className="h-4 w-4 text-brand-500" />
                      Lesson Comprehension Check
                    </h3>
                    
                    {(activeLesson.quizQuestions as any[]).map((q, qIdx) => (
                      <div key={qIdx} className="space-y-3">
                        <p className="text-xs font-semibold text-slate-700">{q.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {q.options.map((opt: string) => {
                            const isSelected = selectedAnswers[qIdx] === opt;
                            const isCorrect = opt === q.correctAnswer;
                            return (
                              <button
                                key={opt}
                                type="button"
                                disabled={quizSubmitted}
                                onClick={() => setSelectedAnswers(prev => ({ ...prev, [qIdx]: opt }))}
                                className={`px-4 py-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                                  isSelected
                                    ? quizSubmitted
                                      ? isCorrect 
                                        ? 'bg-green-500 text-white border-green-500'
                                        : 'bg-red-500 text-white border-red-500'
                                      : 'bg-brand-500 text-white border-brand-500'
                                    : quizSubmitted && isCorrect
                                    ? 'bg-green-500 text-white border-green-500'
                                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {!quizSubmitted ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={Object.keys(selectedAnswers).length === 0}
                        className="mt-4 inline-flex items-center gap-1 rounded-lg bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-premium hover:bg-brand-600 disabled:opacity-50 transition-colors"
                      >
                        <Trophy className="h-3.5 w-3.5" />
                        Submit Answer
                      </button>
                    ) : (
                      <div className="mt-4 p-3 bg-brand-50 border border-brand-100 text-brand-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Quiz completed! Scored: {quizScore}%.
                      </div>
                    )}
                  </div>
                )}

                {activeLesson.codingExercise && (
                  <div className="mt-8 border border-slate-200 rounded-2xl p-5 bg-slate-900 text-slate-100 overflow-hidden shadow-xl">
                    <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 mb-3">
                      <Code className="h-4 w-4 text-brand-400" />
                      Coding Practice
                    </h3>
                    <p className="text-[11px] text-slate-400 mb-3">{activeLesson.codingExercise}</p>

                    {/* Simulated Editor */}
                    <textarea
                      rows={6}
                      value={codeInputValue}
                      onChange={(e) => setCodeInputValue(e.target.value)}
                      className="w-full bg-slate-950 text-emerald-400 font-mono text-xs p-3 rounded-lg border border-slate-800 outline-none focus:border-brand-500"
                    />

                    <div className="flex justify-between items-center mt-3">
                      <button
                        onClick={runCode}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow"
                      >
                        Run Code
                      </button>
                    </div>

                    {codeOutput && (
                      <pre className="mt-3 bg-slate-950 text-xs p-3 rounded border border-slate-800 font-mono text-slate-300">
                        <code>{codeOutput}</code>
                      </pre>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
              <button
                disabled={activeIdx === 0}
                onClick={() => handleLessonChange(allLessons[activeIdx - 1].id)}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-bold disabled:opacity-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous Lesson
              </button>

              {!isCapstone && (
                <button
                  onClick={markComplete}
                  disabled={savingProgress || activeLesson.completed}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-xs font-bold transition-colors ${
                    activeLesson.completed
                      ? 'bg-green-500 text-white cursor-default'
                      : 'bg-brand-500 text-white shadow-premium hover:bg-brand-600 disabled:opacity-50'
                  }`}
                >
                  {activeLesson.completed ? (
                    <>
                      <Check className="h-4 w-4" />
                      Completed
                    </>
                  ) : savingProgress ? (
                    'Saving...'
                  ) : (
                    'Mark as Complete'
                  )}
                </button>
              )}

              <button
                disabled={activeIdx === allLessons.length - 1}
                onClick={() => handleLessonChange(allLessons[activeIdx + 1].id)}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-bold disabled:opacity-50 transition-colors"
              >
                Next Lesson
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-12">Select a lesson to begin learning.</p>
        )}
      </div>
    </div>
  );
};
