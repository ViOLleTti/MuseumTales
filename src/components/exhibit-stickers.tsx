import type { ReactNode } from "react";
import type { ExhibitId } from "@/lib/types";

export function ExhibitHole({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative flex h-28 w-36 shrink-0 snap-center items-center justify-center overflow-hidden rounded-2xl bg-[#EAE6DF] ${className}`}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_8px_8px_16px_rgba(209,205,195,0.9),inset_-8px_-8px_16px_rgba(255,255,255,0.9)]" />
    </div>
  );
}

function ScrollSticker() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-3 60 60)">
        <path
          d="M24 38 Q60 42 96 38 L96 82 Q60 86 24 82 Z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="16"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <rect
          x="18"
          y="32"
          width="10"
          height="56"
          rx="4"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="16"
          strokeLinejoin="round"
        />
        <rect
          x="92"
          y="32"
          width="10"
          height="56"
          rx="4"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="16"
          strokeLinejoin="round"
        />
        <path d="M24 38 Q60 42 96 38 L96 82 Q60 86 24 82 Z" fill="#FDFDFD" stroke="#E8E4DB" strokeWidth="1.5" />
        <path d="M31 43 Q60 46 89 43 L89 77 Q60 80 31 77 Z" fill="#F4F3EF" />
        <rect x="18" y="32" width="10" height="56" rx="4" fill="#82A696" />
        <rect x="23" y="32" width="5" height="56" rx="2.5" fill="#6B8E7D" opacity="0.3" />
        <rect x="15" y="55" width="4" height="10" rx="2" fill="#5C7F6D" />
        <rect x="92" y="32" width="10" height="56" rx="4" fill="#82A696" />
        <rect x="92" y="32" width="5" height="56" rx="2.5" fill="#A8C4B6" opacity="0.6" />
        <rect x="101" y="55" width="4" height="10" rx="2" fill="#5C7F6D" />
        <path d="M28 39 L28 81" stroke="#E8E4DB" strokeWidth="1" strokeLinecap="round" />
        <path d="M92 39 L92 81" stroke="#E8E4DB" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function CoinSticker() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-2 60 60)">
        <defs>
          <g id="coin">
            <circle cx="0" cy="0" r="10.5" fill="#F3D370" stroke="#C49B30" strokeWidth="1" />
            <circle cx="0" cy="0" r="7.5" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            <polygon
              points="0,-2.5 0.8,-0.8 2.5,-0.8 1.2,0.5 1.8,2.5 0,1.2 -1.8,2.5 -1.2,0.5 -2.5,-0.8 -0.8,-0.8"
              fill="#C49B30"
            />
          </g>
        </defs>
        <rect x="8" y="28" width="104" height="64" rx="6" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="12" strokeLinejoin="round" />
        <rect x="8" y="28" width="104" height="64" rx="4" fill="#1A1A1A" stroke="#D4AF37" strokeWidth="1.5" />
        <g className="drop-shadow-[0px_4px_6px_rgba(0,0,0,0.8)]">
          <use href="#coin" x="15" y="76" />
          <use href="#coin" x="28.4" y="57" />
          <use href="#coin" x="48.4" y="45.5" />
          <use href="#coin" x="71.6" y="45.5" />
          <use href="#coin" x="91.6" y="57" />
          <use href="#coin" x="105" y="76" />
        </g>
      </g>
    </svg>
  );
}

function SilverPlateSticker() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(3 60 60)">
        <defs>
          <linearGradient id="ending-silverOuter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#E2E8F0" />
            <stop offset="45%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#94A3B8" />
            <stop offset="80%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="ending-silverInner" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="30%" stopColor="#64748B" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="37" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="12" />
        <circle cx="60" cy="60" r="37" fill="url(#ending-silverOuter)" stroke="#CBD5E1" strokeWidth="1" />
        <circle cx="60" cy="60" r="27.5" fill="none" stroke="#F3D370" strokeWidth="1.5" strokeDasharray="1.5,3" />
        <circle
          cx="60"
          cy="60"
          r="27.5"
          fill="none"
          stroke="#C49B30"
          strokeWidth="1.5"
          strokeDasharray="1.5,3"
          strokeDashoffset="1"
        />
        <circle cx="60" cy="60" r="27" fill="url(#ending-silverInner)" />
        <g className="drop-shadow-sm">
          <polygon points="60,38 72,44 60,50 48,44" fill="#F1F5F9" stroke="#1E293B" strokeWidth="0.75" strokeLinejoin="round" />
          <polygon points="48,44 60,50 60,78 48,72" fill="#CBD5E1" stroke="#1E293B" strokeWidth="0.75" strokeLinejoin="round" />
          <polygon points="60,50 72,44 72,72 60,78" fill="#FFFFFF" stroke="#1E293B" strokeWidth="0.75" strokeLinejoin="round" />
          <path
            d="M48 47.5 L60 53.5 M48 51 L60 57 M48 54.5 L60 60.5 M48 58 L60 64 M48 61.5 L60 67.5 M48 65 L60 71 M48 68.5 L60 74.5"
            stroke="#1E293B"
            strokeWidth="0.5"
            strokeLinecap="round"
          />
          <path
            d="M60 53.5 L72 47.5 M60 57 L72 51 M60 60.5 L72 54.5 M60 64 L72 58 M60 67.5 L72 61.5 M60 71 L72 65 M60 74.5 L72 68.5"
            stroke="#1E293B"
            strokeWidth="0.5"
            strokeLinecap="round"
          />
          <line x1="60" y1="50" x2="60" y2="78" stroke="#1E293B" strokeWidth="0.75" />
        </g>
      </g>
    </svg>
  );
}

function SilkSticker() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-4 60 60)">
        <defs>
          <pattern id="ending-weave" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
            <path d="M0,0 L3,3 M0,3 L3,0" stroke="#EAE5D9" strokeWidth="0.3" opacity="0.7" />
          </pattern>
        </defs>
        <rect x="22" y="15" width="76" height="90" rx="4" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="12" strokeLinejoin="round" />
        <rect x="22" y="15" width="76" height="90" rx="4" fill="#FDFCF8" />
        <rect
          x="22"
          y="15"
          width="76"
          height="90"
          rx="4"
          fill="url(#ending-weave)"
          stroke="#D4D0C8"
          strokeWidth="1.5"
          strokeDasharray="3,2"
          strokeLinejoin="round"
        />
        <path
          d="M42,65 Q50,75 65,65 M40,80 Q45,72 42,65 M75,34 Q65,45 72,52"
          stroke="#D4D0C8"
          strokeWidth="0.5"
          strokeDasharray="1.5,1.5"
          fill="none"
        />
        <g stroke="#0F0F0F" fill="none" strokeWidth="1.6" strokeDasharray="2.5,0.5" strokeLinecap="round" strokeLinejoin="round">
          <g transform="translate(72, 22)">
            <rect x="0" y="0" width="12" height="8" rx="0.5" />
            <polygon points="0,8 12,8 10,14 -2,14" />
            <line x1="-0.5" y1="10" x2="10.5" y2="10" strokeWidth="1" strokeDasharray="1.5,1" />
            <line x1="-1.5" y1="12" x2="9.5" y2="12" strokeWidth="1" strokeDasharray="1.5,1" />
          </g>
          <g transform="translate(42, 28)">
            <ellipse cx="0" cy="0" rx="9" ry="12" />
            <path
              d="M-3,-8 C0,-8 3,-5 3,-2 C3,-1 5,0 5,2 C5,4 2,5 1,6 L4,10 L-5,10 L-4,6 C-6,4 -6,1 -4,-2 C-4,-5 -4,-7 -3,-8 Z"
              strokeWidth="1.3"
            />
            <line x1="0" y1="-2" x2="2" y2="-2" strokeWidth="1" />
            <path d="M-3,6 L1,6" strokeWidth="1" />
          </g>
          <g transform="translate(56, 45)">
            <polyline points="5,25 5,0 15,0 15,25" />
            <line x1="2" y1="5" x2="18" y2="5" />
            <path d="M5,2 L0,8 L0,18" strokeWidth="1.3" strokeDasharray="2,2" />
            <path d="M10,2 L5,8 L5,18" strokeWidth="1.3" strokeDasharray="2,2" />
            <path d="M15,2 L10,8 L10,18" strokeWidth="1.3" strokeDasharray="2,2" />
            <line x1="-2" y1="8" x2="12" y2="8" strokeWidth="1" />
            <line x1="-2" y1="12" x2="12" y2="12" strokeWidth="1" />
            <line x1="-2" y1="16" x2="12" y2="16" strokeWidth="1" />
            <line x1="2" y1="15" x2="18" y2="15" />
            <line x1="2" y1="25" x2="18" y2="25" />
            <path d="M7,15 L7,25 M10,15 L10,25 M13,15 L13,25" strokeWidth="1" strokeDasharray="1.5,1.5" />
            <path d="M5,25 Q10,40 28,55" fill="none" />
            <path d="M15,25 Q20,35 38,45" fill="none" />
            <path d="M5,28 Q10,29 15,28" strokeWidth="1" strokeDasharray="1.5,1.5" />
            <path d="M7,34 Q13,35 18,33" strokeWidth="1" strokeDasharray="1.5,1.5" />
            <path d="M11,41 Q18,42 24,38" strokeWidth="1" strokeDasharray="1.5,1.5" />
            <path d="M17,48 Q25,49 32,42" strokeWidth="1" strokeDasharray="1.5,1.5" />
            <path d="M25,53 Q32,54 37,46" strokeWidth="1" strokeDasharray="1.5,1.5" />
          </g>
          <g transform="translate(36, 56)">
            <path d="M2,19 L10,19 M6,19 L6,9" />
            <rect x="0" y="3" width="5" height="7" rx="1" />
            <ellipse cx="7" cy="6.5" rx="3" ry="9" />
            <ellipse cx="7" cy="6.5" rx="1.5" ry="9" />
            <line x1="4" y1="-2.5" x2="10" y2="-2.5" />
            <line x1="4" y1="15.5" x2="10" y2="15.5" />
          </g>
          <g strokeWidth="1.3" strokeDasharray="1.5,1.5">
            <ellipse cx="32" cy="53" rx="1.2" ry="2.5" transform="rotate(30 32 53)" />
            <line x1="36" y1="46" x2="36" y2="52" transform="rotate(15 36 49)" />
            <ellipse cx="42" cy="47" rx="1.2" ry="2.5" />
            <line x1="48" y1="46" x2="48" y2="52" transform="rotate(-15 48 49)" />
            <line x1="52" y1="50" x2="52" y2="56" transform="rotate(-30 52 53)" />
            <ellipse cx="56" cy="58" rx="1.2" ry="2.5" transform="rotate(-45 56 58)" />
          </g>
          <g transform="translate(25, 80)">
            <line x1="12" y1="2" x2="18" y2="2" />
            <path d="M12,2 Q6,5 2,8" />
            <path d="M18,2 Q24,5 28,8" />
            <path d="M2,8 Q15,6 28,8" />
            <line x1="7" y1="7" x2="7" y2="16" />
            <line x1="11" y1="7" x2="11" y2="16" />
            <line x1="19" y1="7" x2="19" y2="16" />
            <line x1="23" y1="7" x2="23" y2="16" />
            <line x1="4" y1="16" x2="26" y2="16" />
            <line x1="2" y1="18" x2="28" y2="18" />
          </g>
        </g>
      </g>
    </svg>
  );
}

function BoatSticker() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(10, 8) rotate(2 60 60)">
        <polygon
          points="72,26 77,26 84,37 90,48 90,56 25,81 13,71 13,57 28,46 74,29"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="14"
          strokeLinejoin="round"
        />
        <polygon points="22,83 92,58 92,52 10,72" fill="#E8E4DB" opacity="0.8" />
        <g strokeLinejoin="round">
          <polygon points="25,81 13,71 13,63 25,73" fill="#222222" />
          <polygon points="25,81 90,56 90,48 25,73" fill="#111111" />
          <polygon points="25,73 32,70.2 25,81" fill="#FFFFFF" opacity="0.8" />
          <polygon points="25,73 90,48 78,38 13,63" fill="#8B5A2B" />
          <polygon points="28,60 38,68 38,54 28,46" fill="#2D55B4" />
          <polygon points="38,68 84,51 84,37 38,54" fill="#1E3A8A" />
          <polygon points="28,46 38,54 84,37 74,29" fill="#F1F5F9" />
          <g>
            <polygon points="46,61 52,59 52,53 46,55" fill="#FFFFFF" />
            <polygon points="47,60 51,58.7 51,54 47,55.3" fill="#87CEEB" />
            <polygon points="61,55.5 67,53.5 67,47.5 61,49.5" fill="#FFFFFF" />
            <polygon points="62,54.5 66,53.2 66,48.5 62,49.8" fill="#87CEEB" />
            <polygon points="76,50 82,48 82,42 76,44" fill="#FFFFFF" />
            <polygon points="77,49 81,47.7 81,43 77,44.3" fill="#87CEEB" />
          </g>
          <g stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round">
            <line x1="25" y1="73" x2="25" y2="67" />
            <line x1="31" y1="70.5" x2="31" y2="64.5" />
            <line x1="38" y1="68" x2="38" y2="62" />
            <line x1="25" y1="67" x2="38" y2="62" />
            <line x1="19" y1="68" x2="19" y2="62" />
            <line x1="13" y1="63" x2="13" y2="57" />
            <line x1="25" y1="67" x2="13" y2="57" />
          </g>
          <rect x="73" y="28" width="3" height="12" fill="#333333" />
          <polygon points="72,28 77,28 77,26 72,26" fill="#111111" />
          <ellipse cx="55" cy="47" rx="4.5" ry="2.2" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <ellipse
            cx="55"
            cy="47"
            rx="4.5"
            ry="2.2"
            fill="none"
            stroke="#DC2626"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />
          <line x1="87" y1="49.5" x2="80" y2="46" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round" />
          <polyline
            points="38,54 84,37"
            stroke="#FFFFFF"
            strokeWidth="0.75"
            fill="none"
            opacity="0.8"
          />
          <polyline points="13,63 25,73 90,48" stroke="#DC2626" strokeWidth="1" fill="none" />
        </g>
      </g>
    </svg>
  );
}

function ChessSticker() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(10, 10) rotate(-3 60 60)">
        <g fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="14" strokeLinejoin="round">
          <polygon points="15,45 85,45 100,85 0,85" />
          <circle cx="25" cy="45" r="4" />
          <circle cx="45" cy="43" r="5" />
          <circle cx="65" cy="35" r="6" />
          <polygon points="20,45 30,45 25,40" />
          <polygon points="38,45 52,45 45,38" />
          <polygon points="57,45 73,45 65,33" />
          <circle cx="25" cy="59" r="4" />
          <circle cx="50" cy="44" r="7" />
          <circle cx="75" cy="49" r="5" />
          <polygon points="18,65 32,65 25,56" />
          <polygon points="38,68 62,68 50,42" />
          <polygon points="68,62 82,62 75,47" />
        </g>
        <polygon points="5,82 95,82 80,50 20,50" fill="#E8E4DB" opacity="0.8" />
        <g>
          <polygon points="0,80 100,80 100,85 0,85" fill="#8B5A2B" />
          <polygon points="100,80 85,45 85,50 100,85" fill="#6B4226" />
          <polygon points="0,80 100,80 85,45 15,45" fill="#D2B48C" />
          <g stroke="#A0522D" strokeWidth="0.5">
            <line x1="4.3" y1="70" x2="95.7" y2="70" />
            <line x1="8.6" y1="60" x2="91.4" y2="60" />
            <line x1="12.9" y1="52" x2="87.1" y2="52" />
            <line x1="12.5" y1="80" x2="23.75" y2="45" />
            <line x1="25" y1="80" x2="32.5" y2="45" />
            <line x1="37.5" y1="80" x2="41.25" y2="45" />
            <line x1="50" y1="80" x2="50" y2="45" />
            <line x1="62.5" y1="80" x2="58.75" y2="45" />
            <line x1="75" y1="80" x2="67.5" y2="45" />
            <line x1="87.5" y1="80" x2="76.25" y2="45" />
          </g>
          <polygon points="0,80 12.5,80 14.5,70 4.3,70" fill="#A0522D" />
          <polygon points="25,80 37.5,80 35,70 26.5,70" fill="#A0522D" />
          <polygon points="50,80 62.5,80 57,70 50,70" fill="#A0522D" />
          <polygon points="75,80 87.5,80 83.5,70 71.5,70" fill="#A0522D" />
          <polygon points="14.5,70 26.5,70 28.5,60 18.5,60" fill="#A0522D" />
          <polygon points="35,70 50,70 50,60 38.5,60" fill="#A0522D" />
          <polygon points="57,70 71.5,70 65,60 55,60" fill="#A0522D" />
          <polygon points="83.5,70 95.7,70 87,60 78,60" fill="#A0522D" />
          <polygon points="8.6,60 18.5,60 21,52 12.9,52" fill="#A0522D" />
          <polygon points="28.5,60 38.5,60 40,52 31.5,52" fill="#A0522D" />
          <polygon points="50,60 55,60 53,52 50,52" fill="#A0522D" />
          <polygon points="65,60 78,60 71,52 61,52" fill="#A0522D" />
        </g>
        <g>
          <g transform="translate(25, 45)">
            <ellipse cx="0" cy="5" rx="5" ry="1.5" fill="#8B0000" />
            <path d="M-3,5 L-2,1 Q0,-2 2,1 L3,5 Z" fill="#8B0000" />
            <circle cx="0" cy="0" r="2.5" fill="#8B0000" />
          </g>
          <g transform="translate(45, 43)">
            <ellipse cx="0" cy="5" rx="6" ry="2" fill="#8B0000" />
            <path d="M-4,5 L-3,0 Q0,-4 3,0 L4,5 Z" fill="#8B0000" />
            <rect x="-1" y="-3" width="2" height="4" fill="#600000" />
            <rect x="-2" y="-2" width="4" height="2" fill="#600000" />
          </g>
          <g transform="translate(65, 40)">
            <ellipse cx="0" cy="7" rx="7" ry="2" fill="#8B0000" />
            <path d="M-4,7 L-3,-2 Q0,-6 3,-2 L4,7 Z" fill="#8B0000" />
            <path d="M-4,-2 L-5,-6 L-2,-4 L0,-7 L2,-4 L5,-6 L4,-2 Z" fill="#8B0000" />
          </g>
        </g>
        <g>
          <g transform="translate(25, 65)">
            <ellipse cx="0" cy="6" rx="8" ry="3" fill="#F0F0F0" />
            <ellipse cx="0" cy="4" rx="7" ry="2.5" fill="#E5E5E5" />
            <path d="M-6,4 L-4,-4 Q0,-6 4,-4 L6,4 Z" fill="#F9F9F9" />
            <path d="M-5,-1 Q0,2 5,-1 L4,3 L-4,3 Z" fill="#EEEEEE" />
            <circle cx="0" cy="-6" r="3.5" fill="#FFFFFF" />
          </g>
          <g transform="translate(50, 68)">
            <ellipse cx="0" cy="8" rx="12" ry="4" fill="#A0522D" opacity="0.6" />
            <ellipse cx="0" cy="6" rx="12" ry="4" fill="#F0F0F0" />
            <ellipse cx="0" cy="3" rx="10" ry="3" fill="#E5E5E5" />
            <path d="M-8,3 L-6,-8 Q-4,-14 2,-12 Q6,-10 8,3 Z" fill="#F9F9F9" />
            <path d="M-2,-10 Q-8,-10 -10,-6 Q-10,-4 -6,-4 Z" fill="#F9F9F9" />
            <path d="M-3,-5 L-4,-18 Q0,-22 4,-18 L3,-5 Z" fill="#FFFFFF" />
            <path d="M0,-8 L6,-10 L8,-4 L4,2 Z" fill="#EEEEEE" stroke="#E5E5E5" strokeWidth="0.5" />
            <circle cx="0" cy="-20" r="4" fill="#FFFFFF" />
            <path d="M0,-24 Q-4,-26 -8,-22" fill="none" stroke="#F0F0F0" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <g transform="translate(75, 62)">
            <ellipse cx="0" cy="5" rx="8" ry="2.5" fill="#F0F0F0" />
            <ellipse cx="0" cy="3" rx="7" ry="2" fill="#E5E5E5" />
            <path d="M-5,3 L-3,-8 Q0,-10 3,-8 L5,3 Z" fill="#F9F9F9" />
            <path d="M-3,-8 L0,-14 L3,-8 Z" fill="#FFFFFF" />
            <path d="M-2,-8 L0,-12 L2,-8 Z" fill="#EEEEEE" />
            <line x1="-4" y1="3" x2="-6" y2="-12" stroke="#E5E5E5" strokeWidth="1" />
            <circle cx="-6" cy="-13" r="1.5" fill="#EEEEEE" />
          </g>
        </g>
      </g>
    </svg>
  );
}

function ElephantSticker() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(15, 12) rotate(-5 50 50)">
        <ellipse cx="45" cy="81" rx="36" ry="6" fill="#E8E4DB" opacity="0.8" />
        <g transform="translate(90, 0) scale(-1, 1)">
          <g fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="14" strokeLinejoin="round">
            <path d="M 40,35 C 55,35 68,40 70,50 L 70,80 L 58,80 L 58,65 C 58,60 46,60 46,65 L 46,80 L 34,80 L 34,65 C 34,60 28,60 26,65 C 24,68 20,73 20,78 C 20,83 14,83 14,78 C 14,60 18,48 26,42 C 30,37 35,35 40,35 Z" />
            <path d="M 70,50 C 75,55 75,65 73,72" />
            <path d="M 38,36 C 48,34 60,36 67,41 L 65,55 L 36,48 Z" />
          </g>
          <g>
            <path d="M 62,65 L 62,78 L 72,78 L 72,65 Z" fill="#D3D3D3" />
            <path d="M 38,65 L 38,78 L 48,78 L 48,65 Z" fill="#D3D3D3" />
            <circle cx="42" cy="77" r="1.5" fill="#27408B" />
            <circle cx="46" cy="77" r="1.5" fill="#27408B" />
            <circle cx="66" cy="77" r="1.5" fill="#27408B" />
            <circle cx="70" cy="77" r="1.5" fill="#27408B" />
            <path
              d="M 40,35 C 55,35 68,40 70,50 L 70,80 L 58,80 L 58,65 C 58,60 46,60 46,65 L 46,80 L 34,80 L 34,65 C 34,60 28,60 26,65 C 24,68 20,73 20,78 C 20,83 14,83 14,78 C 14,60 18,48 26,42 C 30,37 35,35 40,35 Z"
              fill="#FDFDFD"
            />
            <path
              d="M 46,65 L 46,80 L 34,80 L 34,65 C 34,60 28,60 26,65 C 24,68 20,73 20,78 C 20,83 14,83 14,78 C 14,60 18,48 26,42 C 28,45 28,55 35,55 C 42,55 45,60 46,65 Z"
              fill="#E0E0E0"
            />
            <path d="M 70,50 L 70,80 L 58,80 L 58,65 C 58,60 46,60 46,65 C 55,65 65,60 70,50 Z" fill="#EAEAEA" />
            <circle cx="36" cy="79.5" r="1.5" fill="#4169E1" />
            <circle cx="40" cy="79.5" r="1.5" fill="#4169E1" />
            <circle cx="44" cy="79.5" r="1.5" fill="#4169E1" />
            <circle cx="60" cy="79.5" r="1.5" fill="#4169E1" />
            <circle cx="64" cy="79.5" r="1.5" fill="#4169E1" />
            <circle cx="68" cy="79.5" r="1.5" fill="#4169E1" />
            <path d="M 23,54 Q 15,58 12,52 Q 15,55 21,52 Z" fill="#FFFFFF" stroke="#AAAAAA" strokeWidth="0.5" />
            <ellipse cx="28" cy="46" rx="1" ry="1.5" fill="#333333" />
            <path d="M 26,44 Q 28,43 30,44.5" stroke="#888888" strokeWidth="0.5" fill="none" />
            <path d="M 38,36 C 48,34 60,36 67,41 L 65,55 L 36,48 Z" fill="#FFD700" />
            <path d="M 39,38 C 48,36 58,38 64,43 L 62,53 L 37,46 Z" fill="#FFC125" />
            <path
              d="M 36,48 L 35,53 M 40,49 L 39,54 M 44,49.5 L 43,54.5 M 48,50 L 47,55 M 52,51 L 51,56 M 56,52 L 55,57 M 60,53 L 59,58 M 65,55 L 64,60"
              stroke="#FFD700"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path d="M 38,36 C 34,36 28,38 25,43 L 30,48 C 34,44 36,40 38,36 Z" fill="#FFA500" />
            <path
              d="M 25,43 L 23,47 M 27.5,45 L 25.5,49 M 30,48 L 28,52 M 33,46 L 31,50 M 36,44 L 34,48 M 38,40 L 36,44"
              stroke="#FF8C00"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path d="M 38,40 C 46,38 52,48 48,56 C 44,64 36,58 34,50 C 32,44 34,41 38,40 Z" fill="#FFC125" />
            <path d="M 38,44 C 41,43 45,47 44,53 M 41,45 C 43,44 47,48 46,52" stroke="#DAA520" strokeWidth="0.5" fill="none" />
            <path d="M 70,50 C 75,55 75,65 73,72" stroke="#4169E1" strokeWidth="2" fill="none" />
            <polygon points="73,72 71,76 75,76" fill="#4169E1" />
            <g transform="translate(30, 52)">
              <circle cx="-1.5" cy="-1.5" r="1.5" fill="#FF69B4" />
              <circle cx="1.5" cy="-1.5" r="1.5" fill="#FF69B4" />
              <circle cx="-1.5" cy="1.5" r="1.5" fill="#FF69B4" />
              <circle cx="1.5" cy="1.5" r="1.5" fill="#FF69B4" />
              <circle cx="0" cy="0" r="1" fill="#FFD700" />
            </g>
            <g transform="translate(26, 55) scale(0.8)">
              <circle cx="-1.5" cy="-1.5" r="1.5" fill="#FF8C00" />
              <circle cx="1.5" cy="-1.5" r="1.5" fill="#FF8C00" />
              <circle cx="-1.5" cy="1.5" r="1.5" fill="#FF8C00" />
              <circle cx="1.5" cy="1.5" r="1.5" fill="#FF8C00" />
              <circle cx="0" cy="0" r="1" fill="#FFFFFF" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

function ChariotSticker() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(10, 8) rotate(-3 50 50)">
        <ellipse cx="50" cy="94" rx="42" ry="6" fill="#E8E4DB" opacity="0.8" />
        <defs>
          <g id="ending-bronze-horse">
            <path d="M -2.5,25 L -4,21 L -1,24 M 2.5,25 L 4,21 L 1,24" stroke="#9E6B5D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M -2.5,25 Q 0,23 2.5,25 L 2,35 Q 0,38 -2,35 Z" fill="#B37E6B" />
            <path d="M -1.5,35 Q 0,37 1.5,35 Z" fill="#6B4235" />
            <circle cx="-1.5" cy="28" r="0.8" fill="#1A2016" />
            <circle cx="1.5" cy="28" r="0.8" fill="#1A2016" />
            <path d="M -2.5,25 Q 0,30 2.5,25" stroke="#8A5A4D" strokeWidth="0.5" fill="none" />
            <path d="M -2.5,28 Q -6,38 -7,48 Q 0,50 7,48 Q 6,38 2.5,28 Z" fill="#9E6B5D" />
            <path d="M -2.5,32 Q -4,40 -5,47 M 2.5,32 Q 4,40 5,47" stroke="#8A5A4D" strokeWidth="1" fill="none" />
            <path d="M 0,30 L 0,47" stroke="#B37E6B" strokeWidth="1" fill="none" />
            <path d="M -4,50 L 4,50 L 3,60 L -3,60 Z" fill="#6B4235" />
            <path d="M -3.5,58 Q -5,64 -3.5,68 L -2,68 Q -3,64 -1.5,58 Z" fill="#7A4C3D" />
            <circle cx="-2.75" cy="68" r="1.2" fill="#5C362B" />
            <path d="M -3.5,68 L -4.5,76 L -2,76 L -2,68 Z" fill="#5C362B" />
            <path d="M -4.5,76 L -5.5,79 L -1.5,79 L -2,76 Z" fill="#2E1C15" />
            <path d="M 3.5,58 Q 5,64 3.5,68 L 2,68 Q 3,64 1.5,58 Z" fill="#7A4C3D" />
            <circle cx="2.75" cy="68" r="1.2" fill="#5C362B" />
            <path d="M 3.5,68 L 4.5,76 L 2,76 L 2,68 Z" fill="#5C362B" />
            <path d="M 4.5,76 L 5.5,79 L 1.5,79 L 2,76 Z" fill="#2E1C15" />
            <path d="M -7,48 Q -10,58 -6,68 L 6,68 Q 10,58 7,48 Z" fill="#8C5C4D" />
            <path d="M -6,50 Q -4,60 -1.5,65 M 6,50 Q 4,60 1.5,65" stroke="#B37E6B" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 0,48 L 0,65" stroke="#7A4C3D" strokeWidth="1.5" fill="none" />
            <path d="M -6,65 Q -8,70 -5,75 L -3,75 Q -4,70 -1.5,65 Z" fill="#9E6B5D" />
            <circle cx="-4" cy="75" r="1.5" fill="#8A5A4D" />
            <path d="M -5,75 L -6,85 L -3,85 L -3,75 Z" fill="#7A4C3D" />
            <path d="M -6,85 L -7.5,89 L -2.5,89 L -3,85 Z" fill="#2E1C15" />
            <path d="M -4.5,76 L -5.5,84" stroke="#5C362B" strokeWidth="0.5" />
            <path d="M 6,65 Q 8,70 5,75 L 3,75 Q 4,70 1.5,65 Z" fill="#9E6B5D" />
            <circle cx="4" cy="75" r="1.5" fill="#8A5A4D" />
            <path d="M 5,75 L 6,85 L 3,85 L 3,75 Z" fill="#7A4C3D" />
            <path d="M 6,85 L 7.5,89 L 2.5,89 L 3,85 Z" fill="#2E1C15" />
            <path d="M 4.5,76 L 5.5,84" stroke="#5C362B" strokeWidth="0.5" />
            <path d="M -3.5,32 Q 0,35 3.5,32" stroke="#C4A661" strokeWidth="1" fill="none" />
            <circle cx="-3.5" cy="32" r="1" fill="#8B7355" />
            <circle cx="3.5" cy="32" r="1" fill="#8B7355" />
            <path d="M -7,48 Q 0,54 7,48" stroke="#8B7355" strokeWidth="1.5" fill="none" />
            <circle cx="0" cy="51" r="1.5" fill="#C4A661" />
          </g>
        </defs>
        <g fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="14" strokeLinejoin="round">
          <path d="M 22,22 Q 50,0 78,22 L 78,25 Q 50,12 22,25 Z" />
          <rect x="40" y="25" width="20" height="20" />
          <rect x="15" y="40" width="70" height="25" />
          <ellipse cx="29" cy="70" rx="4" ry="16" />
          <ellipse cx="71" cy="70" rx="4" ry="16" />
          <rect x="16" y="25" width="5" height="60" rx="2" />
          <rect x="37" y="25" width="5" height="60" rx="2" />
          <rect x="58" y="25" width="5" height="60" rx="2" />
          <rect x="79" y="25" width="5" height="60" rx="2" />
        </g>
        <g>
          <path d="M 28,45 L 72,45 L 68,60 L 32,60 Z" fill="#5E4B35" />
          <path d="M 28,45 L 28,55 M 72,45 L 72,55" stroke="#8B7355" strokeWidth="1.5" />
          <rect x="48.5" y="20" width="3" height="30" fill="#4A3B2C" />
          <path d="M 44,45 L 45,36 Q 50,34 55,36 L 56,45 Z" fill="#4C5E47" />
          <circle cx="50" cy="32" r="4.5" fill="#C4A661" />
          <path d="M 45,31 Q 50,23 55,31 Z" fill="#3C4A38" />
          <path d="M 48,27 L 52,27 L 50,23 Z" fill="#2E3A28" />
          <path d="M 46,38 L 40,43 M 54,38 L 60,43" stroke="#596A53" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="29" cy="70" rx="4" ry="16" fill="#6B6254" stroke="#4A3B2C" strokeWidth="1.5" />
          <path d="M 29,54 L 29,86 M 25,70 L 33,70 M 27.5,60 L 30.5,80 M 27.5,80 L 30.5,60" stroke="#3A2D21" strokeWidth="1" />
          <ellipse cx="29" cy="70" rx="1.5" ry="3" fill="#2E2319" />
          <ellipse cx="71" cy="70" rx="4" ry="16" fill="#6B6254" stroke="#4A3B2C" strokeWidth="1.5" />
          <path d="M 71,54 L 71,86 M 67,70 L 75,70 M 69.5,60 L 72.5,80 M 69.5,80 L 72.5,60" stroke="#3A2D21" strokeWidth="1" />
          <ellipse cx="71" cy="70" rx="1.5" ry="3" fill="#2E2319" />
          <path d="M 15,52 Q 50,48 85,52" stroke="#4A3B2C" strokeWidth="2" fill="none" />
          <path
            d="M 40,43 Q 30,45 18.5,32 M 40,43 Q 42,42 39.5,32 M 60,43 Q 58,42 60.5,32 M 60,43 Q 70,45 81.5,32"
            stroke="#3A2D21"
            strokeWidth="1"
            fill="none"
          />
          <use href="#ending-bronze-horse" x="18.5" y="0" />
          <use href="#ending-bronze-horse" x="39.5" y="0" />
          <use href="#ending-bronze-horse" x="60.5" y="0" />
          <use href="#ending-bronze-horse" x="81.5" y="0" />
          <path d="M 22,22 Q 50,0 78,22 L 78,25 Q 50,12 22,25 Z" fill="#4C5E47" />
          <path d="M 50,12 L 50,22 M 38,16 L 33,24 M 62,16 L 67,24" stroke="#3C4A38" strokeWidth="1" />
          <circle cx="50" cy="11" r="2.5" fill="#C4A661" />
        </g>
      </g>
    </svg>
  );
}

const EXHIBIT_STICKER_COMPONENTS: Record<ExhibitId, () => JSX.Element> = {
  E1: SilverPlateSticker,
  E2: CoinSticker,
  E3: SilkSticker,
  E4: ElephantSticker,
  E5: ChessSticker,
  E6: ChariotSticker,
  E7: ScrollSticker,
  E8: BoatSticker,
};

export function ExhibitSticker({ exhibitId }: { exhibitId: ExhibitId }) {
  const StickerComponent = EXHIBIT_STICKER_COMPONENTS[exhibitId];
  return <StickerComponent />;
}
