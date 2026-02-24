"use client";

import React, { useEffect, useRef } from "react";

// V2: same radial fill (center → out) but dissolves center-first (middle expands outward)

const SIZE = 20;
const CENTER = SIZE / 2;
const MAX_DIST = 8.3;

const TOTAL = 2400;
const FILL_WINDOW = 500;
const HOLD_UNTIL = 1400;
const DISSOLVE_WINDOW = 500;
const APPEAR_FADE = 180;
const DISAPPEAR_FADE = 200;

const DOTS = (() => {
  const dots: { cx: number; cy: number; r: number; dn: number }[] = [];

  dots.push({ cx: CENTER, cy: CENTER, r: 1.1, dn: 0 });

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    dots.push({ cx: CENTER + 2.8 * Math.cos(a), cy: CENTER + 2.8 * Math.sin(a), r: 0.9, dn: 2.8 / MAX_DIST });
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    dots.push({ cx: CENTER + 5.5 * Math.cos(a), cy: CENTER + 5.5 * Math.sin(a), r: 0.85, dn: 5.5 / MAX_DIST });
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    dots.push({ cx: CENTER + 8.3 * Math.cos(a), cy: CENTER + 8.3 * Math.sin(a), r: 0.75, dn: 1 });
  }

  return dots;
})();

interface OpalLoaderV2Props {
  size?: number;
  color?: string;
  className?: string;
}

export function OpalLoaderV2({ size = 20, color = "currentColor", className }: OpalLoaderV2Props) {
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const animations: Animation[] = [];
    const off = (ms: number) => Math.min(ms / TOTAL, 1);

    dotRefs.current.forEach((el, i) => {
      if (!el) return;
      const { dn } = DOTS[i];

      // Appear: center first (dn=0 → delay 0)
      const appearAt = dn * FILL_WINDOW;
      // Dissolve: center first (dn=0 → dissolves earliest), expands outward
      const disappearAt = HOLD_UNTIL + dn * DISSOLVE_WINDOW;

      const keyframes: Keyframe[] = [
        { opacity: 0, transform: "scale(0)", offset: 0 },
        ...(appearAt > 0 ? [{ opacity: 0, transform: "scale(0)", offset: off(appearAt) }] : []),
        { opacity: 1, transform: "scale(1)", offset: off(appearAt + APPEAR_FADE) },
        { opacity: 1, transform: "scale(1)", offset: off(disappearAt) },
        { opacity: 0, transform: "scale(1.6)", offset: off(disappearAt + DISAPPEAR_FADE) },
        { opacity: 0, transform: "scale(0)", offset: 1 },
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
      {DOTS.map((dot, i) => (
        <circle
          key={i}
          ref={(el) => { dotRefs.current[i] = el; }}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill={color}
          style={{ transformBox: "fill-box", transformOrigin: "center", opacity: 0 }}
        />
      ))}
    </svg>
  );
}
