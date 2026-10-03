import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { BrandLogo, UpskillMark } from './BrandLogo';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleNavigate = (link: string) => {
    window.dispatchEvent(new CustomEvent('app-navigate', { detail: { link } }));
  };

  const roleLabel =
    user.role === 'admin'
      ? 'مدير النظام'
      : user.role === 'teacher'
        ? `أستاذ ${user.subject || ''}`.trim()
        : 'طالب';

  const avatarInitial = user.first_name ? user.first_name.charAt(0) : 'م';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E5EA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Right side in RTL: Brand Logo / Session */}
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" showSubtitle={false} />
        </div>

        {/* User profile, notifications & actions (RTL Left side) */}
        <div className="flex items-center gap-2.5 sm:gap-3">

          {/* Notification Bell */}
          <NotificationBell onNavigate={handleNavigate} />

          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#E2E5EA] bg-[#F8F9FA] text-right">
            <div className="w-8 h-8 rounded-lg bg-[#0A4D92] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
              {avatarInitial}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-[#0C2340] leading-tight">
                {user.role === 'teacher' ? 'أ. ' : ''}{user.first_name} {user.last_name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                {roleLabel}
              </div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
