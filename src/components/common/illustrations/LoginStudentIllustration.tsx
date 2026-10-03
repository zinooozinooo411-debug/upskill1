import React from 'react';

interface LoginStudentIllustrationProps {
  className?: string;
}

/**
 * Editorial vector illustration for the Login View (Matching uploaded mockup):
 * Student with backpack climbing ascending milestone blocks toward the summit flag & upward arrow.
 */
export const LoginStudentIllustration: React.FC<LoginStudentIllustrationProps> = ({
  className = ''
}) => {
  return (
    <div className={`relative w-full flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 340 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[320px] h-auto object-contain"
      >
        <defs>
          <linearGradient id="loginStepGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A4D92" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0A4D92" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Stepped Ascending Milestone Blocks */}
        {/* Step 1 */}
        <rect x="30" y="250" width="60" height="70" rx="4" fill="#0A4D92" fillOpacity="0.08" />
        <rect x="30" y="248" width="60" height="4" fill="#0A4D92" fillOpacity="0.3" />

        {/* Step 2 */}
        <rect x="95" y="200" width="60" height="120" rx="4" fill="#0A4D92" fillOpacity="0.14" />
        <rect x="95" y="198" width="60" height="4" fill="#0A4D92" fillOpacity="0.4" />

        {/* Step 3 */}
        <rect x="160" y="150" width="60" height="170" rx="4" fill="#0A4D92" fillOpacity="0.2" />
        <rect x="160" y="148" width="60" height="4" fill="#0A4D92" fillOpacity="0.6" />

        {/* Step 4 (Summit Pillar) */}
        <rect x="225" y="90" width="65" height="230" rx="4" fill="#0A4D92" fillOpacity="0.35" />
        <rect x="225" y="87" width="65" height="5" fill="#0A4D92" />

        {/* Dashed Ascending trajectory line */}
        <path
          d="M50 240L125 190L190 140L255 80"
          stroke="#0A4D92"
          strokeWidth="2.5"
          strokeDasharray="5 5"
          strokeLinecap="round"
        />

        {/* Summit Flag & Upward Directional Arrow */}
        <g transform="translate(258, 40)">
          {/* Flagpole */}
          <line x1="0" y1="0" x2="0" y2="48" stroke="#0A4D92" strokeWidth="3" strokeLinecap="round" />
          {/* Flag banner with checkmark motif */}
          <path
            d="M0 2L28 12L0 22V2Z"
            fill="#0A4D92"
          />
          {/* Summit Upward Arrow shooting up */}
          <path
            d="M12 -8L24 -20M24 -20H15M24 -20V-11"
            stroke="#0A4D92"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* ======================================================== */}
        {/* STUDENT FIGURE CLIMBING (Ascending onto Step 2) */}
        {/* ======================================================== */}
        <g transform="translate(68, 120)">
          {/* Head & Cap */}
          <circle cx="20" cy="14" r="8" fill="#0C2340" />
          <path d="M12 14C12 10 16 8 22 8L28 10V14H12Z" fill="#0A4D92" />

          {/* Neck */}
          <rect x="18" y="21" width="4" height="4" fill="#0C2340" />

          {/* Torso leaning forward in determined posture */}
          <path
            d="M12 25C15 23 27 23 29 25L32 60H11L12 25Z"
            fill="#0A4D92"
          />

          {/* Backpack */}
          <path
            d="M7 28C5 28 4 30 4 34V52C4 56 6 58 9 58H12V28H7Z"
            fill="#08386B"
          />
          <path d="M12 30C16 32 17 38 17 48" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />

          {/* Stepping Leg (Right leg lifted onto step) */}
          <path
            d="M24 58L34 78L44 78L36 58"
            fill="#0C2340"
          />
          <rect x="36" y="76" width="12" height="5" rx="2" fill="#0A4D92" />

          {/* Supporting Leg (Left leg pushing up from lower step) */}
          <path
            d="M13 58L10 88L18 88L20 58"
            fill="#0C2340"
          />
          <rect x="8" y="86" width="12" height="5" rx="2" fill="#0A4D92" />

          {/* Arm holding strap / reaching forward */}
          <path
            d="M26 28L36 42L33 46L24 34"
            fill="#0A4D92"
          />
        </g>

        {/* Small floating progress sparkles */}
        <circle cx="270" cy="110" r="2" fill="#0A4D92" fillOpacity="0.4" />
        <circle cx="210" cy="70" r="1.5" fill="#0A4D92" fillOpacity="0.5" />
      </svg>
    </div>
  );
};
