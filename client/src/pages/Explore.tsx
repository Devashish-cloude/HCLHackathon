import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, BookOpen, Star, Clock, BookmarkPlus, Sparkles, Check } from 'lucide-react';
import api from '../services/api';

export const Explore: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract initial search term from URL query if present
  const queryParams = new URLSearchParams(location.search);
  const urlSearch = queryParams.get('search') || '';

  const [courses, setCourses] = useState<any[]>([]);
  const [searchVal, setSearchVal] = useState(urlSearch);
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledSuccessCourse, setEnrolledSuccessCourse] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses`, {
        params: {
          search: searchVal || undefined,
          difficulty: difficultyFilter || undefined
        }
      });
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [searchVal, difficultyFilter]);

  // Synchronize URL search queries if they change
  useEffect(() => {
    const freshQuery = new URLSearchParams(location.search).get('search') || '';
    if (freshQuery !== searchVal) {
      setSearchVal(freshQuery);
    }
  }, [location.search]);

  const handleEnroll = async (courseId: string, courseTitle: string) => {
    try {
      const res = await api.post(`/courses/${courseId}/enroll`);
      if (res.data.success) {
        setEnrolledCourses(prev => [...prev, courseId]);
        // Redirect to course experience page
        navigate(`/courses/${courseId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 fade-in relative">
      {enrolledSuccessCourse && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <Check className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-green-800">Enrolled successfully!</h4>
            <p className="text-[10px] text-green-600 mt-0.5">"{enrolledSuccessCourse}" has been added to your dashboard and path.</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Explore Content</h1>
        <p className="text-slate-500 text-sm mt-1">Discover new courses, assessments, and learning resources.</p>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics (e.g. async, React)..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-500"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto shrink-0 pb-1">
          {['', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold shrink-0 transition-all ${
                difficultyFilter === diff
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {diff || 'All Levels'}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = enrolledCourses.includes(course.id);
            return (
              <div key={course.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                
                {/* Course Header Banner */}
                <div>
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                    <img 
                      src={course.imageUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=300"} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 right-2.5 bg-white/90 text-slate-800 text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur">
                      {course.difficulty}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</span>
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold">★ {course.rating}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{course.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                      {course.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {course.tags?.map((tag: string) => (
                        <span key={tag} className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer action button */}
                <div className="px-5 pb-5 pt-2">
                  <button
                    onClick={() => handleEnroll(course.id, course.title)}
                    disabled={isEnrolled}
                    className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                      isEnrolled 
                        ? 'bg-green-500 text-white cursor-default'
                        : 'border border-brand-200 bg-white text-brand-600 hover:bg-brand-50'
                    }`}
                  >
                    {isEnrolled ? (
                      <>
                        <Check className="h-4 w-4" />
                        Added to Path
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="h-4 w-4" />
                        Enroll / Add to Path
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}

          {courses.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400 text-xs font-semibold">
              No matching courses found. Try adjusting filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
