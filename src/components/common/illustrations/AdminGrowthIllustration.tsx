import React from 'react';

interface AdminGrowthIllustrationProps {
  className?: string;
  variant?: 'header' | 'sidebar';
}

/**
 * Editorial vector illustration for Admin Dashboard (Matching uploaded mockup):
 * Ascending growth milestone bars with upward directional arrow and organizational clarity.
 */
export const AdminGrowthIllustration: React.FC<AdminGrowthIllustrationProps> = ({
  className = '',
  variant = 'header'
}) => {
  if (variant === 'sidebar') {
    return (
      <div className={`relative w-full flex flex-col items-center select-none ${className}`}>
        <svg
          viewBox="0 0 220 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-[180px] h-auto object-contain"
        >
          {/* Ascending 5-step milestone bars */}
          <rect x="25" y="85" width="22" height="35" rx="3" fill="#0A4D92" fillOpacity="0.15" />
          <rect x="60" y="70" width="22" height="50" rx="3" fill="#0A4D92" fillOpacity="0.28" />
          <rect x="95" y="52" width="22" height="68" rx="3" fill="#0A4D92" fillOpacity="0.45" />
          <rect x="130" y="34" width="22" height="86" rx="3" fill="#0A4D92" fillOpacity="0.7" />
          <rect x="165" y="15" width="22" height="105" rx="3" fill="#0A4D92" />

          {/* Upward diagonal line connecting summit tops */}
          <path
            d="M36 80L71 65L106 47L141 29L176 10"
            stroke="#0A4D92"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Arrowhead */}
          <path
            d="M165 9H178V22"
            stroke="#0A4D92"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[11px] font-bold text-slate-500 mt-2 text-center">
          بيئة منظمة تصنع فرقاً حقيقياً
        </span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-end select-none ${className}`}>
      <svg
        viewBox="0 0 260 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[240px] h-auto object-contain"
      >
        <defs>
          <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A4D92" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0A4D92" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Shaded Area under Curve */}
        <path
          d="M20 95C70 85 110 70 150 45C190 20 220 15 245 10V105H20V95Z"
          fill="url(#adminChartGrad)"
        />

        {/* Main Growth Curve */}
        <path
          d="M20 95C70 85 110 70 150 45C190 20 220 15 245 10"
          stroke="#0A4D92"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Upward Arrow at Summit */}
        <path
          d="M232 10H247V25"
          stroke="#0A4D92"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Milestone Dots */}
        <circle cx="20" cy="95" r="3.5" fill="#FFFFFF" stroke="#0A4D92" strokeWidth="2" />
        <circle cx="95" cy="76" r="3.5" fill="#FFFFFF" stroke="#0A4D92" strokeWidth="2" />
        <circle cx="165" cy="38" r="4" fill="#FFFFFF" stroke="#0A4D92" strokeWidth="2.5" />
        <circle cx="245" cy="10" r="5" fill="#0A4D92" />
      </svg>
    </div>
  );
};
