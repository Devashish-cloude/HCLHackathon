import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight, ChevronLeft, Sparkles, Loader2, BookOpen, Clock, Target, Star, BrainCircuit } from 'lucide-react';
import api from '../services/api';

export const Onboarding: React.FC = () => {
  const { updateOnboardingCompleted } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [currentRole, setCurrentRole] = useState('Student');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [careerGoal, setCareerGoal] = useState('Frontend Engineering');
  const [customGoal, setCustomGoal] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<{ name: string; level: string }[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState(1.5);
  const [preferredLearningStyle, setPreferredLearningStyle] = useState('Coding');
  const [goalStatement, setGoalStatement] = useState('');

  const roles = ['Student', 'Junior Developer', 'Career Switcher', 'Non-Technical Professional', 'Self-Taught Coder'];
  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];
  
  const careerGoals = [
    'Frontend Engineering',
    'Backend Engineering',
    'Full Stack Web Development',
    'AI / Machine Learning Engineer',
    'Data Scientist',
    'UI/UX Designer',
    'Cloud Architect',
    'Cybersecurity Specialist',
    'Other (Write Custom)'
  ];

  const skillOptions = [
    'JS Fundamentals',
    'DOM Manipulation',
    'ES6+ Features',
    'Data Structures',
    'Async Programming',
    'API Integration',
    'Error Handling',
    'React Fundamentals',
    'HTML/CSS Basics',
    'TypeScript Core',
  ];

  const interestOptions = [
    'Web Development',
    'Artificial Intelligence',
    'Machine Learning',
    'Cloud Computing',
    'Cybersecurity',
    'Data Science',
    'Mobile Development',
    'UI/UX Design',
    'DevOps & Deployments'
  ];

  const styles = ['Video', 'Reading', 'Coding', 'Projects', 'Quizzes'];

  const toggleInterest = (val: string) => {
    setInterests(prev => 
      prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]
    );
  };

  const handleSkillLevelChange = (skillName: string, level: string) => {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.name === skillName);
      if (exists) {
        if (level === 'None') {
          return prev.filter(s => s.name !== skillName);
        }
        return prev.map(s => s.name === skillName ? { ...s, level } : s);
      } else {
        if (level === 'None') return prev;
        return [...prev, { name: skillName, level }];
      }
    });
  };

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      setErrorMsg('Please enter your name to continue.');
      return;
    }
    if (step === 6 && !goalStatement.trim()) {
      setErrorMsg('Please provide a goal statement.');
      return;
    }
    setErrorMsg(null);
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name,
      currentRole,
      experienceLevel,
      careerGoal: careerGoal === 'Other (Write Custom)' ? customGoal : careerGoal,
      interests,
      skills: selectedSkills,
      hoursPerDay,
      preferredLearningStyle,
      goalStatement
    };

    try {
      const res = await api.post('/auth/onboarding', payload);
      if (res.data.success) {
        updateOnboardingCompleted(name);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit onboarding profiles.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepPercentage = Math.round((step / 6) * 100);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      {/* Container */}
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl relative overflow-hidden">
        {/* Top Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
          <div 
            className="h-full bg-brand-500 transition-all duration-300"
            style={{ width: `${stepPercentage}%` }}
          ></div>
        </div>

        {/* Step indicator */}
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-6">
          <span>Step {step} of 6</span>
          <span>{stepPercentage}% Complete</span>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-5 fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Let's get started!</h2>
              <p className="text-slate-500 text-sm mt-0.5">Tell us a bit about yourself.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">What is your name?</label>
              <input
                type="text"
                placeholder="Devashish"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Role / Status</label>
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  {experienceLevels.map(el => <option key={el} value={el}>{el}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Career Goal */}
        {step === 2 && (
          <div className="space-y-5 fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">What is your target career path?</h2>
              <p className="text-slate-500 text-sm mt-0.5">We will construct your learning nodes based on this goal.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {careerGoals.map(cg => (
                <button
                  key={cg}
                  type="button"
                  onClick={() => setCareerGoal(cg)}
                  className={`px-4 py-3 rounded-lg border text-left text-sm font-semibold transition-all ${
                    careerGoal === cg 
                      ? 'border-brand-500 bg-brand-50 text-brand-700' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {cg}
                </button>
              ))}
            </div>

            {careerGoal === 'Other (Write Custom)' && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Enter Custom Career Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js Mobile Specialist"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Skill Rating */}
        {step === 3 && (
          <div className="space-y-5 fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Rate your current skills</h2>
              <p className="text-slate-500 text-sm mt-0.5">Assessments will adjust based on these base values.</p>
            </div>
            <div className="max-h-72 overflow-y-auto pr-2 space-y-4">
              {skillOptions.map(skillName => {
                const currentVal = selectedSkills.find(s => s.name === skillName)?.level || 'None';
                return (
                  <div key={skillName} className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-3">
                    <span className="text-sm font-semibold text-slate-700">{skillName}</span>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      {['None', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleSkillLevelChange(skillName, lvl)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                            currentVal === lvl
                              ? 'bg-brand-500 text-white border-brand-500'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Interests */}
        {step === 4 && (
          <div className="space-y-5 fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Select your learning interests</h2>
              <p className="text-slate-500 text-sm mt-0.5">We will enrich your explore page with these topics.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interestOptions.map(int => {
                const isSelected = interests.includes(int);
                return (
                  <button
                    key={int}
                    type="button"
                    onClick={() => toggleInterest(int)}
                    className={`px-4 py-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                      isSelected 
                        ? 'border-brand-500 bg-brand-50 text-brand-700' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {int}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Preferences */}
        {step === 5 && (
          <div className="space-y-6 fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Choose your study parameters</h2>
              <p className="text-slate-500 text-sm mt-0.5">This adjusts the estimated module completion windows.</p>
            </div>
            <div className="space-y-4">
              {/* Hours per Day Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-slate-400" /> Daily Available Hours</span>
                  <span className="text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded">{hoursPerDay} hours</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>

              {/* Preferred learning style selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-slate-400" /> Preferred Learning Format
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {styles.map(sty => (
                    <button
                      key={sty}
                      type="button"
                      onClick={() => setPreferredLearningStyle(sty)}
                      className={`py-2 rounded-lg border text-xs font-semibold transition-all ${
                        preferredLearningStyle === sty
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      {sty}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Final Goal Statement */}
        {step === 6 && (
          <div className="space-y-5 fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Define your primary milestone</h2>
              <p className="text-slate-500 text-sm mt-0.5">Write a brief statement of what you want to achieve.</p>
            </div>
            <div>
              <textarea
                rows={4}
                placeholder="e.g. I want to become a job-ready full-stack developer within 6 months, building real React apps."
                value={goalStatement}
                onChange={(e) => setGoalStatement(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
              />
            </div>
            
            {/* Quick Suggestions helper */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Quick suggestions</span>
              <div className="flex flex-wrap gap-2">
                {[
                  `Become job-ready for a ${careerGoal || 'developer'} role.`,
                  'Build 5 production capstones and master Javascript.',
                  'Acquire core backend logic and learn database relations.'
                ].map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setGoalStatement(sug)}
                    className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded hover:bg-slate-200 transition-colors text-left"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between items-center border-t border-slate-100 pt-6">
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 6 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-premium hover:bg-brand-600 transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-premium hover:bg-brand-600 disabled:bg-brand-300 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Learning Path
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
