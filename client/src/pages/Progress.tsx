import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Calendar, Flame, GraduationCap, Award, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

export const Progress: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgressData = async () => {
    try {
      const res = await api.get('/dashboard'); // Fetching stats from dashboard payload
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load progress details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  // Static chart data matching the seed dates/hours
  const weeklyActivityData = [
    { day: 'Mon', mins: 45 },
    { day: 'Tue', mins: 60 },
    { day: 'Wed', mins: 30 },
    { day: 'Thu', mins: 90 },
    { day: 'Fri', mins: 120 },
    { day: 'Sat', mins: 40 },
    { day: 'Sun', mins: 75 }
  ];

  const skillGrowthData = [
    { name: 'Week 1', score: 30 },
    { name: 'Week 2', score: 48 },
    { name: 'Week 3', score: 58 },
    { name: 'Week 4', score: 65 },
    { name: 'Week 5', score: 78 }
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
      </div>
    );
  }

  const { stats } = data || {};

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Learning Progress</h1>
        <p className="text-slate-500 text-sm mt-1">Detailed breakdown of study hours, skill growths, and milestones.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Hours */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-brand-50 p-2.5 text-brand-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Time Invested</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">38 hrs</h3>
          </div>
        </div>

        {/* Streak */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Streak</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{stats?.learningStreak || 14} days</h3>
          </div>
        </div>

        {/* Skills */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mastery</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{stats?.skillsMastered || 12} Skills</h3>
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Finished</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{stats?.coursesCompleted || 3} Courses</h3>
          </div>
        </div>
      </div>

      {/* Visual Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Activity Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-brand-500" />
            Weekly Learning Activity (Minutes)
          </h3>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(37, 99, 235, 0.03)' }}
                  contentStyle={{ background: '#0f172a', borderRadius: '8px', border: '0', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="mins" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Growth Line Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-brand-500" />
            Skill Growth Rate (%)
          </h3>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={skillGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', borderRadius: '8px', border: '0', color: '#fff', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
