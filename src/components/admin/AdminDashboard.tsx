import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { User } from '../../types';
import {
  Users,
  Plus,
  Search,
  KeyRound,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
  Shield,
  UserCheck,
  UserX,
  X,
  Lock,
  Settings,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  Sliders,
  UserPlus
} from 'lucide-react';
import { BrandLogo, UpskillMark } from '../common/BrandLogo';
import { AdminGrowthIllustration } from '../common/illustrations/AdminGrowthIllustration';
import { EmptyStudentsIllustration } from '../common/illustrations/EmptyStatesIllustrations';

export const AdminDashboard: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher'>('all');

  // Success Toast Banner
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Settings State: Public Registration Control
  const [allowRegistration, setAllowRegistration] = useState(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Delete User Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [subject, setSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Success Created User Info Modal (with Copy button)
  const [createdAccountInfo, setCreatedAccountInfo] = useState<{
    first_name: string;
    last_name: string;
    username: string;
    password: string;
    role: string;
    subject?: string | null;
  } | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Change Password Modal
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    loadSettings();
  }, [roleFilter, search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers({
        role: roleFilter === 'all' ? undefined : roleFilter,
        search: search || undefined
      });
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      setAllowRegistration(res.allow_registration);
    } catch (e) {
      console.error('Failed to load system settings:', e);
    }
  };

  const handleToggleRegistration = async () => {
    const nextVal = !allowRegistration;
    setIsUpdatingSettings(true);
    try {
      const res = await api.updateSettings({ allow_registration: nextVal });
      setAllowRegistration(res.allow_registration);
      setSuccessToast(
        nextVal
          ? 'تم تفعيل تسجيل الطلاب الذاتي بنجاح.'
          : 'تم إغلاق تسجيل الطلاب الذاتي بنجاح.'
      );
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(`تعذر تحديث إعدادات التسجيل: ${err?.message}`);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !password) {
      setCreateError('يرجى ملء جميع الحقول الإلزامية.');
      return;
    }

    setIsSubmitting(true);
    setCreateError(null);

    try {
      await api.createAdminUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        password: password,
        role: role,
        subject: role === 'teacher' ? subject.trim() : undefined
      });

      setShowCreateModal(false);
      setCreatedAccountInfo({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        password: password,
        role: role,
        subject: role === 'teacher' && subject.trim() ? subject.trim() : null
      });

      // Clear form
      setFirstName('');
      setLastName('');
      setUsername('');
      setPassword('');
      setSubject('');
      setRole('student');

      loadUsers();
    } catch (err: any) {
      setCreateError(err?.message || 'تعذر إنشاء الحساب.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdAccountInfo) return;
    const roleText =
      createdAccountInfo.role === 'teacher'
        ? 'أستاذ'
        : createdAccountInfo.role === 'admin'
          ? 'مدير النظام'
          : 'طالب';
    const textToCopy = `بيانات الدخول لمنصة أب سكيل (Upskill):\nالاسم: ${createdAccountInfo.first_name} ${createdAccountInfo.last_name}\nالصفة: ${roleText}\nاسم المستخدم: ${createdAccountInfo.username}\nكلمة المرور: ${createdAccountInfo.password}${createdAccountInfo.subject ? `\nالمادة: ${createdAccountInfo.subject}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.is_active === 1 ? false : true;
    try {
      await api.toggleUserStatus(user.id, nextStatus);
      setUsers(users.map(u => (u.id === user.id ? { ...u, is_active: nextStatus ? 1 : 0 } : u)));
      setSuccessToast(`تم ${nextStatus ? 'تفعيل' : 'تعطيل'} حساب @${user.username} بنجاح.`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (e: any) {
      alert(`تعذر تحديث حالة الحساب: ${e?.message}`);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newPassword.trim()) return;

    setIsChangingPass(true);
    setPasswordError(null);
    try {
      await api.changeUserPassword(passwordModalUser.id, newPassword.trim());
      setSuccessToast(`تم تحديث كلمة المرور للحساب @${passwordModalUser.username} بنجاح.`);
      setTimeout(() => setSuccessToast(null), 4000);
      setPasswordModalUser(null);
      setNewPassword('');
    } catch (e: any) {
      setPasswordError(e?.message || 'فشل تغيير كلمة المرور.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await api.deleteUser(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setSuccessToast(res.message || `تم حذف حساب ${userToDelete.first_name} ${userToDelete.last_name} بنجاح.`);
      setTimeout(() => setSuccessToast(null), 4000);
      setUserToDelete(null);
    } catch (err: any) {
      setDeleteError(err?.message || 'تعذر حذف الحساب.');
    } finally {
      setIsDeleting(false);
    }
  };

  const studentsCount = users.filter(u => u.role === 'student').length;
  const teachersCount = users.filter(u => u.role === 'teacher').length;
  const adminsCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8F9FA] select-none text-right px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto space-y-8">
      
      {/* Toast Notification Banner */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. HERO COMPOSITION (Matching Mockup Image Top-Right) */}
      <div className="bg-white rounded-3xl border border-[#E2E5EA] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0A4D92]"></span>
            <span className="text-xs font-bold text-[#0A4D92]">منظومة التحكم المركزية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0C2340] tracking-tight">
            مركز إدارة Upskill
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg">
            كل شيء يبدأ من بيئة تعليمية منظمة. إدارة الحسابات، سياسات التسجيل، وضوابط الأمان.
          </p>
        </div>

        {/* Vector Growth Curve Illustration */}
        <div className="shrink-0 flex items-center justify-end">
          <AdminGrowthIllustration className="w-48 sm:w-60" variant="header" />
        </div>

      </div>

      {/* 2. STATS OVERVIEW ROW (3 Cards Matching Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Active Accounts */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E5EA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">الحسابات النشطة</span>
            <div className="text-3xl font-black text-[#0C2340] font-mono">
              {users.filter(u => u.is_active === 1).length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EDF4FC] text-[#0A4D92] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Teachers */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E5EA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">المعلمين</span>
            <div className="text-3xl font-black text-[#0C2340] font-mono">
              {teachersCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EDF4FC] text-[#0A4D92] flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Students */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E5EA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">الطلاب</span>
            <div className="text-3xl font-black text-[#0C2340] font-mono">
              {studentsCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EDF4FC] text-[#0A4D92] flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. QUICK MODULES GRID (4 Control Modules Matching Mockup) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-2xl bg-white border border-[#E2E5EA] shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0A4D92]">
            <Users className="w-4 h-4 text-[#0A4D92]" />
            <span>إدارة الحسابات</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            إضافة، تعديل، وحذف الحسابات (طلاب - معلمين)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2E5EA] shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0A4D92]">
            <Sliders className="w-4 h-4 text-[#0A4D92]" />
            <span>إعدادات النظام</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            تكوين خيارات المنصة وإدارة السجلات
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2E5EA] shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0A4D92]">
            <UserPlus className="w-4 h-4 text-[#0A4D92]" />
            <span>السماح بالتسجيل</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            تفعيل أو إيقاف إنشاء حسابات جديدة
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2E5EA] shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0A4D92]">
            <ShieldCheck className="w-4 h-4 text-[#0A4D92]" />
            <span>الأمان والنظام</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            مراقبة النشاط وحماية البيانات والبيئة
          </p>
        </div>

      </div>

      {/* 4. SPLIT LAYOUT: ACCOUNT MANAGEMENT & REGISTRATION SETTINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT PANEL (In RTL this is the main Account Management Table - 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E5EA] shadow-xs space-y-5">
          
          {/* Header & New Account Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E5EA] pb-4">
            <div>
              <h2 className="text-xl font-black text-[#0C2340]">إدارة الحسابات</h2>
              <span className="text-xs text-slate-400">قائمة حسابات الطلاب والمعلمين المسجلة</span>
            </div>

            <button
              onClick={() => {
                setCreateError(null);
                setShowCreateModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A4D92] hover:bg-[#08386B] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حساب...</span>
            </button>
          </div>

          {/* Search & Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث عن مستخدم..."
                className="w-full pr-10 pl-3.5 py-2 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs sm:text-sm text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
              />
            </div>

            {/* Segmented Filter */}
            <div className="flex items-center gap-1 p-1 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl w-full sm:w-auto text-xs font-bold">
              <button
                onClick={() => setRoleFilter('all')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  roleFilter === 'all'
                    ? 'bg-[#0A4D92] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-[#0C2340]'
                }`}
              >
                الكل ({users.length})
              </button>
              <button
                onClick={() => setRoleFilter('teacher')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  roleFilter === 'teacher'
                    ? 'bg-[#0A4D92] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-[#0C2340]'
                }`}
              >
                المعلمين ({teachersCount})
              </button>
              <button
                onClick={() => setRoleFilter('student')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  roleFilter === 'student'
                    ? 'bg-[#0A4D92] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-[#0C2340]'
                }`}
              >
                الطلاب ({studentsCount})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-[#E2E5EA] overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-xs font-bold text-slate-400">
                جاري تحميل الحسابات...
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <EmptyStudentsIllustration />
                <p className="text-xs font-bold text-[#0C2340]">لم يتم إضافة طلاب بعد</p>
                <p className="text-[11px] text-slate-400">يمكنك إضافة طلاب من خلال زر إضافة حساب أعلاه.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E2E5EA] text-slate-600 font-bold">
                      <th className="py-3 px-4">الاسم</th>
                      <th className="py-3 px-4">اسم المستخدم</th>
                      <th className="py-3 px-4">الدور</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4">تاريخ الإنشاء</th>
                      <th className="py-3 px-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E5EA]">
                    {users.map(u => {
                      const isSelf = currentAdmin?.id === u.id;
                      const isOtherAdmin = u.role === 'admin' && !isSelf;
                      const isActive = u.is_active === 1;

                      const roleLabel =
                        u.role === 'admin'
                          ? 'مدير'
                          : u.role === 'teacher'
                            ? `معلم (${u.subject || ''})`
                            : 'طالب';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#0A4D92] text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {u.first_name ? u.first_name.charAt(0) : 'م'}
                              </div>
                              <div>
                                <span className="font-bold text-[#0C2340] block">
                                  {u.first_name} {u.last_name}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] text-[#0A4D92] font-semibold">
                                    (حسابك الحالي)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">
                            {u.username}
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            {roleLabel}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-rose-50 text-rose-800'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span>{isActive ? 'نشط' : 'معطل'}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('ar-EG') : '2026-10-01'}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* Edit / Password Change */}
                              <button
                                onClick={() => {
                                  setPasswordModalUser(u);
                                  setNewPassword('');
                                  setPasswordError(null);
                                }}
                                className="p-1.5 text-slate-400 hover:text-[#0A4D92] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="تعديل كلمة المرور"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              {/* Toggle Active Status */}
                              {!isSelf && (
                                <button
                                  onClick={() => handleToggleStatus(u)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    isActive
                                      ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                      : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                  title={isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                                >
                                  {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                </button>
                              )}

                              {/* Delete Account */}
                              {isSelf ? (
                                <span
                                  className="p-1.5 text-slate-300 cursor-not-allowed"
                                  title="لا يمكنك حذف حساب المدير الخاص بك أثناء تسجيل الدخول به"
                                >
                                  <Shield className="w-4 h-4" />
                                </span>
                              ) : isOtherAdmin ? (
                                <span
                                  className="p-1.5 text-slate-300 cursor-not-allowed"
                                  title="حساب مدير نظام محمي"
                                >
                                  <Lock className="w-4 h-4" />
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setDeleteError(null);
                                    setUserToDelete(u);
                                  }}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title={`حذف حساب ${u.first_name}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
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

        {/* LEFT PANEL (In RTL this is the System Settings & Registration Control - 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E5EA] shadow-xs space-y-6">
          
          <div>
            <h2 className="text-xl font-black text-[#0C2340]">إعدادات التسجيل والنظام</h2>
            <p className="text-xs text-slate-400 mt-1">ضوابط إنشاء الحسابات وسياسات الوصول</p>
          </div>

          {/* Toggle Switch: السماح بإنشاء حسابات جديدة */}
          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5EA] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0C2340]">
                السماح بإنشاء حسابات جديدة
              </span>
              
              <button
                type="button"
                disabled={isUpdatingSettings}
                onClick={handleToggleRegistration}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  allowRegistration ? 'bg-[#0A4D92]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    allowRegistration ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              عند التفعيل، يمكن للطلاب إنشاء حساباتهم من صفحة تسجيل الدخول.
            </p>
          </div>

          {/* Registration Type Rule */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#0C2340] block">
              نوع الحسابات المسموح بها للتسجيل
            </span>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0A4D92] bg-[#EDF4FC] p-3 rounded-xl border border-[#0A4D92]/20">
              <Check className="w-4 h-4 text-[#0A4D92]" />
              <span>الطلاب فقط</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              لا يمكن إنشاء حسابات معلمين أو مديرين عبر التسجيل الذاتي.
            </p>
          </div>

          {/* Sidebar Growth Illustration */}
          <div className="pt-4 border-t border-[#E2E5EA]">
            <AdminGrowthIllustration variant="sidebar" />
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: DELETE CONFIRMATION DIALOG */}
      {/* ======================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-[#E2E5EA] max-w-md w-full p-6 sm:p-7 shadow-xl text-right space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0C2340]">
                  حذف الحساب؟
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  سيتم حذف حساب <span className="font-bold text-[#0C2340]">{userToDelete.first_name} {userToDelete.last_name}</span> (<span className="font-mono text-[#0A4D92]">@{userToDelete.username}</span>) نهائياً.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-2xl text-[11px] text-rose-900 leading-relaxed font-medium">
              لا يمكن التراجع عن هذا الإجراء وسيتم مسح كافة البيانات والملاحظات والأهداف المرتبطة بالحساب بأمان من قاعدة البيانات.
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 border border-[#E2E5EA] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <span>جاري الحذف...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الحساب</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CREATE USER MODAL */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-[#E2E5EA] max-w-lg w-full p-6 sm:p-7 shadow-xl text-right space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-[#E2E5EA] pb-3">
              <div className="flex items-center gap-2">
                <UpskillMark size={24} />
                <h3 className="text-base sm:text-lg font-black text-[#0C2340]">
                  إضافة حساب جديد
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  نوع الحساب *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      role === 'student'
                        ? 'bg-[#0A4D92] text-white border-[#0A4D92] shadow-2xs'
                        : 'bg-[#F8F9FA] border-[#E2E5EA] text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    طالب (Student)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      role === 'teacher'
                        ? 'bg-[#0A4D92] text-white border-[#0A4D92] shadow-2xs'
                        : 'bg-[#F8F9FA] border-[#E2E5EA] text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    أستاذ / معلم (Teacher)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم الأول *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="مثال: أحمد"
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
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
                    onChange={e => setLastName(e.target.value)}
                    placeholder="مثال: بلقاسم"
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
                  />
                </div>
              </div>

              {role === 'teacher' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    مادة التدريس *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="مثال: الرياضيات، الفيزياء"
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المستخدم *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="مثال: ahmed_b"
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs font-mono text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كلمة المرور *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="كلمة مرور قوية (6 خانات على الأقل)"
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs font-mono text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E5EA]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#E2E5EA] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#0A4D92] hover:bg-[#08386B] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CREATED CREDENTIALS DISPLAY (WITH COPY) */}
      {/* ======================================================== */}
      {createdAccountInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-[#E2E5EA] max-w-md w-full p-6 sm:p-7 shadow-xl text-right space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#0C2340]">
                تم إنشاء الحساب بنجاح
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              يمكنك نسخ بيانات الدخول التالية وتسليمها للمستخدم:
            </p>

            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5EA] space-y-2 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">الاسم الكامل:</span>
                <span className="font-bold text-[#0C2340]">
                  {createdAccountInfo.first_name} {createdAccountInfo.last_name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الصفة / الدور:</span>
                <span className="font-bold text-[#0C2340]">
                  {createdAccountInfo.role === 'teacher' ? `أستاذ ${createdAccountInfo.subject || ''}` : 'طالب'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">اسم المستخدم:</span>
                <span className="font-bold text-[#0A4D92]">
                  {createdAccountInfo.username}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">كلمة المرور:</span>
                <span className="font-bold text-slate-800">
                  {createdAccountInfo.password}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A4D92] hover:bg-[#08386B] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>تم النسخ للحافظة!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ بيانات الدخول</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCreatedAccountInfo(null)}
                className="px-4 py-2 border border-[#E2E5EA] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CHANGE PASSWORD */}
      {/* ======================================================== */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-[#E2E5EA] max-w-md w-full p-6 shadow-xl text-right space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2E5EA] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#0A4D92]" />
                <h3 className="text-base font-bold text-[#0C2340]">
                  تغيير كلمة المرور
                </h3>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              تحديد كلمة مرور جديدة للحساب: <span className="font-bold text-[#0C2340]">@{passwordModalUser.username}</span>
            </p>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كلمة المرور الجديدة *
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة مرور جديدة (6 خانات على الأقل)"
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E2E5EA] rounded-xl text-xs font-mono text-[#0C2340] focus:outline-none focus:ring-2 focus:ring-[#0A4D92]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 border border-[#E2E5EA] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-5 py-2 bg-[#0A4D92] hover:bg-[#08386B] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isChangingPass ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
