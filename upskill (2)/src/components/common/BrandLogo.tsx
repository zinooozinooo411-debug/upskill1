import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showArabicSubtitle?: boolean;
  className?: string;
  variant?: 'full' | 'compact';
}

/**
 * Standalone Icon Mark of the Upskill Brand:
 * Circular checkmark with upward-pointing diagonal arrow (progress vector)
 * alongside ascending growth milestone bars.
 */
export const UpskillMark: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      {/* Outer circle with opening for arrow */}
      <circle
        cx="20"
        cy="26"
        r="14"
        stroke="#0A4D92"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      {/* Internal Checkmark */}
      <path
        d="M13.5 26.5L18 31L23.5 23"
        stroke="#0A4D92"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Upward Diagonal Arrow shooting from check toward top-right */}
      <path
        d="M19 29L34 14"
        stroke="#0A4D92"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      <path
        d="M25.5 13.5H34.5V22.5"
        stroke="#0A4D92"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ascending Growth Milestone Bars */}
      <rect x="38" y="24" width="3" height="16" rx="1.5" fill="#0A4D92" />
      <rect x="43" y="16" width="3" height="24" rx="1.5" fill="#0A4D92" />
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  showArabicSubtitle = false,
  className = '',
  variant = 'full'
}) => {
  // Height scale based on size prop
  const scaleClass =
    size === 'sm'
      ? 'h-8'
      : size === 'md'
        ? 'h-10 sm:h-11'
        : size === 'lg'
          ? 'h-14 sm:h-16'
          : 'h-16 sm:h-20';

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 select-none ${className}`}>
        <UpskillMark size={size === 'sm' ? 26 : size === 'lg' ? 40 : 32} />
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#0A4D92] leading-none">
            upskill
          </span>
          {showSubtitle && (
            <span className="text-[9px] font-semibold text-[#0C2340] tracking-wide uppercase mt-0.5">
              Evaluation
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      {/* SVG reproduction matching the official Upskill logo image */}
      <svg
        viewBox="0 0 340 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${scaleClass} w-auto`}
      >
        {/* Letter 'u' */}
        <path
          d="M14 38V62C14 71 20 78 30 78C40 78 46 71 46 62V38"
          stroke="#0A4D92"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter 'p' stem */}
        <path
          d="M59 38V98"
          stroke="#0A4D92"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Letter 'p' circular container with check & arrow */}
        <circle
          cx="82"
          cy="58"
          r="19"
          stroke="#0A4D92"
          strokeWidth="6"
        />

        {/* Inner Checkmark */}
        <path
          d="M73 59L79.5 65.5L88 54"
          stroke="#0A4D92"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Upward Diagonal Arrow passing through 'p' */}
        <path
          d="M81 63L110 34"
          stroke="#0A4D92"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Arrow head */}
        <path
          d="M97 33.5H111.5V48"
          stroke="#0A4D92"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter 's' */}
        <path
          d="M146 45C143 40.5 137.5 38 130 38C121 38 116 43 116 48.5C116 54.5 121 57.5 128.5 59.5L133 60.8C142 63.3 147 67 147 74C147 82 139 88 128 88C117.5 88 112 82.5 110 77"
          stroke="#0A4D92"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter 'k' stem & legs */}
        <path
          d="M162 20V78"
          stroke="#0A4D92"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M184 41L163 60L186 78"
          stroke="#0A4D92"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter 'i' (Ascending bar 1) */}
        <circle cx="202" cy="27" r="4.5" fill="#0A4D92" />
        <path
          d="M202 41V78"
          stroke="#0A4D92"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* First letter 'l' (Ascending bar 2 - taller) */}
        <path
          d="M220 18V78"
          stroke="#0A4D92"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Second letter 'l' (Ascending bar 3 - tallest growth milestone) */}
        <path
          d="M238 6V78"
          stroke="#0A4D92"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Subtitle: Student Evaluation Platform */}
        {showSubtitle && (
          <text
            x="116"
            y="94"
            fill="#0C2340"
            fontFamily="Tajawal, 'IBM Plex Sans Arabic', system-ui, -apple-system, sans-serif"
            fontSize="12.5"
            fontWeight="600"
            letterSpacing="0.4"
          >
            Student Evaluation Platform
          </text>
        )}
      </svg>

      {/* Optional Arabic Complementary Subtitle */}
      {showArabicSubtitle && (
        <span className="text-[11px] font-medium text-[#0A4D92]/80 mt-1 text-right">
          منصة تقييم وتوجيه الطلاب
        </span>
      )}
    </div>
  );
};
