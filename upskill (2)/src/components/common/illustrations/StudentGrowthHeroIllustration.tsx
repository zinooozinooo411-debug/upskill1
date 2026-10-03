import React from 'react';

interface StudentGrowthHeroIllustrationProps {
  className?: string;
  currentStep?: 'start' | 'feedback' | 'improve' | 'progress' | 'achieve';
}

/**
 * Editorial vector illustration of the Upskill Student Growth Path:
 * A student with backpack looking forward up an ascending slope
 * with interconnected milestone nodes leading to the summit checkmark:
 * بداية (Start) → ملاحظات (Feedback) → تحسين (Improvement) → تقدم (Progress) → إنجاز (Achievement)
 */
export const StudentGrowthHeroIllustration: React.FC<StudentGrowthHeroIllustrationProps> = ({
  className = '',
  currentStep = 'progress'
}) => {
  return (
    <div className={`relative w-full h-full min-h-[260px] flex items-center justify-center select-none overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 540 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="slopeGrad" x1="50" y1="280" x2="480" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A4D92" stopOpacity="0.08" />
            <stop offset="60%" stopColor="#0A4D92" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#0A4D92" stopOpacity="0.25" />
          </linearGradient>

          <linearGradient id="pathGrad" x1="120" y1="260" x2="420" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A4D92" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0A4D92" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="summitGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0A4D92" />
            <stop offset="100%" stopColor="#08386B" />
          </linearGradient>

          {/* Node Glow Filter */}
          <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0A4D92" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Contour & Topological Background Lines */}
        <path
          d="M30 300C120 280 200 240 310 210C420 180 470 120 530 110"
          stroke="#0A4D92"
          strokeWidth="1"
          strokeOpacity="0.1"
          strokeDasharray="4 4"
        />
        <path
          d="M0 270C90 260 180 210 290 170C390 130 450 70 540 60"
          stroke="#0A4D92"
          strokeWidth="1"
          strokeOpacity="0.08"
        />
        <path
          d="M50 320C150 295 240 260 340 200C430 140 480 80 520 40"
          stroke="#0A4D92"
          strokeWidth="1.2"
          strokeOpacity="0.12"
        />

        {/* Mountain Silhouette Base Fill */}
        <path
          d="M40 320C120 300 200 270 290 220C370 175 420 125 450 65L540 65V320H40Z"
          fill="url(#slopeGrad)"
        />

        {/* Ascending Main Growth Path (Connecting line) */}
        <path
          d="M135 255L195 210L275 160L350 110L425 65"
          stroke="url(#pathGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="6 6"
        />

        {/* Ascending Stepping Stones along the ridge */}
        <line x1="120" y1="265" x2="150" y2="255" stroke="#0A4D92" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
        <line x1="180" y1="220" x2="210" y2="210" stroke="#0A4D92" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
        <line x1="260" y1="170" x2="290" y2="160" stroke="#0A4D92" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
        <line x1="335" y1="120" x2="365" y2="110" stroke="#0A4D92" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round" />

        {/* ======================================================== */}
        {/* STUDENT CHARACTER SILHOUETTE (Bottom Left looking up) */}
        {/* ======================================================== */}
        <g transform="translate(68, 175)">
          {/* Head & Hair */}
          <circle cx="28" cy="18" r="9" fill="#0C2340" />
          {/* Neck */}
          <rect x="25" y="26" width="6" height="4" rx="2" fill="#0C2340" />
          {/* Body / Jacket */}
          <path
            d="M16 30C19 28 35 28 38 30L42 68H14L16 30Z"
            fill="#0A4D92"
          />
          {/* Backpack on back */}
          <path
            d="M11 34C9 34 7 36 7 40V58C7 62 9 64 12 64H16V34H11Z"
            fill="#08386B"
          />
          {/* Backpack strap */}
          <path
            d="M16 34C20 37 21 44 21 54"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
          {/* Legs / Trousers */}
          <path
            d="M17 68L15 105H24L26 72L30 72L32 105H41L39 68H17Z"
            fill="#0C2340"
          />
          {/* Boots walking forward */}
          <path d="M12 103C12 101 15 101 24 101V106H10C10 105 11 103 12 103Z" fill="#0A4D92" />
          <path d="M30 103C30 101 33 101 42 101V106H28C28 105 29 103 30 103Z" fill="#0A4D92" />
          {/* Arm pointing slightly forward/upward */}
          <path
            d="M33 34L45 50L43 56L31 42"
            fill="#0A4D92"
          />
        </g>

        {/* ======================================================== */}
        {/* MILESTONE NODES ALONG THE PATH */}
        {/* ======================================================== */}

        {/* Node 1: بداية (Start) */}
        <g transform="translate(135, 255)" filter="url(#nodeShadow)">
          <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke="#0A4D92" strokeWidth="2.5" />
          {/* Flag Icon */}
          <path d="M-4 -6V6M-4 -6L3 -3L-4 0" stroke="#0A4D92" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          {/* Label */}
          <rect x="-24" y="18" width="48" height="18" rx="9" fill="#0C2340" />
          <text x="0" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="Tajawal, sans-serif">
            بداية
          </text>
        </g>

        {/* Node 2: ملاحظات (Feedback) */}
        <g transform="translate(195, 210)" filter="url(#nodeShadow)">
          <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke="#0A4D92" strokeWidth="2.5" />
          {/* Notebook / Message Icon */}
          <path d="M-4 -5H3M-4 -2H3M-4 1H0M-5 -6H4V6H-5Z" stroke="#0A4D92" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          {/* Label */}
          <rect x="-28" y="18" width="56" height="18" rx="9" fill="#0C2340" />
          <text x="0" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="Tajawal, sans-serif">
            ملاحظات
          </text>
        </g>

        {/* Node 3: تحسين (Improvement) */}
        <g transform="translate(275, 160)" filter="url(#nodeShadow)">
          <circle cx="0" cy="0" r="15" fill="#FFFFFF" stroke="#0A4D92" strokeWidth="2.5" />
          {/* Gear / Target icon */}
          <circle cx="0" cy="0" r="4.5" stroke="#0A4D92" strokeWidth="1.6" />
          <path d="M0 -7V-5M0 5V7M-7 0H-5M5 0H7" stroke="#0A4D92" strokeWidth="1.6" strokeLinecap="round" />
          {/* Label */}
          <rect x="-25" y="20" width="50" height="18" rx="9" fill="#0C2340" />
          <text x="0" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="Tajawal, sans-serif">
            تحسين
          </text>
        </g>

        {/* Node 4: تقدم (Progress) */}
        <g transform="translate(350, 110)" filter="url(#nodeShadow)">
          <circle cx="0" cy="0" r="16" fill="#0A4D92" />
          {/* Ascending Chart Bars Icon in white */}
          <rect x="-6" y="0" width="3" height="6" rx="1" fill="#FFFFFF" />
          <rect x="-1" y="-3" width="3" height="9" rx="1" fill="#FFFFFF" />
          <rect x="4" y="-7" width="3" height="13" rx="1" fill="#FFFFFF" />
          {/* Label */}
          <rect x="-25" y="20" width="50" height="18" rx="9" fill="#0A4D92" />
          <text x="0" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="Tajawal, sans-serif">
            تقدم
          </text>
        </g>

        {/* Node 5: إنجاز (Achievement Summit Check) */}
        <g transform="translate(425, 65)" filter="url(#nodeShadow)">
          {/* Outer Pulse Ring */}
          <circle cx="0" cy="0" r="26" fill="#0A4D92" fillOpacity="0.15" />
          <circle cx="0" cy="0" r="20" fill="url(#summitGlow)" />
          {/* Upskill Brand Checkmark */}
          <path
            d="M-6 0L-2 4L7 -5"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Tiny Upward Directional Vector */}
          <path
            d="M7 -5L12 -10M12 -10H8M12 -10V-6"
            stroke="#38BDF8"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Label */}
          <rect x="-24" y="24" width="48" height="20" rx="10" fill="#0C2340" />
          <text x="0" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="Tajawal, sans-serif">
            إنجاز
          </text>
        </g>

        {/* Subtle decorative upward sparkles */}
        <circle cx="470" cy="45" r="2.5" fill="#0A4D92" fillOpacity="0.4" />
        <circle cx="450" cy="30" r="1.5" fill="#0A4D92" fillOpacity="0.6" />
        <circle cx="485" cy="75" r="2" fill="#0A4D92" fillOpacity="0.3" />
      </svg>
    </div>
  );
};
