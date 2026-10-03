import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, setStoredToken } from '../../services/api';
import { ShieldCheck, Lock, User as UserIcon, ArrowLeft, AlertCircle, KeyRound, ShieldAlert } from 'lucide-react';
import { BrandLogo, UpskillMark } from '../common/BrandLogo';

interface InitialSetupViewProps {
  onSetupSuccess: () => void;
}

export const InitialSetupView: React.FC<InitialSetupViewProps> = ({ onSetupSuccess }) => {
  const { refreshUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !password) {
      setError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل لضمان الأمان.');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين. يرجى إعادة التأكد من كتابتها بدقة.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.setupInitialAdmin({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        password: password
      });

      // Save token in storage
      setStoredToken(res.token);
      await refreshUser();
      onSetupSuccess();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء إعداد النظام. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-canvas flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 select-none text-right">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center flex flex-col items-center">
        <BrandLogo size="lg" showSubtitle={true} showArabicSubtitle={true} className="mb-2" />
        <p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium">
          خطوة صغيرة اليوم، فرق كبير مع الوقت.
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs sm:rounded-2xl border border-[#E2E5EA] text-right space-y-6">
          
          <div className="space-y-1.5 border-b border-[#E2E5EA] pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-[#EDF4FC] text-[#0A4D92] mb-1">
              <UpskillMark size={14} />
              <span>التهيئة الأولى للنظام</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0C2340] tracking-tight">
              إعداد النظام لأول مرة
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              مرحباً بك في منصة أب سكيل. يرجى إنشاء حساب مدير النظام الرئيسي للبدء في إدارة المنصة وإضافة حسابات الأساتذة والطلاب.
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-xl text-[11px] text-amber-900 leading-relaxed font-medium">
            <strong>ملاحظة أمنية:</strong> هذه الشاشة تظهر لمرة واحدة فقط لإنشاء حساب المدير الأساسي. بعد حفظ الحساب، ستغلق هذه الصفحة نهائياً ولن يتمكن أي شخص من إنشاء حساب مدير آخر إلا من خلال لوحة الإدارة.
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الأول *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="مثال: منيرة"
                  className="w-full px-3.5 py-2.5 border border-[#E2E5EA] rounded-xl text-xs sm:text-sm text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92] font-medium bg-[#F9F9F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم العائلة *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="مثال: السالم"
                  className="w-full px-3.5 py-2.5 border border-[#E2E5EA] rounded-xl text-xs sm:text-sm text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92] font-medium bg-[#F9F9F6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم المستخدم للمدير *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: admin"
                  className="w-full pr-10 pl-3.5 py-2.5 border border-[#E2E5EA] rounded-xl text-xs sm:text-sm text-[#0C2340] font-mono focus:outline-none focus:ring-2 focus:ring-[#0A4D92] font-medium bg-[#F9F9F6]"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                يستخدم لتسجيل الدخول إلى لوحة إدارة الحسابات.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                كلمة المرور *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-3.5 py-2.5 border border-[#E2E5EA] rounded-xl text-xs sm:text-sm text-[#0C2340] font-mono focus:outline-none focus:ring-2 focus:ring-[#0A4D92] font-medium bg-[#F9F9F6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تأكيد كلمة المرور *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-3.5 py-2.5 border border-[#E2E5EA] rounded-xl text-xs sm:text-sm text-[#0C2340] font-mono focus:outline-none focus:ring-2 focus:ring-[#0A4D92] font-medium bg-[#F9F9F6]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-[#0A4D92] hover:bg-[#083D75] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>جاري حفظ الحساب وإعداد النظام...</span>
              ) : (
                <>
                  <span>إتمام الإعداد وبدء الاستخدام</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        <div className="mt-5 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#0A4D92]" />
          <span>منظومة حماية مشفرة ومتوافقة مع أعلى معايير أمان البيانات المدرسية</span>
        </div>
      </div>
    </div>
  );
};
