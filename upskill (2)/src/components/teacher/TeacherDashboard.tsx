import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  TeacherDashboardData,
  TeacherStudentItem,
  TeacherStudentProfile,
  FeedbackItem,
  GoalItem,
  TeacherSuggestion,
  FeedbackCategory,
  SuggestionCategory,
  GeneralObservation,
  GeneralGoal,
  RecognitionItem
} from '../../types';
import {
  Home,
  Users,
  FileText,
  Lightbulb,
  Award,
  Target,
  Plus,
  Search,
  Check,
  CheckCircle2,
  Calendar,
  Eye,
  Trash2,
  Edit3,
  X,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Compass,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { BrandLogo, UpskillMark } from '../common/BrandLogo';
import { TeacherHeroIllustration } from '../common/illustrations/TeacherHeroIllustration';
import { EmptyStudentsIllustration } from '../common/illustrations/EmptyStatesIllustrations';

type TeacherTab =
  | 'students'
  | 'feedback'
  | 'suggestions'
  | 'recognition'
  | 'goals'
  | 'observations';

const PRESET_STRENGTHS = [
  'فهم جيد للمفاهيم الأساسية',
  'مشاركة فعالة في الحصص',
  'التزام بالمواعيد والواجبات',
  'يعمل بتعاون مع زملائه',
  'يطور تحسناً ملحوظاً في التحليل',
  'يشرح أفكاره وخطوات حله بوضوح',
  'يطرح أسئلة ذكية وهادفة',
  'يبذل جهداً متميزاً ومستمراً'
];

const PRESET_IMPROVEMENTS = [
  'حل التمارين بشكل أسرع',
  'مراجعة القواعد والعمليات الأساسية',
  'تقليل الأخطاء في العمليات الحسابية',
  'تنظيم خطوات الحل في أسطر واضحة',
  'مراجعة العمل والحلول قبل التسليم',
  'المشاركة والتفاعل أكثر أثناء المناقشات',
  'طرح الأسئلة فوراً عند عدم وضوح الفكرة',
  'إدارة الوقت بفعالية أثناء الاختبارات'
];

const RECOGNITION_CATEGORIES = [
  'التحصيل الأكاديمي',
  'التطور والتحسن المستمر',
  'المشاركة والتفاعل الصفي',
  'بذل الجهد والمثابرة',
  'التعاون وروح الفريق',
  'جودة المشاريع والتطبيقات',
  'مساعدة الزملاء والتوجيه',
  'المواظبة والانضباط'
];

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TeacherTab>('students');

  // Data states
  const [dashData, setDashData] = useState<TeacherDashboardData | null>(null);
  const [students, setStudents] = useState<TeacherStudentItem[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<TeacherStudentProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [suggestions, setSuggestions] = useState<TeacherSuggestion[]>([]);
  const [observations, setObservations] = useState<GeneralObservation[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [recognitions, setRecognitions] = useState<RecognitionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Structured Feedback Drawer / Modal (Matching Mockup "ملاحظات المعلم")
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [modalStudent, setModalStudent] = useState<TeacherStudentItem | null>(null);
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>([]);
  const [nextActionInput, setNextActionInput] = useState('');
  const [personalAdvice, setPersonalAdvice] = useState('');
  const [customStrengthInput, setCustomStrengthInput] = useState('');
  const [customImprovementInput, setCustomImprovementInput] = useState('');
  const [wantsGoal, setWantsGoal] = useState(true);
  const [goalDeadline, setGoalDeadline] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Suggestions Library State
  const [newSugCategory, setNewSugCategory] = useState<SuggestionCategory>('Strengths');
  const [newSugText, setNewSugText] = useState('');
  const [sugSearch, setSugSearch] = useState('');

  // General Observation state
  const [newObsText, setNewObsText] = useState('');
  const [newObsCategory, setNewObsCategory] = useState<FeedbackCategory>('Study Habits');

  // Recognition state (Highlight 3-5 students)
  const [showRecognitionModal, setShowRecognitionModal] = useState(false);
  const [recStudentIds, setRecStudentIds] = useState<string[]>([]);
  const [recCategory, setRecCategory] = useState<string>('التحصيل الأكاديمي');
  const [recReason, setRecReason] = useState<string>('');
  const [submittingRec, setSubmittingRec] = useState(false);

  useEffect(() => {
    loadAllTeacherData();
  }, [user?.id]);

  const loadAllTeacherData = async () => {
    setLoading(true);
    try {
      const [dash, stud, sug, obs, g, recs] = await Promise.all([
        api.getTeacherDashboard(),
        api.getTeacherStudents(),
        api.getTeacherSuggestions(),
        api.getTeacherGeneralObservations(),
        api.getTeacherGoals(),
        api.getTeacherRecognitions()
      ]);
      setDashData(dash);
      setStudents(stud);
      setSuggestions(sug);
      setObservations(obs);
      setGoals(g);
      setRecognitions(recs);
    } catch (err) {
      console.error('Failed to load teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openFeedbackForStudent = (student: TeacherStudentItem) => {
    setModalStudent(student);
    setSelectedStrengths(['فهم جيد للمفاهيم الأساسية', 'مشاركة فعالة في الحصص']);
    setSelectedImprovements(['حل التمارين بشكل أسرع']);
    setNextActionInput(`حل 3 تمارين إضافية في ${user?.subject || 'المادة'}`);
    setPersonalAdvice('');
    setCustomStrengthInput('');
    setCustomImprovementInput('');
    setWantsGoal(true);
    setGoalDeadline('');
    setShowFeedbackModal(true);
  };

  const toggleStrength = (strength: string) => {
    if (selectedStrengths.includes(strength)) {
      setSelectedStrengths(selectedStrengths.filter(s => s !== strength));
    } else {
      setSelectedStrengths([...selectedStrengths, strength]);
    }
  };

  const toggleImprovement = (imp: string) => {
    if (selectedImprovements.includes(imp)) {
      setSelectedImprovements(selectedImprovements.filter(i => i !== imp));
    } else {
      setSelectedImprovements([...selectedImprovements, imp]);
      if (!nextActionInput) {
        setNextActionInput(`مراجعة وتطبيق: ${imp}`);
      }
    }
  };

  const handleSubmitFeedback = async () => {
    if (!modalStudent) return;
    if (selectedStrengths.length === 0 && !customStrengthInput.trim()) {
      alert('يرجى تحديد نقطة قوة واحدة على الأقل.');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const allStr = [...selectedStrengths];
      if (customStrengthInput.trim()) allStr.push(customStrengthInput.trim());

      const allImp = [...selectedImprovements];
      if (customImprovementInput.trim()) allImp.push(customImprovementInput.trim());

      await api.giveTeacherFeedback({
        student_id: modalStudent.id,
        subject: user?.subject || 'الرياضيات',
        category: 'الفهم والمشاركة',
        strengths: allStr,
        areas_to_improve: allImp,
        personal_comment: personalAdvice.trim() || undefined,
        create_goal: wantsGoal && nextActionInput.trim() ? {
          title: nextActionInput.trim(),
          description: allImp.length > 0 ? `العمل على: ${allImp.join('، ')}` : undefined,
          deadline: goalDeadline.trim() || undefined
        } : undefined
      });

      setShowFeedbackModal(false);
      loadAllTeacherData();
    } catch (err: any) {
      alert(`حدث خطأ أثناء إرسال الملاحظة: ${err?.message}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSubmitRecognition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recStudentIds.length === 0 || !recReason.trim()) {
      alert('يرجى اختيار طالب واحد على الأقل وكتابة سبب التقدير.');
      return;
    }
    setSubmittingRec(true);
    try {
      await api.awardTeacherRecognition({
        student_ids: recStudentIds,
        category: recCategory,
        reason: recReason.trim()
      });
      setShowRecognitionModal(false);
      setRecStudentIds([]);
      setRecReason('');
      loadAllTeacherData();
    } catch (err: any) {
      alert(`تعذر إضافة التقدير: ${err?.message}`);
    } finally {
      setSubmittingRec(false);
    }
  };

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObsText.trim()) return;
    try {
      await api.addTeacherGeneralObservation({
        category: newObsCategory,
        subject: user?.subject || 'الرياضيات',
        observation: newObsText.trim()
      });
      setNewObsText('');
      loadAllTeacherData();
    } catch (err: any) {
      alert(`تعذر مشاركة الملاحظة: ${err?.message}`);
    }
  };

  const handleAddSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSugText.trim()) return;
    try {
      await api.addTeacherSuggestion(newSugCategory, newSugText.trim());
      setNewSugText('');
      loadAllTeacherData();
    } catch (err: any) {
      alert(`تعذر حفظ الاقتراح: ${err?.message}`);
    }
  };

  const filteredStudents = students.filter(s => {
    const q = studentSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#F8F9FA] select-none text-right">
      
      {/* 1. DESKTOP RIGHT SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-white border-l border-[#E2E5EA] p-6 flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="px-2 pt-1 pb-2">
            <BrandLogo size="md" showSubtitle={true} />
          </div>

          <nav className="space-y-1.5 text-right font-bold text-xs sm:text-sm">
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-[#EDF4FC] text-[#0A4D92] font-black shadow-2xs'
                  : 'text-slate-600 hover:text-[#0C2340] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className={`w-4 h-4 ${activeTab === 'students' ? 'text-[#0A4D92]' : 'text-slate-400'}`} />
                <span>قائمة الطلاب</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                {students.length}
              </span>
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
                <span>الملاحظات</span>
              </div>
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
                <span>الأهداف</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                {goals.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('recognition')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'recognition'
                  ? 'bg-[#EDF4FC] text-[#0A4D92] font-black shadow-2xs'
                  : 'text-slate-600 hover:text-[#0C2340] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Award className={`w-4 h-4 ${activeTab === 'recognition' ? 'text-[#0A4D92]' : 'text-slate-400'}`} />
                <span>التميز والتقدير</span>
              </div>
              {recognitions.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono">
                  {recognitions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('suggestions')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'suggestions'
                  ? 'bg-[#EDF4FC] text-[#0A4D92] font-black shadow-2xs'
                  : 'text-slate-600 hover:text-[#0C2340] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Lightbulb className={`w-4 h-4 ${activeTab === 'suggestions' ? 'text-[#0A4D92]' : 'text-slate-400'}`} />
                <span>اقتراحاتي</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EDF4FC] text-[#0A4D92] font-mono">
                {suggestions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('observations')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'observations'
                  ? 'bg-[#EDF4FC] text-[#0A4D92] font-black shadow-2xs'
                  : 'text-slate-600 hover:text-[#0C2340] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Eye className={`w-4 h-4 ${activeTab === 'observations' ? 'text-[#0A4D92]' : 'text-slate-400'}`} />
                <span>الملاحظات العامة</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5EA] text-right space-y-1">
          <div className="text-xs font-bold text-[#0A4D92] flex items-center gap-1.5">
            <UpskillMark size={16} />
            <span>توجيه نحو التقدم</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            لا تكتفِ بالتقييم؛ وجّه طلابك إلى خطوتهم العملية التالية.
          </p>
        </div>
      </aside>

      {/* 2. MAIN TEACHER CONTENT */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">
        
        {loading ? (
          <div className="py-24 text-center text-xs font-bold text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-3 border-[#0A4D92] border-t-transparent animate-spin" />
            <span>جاري تحميل لوحة المعلم...</span>
          </div>
        ) : (
          <>
            {/* TAB: STUDENTS LIST (Matching Mockup Image Bottom-Middle) */}
            {activeTab === 'students' && (
              <div className="space-y-6">
                
                {/* HERO COMPOSITION (Matching Bottom-Middle Mockup) */}
                <div className="bg-white rounded-3xl border border-[#E2E5EA] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                  
                  <div className="space-y-2 z-10">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0C2340] tracking-tight">
                      مرحبًا، {user?.first_name ? `أستاذ ${user.first_name}` : 'أستاذة سارة'}
                    </h1>
                    <h2 className="text-base font-bold text-[#0A4D92]">
                      ساعد طلابك على التقدم.
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md">
                      اختر طالبًا وابدأ من ملاحظته الأخيرة لوضع خطة تطويرية محددة.
                    </p>
                  </div>

                  {/* Teacher & Students Collaboration Illustration */}
                  <div className="shrink-0 flex items-center justify-end">
                    <TeacherHeroIllustration className="w-64 sm:w-80" />
                  </div>

                </div>

                {/* STUDENTS ROSTER TABLE (Matching Bottom-Middle Mockup) */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E5EA] shadow-xs space-y-5">
                  
                  {/* Table Header & Search */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E5EA] pb-4">
                    <div>
                      <h2 className="text-xl font-black text-[#0C2340]">الطلاب</h2>
                      <span className="text-xs text-slate-400">متابعة الأداء وإرسال الملاحظات</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Search */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={studentSearch}
                          onChange={e => setStudentSearch(e.target.value)}
                          placeholder="ابحث عن طالب..."
                          className="w-full pr-10 pl-3.5 py-2 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs sm:text-sm text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Students Table */}
                  <div className="rounded-2xl border border-[#E2E5EA] overflow-hidden">
                    {filteredStudents.length === 0 ? (
                      <div className="py-16 text-center space-y-2">
                        <EmptyStudentsIllustration />
                        <p className="text-xs font-bold text-[#0C2340]">
                          {students.length === 0 ? 'لم يتم إضافة طلاب بعد' : 'لا يوجد طلاب مطابقون للبحث'}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="bg-[#F8F9FA] border-b border-[#E2E5EA] text-slate-600 font-bold">
                              <th className="py-3 px-4">الاسم</th>
                              <th className="py-3 px-4">التركيز الحالي</th>
                              <th className="py-3 px-4">آخر ملاحظة</th>
                              <th className="py-3 px-4">الهدف</th>
                              <th className="py-3 px-4 text-center">الإجراء</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E2E5EA]">
                            {filteredStudents.map((st, idx) => {
                              const hasFeedback = (st.feedback_count || 0) > 0;
                              const hasGoals = (st.active_goals_count || 0) > 0;
                              const focusSubject = user?.subject || (idx % 2 === 0 ? 'الرياضيات' : 'الفيزياء');

                              return (
                                <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                                  {/* Name */}
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-[#0A4D92] text-white font-bold text-xs flex items-center justify-center shrink-0">
                                        {st.first_name ? st.first_name.charAt(0) : 'ط'}
                                      </div>
                                      <div>
                                        <span className="font-bold text-[#0C2340] block">
                                          {st.first_name} {st.last_name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          @{st.username}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Focus */}
                                  <td className="py-3.5 px-4">
                                    <span className="font-semibold text-slate-700">
                                      {focusSubject}
                                    </span>
                                  </td>

                                  {/* Feedback Status */}
                                  <td className="py-3.5 px-4">
                                    {hasFeedback ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A4D92] bg-[#EDF4FC] px-2 py-0.5 rounded-md">
                                        <span>مسجلة ({st.feedback_count})</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                                        <span>جديد</span>
                                      </span>
                                    )}
                                  </td>

                                  {/* Goal Status */}
                                  <td className="py-3.5 px-4">
                                    {hasGoals ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A4D92]">
                                        <span className="w-2 h-2 rounded-full bg-[#0A4D92]" />
                                        <span>قيد التقدم</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                                        <span>لم يبدأ</span>
                                      </span>
                                    )}
                                  </td>

                                  {/* Action: متابعة / إضافة ملاحظة */}
                                  <td className="py-3.5 px-4 text-center">
                                    <button
                                      onClick={() => openFeedbackForStudent(st)}
                                      className="px-4 py-1.5 bg-[#0A4D92] hover:bg-[#08386B] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                                    >
                                      متابعة
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* TAB: RECOGNITION (الطلاب المتميزون) */}
            {activeTab === 'recognition' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E5EA] shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E5EA] pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#0C2340]">الطلاب المتميزون والتقدير</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      تسليط الضوء على الطلاب المتميزين وتكريم جهدهم ومواظبتهم.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRecognitionModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A4D92] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة تميز جديد</span>
                  </button>
                </div>

                {recognitions.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    لا توجد تكريمات مسجلة بعد.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recognitions.map(rec => (
                      <div
                        key={rec.id}
                        className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#E2E5EA] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#0A4D92] text-xs">
                            {rec.student_first_name} {rec.student_last_name}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          "{rec.reason}"
                        </p>
                        <span className="text-[10px] text-slate-400 block pt-1 font-mono">
                          {new Date(rec.created_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: FEEDBACK HISTORY */}
            {activeTab === 'feedback' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E5EA] shadow-xs space-y-6">
                <div className="border-b border-[#E2E5EA] pb-4">
                  <h2 className="text-xl font-black text-[#0C2340]">سجل الملاحظات المرسلة</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    كافة التوجيهات التي تم إرسالها للطلاب من قبلك.
                  </p>
                </div>

                {!dashData?.recentFeedback || dashData.recentFeedback.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    لا توجد ملاحظات مرسلة بعد. اختر طالبًا من قائمة الطلاب للبدء.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashData.recentFeedback.map(fb => (
                      <div
                        key={fb.id}
                        className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#E2E5EA] space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-[#E2E5EA] pb-2">
                          <span className="font-bold text-[#0C2340]">
                            الطالب: {fb.student_first_name} {fb.student_last_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(fb.created_at || Date.now()).toLocaleDateString('ar-EG')}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {fb.strengths && (
                            <div className="text-emerald-800">
                              <strong>نقاط القوة:</strong> {Array.isArray(fb.strengths) ? fb.strengths.join('، ') : fb.strengths}
                            </div>
                          )}
                          {fb.areas_to_improve && (
                            <div className="text-[#0A4D92]">
                              <strong>يحتاج إلى تحسين:</strong> {Array.isArray(fb.areas_to_improve) ? fb.areas_to_improve.join('، ') : fb.areas_to_improve}
                            </div>
                          )}
                          {fb.personal_comment && (
                            <div className="p-3 bg-white border border-[#E2E5EA] rounded-xl text-slate-700 italic">
                              "{fb.personal_comment}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: GOALS */}
            {activeTab === 'goals' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E5EA] shadow-xs space-y-6">
                <div className="border-b border-[#E2E5EA] pb-4">
                  <h2 className="text-xl font-black text-[#0C2340]">أهداف الطلاب المحددة</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    متابعة تحقيق الأهداف والتحديات الموكلة للطلاب.
                  </p>
                </div>

                {goals.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    لا توجد أهداف نشطة حالياً.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {goals.map(g => (
                      <div
                        key={g.id}
                        className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5EA] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <h3 className="font-bold text-[#0C2340]">{g.title}</h3>
                          {g.description && <p className="text-slate-500">{g.description}</p>}
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          g.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800'
                            : g.status === 'in_progress'
                              ? 'bg-amber-50 text-amber-900'
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {g.status === 'completed' ? 'مكتمل ↗' : g.status === 'in_progress' ? 'قيد التقدم' : 'لم يبدأ'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: OBSERVATIONS */}
            {activeTab === 'observations' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E5EA] shadow-xs space-y-6">
                <div className="border-b border-[#E2E5EA] pb-4">
                  <h2 className="text-xl font-black text-[#0C2340]">الملاحظات العامة للصف</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    توجيهات جماعية موجهة لجميع طلاب الصف.
                  </p>
                </div>

                <form onSubmit={handleAddObservation} className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5EA] space-y-3">
                  <label className="block text-xs font-bold text-[#0C2340]">إضافة ملاحظة عامة جديدة</label>
                  <textarea
                    rows={3}
                    required
                    value={newObsText}
                    onChange={e => setNewObsText(e.target.value)}
                    placeholder="اكتب ملاحظة عامة وتوجيهات لكافة الطلاب..."
                    className="w-full p-3 bg-white border border-[#E2E5EA] rounded-xl text-xs text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0A4D92] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      نشر الملاحظة
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {observations.map(obs => (
                    <div key={obs.id} className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5EA] text-xs space-y-1">
                      <p className="text-slate-800 leading-relaxed font-medium">"{obs.observation}"</p>
                      <span className="text-[10px] text-slate-400 block font-mono">{new Date(obs.created_at).toLocaleDateString('ar-EG')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SUGGESTIONS */}
            {activeTab === 'suggestions' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E5EA] shadow-xs space-y-6">
                <div className="border-b border-[#E2E5EA] pb-4">
                  <h2 className="text-xl font-black text-[#0C2340]">مكتبة الاقتراحات التربوية</h2>
                  <p className="text-xs text-slate-500 mt-0.5">عبارات جاهزة للاستخدام السريع أثناء تقييم الطلاب.</p>
                </div>

                <form onSubmit={handleAddSuggestion} className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5EA] space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newSugText}
                      onChange={e => setNewSugText(e.target.value)}
                      placeholder="اكتب عبارة توجيهية جديدة..."
                      className="flex-1 p-2.5 bg-white border border-[#E2E5EA] rounded-xl text-xs text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
                    />
                    <button type="submit" className="px-4 py-2 bg-[#0A4D92] text-white text-xs font-bold rounded-xl cursor-pointer">
                      حفظ العبارة
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  {suggestions.map(sug => (
                    <div key={sug.id} className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E2E5EA] text-xs text-slate-700">
                      {sug.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* ======================================================== */}
      {/* 3. STRUCTURED FEEDBACK DRAWER / MODAL (Matching Mockup "ملاحظات المعلم") */}
      {/* ======================================================== */}
      {showFeedbackModal && modalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto select-none">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E2E5EA] text-right space-y-6 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header: Student Profile Info */}
            <div className="flex items-center justify-between border-b border-[#E2E5EA] pb-4">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="space-y-0.5 text-left">
                  <h3 className="text-base font-black text-[#0C2340]">
                    {modalStudent.first_name} {modalStudent.last_name}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {user?.subject || 'الرياضيات'} · اليوم
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#0A4D92] text-white font-bold text-sm flex items-center justify-center">
                  {modalStudent.first_name.charAt(0)}
                </div>
              </div>
            </div>

            {/* Section 1: نقاط القوة (Strengths) */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>نقاط القوة</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_STRENGTHS.map(str => {
                  const isSelected = selectedStrengths.includes(str);
                  return (
                    <button
                      key={str}
                      type="button"
                      onClick={() => toggleStrength(str)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-[#F8F9FA] border-[#E2E5EA] text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {str}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: ما يحتاج إلى تحسين (Areas to improve) */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0A4D92]">
                <AlertTriangle className="w-4 h-4 text-[#0A4D92]" />
                <span>ما يحتاج إلى تحسين</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMPROVEMENTS.map(imp => {
                  const isSelected = selectedImprovements.includes(imp);
                  return (
                    <button
                      key={imp}
                      type="button"
                      onClick={() => toggleImprovement(imp)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#EDF4FC] border-[#0A4D92]/40 text-[#0A4D92] font-bold'
                          : 'bg-[#F8F9FA] border-[#E2E5EA] text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {imp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: الخطوة التالية / الهدف (Next Action / Goal) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0C2340]">
                <Compass className="w-4 h-4 text-[#0A4D92]" />
                <span>الخطوة التالية (الهدف العملي)</span>
              </div>
              <input
                type="text"
                value={nextActionInput}
                onChange={e => setNextActionInput(e.target.value)}
                placeholder="مثال: حل 3 تمارين إضافية في الدوال والمتتاليات"
                className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs text-[#0C2340] font-medium focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
              />
            </div>

            {/* Personal Comment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                توجيه أو نصيحة خاصة (اختياري)
              </label>
              <textarea
                rows={2}
                value={personalAdvice}
                onChange={e => setPersonalAdvice(e.target.value)}
                placeholder="اكتب كلمة تشجيع أو إرشاد مخصص للطالب..."
                className="w-full px-3.5 py-2 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E5EA]">
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2.5 border border-[#E2E5EA] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={submittingFeedback}
                onClick={handleSubmitFeedback}
                className="px-6 py-2.5 bg-[#0A4D92] hover:bg-[#08386B] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {submittingFeedback ? (
                  <span>جاري الإرسال...</span>
                ) : (
                  <>
                    <span>حفظ كهدف وإرسال الملاحظة</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. RECOGNITION MODAL */}
      {/* ======================================================== */}
      {showRecognitionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-[#E2E5EA] text-right space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E5EA] pb-3">
              <h3 className="text-base font-black text-[#0C2340]">منح تميز وتقدير إيجابي</h3>
              <button onClick={() => setShowRecognitionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRecognition} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر الطلاب *</label>
                <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-[#F8F9FA] rounded-xl border border-[#E2E5EA]">
                  {students.map(st => (
                    <label key={st.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recStudentIds.includes(st.id)}
                        onChange={e => {
                          if (e.target.checked) setRecStudentIds([...recStudentIds, st.id]);
                          else setRecStudentIds(recStudentIds.filter(id => id !== st.id));
                        }}
                        className="rounded text-[#0A4D92]"
                      />
                      <span>{st.first_name} {st.last_name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مجال التميز *</label>
                <select
                  value={recCategory}
                  onChange={e => setRecCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs text-[#0C2340]"
                >
                  {RECOGNITION_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سبب التقدير *</label>
                <textarea
                  rows={3}
                  required
                  value={recReason}
                  onChange={e => setRecReason(e.target.value)}
                  placeholder="مثال: تفوق ملحوظ في حل المسائل والمواظبة على المشاركة الإيجابية..."
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs text-[#0C2340]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E5EA]">
                <button
                  type="button"
                  onClick={() => setShowRecognitionModal(false)}
                  className="px-4 py-2 border border-[#E2E5EA] text-xs font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingRec}
                  className="px-5 py-2 bg-[#0A4D92] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {submittingRec ? 'جاري المنح...' : 'منح التميز'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E5EA] py-2 px-2 flex items-center justify-around text-center shadow-lg select-none">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'students' ? 'text-[#0A4D92] font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'students' ? 'text-[#0A4D92]' : ''}`} />
          <span className="text-[10px]">الطلاب</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'feedback' ? 'text-[#0A4D92] font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <FileText className={`w-5 h-5 ${activeTab === 'feedback' ? 'text-[#0A4D92]' : ''}`} />
          <span className="text-[10px]">الملاحظات</span>
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'goals' ? 'text-[#0A4D92] font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <Target className={`w-5 h-5 ${activeTab === 'goals' ? 'text-[#0A4D92]' : ''}`} />
          <span className="text-[10px]">الأهداف</span>
        </button>

        <button
          onClick={() => setActiveTab('recognition')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'recognition' ? 'text-[#0A4D92] font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <Award className={`w-5 h-5 ${activeTab === 'recognition' ? 'text-[#0A4D92]' : ''}`} />
          <span className="text-[10px]">التميز</span>
        </button>
      </nav>

    </div>
  );
};
