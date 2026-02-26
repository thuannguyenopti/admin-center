"use client";

import React, { useEffect, useRef } from "react";

// V3: same ring positions as V1/V2, spiral appearance/dissolve order.
// Each dot reappears in spiral order during the overlap window of the same
// cycle, so the next fill sweeps outward continuously without a reset gap.

const SIZE = 20;
const CENTER = SIZE / 2;
const MAX_DIST = 8.3;

const TOTAL = 1500;
const HOLD_UNTIL = 300;
const DISSOLVE_WINDOW = 700;
const DISAPPEAR_FADE = 160;
const APPEAR_FADE = 160;
const LOOP_OVERLAP = 550;
const OVERLAP_FILL_WINDOW = 700;
const MIN_GAP = 30;

// Same ring layout as V1/V2
const BASE_DOTS = (() => {
  const dots: { cx: number; cy: number; r: number; dn: number }[] = [];
  dots.push({ cx: CENTER, cy: CENTER, r: 0.9, dn: 0 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    dots.push({ cx: CENTER + 2.8 * Math.cos(a), cy: CENTER + 2.8 * Math.sin(a), r: 0.9, dn: 2.8 / MAX_DIST });
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    dots.push({ cx: CENTER + 5.5 * Math.cos(a), cy: CENTER + 5.5 * Math.sin(a), r: 0.9, dn: 5.5 / MAX_DIST });
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    dots.push({ cx: CENTER + 8.3 * Math.cos(a), cy: CENTER + 8.3 * Math.sin(a), r: 0.9, dn: 1 });
  }
  return dots;
})();

// Spiral order: angle fraction + ring fraction × weight → normalised [0, 1]
const DOTS = (() => {
  const withOrder = BASE_DOTS.map(dot => {
    let theta = Math.atan2(dot.cy - CENTER, dot.cx - CENTER);
    if (theta < 0) theta += Math.PI * 2;
    const spiralT = theta / (Math.PI * 2) + dot.dn * 0.75;
    return { ...dot, spiralT };
  });
  const max = Math.max(...withOrder.map(d => d.spiralT));
  const min = Math.min(...withOrder.map(d => d.spiralT));
  return withOrder.map(d => ({ ...d, spiralOrder: (d.spiralT - min) / (max - min) }));
})();

interface Props { size?: number; color?: string; className?: string; }

export function OpalLoaderV3({ size = 20, color = "currentColor", className }: Props) {
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const animations: Animation[] = [];
    const off = (ms: number) => Math.min(ms / TOTAL, 1);

    dotRefs.current.forEach((el, i) => {
      if (!el) return;
      const { spiralOrder } = DOTS[i];

      const disappearAt = HOLD_UNTIL + spiralOrder * DISSOLVE_WINDOW;
      const dissolveEnd = disappearAt + DISAPPEAR_FADE;

      // Reappear in spiral order after this dot's dissolve finishes.
      const overlapStart = Math.max(dissolveEnd + MIN_GAP, LOOP_OVERLAP + spiralOrder * OVERLAP_FILL_WINDOW);
      const overlapEnd = overlapStart + APPEAR_FADE;

      // All dots start fully visible at offset:0 (from previous cycle's overlap).
      const keyframes: Keyframe[] = [
        { opacity: 1, offset: 0 },
        { opacity: 1, offset: off(disappearAt) },   // hold
        { opacity: 0, offset: off(dissolveEnd) },   // dissolve out
        { opacity: 0, offset: off(overlapStart) },  // wait (gap)
        { opacity: 1, offset: off(overlapEnd) },    // reappear (next fill wave)
        { opacity: 1, offset: 1 },                  // stay visible → seamless loop
      ];

      animations.push(el.animate(keyframes, { duration: TOTAL, iterations: Infinity, easing: "ease-in-out" }));
    });

    return () => animations.forEach(a => a.cancel());
  }, []);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${SIZE} ${SIZE}`} fill="none" aria-label="Loading" role="status" className={className}>
      {DOTS.map((dot, i) => (
        <circle key={i} ref={el => { dotRefs.current[i] = el; }}
          cx={dot.cx} cy={dot.cy} r={dot.r} fill={color}
          style={{ opacity: 0 }} />
      ))}
    </svg>
  );
}
