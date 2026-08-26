import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Map, 
  BarChart3, 
  MessageSquare, 
  Compass, 
  TrendingUp, 
  Settings, 
  HelpCircle, 
  PlusCircle, 
  Bell, 
  LogOut, 
  Search, 
  Menu, 
  X,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch live notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const markNotificationRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Learning Path', path: '/learning-path', icon: Map },
    { name: 'Skill Analysis', path: '/skill-analysis', icon: BarChart3 },
    { name: 'AI Mentor', path: '/ai-mentor', icon: MessageSquare },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white px-5 py-6 md:flex">
        {/* Branding Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 font-bold text-white shadow-premium">
            L
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-none text-lg">LearnPath AI</h1>
            <span className="text-xs text-slate-400 font-medium">Professional Learner</span>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-50 text-brand-600 shadow-[inset_3px_0_0_#2563eb]' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions and Account Details */}
        <div className="mt-auto space-y-4 pt-6 border-t border-slate-100">
          <button
            onClick={() => navigate('/assessments')}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-premium hover:bg-brand-600 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            New Assessment
          </button>

          <div className="space-y-1">
            <Link
              to="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Settings className="h-5 w-5 text-slate-400" />
              Settings
            </Link>
            <Link
              to="/settings?tab=help"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <HelpCircle className="h-5 w-5 text-slate-400" />
              Help
            </Link>
          </div>

          {/* User profile capsule at sidebar bottom */}
          <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="truncate text-xs font-semibold text-slate-900">{user?.name || 'User'}</h4>
              <p className="truncate text-[10px] text-slate-400">Professional Learner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MOBILE DRAWERN NAVIGATION --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          
          <aside className="relative flex w-64 flex-col bg-white p-5 shadow-2xl">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mb-8 flex items-center gap-3 mt-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 font-bold text-white shadow-premium">
                L
              </div>
              <h1 className="font-bold text-slate-900 text-lg">LearnPath AI</h1>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive 
                        ? 'bg-brand-50 text-brand-600' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-4 border-t border-slate-100 pt-4">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/assessments'); }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-premium"
              >
                <PlusCircle className="h-4 w-4" />
                New Assessment
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* --- MAIN PAGE CONTENT --- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* --- TOPBAR --- */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8 shadow-sm">
          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-72 md:w-96 max-w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search courses, skills, or mentors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </form>

          {/* Notification bell and Avatar menu */}
          <div className="flex items-center gap-4 relative">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileDropdownOpen(false); }}
                className="relative rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <Bell className="h-5.5 w-5.5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>

              {/* Notifications Dropdown Card */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3.5 z-40 w-80 rounded-xl border border-slate-200 bg-white shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-950 text-sm">Notifications</h3>
                    {unreadCount > 0 && <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-slate-400">No new notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => { markNotificationRead(n.id); }}
                          className={`px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex gap-3 border-b border-slate-50 last:border-0 ${!n.read ? 'bg-brand-50/20' : ''}`}
                        >
                          <div className={`mt-0.5 rounded-full p-1 h-fit ${!n.read ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-900">{n.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setProfileDropdownOpen(!profileDropdownOpen); setNotificationsOpen(false); }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 hover:ring-2 hover:ring-brand-200 transition-all"
              >
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3.5 z-40 w-48 rounded-xl border border-slate-200 bg-white shadow-xl py-1 animate-in fade-in duration-200">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    My Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Settings
                  </Link>
                  <button 
                    onClick={() => { setProfileDropdownOpen(false); logout(); navigate('/login'); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 border-t border-slate-100"
                  >
                    <LogOut className="h-4 w-4 text-red-400" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- DYNAMIC CHILD ROUTE RENDER --- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
