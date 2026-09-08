import React from 'react';

interface ScudropLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
}

export const ScudropLogo: React.FC<ScudropLogoProps> = ({
  size = 40,
  className = '',
  showText = false,
  textColor = 'text-slate-900',
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="relative shrink-0 rounded-full shadow-md shadow-blue-900/20 hover:scale-105 transition-transform duration-200"
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-sm select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="scudropBlueGlow" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stop-color="#0029f5" />
              <stop offset="65%" stop-color="#001bd4" />
              <stop offset="100%" stop-color="#0012a8" />
            </radialGradient>
            <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.3" />
            </filter>
          </defs>

          {/* Outer Ring */}
          <circle cx="100" cy="100" r="98" fill="#0c111d" />

          {/* Royal Electric Blue Background Disk */}
          <circle cx="100" cy="100" r="92" fill="url(#scudropBlueGlow)" />

          {/* "FR" Region Indicator */}
          <text
            x="166"
            y="56"
            fill="#ffffff"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="800"
            fontSize="21"
            letterSpacing="0.5"
            textAnchor="end"
          >
            FR
          </text>

          {/* Scudrop S Geometric Monogram */}
          <g filter="url(#logoShadow)">
            {/* Top White Ribbon */}
            <path
              d="M 80 48
                 L 134 48
                 L 156 70
                 L 136 90
                 L 118 90
                 L 118 72
                 L 88 72
                 L 58 102
                 L 58 126
                 L 46 114
                 L 46 84
                 Z"
              fill="#f8fafc"
            />

            {/* Bottom White Ribbon (Inverted 180°) */}
            <path
              d="M 120 152
                 L 66 152
                 L 44 130
                 L 64 110
                 L 82 110
                 L 82 128
                 L 112 128
                 L 142 98
                 L 142 74
                 L 154 86
                 L 154 116
                 Z"
              fill="#f8fafc"
            />

            {/* Central White Core Square */}
            <rect x="84" y="84" width="32" height="32" fill="#ffffff" />

            {/* Upper Right Cutout Square */}
            <rect x="116" y="66" width="26" height="24" fill="#001bd4" />

            {/* Lower Left Cutout Square */}
            <rect x="58" y="110" width="26" height="24" fill="#001bd4" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-xl ${textColor}`}>
              SCUDROP
            </span>
            <span className="bg-[#001cd6] text-white text-[11px] font-bold px-1.5 py-0.5 rounded tracking-wider shadow-sm">
              FR
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
            Order & Profit Control
          </span>
        </div>
      )}
    </div>
  );
};
