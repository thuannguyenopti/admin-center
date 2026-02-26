"use client";

import React, { useEffect, useRef } from "react";

// V5: sparkle fill, bubble-expand dissolve, continuous overlap.
// After each dot's expand-dissolve completes, it immediately starts its next
// pop-in burst within the same cycle — no reset gap, perpetual sparkle cycle.

const SIZE = 20;
const CENTER = SIZE / 2;
const MAX_DIST = 8.3;

const TOTAL = 1400; // 400ms shorter cycle for earlier loop
const HOLD_UNTIL = 100; // ms until center starts dissolving (max nextPopSettle = 1370ms < 1400ms)
const RING_SPREAD = 350;  // outer ring dissolves later by this much
const JITTER = 320;  // per-dot random jitter within ring window
const DISSOLVE_SNAP = 40;   // ms: snap from 1× to 3× (halfway opacity)
const DISSOLVE_FADE = 350;  // ms: expand 3× → 5× while fading to 0
const DISSOLVE_TOTAL = DISSOLVE_SNAP + DISSOLVE_FADE; // 390ms per dot
const POP_BURST = 54;   // ms to peak (30% of POP_DURATION)
const POP_DURATION = 180;  // ms: full pop-in settle
const MIN_GAP = 30;   // ms gap between dissolveEnd and re-pop

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const GLOBE_DOTS = (() => {
  const dots: { cx: number; cy: number; dn: number; dissolveStart: number }[] = [];

  const push = (cx: number, cy: number, dn: number, seed: number) => {
    dots.push({
      cx, cy, dn,
      dissolveStart: HOLD_UNTIL + dn * RING_SPREAD + rand(seed) * JITTER,
    });
  };

  push(CENTER, CENTER, 0, 100);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    push(CENTER + 2.8 * Math.cos(a), CENTER + 2.8 * Math.sin(a), 2.8 / MAX_DIST, 110 + i);
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    push(CENTER + 5.5 * Math.cos(a), CENTER + 5.5 * Math.sin(a), 5.5 / MAX_DIST, 120 + i);
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    push(CENTER + 8.3 * Math.cos(a), CENTER + 8.3 * Math.sin(a), 1, 140 + i);
  }

  return dots;
})();

interface Props { size?: number; color?: string; className?: string; }

export function OpalLoaderV5({ size = 20, color = "currentColor", className }: Props) {
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const animations: Animation[] = [];
    const off = (ms: number) => Math.max(0, Math.min(1, ms / TOTAL));

    dotRefs.current.forEach((el, i) => {
      if (!el) return;
      const { dissolveStart } = GLOBE_DOTS[i];

      const dissolveEnd = dissolveStart + DISSOLVE_TOTAL;
      const nextPopStart = dissolveEnd + MIN_GAP;
      const nextPopPeak = nextPopStart + POP_BURST;
      const nextPopSettle = nextPopStart + POP_DURATION;

      // All dots start fully visible at offset:0 (from previous cycle's re-pop).
      const keyframes: Keyframe[] = [
        { opacity: 1, transform: "scale(1)", offset: 0 },
        { opacity: 1, transform: "scale(1)", offset: off(dissolveStart) },         // hold
        { opacity: 0.5, transform: "scale(3)", offset: off(dissolveStart + DISSOLVE_SNAP) }, // snap-expand
        { opacity: 0, transform: "scale(5)", offset: off(dissolveEnd) },           // gone
        { opacity: 0, transform: "scale(0.5)", offset: off(nextPopStart) },        // ready to pop
        { opacity: 1, transform: "scale(1.4)", offset: off(nextPopPeak) },         // burst
        { opacity: 1, transform: "scale(1)", offset: off(nextPopSettle) },         // settle
        { opacity: 1, transform: "scale(1)", offset: 1 },                          // stay → seamless loop
      ];

      animations.push(el.animate(keyframes, {
        duration: TOTAL,
        iterations: Infinity,
        easing: "ease-out",
      }));
    });

    return () => animations.forEach(a => a.cancel());
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
      style={{ overflow: "visible" }}
    >
      {GLOBE_DOTS.map((dot, i) => (
        <circle
          key={i}
          ref={el => { dotRefs.current[i] = el; }}
          cx={dot.cx}
          cy={dot.cy}
          r={0.9}
          fill={color}
          style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}
        />
      ))}
    </svg>
  );
}
