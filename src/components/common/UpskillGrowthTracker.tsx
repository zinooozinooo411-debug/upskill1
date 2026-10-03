import React from 'react';
import { UpskillMark } from './BrandLogo';
import { ArrowUpRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import { GoalItem } from '../../types';

interface UpskillGrowthTrackerProps {
  goals: GoalItem[];
  className?: string;
}

export const UpskillGrowthTracker: React.FC<UpskillGrowthTrackerProps> = ({
  goals,
  className = ''
}) => {
  const completedGoals = goals.filter(g => g.status === 'completed');
  const inProgressGoals = goals.filter(g => g.status === 'in_progress');
  const notStartedGoals = goals.filter(g => g.status === 'not_started');

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white border border-[#E2E5EA] p-5 shadow-xs select-none ${className}`}
    >
      {/* Header with Upskill growth vector motif */}
      <div className="flex items-center justify-between border-b border-[#E2E5EA]/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <UpskillMark size={24} />
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#0C2340]">
              مسار التقدم والنمو
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">
              نحو تحقيق الأهداف الدراسية
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A4D92]">
          <span className="text-sm font-extrabold">{completedGoals.length}</span>
          <span className="text-[11px] text-slate-400 font-normal">من</span>
          <span className="text-sm font-extrabold">{goals.length}</span>
          <span className="text-[10px] text-slate-500 mr-1">مكتمل</span>
        </div>
      </div>

      {/* Ascending Milestone Bars Visual (Inspired by Upskill logo 'i - l - l') */}
      <div className="py-2">
        <div className="grid grid-cols-3 gap-3 items-end pt-3 pb-2">
          
          {/* Step 1: Not Started */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center p-2 text-center transition-all">
              <span className="text-xs font-bold text-slate-600 font-mono">
                {notStartedGoals.length}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">أهداف</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <Circle className="w-3 h-3 text-slate-400 shrink-0" />
              <span>لم يبدأ</span>
            </div>
          </div>

          {/* Step 2: In Progress (Taller) */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-full h-18 rounded-xl bg-[#EDF4FC] border border-[#0A4D92]/25 flex flex-col items-center justify-center p-2 text-center transition-all">
              <span className="text-sm font-black text-[#0A4D92] font-mono">
                {inProgressGoals.length}
              </span>
              <span className="text-[10px] text-[#0A4D92]/80 mt-0.5 font-medium">قيد العمل</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#0A4D92]">
              <Clock className="w-3 h-3 text-[#0A4D92] shrink-0" />
              <span>قيد التقدم</span>
            </div>
          </div>

          {/* Step 3: Completed (Tallest summit) */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-full h-24 rounded-xl bg-[#0A4D92] text-white flex flex-col items-center justify-center p-2 text-center shadow-xs transition-all">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-0.5" />
              <span className="text-base font-black font-mono">
                {completedGoals.length}
              </span>
              <span className="text-[10px] text-blue-100 font-medium">تم إنجازه</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#0C2340]">
              <ArrowUpRight className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>مكتمل ↗</span>
            </div>
          </div>

        </div>
      </div>

      {/* Upward Movement Tagline */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>كل خطوة تصنع فرقاً حقيقياً في مستواك</span>
        <div className="flex items-center gap-1 text-[#0A4D92] font-bold">
          <span>نحو القمة</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
