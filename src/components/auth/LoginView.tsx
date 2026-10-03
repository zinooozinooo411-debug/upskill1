import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, setStoredToken } from '../../services/api';
import { Lock, User as UserIcon, ArrowLeft, ShieldCheck, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { BrandLogo, UpskillMark } from '../common/BrandLogo';
import { LoginStudentIllustration } from '../common/illustrations/LoginStudentIllustration';

export const LoginView: React.FC = () => {
  const { login, refreshUser } = useAuth();
  
  // Registration capability status
  const [canRegister, setCanRegister] = useState(false);
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student Registration form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      const res = await api.getRegistrationStatus();
      setCanRegister(res.allowed);
    } catch {
      setCanRegister(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setError(err?.message || 'فشل تسجيل الدخول. يرجى التحقق من بيانات الدخول.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regLastName.trim() || !regUsername.trim() || !regPassword) {
      setRegError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('كلمة المرور يجب أن تتكون من 6 خانات على الأقل.');
      return;
    }

    setRegError(null);
    setIsRegistering(true);

    try {
      const res = await api.registerStudent({
        first_name: regFirstName.trim(),
        last_name: regLastName.trim(),
        username: regUsername.trim(),
        password: regPassword
      });

      setStoredToken(res.token);
      await refreshUser();
    } catch (err: any) {
      setRegError(err?.message || 'تعذر تسجيل الحساب.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-canvas flex items-center justify-center p-4 sm:p-6 lg:p-10 select-none text-right">
      
      {/* Outer Split Container */}
      <div className="w-full max-w-5xl bg-white border border-[#E2E5EA] rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Brand & Illustration Side (RTL Right side in desktop) */}
        <div className="lg:col-span-6 bg-[#F8F9FA] p-8 sm:p-12 border-b lg:border-b-0 lg:border-l border-[#E2E5EA] flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle diagonal background line */}
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-40">
            <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
              <path d="M0 400L400 0" stroke="#0A4D92" strokeWidth="1" strokeDasharray="6 6" strokeOpacity="0.15" />
            </svg>
          </div>

          <div>
            <BrandLogo size="md" showSubtitle={true} showArabicSubtitle={false} className="mb-8" />
            
            <div className="space-y-3 max-w-sm">
              <h1 className="text-2xl sm:text-3xl font-black text-[#0C2340] leading-snug tracking-tight">
                لا تتوقف عند مستواك الحالي؛
              </h1>
              <p className="text-base sm:text-lg font-bold text-[#0A4D92]">
                طوّر مهاراتك. خطوة بعد خطوة.
              </p>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed pt-1">
                منصة توجيه وتقييم تمنحك ملاحظات واضحة وخطوات عملية لتحقيق أهدافك التعليمية.
              </p>
            </div>
          </div>

          {/* Custom Ascending Steps Illustration */}
          <div className="py-6 sm:py-8 flex items-center justify-center">
            <LoginStudentIllustration className="w-full max-w-[280px]" />
          </div>

          {/* Motivational Bottom Micro-quote */}
          <div className="pt-4 border-t border-[#E2E5EA]/80 flex items-center justify-between text-xs text-slate-500">
            <span>كل خطوة صغيرة تقربك من هدفك الكبير.</span>
            <div className="flex items-center gap-1 text-[#0A4D92] font-bold">
              <span>Upskill</span>
              <span className="text-[10px] text-slate-400">·</span>
              <span className="text-[10px]">Education</span>
            </div>
          </div>
        </div>

        {/* Clean Form Side (RTL Left side in desktop) */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white">
          
          <div className="w-full max-w-md mx-auto">
            
            {/* Header Titles */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0A4D92]"></span>
                <span className="text-xs font-bold text-[#0A4D92] tracking-wide">
                  {activeMode === 'login' ? 'بوابة الدخول' : 'تسجيل جديد'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#0C2340] tracking-tight">
                {activeMode === 'login' ? 'مرحبًا بعودتك' : 'حساب طالب جديد'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {activeMode === 'login'
                  ? 'سجّل دخولك لمتابعة خطتك التعليمية وملاحظات المعلمين'
                  : 'أدخل بياناتك للانضمام إلى منصة التقييم والمتابعة'}
              </p>
            </div>

            {/* Segmented Mode Switcher (When Registration is allowed) */}
            {canRegister && (
              <div className="mb-6 p-1 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('login');
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeMode === 'login'
                      ? 'bg-white text-[#0C2340] shadow-xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-[#0C2340]'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>تسجيل الدخول</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('register');
                    setRegError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeMode === 'register'
                      ? 'bg-white text-[#0C2340] shadow-xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-[#0C2340]'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>طالب جديد</span>
                </button>
              </div>
            )}

            {/* LOGIN FORM */}
            {activeMode === 'login' ? (
              <div>
                {error && (
                  <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium leading-relaxed flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0C2340] mb-1.5">
                      اسم المستخدم
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        autoFocus
                        autoComplete="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="أدخل اسم المستخدم"
                        className="w-full pr-10 pl-3.5 py-3 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs sm:text-sm text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0C2340] mb-1.5">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور"
                        className="w-full pr-10 pl-3.5 py-3 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs sm:text-sm text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92] focus:bg-white transition-all font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3.5 px-4 bg-[#0A4D92] hover:bg-[#08386B] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>جاري تسجيل الدخول...</span>
                    ) : (
                      <>
                        <span>تسجيل الدخول</span>
                        <ArrowLeft className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Quick Registration switch if enabled */}
                  {canRegister && (
                    <div className="pt-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMode('register');
                          setError(null);
                        }}
                        className="text-xs text-[#0A4D92] hover:text-[#0C2340] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>ليس لديك حساب؟ حساب طالب جديد</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            ) : (
              /* REGISTRATION FORM */
              <div>
                {regError && (
                  <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium leading-relaxed flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{regError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        الاسم الأول *
                      </label>
                      <input
                        type="text"
                        required
                        value={regFirstName}
                        onChange={e => setRegFirstName(e.target.value)}
                        placeholder="مثال: أحمد"
                        className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        اسم العائلة *
                      </label>
                      <input
                        type="text"
                        required
                        value={regLastName}
                        onChange={e => setRegLastName(e.target.value)}
                        placeholder="مثال: بلقاسم"
                        className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسم المستخدم المطلوب *
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={e => setRegUsername(e.target.value)}
                      placeholder="مثال: ahmed_b"
                      className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs font-mono text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      كلمة المرور * (6 خانات على الأقل)
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs font-mono text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full mt-2 py-3.5 px-4 bg-[#0A4D92] hover:bg-[#08386B] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isRegistering ? (
                      <span>جاري إنشاء الحساب...</span>
                    ) : (
                      <>
                        <span>إنشاء حساب الطالب والدخول</span>
                        <ArrowLeft className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode('login');
                        setRegError(null);
                      }}
                      className="text-xs text-slate-500 hover:text-[#0C2340] font-medium transition-colors cursor-pointer"
                    >
                      لديك حساب بالفعل؟ تسجيل الدخول
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-[#E2E5EA]/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Upskill · Student Evaluation Platform</span>
            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0A4D92]" />
              <span>بيانات آمنة ومشفرة</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
