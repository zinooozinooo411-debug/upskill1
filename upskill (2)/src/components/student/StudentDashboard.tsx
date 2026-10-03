import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  FeedbackItem,
  GoalItem,
  GeneralObservation,
  GeneralGoal,
  ActivityItem,
  StudentDashboardData,
  RecognitionItem
} from '../../types';
import {
  Home,
  FileText,
  Target,
  Sparkles,
  Eye,
  Flag,
  Calendar,
  CheckCircle2,
  Clock,
  Circle,
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  TrendingUp,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { BrandLogo, UpskillMark } from '../common/BrandLogo';
import { UpskillGrowthTracker } from '../common/UpskillGrowthTracker';
import { StudentGrowthHeroIllustration } from '../common/illustrations/StudentGrowthHeroIllustration';
import {
  EmptyFeedbackIllustration,
  EmptyJourneyIllustration
} from '../common/illustrations/EmptyStatesIllustrations';

type StudentTab = 'overview' | 'feedback' | 'goals' | 'activities' | 'observations' | 'general-goals';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<StudentTab>('overview');

  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);
  const [allGoals, setAllGoals] = useState<GoalItem[]>([]);
  const [allObservations, setAllObservations] = useState<GeneralObservation[]>([]);
  const [allGeneralGoals, setAllGeneralGoals] = useState<GeneralGoal[]>([]);
  const [myRecognitions, setMyRecognitions] = useState<RecognitionItem[]>([]);
  const [allActivity, setAllActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Updating goal status state
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [goalFilter, setGoalFilter] = useState<'all' | 'in_progress' | 'not_started' | 'completed'>('all');

  useEffect(() => {
    loadAllStudentData();

    const handleAppNavigate = (e: any) => {
      const link = e.detail?.link;
      if (link === 'feedback') setActiveTab('feedback');
      else if (link === 'goals') setActiveTab('goals');
      else if (link === 'recognition' || link === 'activities') setActiveTab('activities');
      else if (link === 'observations') setActiveTab('observations');
    };

    window.addEventListener('app-navigate', handleAppNavigate);
    return () => window.removeEventListener('app-navigate', handleAppNavigate);
  }, [user?.id]);

  const loadAllStudentData = async () => {
    setLoading(true);
    try {
      const [dash, fb, g, obs, gg, act, recs] = await Promise.all([
        api.getStudentDashboard(),
        api.getStudentFeedback(),
        api.getStudentGoals(),
        api.getStudentObservations(),
        api.getStudentGeneralGoals(),
        api.getStudentActivity(),
        api.getStudentRecognitions()
      ]);
      setDashboardData(dash);
      setAllFeedback(fb);
      setAllGoals(g);
      setAllObservations(obs);
      setAllGeneralGoals(gg);
      setAllActivity(act);
      setMyRecognitions(recs || []);
    } catch (err) {
      console.error('Failed to load student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoalStatus = async (
    goalId: string,
    newStatus: 'not_started' | 'in_progress' | 'completed'
  ) => {
    setUpdatingGoalId(goalId);
    try {
      const res = await api.updateStudentGoalStatus(goalId, newStatus);
      setAllGoals(prev =>
        prev.map(g => (g.id === goalId ? { ...g, status: newStatus, completed_at: res.completed_at } : g))
      );
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          recentGoals: dashboardData.recentGoals.map(g =>
            g.id === goalId ? { ...g, status: newStatus, completed_at: res.completed_at } : g
          )
        });
      }
    } catch (err: any) {
      alert(`تعذر تحديث حالة الهدف: ${err?.message}`);
    } finally {
      setUpdatingGoalId(null);
    }
  };

  const renderStatusBadge = (status: 'not_started' | 'in_progress' | 'completed') => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#EDF4FC] text-[#0A4D92] border border-[#0A4D92]/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#0A4D92]" />
          <span>مكتمل ↗</span>
        </span>
      );
    }
    if (status === 'in_progress') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>قيد التقدم</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
        <Circle className="w-3.5 h-3.5 text-slate-400" />
        <span>لم يبدأ</span>
      </span>
    );
  };

  const filteredGoals = allGoals.filter(g => {
    if (goalFilter === 'all') return true;
    return g.status === goalFilter;
  });

  const latestFeedback = allFeedback.length > 0 ? allFeedback[0] : null;
  const recentGoals = allGoals.slice(0, 3);

  // Derive student focus topic
  const focusSubject = latestFeedback?.subject || 'الرياضيات والمواد الأساسية';
  const focusDetail =
    latestFeedback?.areas_to_improve && latestFeedback.areas_to_improve.length > 0
      ? latestFeedback.areas_to_improve[0]
      : 'تعمل على تطوير مهاراتك ومتابعة الملاحظات الأخيرة مع أساتذتك.';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#F8F9FA]">
      
      {/* 1. DESKTOP RIGHT SIDEBAR (Matching uploaded mockup) */}
      <aside className="hidden lg:flex w-64 bg-white border-l border-[#E2E5EA] p-6 flex-col justify-between shrink-0 select-none">
        <div className="space-y-6">
          
          {/* Brand Logo at Sidebar Top */}
          <div className="px-2 pt-1 pb-2">
            <BrandLogo size="md" showSubtitle={true} />
          </div>

          {/* Navigation Items with directional indicators */}
          <nav className="space-y-1.5 text-right font-bold text-xs sm:text-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#EDF4FC] text-[#0A4D92] font-black shadow-2xs'
                  : 'text-slate-600 hover:text-[#0C2340] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className={`w-4 h-4 ${activeTab === 'overview' ? 'text-[#0A4D92]' : 'text-slate-400'}`} />
                <span>لوحة التحكم</span>
              </div>
              {activeTab === 'overview' && (
                <span className="w-2 h-2 rounded-full bg-[#0A4D92]"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'feedback'
                  ? 'bg-[#EDF4FC] text-[#0A4D92] font-black shadow-2xs'
                  : 'text-slate-600 hover:text-[#0C2340] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className={`w-4 h-4 ${activeTab === 'feedback' ? 'text-[#0A4D92]' : 'text-slate-400'}`} />
                <span>ملاحظاتي</span>
              </div>
              {allFeedback.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                  {allFeedback.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'goals'
                  ? 'bg-[#EDF4FC] text-[#0A4D92] font-black shadow-2xs'
                  : 'text-slate-600 hover:text-[#0C2340] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Target className={`w-4 h-4 ${activeTab === 'goals' ? 'text-[#0A4D92]' : 'text-slate-400'}`} />
                <span>أهدافي</span>
              </div>
              {allGoals.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EDF4FC] text-[#0A4D92] font-bold font-mono">
                  {allGoals.filter(g => g.status !== 'completed').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('activities')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'activities'
                  ? 'bg-[#EDF4FC] text-[#0A4D92] font-black shadow-2xs'
                  : 'text-slate-600 hover:text-[#0C2340] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Award className={`w-4 h-4 ${activeTab === 'activities' ? 'text-[#0A4D92]' : 'text-slate-400'}`} />
                <span>التكريمات</span>
              </div>
              {myRecognitions.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono">
                  {myRecognitions.length}
                </span>
              )}
            </button>

            <div className="my-2 border-t border-[#E2E5EA]" />

            <button
              onClick={() => setActiveTab('observations')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'observations'
                  ? 'bg-[#EDF4FC] text-[#0A4D92] font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-4 h-4 text-[#0A4D92]" />
              <span>الملاحظات العامة</span>
            </button>

            <button
              onClick={() => setActiveTab('general-goals')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'general-goals'
                  ? 'bg-[#EDF4FC] text-[#0A4D92] font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Flag className="w-4 h-4 text-[#0A4D92]" />
              <span>الأهداف العامة</span>
            </button>
          </nav>
        </div>

        {/* Growth motivational footer */}
        <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5EA] text-right space-y-1.5">
          <div className="text-xs font-bold text-[#0A4D92] flex items-center gap-1.5">
            <UpskillMark size={16} />
            <span>كل خطوة صغيرة</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            تقربك من هدفك الكبير. استمر في المحاولة والتقدم.
          </p>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl text-right">
        
        {loading ? (
          <div className="py-24 text-center text-xs font-bold text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-3 border-[#0A4D92] border-t-transparent animate-spin" />
            <span>جاري تحميل لوحة نمو الطالب...</span>
          </div>
        ) : (
          <>
            {/* ======================================================== */}
            {/* TAB: OVERVIEW (Exact match to Mockup Image Top-Left) */}
            {/* ======================================================== */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* 1. HERO COMPOSITION (Matching Top-Left Mockup) */}
                <div className="bg-white rounded-3xl border border-[#E2E5EA] p-6 sm:p-8 shadow-xs overflow-hidden relative">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Character & Upward Growth Path Vector (Lg: 6 cols in RTL) */}
                    <div className="lg:col-span-6 order-2 lg:order-1 bg-[#F8F9FA] rounded-2xl border border-[#E2E5EA]/70 p-4 flex items-center justify-center overflow-hidden">
                      <StudentGrowthHeroIllustration className="w-full max-h-[300px]" />
                    </div>

                    {/* Editorial Greetings & Focus (Lg: 6 cols in RTL) */}
                    <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
                      
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#0C2340] tracking-tight">
                          مرحبًا، {user?.first_name || 'أحمد'}
                        </h1>
                        <h2 className="text-base sm:text-lg font-bold text-[#0A4D92] mt-1">
                          خطوتك القادمة تبدأ من هنا.
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                          راجع ملاحظاتك، اعمل على أهدافك، واستمر في التقدم.
                        </p>
                      </div>

                      {/* Current Focus Card */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F9FA] border border-[#E2E5EA] space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#0A4D92]">
                          <Compass className="w-4 h-4 text-[#0A4D92]" />
                          <span>تركيزك الحالي</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-[#0C2340]">
                          تحسين مهارات {focusSubject}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {focusDetail}
                        </p>
                        <div className="pt-1">
                          <button
                            onClick={() => setActiveTab('feedback')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A4D92] hover:text-[#0C2340] transition-colors cursor-pointer"
                          >
                            <span>عرض التفاصيل</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Motivational Quote Box */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 font-medium leading-relaxed italic flex items-start gap-2.5">
                        <span className="text-lg text-[#0A4D92] font-black shrink-0 leading-none">“</span>
                        <p className="pt-0.5">
                          ليس عليك أن تكون الأفضل، الآن.. كل ما عليك هو أن تكون أفضل من أمس.
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

                {/* 2. LOWER SECTION: TWO-COLUMN EDITORIAL (Matching Mockup) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* RECENT FEEDBACK (Right side in RTL, Lg: 6 cols) */}
                  <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E2E5EA] shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E2E5EA] pb-3">
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-[#0C2340]">
                          ملاحظاتك الأخيرة
                        </h2>
                        <span className="text-[11px] text-slate-400">توجيهات أساتذتك لتحسين الأداء</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('feedback')}
                        className="text-xs font-bold text-[#0A4D92] hover:text-[#0C2340] flex items-center gap-1 cursor-pointer"
                      >
                        <span>عرض الكل</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>

                    {!latestFeedback ? (
                      <div className="py-8 text-center space-y-2">
                        <EmptyFeedbackIllustration />
                        <p className="text-xs font-bold text-[#0C2340]">لا توجد ملاحظات بعد</p>
                        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                          كل ملاحظة هي خطوة نحو التقدم. ستظهر هنا فور إضافتها.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5EA] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EDF4FC] text-[#0A4D92]">
                              في {latestFeedback.subject}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {new Date(latestFeedback.date || latestFeedback.created_at || Date.now()).toLocaleDateString('ar-EG')}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-bold text-[#0C2340] leading-relaxed">
                            {latestFeedback.areas_to_improve && latestFeedback.areas_to_improve.length > 0
                              ? latestFeedback.areas_to_improve[0]
                              : latestFeedback.strengths?.[0] || 'استمر في بذل الجهد والمشاركة الفعالة.'}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-[#E2E5EA]/80 text-xs">
                            <span className="text-slate-500 font-medium">الأستاذ: {latestFeedback.teacher}</span>
                            <button
                              onClick={() => setActiveTab('feedback')}
                              className="text-[#0A4D92] font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <span>التفاصيل</span>
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
                          <span>كل خطوة صغيرة تقربك من هدفك الكبير.</span>
                          <span className="text-[#0A4D92] font-bold">Upskill</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RECENT GOALS (Left side in RTL, Lg: 6 cols) */}
                  <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E2E5EA] shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E2E5EA] pb-3">
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-[#0C2340]">
                          أهدافك
                        </h2>
                        <span className="text-[11px] text-slate-400">خطوات عملية محددة للنمو</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('goals')}
                        className="text-xs font-bold text-[#0A4D92] hover:text-[#0C2340] flex items-center gap-1 cursor-pointer"
                      >
                        <span>عرض الكل</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>

                    {recentGoals.length === 0 ? (
                      <div className="py-8 text-center space-y-2">
                        <EmptyJourneyIllustration />
                        <p className="text-xs font-bold text-[#0C2340]">لم تبدأ رحلتك هنا بعد</p>
                        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                          عندما يحدد لك المعلم هدفًا، سيظهر هنا لتبدأ بالعمل عليه.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentGoals.map(goal => (
                          <div
                            key={goal.id}
                            className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5EA] hover:border-[#0A4D92]/40 transition-all flex items-center justify-between gap-3"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <h3 className="text-xs sm:text-sm font-bold text-[#0C2340] truncate">
                                {goal.title}
                              </h3>
                              {goal.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                                  {goal.description}
                                </p>
                              )}
                            </div>

                            <div className="shrink-0">
                              <button
                                type="button"
                                disabled={updatingGoalId === goal.id}
                                onClick={() => {
                                  const nextStatus =
                                    goal.status === 'not_started'
                                      ? 'in_progress'
                                      : goal.status === 'in_progress'
                                        ? 'completed'
                                        : 'not_started';
                                  handleUpdateGoalStatus(goal.id, nextStatus);
                                }}
                                title="انقر لتحديث حالة الهدف"
                                className="transition-transform active:scale-95 cursor-pointer"
                              >
                                {renderStatusBadge(goal.status)}
                              </button>
                            </div>
                          </div>
                        ))}

                        <div className="pt-2">
                          <UpskillGrowthTracker goals={allGoals} />
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: MY FEEDBACK (ملاحظاتي الكاملة) */}
            {/* ======================================================== */}
            {activeTab === 'feedback' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E5EA] shadow-xs space-y-6">
                <div className="border-b border-[#E2E5EA] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-black text-[#0C2340]">ملاحظاتي التربوية</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      توجيهات خاصة موجهة لك شخصياً لمساعدتك على التقدم المستمر.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="text-xs font-bold text-[#0A4D92] hover:text-[#0C2340] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                  >
                    <span>العودة للرئيسية</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {allFeedback.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <EmptyFeedbackIllustration />
                    <p className="text-sm font-bold text-[#0C2340]">لا توجد ملاحظات بعد</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      كل ملاحظة فرصة للتحسن. ستظهر ملاحظات أساتذتك هنا فور إضافتها.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {allFeedback.map(fb => (
                      <div
                        key={fb.id}
                        className="p-6 rounded-3xl bg-[#F8F9FA] border border-[#E2E5EA] space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E5EA] pb-3 gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#EDF4FC] text-[#0A4D92]">
                              {fb.subject}
                            </span>
                            {fb.category && (
                              <span className="text-xs text-slate-500 font-medium">
                                · {fb.category}
                              </span>
                            )}
                            <span className="text-xs font-bold text-[#0C2340]">
                              الأستاذ: {fb.teacher}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">
                            {new Date(fb.date || fb.created_at || Date.now()).toLocaleDateString('ar-EG')}
                          </span>
                        </div>

                        {/* Editorial Strengths */}
                        {fb.strengths && fb.strengths.length > 0 && (
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>نقاط القوة:</span>
                            </div>
                            <ul className="pr-5 space-y-1 text-slate-700 leading-relaxed">
                              {fb.strengths.map((str, idx) => (
                                <li key={idx} className="list-disc list-inside">
                                  {str}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Editorial Improvements */}
                        {fb.areas_to_improve && fb.areas_to_improve.length > 0 && (
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-[#0A4D92]">
                              <TrendingUp className="w-4 h-4 text-[#0A4D92] shrink-0" />
                              <span>ما يحتاج إلى تحسين:</span>
                            </div>
                            <ul className="pr-5 space-y-1 text-slate-700 leading-relaxed">
                              {fb.areas_to_improve.map((area, idx) => (
                                <li key={idx} className="list-disc list-inside">
                                  {area}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Personal Comment */}
                        {fb.personal_comment && (
                          <div className="p-4 bg-white border border-[#E2E5EA] rounded-2xl text-xs space-y-1">
                            <div className="font-bold text-[#0A4D92] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#0A4D92]" />
                              <span>توجيه الأستاذ:</span>
                            </div>
                            <p className="text-slate-800 italic leading-relaxed">
                              "{fb.personal_comment}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: MY GOALS (أهدافي الكاملة) */}
            {/* ======================================================== */}
            {activeTab === 'goals' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E5EA] shadow-xs space-y-6">
                <div className="border-b border-[#E2E5EA] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-[#0C2340]">أهدافي التطويرية</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      خطوات عملية محددة. يمكنك تحديث حالتها مباشرة كلما أحرزت تقدماً.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-2xl border border-[#E2E5EA] self-start sm:self-auto text-xs font-bold">
                    <button
                      onClick={() => setGoalFilter('all')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        goalFilter === 'all' ? 'bg-[#0A4D92] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      الكل ({allGoals.length})
                    </button>
                    <button
                      onClick={() => setGoalFilter('in_progress')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        goalFilter === 'in_progress' ? 'bg-[#0A4D92] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      قيد التقدم
                    </button>
                    <button
                      onClick={() => setGoalFilter('completed')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        goalFilter === 'completed' ? 'bg-[#0A4D92] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      مكتمل
                    </button>
                  </div>
                </div>

                {filteredGoals.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <EmptyJourneyIllustration />
                    <p className="text-sm font-bold text-[#0C2340]">لا توجد أهداف مطابقة</p>
                    <p className="text-xs text-slate-400">ستظهر أهدافك التطويرية هنا فور تحديدها.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredGoals.map(goal => (
                      <div
                        key={goal.id}
                        className="p-5 rounded-3xl bg-[#F8F9FA] border border-[#E2E5EA] flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-bold text-[#0C2340]">
                              {goal.title}
                            </h3>
                            {renderStatusBadge(goal.status)}
                          </div>
                          {goal.description && (
                            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                              {goal.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
                            <span>بواسطة: {goal.created_by || 'الأستاذ'}</span>
                            {goal.deadline && <span>الموعد المستهدف: {goal.deadline}</span>}
                          </div>
                        </div>

                        {/* Interactive toggle buttons */}
                        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#E2E5EA] shrink-0">
                          <button
                            type="button"
                            disabled={updatingGoalId === goal.id}
                            onClick={() => handleUpdateGoalStatus(goal.id, 'not_started')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                              goal.status === 'not_started'
                                ? 'bg-slate-700 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            لم يبدأ
                          </button>
                          <button
                            type="button"
                            disabled={updatingGoalId === goal.id}
                            onClick={() => handleUpdateGoalStatus(goal.id, 'in_progress')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                              goal.status === 'in_progress'
                                ? 'bg-[#0A4D92] text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            قيد التقدم
                          </button>
                          <button
                            type="button"
                            disabled={updatingGoalId === goal.id}
                            onClick={() => handleUpdateGoalStatus(goal.id, 'completed')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                              goal.status === 'completed'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            مكتمل ↗
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: ACTIVITIES & RECOGNITION (التكريمات) */}
            {/* ======================================================== */}
            {activeTab === 'activities' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E5EA] shadow-xs space-y-5">
                  <div className="border-b border-[#E2E5EA] pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-[#0C2340] flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span>التقدير والتميز الإيجابي</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        تكريمات وتقديرات يمنحها الأساتذة للطلاب المتميزين في الجهد والمواظبة والتطور.
                      </p>
                    </div>
                  </div>

                  {myRecognitions.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      لا توجد تكريمات مسجلة بعد. استمر في العمل على أهدافك والمواظبة في القسم.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myRecognitions.map(rec => (
                        <div
                          key={rec.id}
                          className="p-5 rounded-3xl bg-[#F8F9FA] border border-[#E2E5EA] space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-900">
                              {rec.category || 'تكريم إيجابي'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(rec.created_at).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed font-medium">
                            "{rec.reason}"
                          </p>
                          <div className="text-[10px] text-[#0A4D92] font-bold pt-2 border-t border-[#E2E5EA]">
                            ممنوح من: {rec.teacher_first_name ? `${rec.teacher_first_name} ${rec.teacher_last_name}` : 'الأستاذ'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E5EA] shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-[#0C2340] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0A4D92]" />
                    <span>سجل النشاطات الكامل</span>
                  </h3>
                  <div className="divide-y divide-[#E2E5EA]">
                    {allActivity.map((act, i) => (
                      <div key={i} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-[#0A4D92]" />
                          <span className="text-xs font-bold text-slate-800">{act.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(act.date).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: GENERAL OBSERVATIONS (الملاحظات العامة) */}
            {/* ======================================================== */}
            {activeTab === 'observations' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E5EA] shadow-xs space-y-6">
                <div className="border-b border-[#E2E5EA] pb-4">
                  <h2 className="text-xl font-black text-[#0C2340]">الملاحظات العامة للمجموعة</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    توجيهات جماعية يقدمها الأساتذة لكافة طلاب الصف بشكل عام ومجرد دون ذكر أي أسماء.
                  </p>
                </div>

                {allObservations.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    لا توجد ملاحظات عامة بعد.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allObservations.map(obs => (
                      <div
                        key={obs.id}
                        className="p-5 rounded-3xl bg-[#F8F9FA] border border-[#E2E5EA] space-y-3 flex flex-col justify-between"
                      >
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          "{obs.observation}"
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-[#0A4D92] pt-2 border-t border-[#E2E5EA]">
                          <span className="font-bold">{obs.subject || 'ملاحظة عامة'} · {obs.teacher || 'الأستاذ'}</span>
                          <span className="font-mono text-slate-400">{new Date(obs.created_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: GENERAL GOALS (الأهداف العامة) */}
            {/* ======================================================== */}
            {activeTab === 'general-goals' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E5EA] shadow-xs space-y-6">
                <div className="border-b border-[#E2E5EA] pb-4">
                  <h2 className="text-xl font-black text-[#0C2340]">الأهداف العامة للمجموعة</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    أهداف وتحديات مشتركة وضعها الأساتذة لتحفيز روح التعلم والمراجعة الجماعية.
                  </p>
                </div>

                {allGeneralGoals.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    لا توجد أهداف عامة مسجلة بعد.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allGeneralGoals.map(gg => (
                      <div
                        key={gg.id}
                        className="p-5 rounded-3xl bg-[#F8F9FA] border border-[#E2E5EA] space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-[#0C2340]">{gg.title}</h3>
                          {gg.description && (
                            <p className="text-xs text-slate-600 leading-relaxed">{gg.description}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#0A4D92] pt-2 border-t border-[#E2E5EA] font-mono">
                          <span>بواسطة: {gg.created_by || gg.teacher || 'الأستاذ'}</span>
                          {gg.deadline && <span>الموعد: {gg.deadline}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION (Matching Mockup Phone Screen) */}
      <nav className="lg:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E5EA] py-2.5 px-3 flex items-center justify-around text-center shadow-lg select-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'text-[#0A4D92] font-black'
              : 'text-slate-400 hover:text-slate-700 font-semibold'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'overview' ? 'text-[#0A4D92]' : ''}`} />
          <span className="text-[10px]">الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'feedback'
              ? 'text-[#0A4D92] font-black'
              : 'text-slate-400 hover:text-slate-700 font-semibold'
          }`}
        >
          <FileText className={`w-5 h-5 ${activeTab === 'feedback' ? 'text-[#0A4D92]' : ''}`} />
          <span className="text-[10px]">ملاحظاتي</span>
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'goals'
              ? 'text-[#0A4D92] font-black'
              : 'text-slate-400 hover:text-slate-700 font-semibold'
          }`}
        >
          <Target className={`w-5 h-5 ${activeTab === 'goals' ? 'text-[#0A4D92]' : ''}`} />
          <span className="text-[10px]">أهدافي</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'activities'
              ? 'text-[#0A4D92] font-black'
              : 'text-slate-400 hover:text-slate-700 font-semibold'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${activeTab === 'activities' ? 'text-[#0A4D92]' : ''}`} />
          <span className="text-[10px]">النشاطات</span>
        </button>
      </nav>

    </div>
  );
};
