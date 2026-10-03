import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface GrowthMountainCardProps {
  className?: string;
  compact?: boolean;
}

export const GrowthMountainCard: React.FC<GrowthMountainCardProps> = ({
  className = '',
  compact = false
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#EBF7F5] via-[#F0FDF9] to-white border border-teal-100/70 p-4 shadow-xs select-none ${className}`}
    >
      {/* Decorative SVG of Mountain Path with Summit Flag */}
      <div className="relative w-full h-28 sm:h-32 flex items-center justify-center">
        <svg
          viewBox="0 0 320 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-contain"
        >
          {/* Background hills */}
          <path
            d="M0 120C40 90 90 75 140 85C190 95 240 110 320 120V120H0Z"
            fill="#CCECE6"
            fillOpacity="0.4"
          />
          <path
            d="M320 120C280 80 220 60 170 70C120 80 60 100 0 120V120H320Z"
            fill="#B2DFD7"
            fillOpacity="0.3"
          />

          {/* Main green summit ridge */}
          <path
            d="M0 120C25 110 55 90 75 65C85 52 95 48 105 48C115 48 125 60 145 75C175 95 240 115 320 120H0Z"
            fill="#80C9BC"
            fillOpacity="0.6"
          />
          <path
            d="M15 120C45 105 75 80 95 55C100 48 105 48 110 52C125 65 160 90 200 105C240 115 285 118 320 120H15Z"
            fill="#52B3A2"
            fillOpacity="0.5"
          />

          {/* Dashed trail climbing to summit */}
          <path
            d="M20 115C50 105 75 85 92 64C98 56 102 52 105 49"
            stroke="#0D6E66"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />

          {/* Flag at the summit */}
          <line
            x1="105"
            y1="48"
            x2="105"
            y2="30"
            stroke="#0D6E66"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Green triangular flag */}
          <path
            d="M105 30L85 36L105 42V30Z"
            fill="#10B981"
          />
          <circle cx="105" cy="30" r="1.5" fill="#0D6E66" />

          {/* Footstep / checkpoint sparkles */}
          <circle cx="50" cy="98" r="2.5" fill="#0D6E66" />
          <circle cx="75" cy="78" r="2.5" fill="#0D6E66" />
          <circle cx="92" cy="62" r="2.5" fill="#10B981" />

          {/* Soft upward momentum rays */}
          <path
            d="M118 32L128 24M125 40L137 36M120 48L132 48"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Motivational Tagline matching reference image */}
      <div className="mt-2 text-center flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-teal-900">
        <span>كل خطوة صغيرة تقربك من هدفك</span>
        <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
      </div>
    </div>
  );
};
