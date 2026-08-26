import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Eye, Volume2, ShieldCheck, Sun, Moon, Info, HelpCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');

  // Account Settings state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);

  // Dark Mode
  const [darkMode, setDarkMode] = useState(false);

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const tabs = [
    { id: 'account', label: 'Account Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'help', label: 'Help & FAQ', icon: HelpCircle },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 fade-in">
      
      {/* --- LEFT SIDE NAVIGATION TABS --- */}
      <aside className="w-full md:w-56 space-y-1 shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-premium'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {tab.label}
            </button>
          );
        })}
      </aside>

      {/* --- RIGHT DETAILED PANEL --- */}
      <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-h-[320px]">
        
        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Update Password</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Change your account security password credentials.</p>
            </div>

            {passwordSuccess && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs font-semibold text-green-700">
                Password updated successfully!
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-brand-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-brand-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-premium transition-all"
              >
                Update Password
              </button>
            </form>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notification Preferences</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Toggle alert pathways for course triggers and daily tasks.</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Email Alerts</span>
                  <span className="text-[10px] text-slate-400">Receive system-generated course updates on email.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={streakReminders}
                  onChange={(e) => setStreakReminders(e.target.checked)}
                  className="rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Streak Reminders</span>
                  <span className="text-[10px] text-slate-400">Remind me to complete my daily focus tasks to keep my streak active.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={achievementAlerts}
                  onChange={(e) => setAchievementAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Achievement Badges</span>
                  <span className="text-[10px] text-slate-400">Notify me immediately upon mastering new skill sets.</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* APPEARANCE TAB */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">UI Themes</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Toggle light and dark mode styles for your workspace dashboard.</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={toggleTheme}
                className={`flex-1 p-5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                  !darkMode 
                    ? 'border-brand-500 bg-brand-50/30 text-brand-600 font-bold' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                }`}
              >
                <Sun className="h-6 w-6" />
                <span className="text-xs">Light Mode</span>
              </button>

              <button
                onClick={toggleTheme}
                className={`flex-1 p-5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                  darkMode 
                    ? 'border-brand-500 bg-brand-50/30 text-brand-600 font-bold' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                }`}
              >
                <Moon className="h-6 w-6" />
                <span className="text-xs">Dark Mode</span>
              </button>
            </div>
          </div>
        )}

        {/* HELP & FAQ TAB */}
        {activeTab === 'help' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Frequently Asked Questions</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Find answers to common support queries.</p>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <details className="p-3 border border-slate-100 rounded-xl bg-slate-50/30 cursor-pointer">
                <summary className="font-bold text-slate-800">How does AI Path Adaptation work?</summary>
                <p className="mt-2 text-slate-500 pl-1">
                  When you submit assessments, the grading engine evaluates your answers. If score drops below 60% on specific topics, the system flags a skill gap and locks next phases, adding revision modules. Scores above 85% unlock modules and offer advanced options.
                </p>
              </details>

              <details className="p-3 border border-slate-100 rounded-xl bg-slate-50/30 cursor-pointer">
                <summary className="font-bold text-slate-800">Can I reset my learning roadmap?</summary>
                <p className="mt-2 text-slate-500 pl-1">
                  Yes, navigate to the **Learning Path** page and click **Regenerate Roadmap** at the top right to start a fresh curriculum outline.
                </p>
              </details>

              <details className="p-3 border border-slate-100 rounded-xl bg-slate-50/30 cursor-pointer">
                <summary className="font-bold text-slate-800">How do I keep my learning streak alive?</summary>
                <p className="mt-2 text-slate-500 pl-1">
                  Simply check off at least one focus task in your **Today's Focus** widget checklist on the dashboard every 24 hours.
                </p>
              </details>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
