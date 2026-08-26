import React, { useState, useEffect } from 'react';
import { User, Mail, Award, Clock, BookOpen, Save, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(1.5);
  const [preferredLearningStyle, setPreferredLearningStyle] = useState('Coding');
  const [goalStatement, setGoalStatement] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      if (res.data.success) {
        const p = res.data.profile;
        setProfile(p);
        setName(p.name);
        setCurrentRole(p.currentRole);
        setExperienceLevel(p.experienceLevel);
        setCareerGoal(p.careerGoal);
        setHoursPerDay(p.hoursPerDay);
        setPreferredLearningStyle(p.preferredLearningStyle);
        setGoalStatement(p.goalStatement);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await api.put('/users/me', {
        name,
        currentRole,
        experienceLevel,
        careerGoal,
        hoursPerDay,
        preferredLearningStyle,
        goalStatement
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your professional bio and study parameters.</p>
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs font-semibold text-green-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Profile updated successfully!
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 font-extrabold text-brand-700 text-xl shadow-inner">
              {name ? name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{profile?.user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <User className="h-4 w-4 text-slate-400" /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-brand-500"
              />
            </div>

            {/* Current Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Award className="h-4 w-4 text-slate-400" /> Current Role / Status
              </label>
              <input
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-brand-500"
              />
            </div>

            {/* Career Goal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Award className="h-4 w-4 text-slate-400" /> Target Career Goal
              </label>
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-brand-500"
              />
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Award className="h-4 w-4 text-slate-400" /> Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs bg-white outline-none focus:border-brand-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Hours per Day */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="h-4 w-4 text-slate-400" /> Study Hours per Day
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="8"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-brand-500"
              />
            </div>

            {/* Study format */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <BookOpen className="h-4 w-4 text-slate-400" /> Preferred Learning Style
              </label>
              <select
                value={preferredLearningStyle}
                onChange={(e) => setPreferredLearningStyle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs bg-white outline-none focus:border-brand-500"
              >
                <option value="Video">Video</option>
                <option value="Reading">Reading</option>
                <option value="Coding">Coding</option>
                <option value="Projects">Projects</option>
                <option value="Quizzes">Quizzes</option>
              </select>
            </div>
          </div>

          {/* Goal statement */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Target Statement</label>
            <textarea
              rows={3}
              value={goalStatement}
              onChange={(e) => setGoalStatement(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-brand-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-premium hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
