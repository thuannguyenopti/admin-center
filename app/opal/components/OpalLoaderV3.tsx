"use client";

import React, { useEffect, useRef } from "react";

// V3: dots are placed in globe formation (concentric rings, same size as V1/V2).
//     They appear in spiral-sweep order (ring by ring, rotating), then dissolve
//     from the starting point (center-out, same direction as appearance).

const SIZE = 20;
const CENTER = SIZE / 2;

const TOTAL = 2800;
const FILL_WINDOW = 900;     // total time for all dots to appear
const HOLD_UNTIL = 1800;     // when dissolve begins
const DISSOLVE_WINDOW = 700; // total time for all dots to dissolve
const APPEAR_FADE = 130;
const DISAPPEAR_FADE = 130;

const DOT_R = 0.9; // uniform dot size

// Build dots in concentric rings — same globe layout as OpalLoader (V1/V2)
const RING_DEFS = [
  { count: 1, radius: 0 },    // center dot
  { count: 5, radius: 2.8 },  // ring 1
  { count: 9, radius: 5.5 },  // ring 2
  { count: 12, radius: 8.3 },  // ring 3
];

// Assign an order index that traces a spiral sweep:
// We sort dots by (ringIndex + angle / (2π)) so the sweep goes
// ring-0 → ring-1 (0°→360°) → ring-2 (0°→360°) → ring-3 (0°→360°)
// giving a continuous outward spiral-like trace.
const GLOBE_DOTS = (() => {
  const result: { cx: number; cy: number; r: number; order: number }[] = [];
  let orderIdx = 0;

  for (let ri = 0; ri < RING_DEFS.length; ri++) {
    const { count, radius } = RING_DEFS[ri];
    const offset = ri % 2 === 0 ? 0 : 0.3; // slight phase offset per ring
    for (let j = 0; j < count; j++) {
      const angle = radius === 0 ? 0 : (j / count) * Math.PI * 2 + offset - Math.PI / 2;
      result.push({
        cx: radius === 0 ? CENTER : CENTER + radius * Math.cos(angle),
        cy: radius === 0 ? CENTER : CENTER + radius * Math.sin(angle),
        r: DOT_R,
        order: orderIdx++,
      });
    }
  }

  return result;
})();

const TOTAL_DOTS = GLOBE_DOTS.length; // 1 + 5 + 9 + 12 = 27

interface OpalLoaderV3Props {
  size?: number;
  color?: string;
  className?: string;
}

export function OpalLoaderV3({ size = 20, color = "currentColor", className }: OpalLoaderV3Props) {
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const animations: Animation[] = [];
    const off = (ms: number) => Math.min(ms / TOTAL, 1);

    dotRefs.current.forEach((el, i) => {
      if (!el) return;
      const { order } = GLOBE_DOTS[i];
      // normalized 0→1 across all dots in spiral order
      const t = order / (TOTAL_DOTS - 1);

      // Appear: spiral outward (center first, outer last)
      const appearAt = t * FILL_WINDOW;
      // Dissolve: same direction — center first (t=0 → HOLD_UNTIL), outer last
      const disappearAt = HOLD_UNTIL + t * DISSOLVE_WINDOW;

      const keyframes: Keyframe[] = [
        { opacity: 0, offset: 0 },
        ...(appearAt > 0 ? [{ opacity: 0, offset: off(appearAt) }] : []),
        { opacity: 1, offset: off(appearAt + APPEAR_FADE) },
        { opacity: 1, offset: off(disappearAt) },
        { opacity: 0, offset: off(disappearAt + DISAPPEAR_FADE) },
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
