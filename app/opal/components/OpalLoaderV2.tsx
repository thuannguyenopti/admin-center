"use client";

import React, { useEffect, useRef } from "react";

// V2: radial fill center→out, dissolve center→out.
// Each dot fires a second "reappear" phase during the overlap window of the same
// cycle, so the next fill radiates outward continuously without a reset gap.

const SIZE = 20;
const CENTER = SIZE / 2;
const MAX_DIST = 8.3;

const TOTAL = 1350;
const HOLD_UNTIL = 300;
const DISSOLVE_WINDOW = 500;
const DISAPPEAR_FADE = 200;
const APPEAR_FADE = 180;
const LOOP_OVERLAP = 600;
const OVERLAP_FILL_WINDOW = 500;
const MIN_GAP = 30;

const DOTS = (() => {
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

interface Props { size?: number; color?: string; className?: string; }

export function OpalLoaderV2({ size = 20, color = "currentColor", className }: Props) {
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const animations: Animation[] = [];
    const off = (ms: number) => Math.min(ms / TOTAL, 1);

    dotRefs.current.forEach((el, i) => {
      if (!el) return;
      const { dn } = DOTS[i];

      const disappearAt = HOLD_UNTIL + dn * DISSOLVE_WINDOW;
      const dissolveEnd = disappearAt + DISAPPEAR_FADE;

      // Reappear phase starts after this dot's own dissolve finishes (+ MIN_GAP),
      // but no earlier than center's reappear + dn-offset (outward order).
      const overlapStart = Math.max(dissolveEnd + MIN_GAP, LOOP_OVERLAP + dn * OVERLAP_FILL_WINDOW);
      const overlapEnd = overlapStart + APPEAR_FADE;

      // All dots start fully visible at offset:0 (from the previous cycle's overlap reappear).
      const keyframes: Keyframe[] = [
        { opacity: 1, offset: 0 },
        { opacity: 1, offset: off(disappearAt) },   // hold
        { opacity: 0, offset: off(dissolveEnd) },   // dissolve out
        { opacity: 0, offset: off(overlapStart) },  // wait (gap)
        { opacity: 1, offset: off(overlapEnd) },    // reappear (next cycle's fill wave)
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
