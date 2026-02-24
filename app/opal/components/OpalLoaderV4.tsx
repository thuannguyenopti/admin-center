"use client";

import React, { useEffect, useRef } from "react";

// V4: dots use the same concentric ring globe layout as V1/V2.
//     Each dot pops in at a random time (no directional order) to build the globe,
//     holds as a full globe briefly, then each dot disappears in a different random order.

const SIZE = 20;
const CENTER = SIZE / 2;

const TOTAL = 3400; // ms per cycle

// Deterministic seeded pseudo-random (no hydration issues)
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Same concentric ring layout as OpalLoader (V1/V2) — uniform dot size
const DOT_R = 0.9;
const MAX_RADIUS = 8.3;
const RING_DEFS = [
  { count: 1, radius: 0 },
  { count: 5, radius: 2.8 },
  { count: 9, radius: 5.5 },
  { count: 12, radius: 8.3 },
];

const GLOBE_DOTS = (() => {
  const result: { cx: number; cy: number; r: number; idx: number; dn: number }[] = [];
  let idx = 0;
  for (const { count, radius } of RING_DEFS) {
    for (let j = 0; j < count; j++) {
      const angle = radius === 0 ? 0 : (j / count) * Math.PI * 2 - Math.PI / 2;
      result.push({
        cx: radius === 0 ? CENTER : CENTER + radius * Math.cos(angle),
        cy: radius === 0 ? CENTER : CENTER + radius * Math.sin(angle),
        r: DOT_R,
        idx: idx++,
        dn: radius / MAX_RADIUS, // 0 = center, 1 = outermost ring
      });
    }
  }
  return result;
})();

// Cycle timing (as fractions of TOTAL):
//   0.00 → 0.60  build phase: dots pop in randomly
//   0.60 → 0.72  hold phase: full globe visible
//   0.72 → 0.95  dissolve phase: dots disappear randomly
//   0.95 → 1.00  pause: all gone, ready for next loop

const BUILD_START = 0.00;
const BUILD_END = 0.60;
const HOLD_END = 0.72;
const DISSOLVE_END = 0.95;

const APPEAR_FADE = 0.05; // fraction of cycle to fade in
const DISAPPEAR_FADE = 0.04; // fraction of cycle to fade out

interface OpalLoaderV4Props {
  size?: number;
  color?: string;
  className?: string;
}

export function OpalLoaderV4({ size = 20, color = "currentColor", className }: OpalLoaderV4Props) {
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const animations: Animation[] = [];

    dotRefs.current.forEach((el, i) => {
      if (!el) return;

      const dot = GLOBE_DOTS[i];

      // Three-stage build: center → inner ring → mid+outer (random together).
      const buildWindow = BUILD_END - BUILD_START - APPEAR_FADE;
      const minDelay = dot.dn < 0.01 ? 0.00 : dot.dn < 0.5 ? 0.15 : 0.40;
      const maxStart = dot.dn < 0.01 ? 0.15 : dot.dn < 0.5 ? 0.40 : 1.00;
      const popStart = BUILD_START + (minDelay + rand(i * 11 + 3) * (maxStart - minDelay)) * buildWindow;
      const popEnd = popStart + APPEAR_FADE;

      // Random dissolve time within the dissolve window (different random seed)
      const dissolveStart = HOLD_END + rand(i * 7 + 17) * (DISSOLVE_END - HOLD_END - DISAPPEAR_FADE);
      const dissolveEnd = dissolveStart + DISAPPEAR_FADE;

      const clamp = (t: number) => Math.max(0, Math.min(1, t));

      const keyframes: Keyframe[] = [
        // All invisible at start
        { opacity: 0, offset: 0 },

        // Wait until this dot's random pop-in time
        ...(popStart > 0.005
          ? [{ opacity: 0, offset: clamp(popStart) }]
          : []),

        // Pop in with a quick burst
        { opacity: 1, offset: clamp(popEnd) },

        // Hold fully visible through hold period + until this dot's dissolve time
        { opacity: 1, offset: clamp(dissolveStart) },

        // Fade out
        { opacity: 0, offset: clamp(dissolveEnd) },

        // Stay invisible until loop resets
        { opacity: 0, offset: 1 },
      ];

      const anim = el.animate(keyframes, {
        duration: TOTAL,
        iterations: Infinity,
        easing: "ease-in-out",
      });

      animations.push(anim);
    });

    return () => animations.forEach((a) => a.cancel());
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      fill="none"
      aria-label="Loading"
      role="status"
      className={className}
    >
      {GLOBE_DOTS.map((dot, i) => (
        <circle
          key={i}
          ref={(el) => { dotRefs.current[i] = el; }}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill={color}
          style={{ opacity: 0 }}
        />
      ))}
    </svg>
  );
}
