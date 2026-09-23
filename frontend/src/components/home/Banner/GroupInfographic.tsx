"use client";

import {
  HardHat,
  PlaneTakeoff,
  Sparkles,
  Store,
  Trees,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";
import { usePrefersReducedMotion } from "@/components/theme/useInView";

type Node = { label: string; icon: LucideIcon };

const nodes: Node[] = [
  { label: "Construction & Real Estate", icon: HardHat },
  { label: "Facility Support & Cleaning", icon: Sparkles },
  { label: "Machinery & Engineering", icon: Wrench },
  { label: "Plantation & Agriculture", icon: Trees },
  { label: "Mini Market & Retail", icon: Store },
  { label: "Travel & Ticketing", icon: PlaneTakeoff },
];

const SIZE = 520;
const C = SIZE / 2;
const R = 182;
const HUB_R = 84; // spokes start at the hub edge

const point = (index: number, radius = R) => {
  const angle = (-90 + index * 60) * (Math.PI / 180);
  return { x: C + radius * Math.cos(angle), y: C + radius * Math.sin(angle) };
};

/**
 * Animated group-structure infographic. The holding company sits at the hub;
 * six sector "orbs" (3D-shaded) sit on the orbit. Thick gradient spokes draw in
 * on load, then carry a continuous energy flow and travelling pulses.
 */
export default function GroupInfographic() {
  const reduced = usePrefersReducedMotion();

  return (
    <figure
      className="relative mx-auto aspect-square w-full max-w-[500px]"
      aria-label="AM Management Group operates six business sectors from one holding company"
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <radialGradient id="am-hub-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fb731f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fb731f" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="am-spoke" gradientUnits="userSpaceOnUse" x1={C} y1={C - R} x2={C} y2={C + R}>
            <stop offset="0%" stopColor="#ff9a52" />
            <stop offset="50%" stopColor="#fb731f" />
            <stop offset="100%" stopColor="#ff9a52" />
          </linearGradient>
          <filter id="am-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={C} cy={C} r={170} fill="url(#am-hub-glow)" />

        {/* orbit rings */}
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgb(255 255 255 / 0.16)" strokeWidth="1.5" />
        <circle cx={C} cy={C} r={R - 62} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="1" />
        <g style={{ transformOrigin: `${C}px ${C}px`, animation: reduced ? undefined : "am-spin 50s linear infinite" }}>
          <circle cx={C} cy={C} r={R + 40} fill="none" stroke="rgb(251 115 31 / 0.6)" strokeWidth="2" strokeDasharray="1 12" strokeLinecap="round" />
        </g>
        <g style={{ transformOrigin: `${C}px ${C}px`, animation: reduced ? undefined : "am-spin 80s linear infinite reverse" }}>
          <circle cx={C} cy={C} r={R + 56} fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="1" strokeDasharray="40 18" />
        </g>

        {/* spokes */}
        {nodes.map((node, index) => {
          const a = point(index, HUB_R);
          const b = point(index, R - 30);
          const length = Math.hypot(b.x - a.x, b.y - a.y);
          const delay = 0.5 + index * 0.08;
          return (
            <g key={node.label}>
              {/* base track */}
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgb(255 255 255 / 0.1)" strokeWidth="7" strokeLinecap="round" />
              {/* drawn spoke */}
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="url(#am-spoke)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={length}
                strokeDashoffset={reduced ? 0 : length}
                style={reduced ? undefined : { animation: `am-draw 1s ${delay}s cubic-bezier(.22,1,.36,1) forwards` }}
              />
              {/* continuous flow */}
              {!reduced && (
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#fff"
                  strokeOpacity="0.85"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="1 18"
                  style={{ opacity: 0, animation: `am-flow 2.6s linear ${1.6 + index * 0.12}s infinite` }}
                />
              )}
              {!reduced && (
                <circle r="5" fill="#ffb27a" filter="url(#am-glow)" opacity="0">
                  <animateMotion dur="3.6s" begin={`${2 + index * 0.6}s`} repeatCount="indefinite" path={`M${a.x},${a.y} L${b.x},${b.y}`} />
                  <animate attributeName="opacity" values="0;1;1;0" dur="3.6s" begin={`${2 + index * 0.6}s`} repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* hub */}
      <div className="absolute left-1/2 top-1/2 size-[32%] -translate-x-1/2 -translate-y-1/2">
        {!reduced && (
          <div
            aria-hidden="true"
            className="absolute -inset-[7%] rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #fb731f, transparent 30%, transparent 70%, #fb731f)",
              animation: "am-spin 14s linear infinite",
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
            }}
          />
        )}
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff,#eef2f7_70%,#d8dee8)] p-[14%] shadow-[0_0_0_10px_rgb(255_255_255/0.06),0_30px_60px_-18px_rgb(0_0_0/0.7),inset_0_-6px_12px_rgb(15_36_71/0.12)]">
          <BrandLogo width={160} height={160} priority className="h-auto w-full object-contain" />
        </div>
      </div>

      {/* sector orbs */}
      {nodes.map((node, index) => {
        const p = point(index);
        const Icon = node.icon;
        const labelBelow = index === 0 ? false : index === 3 ? true : p.y > C;
        const side = p.x > C + 10 ? "right" : p.x < C - 10 ? "left" : "center";

        return (
          <div
            key={node.label}
            className="absolute"
            style={{ left: `${(p.x / SIZE) * 100}%`, top: `${(p.y / SIZE) * 100}%`, transform: "translate(-50%, -50%)" }}
          >
            <div
              className="relative flex flex-col items-center"
              style={reduced ? undefined : { opacity: 0, animation: `am-node-in 0.8s ${0.9 + index * 0.09}s cubic-bezier(.22,1,.36,1) forwards` }}
            >
              <span
                className="am-orb relative flex size-[50px] items-center justify-center rounded-full sm:size-[60px]"
                style={reduced ? undefined : { animation: `am-float 6s ${index * 0.5}s ease-in-out infinite` }}
              >
                <Icon className="relative size-8 text-white drop-shadow-[0_2px_4px_rgb(0_0_0/0.5)] sm:size-9" strokeWidth={1.9} />
              </span>
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-8 rounded-[50%] bg-black/30 blur-[3px]" />
              <span
                className={[
                  "pointer-events-none absolute w-32 text-[11px] font-semibold leading-tight text-white sm:w-36 sm:text-xs",
                  labelBelow ? "top-full mt-1" : "bottom-full mb-2",
                  side === "right" ? "right-1/2 translate-x-[45%] text-right" : "",
                  side === "left" ? "left-1/2 -translate-x-[45%] text-left" : "",
                  side === "center" ? "left-1/2 -translate-x-1/2 text-center" : "",
                ].join(" ")}
              >
                {node.label}
              </span>
            </div>
          </div>
        );
      })}
    </figure>
  );
}
