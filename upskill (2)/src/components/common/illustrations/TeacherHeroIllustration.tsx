import React from 'react';

interface TeacherHeroIllustrationProps {
  className?: string;
}

/**
 * Editorial vector illustration for Teacher Dashboard Hero (Matching uploaded mockup):
 * Teacher mentoring students with an upward trending arrow chart and collaborative growth motif.
 */
export const TeacherHeroIllustration: React.FC<TeacherHeroIllustrationProps> = ({
  className = ''
}) => {
  return (
    <div className={`relative w-full flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 420 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[380px] h-auto object-contain"
      >
        <defs>
          <linearGradient id="teacherChartGrad" x1="60" y1="140" x2="380" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A4D92" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#0A4D92" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        {/* Upward Growth Polygon Chart in Background */}
        <path
          d="M80 150L160 125L240 95L320 60L390 25V165H80V150Z"
          fill="url(#teacherChartGrad)"
        />

        {/* Dynamic Upward Direction Line with arrow at summit */}
        <path
          d="M80 150L160 125L240 95L320 60L390 25"
          stroke="#0A4D92"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Summit Arrow Head */}
        <path
          d="M375 25H392V42"
          stroke="#0A4D92"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Background Grid Lines */}
        <line x1="80" y1="165" x2="400" y2="165" stroke="#E2E8F0" strokeWidth="1.2" />
        <line x1="80" y1="120" x2="400" y2="120" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="80" y1="75" x2="400" y2="75" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="3 3" />

        {/* ======================================================== */}
        {/* TEACHER & STUDENTS SILHOUETTE FIGURES */}
        {/* ======================================================== */}

        {/* Teacher Figure (Standing tall on left, holding clipboard/tablet) */}
        <g transform="translate(110, 50)">
          {/* Head */}
          <circle cx="20" cy="15" r="9" fill="#0C2340" />
          {/* Glasses or neat hair */}
          <path d="M12 15C12 9 17 6 24 6C28 6 30 9 30 15H12Z" fill="#0A4D92" />
          {/* Torso / Blazer */}
          <path
            d="M10 27C14 25 26 25 30 27L34 75H6L10 27Z"
            fill="#0A4D92"
          />
          {/* Tablet / Folder in hand */}
          <rect x="26" y="40" width="14" height="20" rx="2" fill="#0C2340" stroke="#FFFFFF" strokeWidth="1" />
          {/* Arm pointing forward guiding */}
          <path d="M26 32L38 42" stroke="#0A4D92" strokeWidth="3" strokeLinecap="round" />
          {/* Legs */}
          <line x1="15" y1="75" x2="15" y2="115" stroke="#0C2340" strokeWidth="6" strokeLinecap="round" />
          <line x1="25" y1="75" x2="25" y2="115" stroke="#0C2340" strokeWidth="6" strokeLinecap="round" />
        </g>

        {/* Student 1 (Middle, attentive, holding book) */}
        <g transform="translate(190, 72)">
          {/* Head */}
          <circle cx="16" cy="14" r="7.5" fill="#0C2340" />
          {/* Backpack */}
          <rect x="3" y="24" width="7" height="18" rx="2" fill="#08386B" />
          {/* Body */}
          <path d="M8 24C11 22 21 22 24 24L26 62H6L8 24Z" fill="#0A4D92" />
          {/* Notebook */}
          <rect x="14" y="34" width="12" height="16" rx="1.5" fill="#FFFFFF" stroke="#0A4D92" strokeWidth="1.2" />
          {/* Legs */}
          <line x1="12" y1="62" x2="12" y2="93" stroke="#0C2340" strokeWidth="5" strokeLinecap="round" />
          <line x1="20" y1="62" x2="20" y2="93" stroke="#0C2340" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* Student 2 (Right, looking up toward summit arrow) */}
        <g transform="translate(260, 60)">
          {/* Head looking right */}
          <circle cx="16" cy="13" r="7.5" fill="#0C2340" />
          {/* Body */}
          <path d="M9 23C12 21 20 21 23 23L27 68H5L9 23Z" fill="#0C2340" />
          {/* Arm raised towards the rising goal line */}
          <path d="M22 28L32 18" stroke="#0A4D92" strokeWidth="3" strokeLinecap="round" />
          {/* Legs */}
          <line x1="11" y1="68" x2="11" y2="105" stroke="#0A4D92" strokeWidth="5" strokeLinecap="round" />
          <line x1="21" y1="68" x2="21" y2="105" stroke="#0A4D92" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* Checkmark icon badge at the high point */}
        <g transform="translate(390, 25)">
          <circle cx="0" cy="0" r="12" fill="#0A4D92" />
          <path d="M-4 0L-1 3L5 -3" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
};
