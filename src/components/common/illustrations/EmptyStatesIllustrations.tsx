import React from 'react';

/**
 * Editorial SVG Illustrations for empty states matching the design mockup:
 * 1. Journey / Goals: Mountain with summit flag & ascending path
 * 2. Students: Group silhouette of students
 * 3. Feedback: Document with checklist and directional arrow
 */

export const EmptyJourneyIllustration: React.FC<{ className?: string }> = ({
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 160 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-28 h-24 object-contain"
      >
        {/* Mountain Silhouette */}
        <path
          d="M20 110L70 45L105 85L130 60L150 110H20Z"
          fill="#0A4D92"
          fillOpacity="0.12"
        />
        <path
          d="M40 110L85 30L140 110H40Z"
          fill="#0A4D92"
          fillOpacity="0.2"
        />

        {/* Dashed trail climbing to summit */}
        <path
          d="M45 105C60 95 72 80 82 50L85 32"
          stroke="#0A4D92"
          strokeWidth="2"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />

        {/* Summit Flagpole & Flag */}
        <line x1="85" y1="12" x2="85" y2="35" stroke="#0A4D92" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M85 14L105 22L85 30V14Z" fill="#0A4D92" />

        {/* Base ground line */}
        <line x1="15" y1="110" x2="145" y2="110" stroke="#0A4D92" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export const EmptyStudentsIllustration: React.FC<{ className?: string }> = ({
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 160 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-28 h-24 object-contain"
      >
        {/* Student 1 (Left) */}
        <g transform="translate(32, 45)">
          <circle cx="16" cy="14" r="8" fill="#0A4D92" fillOpacity="0.4" />
          <path d="M4 48C4 36 12 30 28 30C44 30 52 36 52 48H4Z" fill="#0A4D92" fillOpacity="0.25" />
        </g>

        {/* Student 3 (Right) */}
        <g transform="translate(80, 45)">
          <circle cx="16" cy="14" r="8" fill="#0A4D92" fillOpacity="0.4" />
          <path d="M4 48C4 36 12 30 28 30C44 30 52 36 52 48H4Z" fill="#0A4D92" fillOpacity="0.25" />
        </g>

        {/* Student 2 (Center - Front & Prominent) */}
        <g transform="translate(56, 32)">
          <circle cx="24" cy="18" r="11" fill="#0A4D92" />
          <path d="M8 65C8 48 18 40 40 40C62 40 72 48 72 65H8Z" fill="#0A4D92" fillOpacity="0.75" />
          {/* Subtle backpack strap */}
          <path d="M22 46V62" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
          <path d="M58 46V62" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
        </g>

        {/* Base ground line */}
        <line x1="20" y1="105" x2="140" y2="105" stroke="#0A4D92" strokeWidth="1.5" strokeOpacity="0.2" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export const EmptyFeedbackIllustration: React.FC<{ className?: string }> = ({
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 160 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-28 h-24 object-contain"
      >
        {/* Document Sheet */}
        <rect x="45" y="20" width="70" height="85" rx="6" fill="#FFFFFF" stroke="#0A4D92" strokeWidth="2" />
        
        {/* Document Header Line */}
        <rect x="55" y="32" width="30" height="4" rx="2" fill="#0A4D92" />

        {/* Lines */}
        <rect x="55" y="44" width="50" height="3" rx="1.5" fill="#0A4D92" fillOpacity="0.3" />
        <rect x="55" y="54" width="45" height="3" rx="1.5" fill="#0A4D92" fillOpacity="0.3" />
        <rect x="55" y="64" width="35" height="3" rx="1.5" fill="#0A4D92" fillOpacity="0.3" />

        {/* Check & Upward Arrow Emblem at Bottom Right of Document */}
        <g transform="translate(98, 88)">
          <circle cx="0" cy="0" r="14" fill="#0A4D92" />
          <path d="M-5 0L-1 4L6 -3" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
};
