"use client";

import React, { useEffect, useRef } from "react";

// V4: sparkles — dots start invisible, each pops in at a random moment with a burst,
// until all dots are visible (full globe), then they all dissolve together quickly.

const SIZE = 20;
const CENTER = SIZE / 2;

const TOTAL = 2800;
const FILL_WINDOW = 1200;   // time for all dots to pop in
const HOLD_UNTIL = 1600;    // hold full globe until this point
const DISSOLVE_SPREAD = 550; // random window within which dots scatter their dissolve
const DISSOLVE_FADE = 250;   // each dot's individual fade-out duration
const POP_DURATION = 180;   // each dot's burst animation duration

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Same ring layout as V1/V2/V3
const GLOBE_DOTS = (() => {
  const dots: { cx: number; cy: number; popStart: number; dissolveStart: number }[] = [];

  // Center
  dots.push({
    cx: CENTER, cy: CENTER,
    popStart: rand(0) * (FILL_WINDOW - POP_DURATION),
    dissolveStart: HOLD_UNTIL + rand(100) * DISSOLVE_SPREAD,
  });

  // Ring 2: 5 dots
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    dots.push({
      cx: CENTER + 2.8 * Math.cos(a),
      cy: CENTER + 2.8 * Math.sin(a),
      popStart: rand(10 + i) * (FILL_WINDOW - POP_DURATION),
      dissolveStart: HOLD_UNTIL + rand(110 + i) * DISSOLVE_SPREAD,
    });
  }

  // Ring 3: 9 dots
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    dots.push({
      cx: CENTER + 5.5 * Math.cos(a),
      cy: CENTER + 5.5 * Math.sin(a),
      popStart: rand(20 + i) * (FILL_WINDOW - POP_DURATION),
      dissolveStart: HOLD_UNTIL + rand(120 + i) * DISSOLVE_SPREAD,
    });
  }

  // Ring 4: 12 dots
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    dots.push({
      cx: CENTER + 8.3 * Math.cos(a),
      cy: CENTER + 8.3 * Math.sin(a),
      popStart: rand(40 + i) * (FILL_WINDOW - POP_DURATION),
      dissolveStart: HOLD_UNTIL + rand(140 + i) * DISSOLVE_SPREAD,
    });
  }

  return dots;
})();

interface Props { size?: number; color?: string; className?: string; }

export function OpalLoaderV4({ size = 20, color = "currentColor", className }: Props) {
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const animations: Animation[] = [];
    const off = (ms: number) => Math.max(0, Math.min(1, ms / TOTAL));

    dotRefs.current.forEach((el, i) => {
      if (!el) return;
      const { popStart, dissolveStart } = GLOBE_DOTS[i];

      const popPeak    = popStart + POP_DURATION * 0.3;
      const popSettle  = popStart + POP_DURATION;

      // Pop in with burst, stay fully visible, then dissolve at random per-dot time
      const anim = el.animate([
        { opacity: 0, transform: "scale(0.5)", offset: 0 },
        ...(popStart > 10 ? [{ opacity: 0, transform: "scale(0.5)", offset: off(popStart) }] : []),
        { opacity: 1, transform: "scale(1.4)", offset: off(popPeak) },       // burst peak
        { opacity: 1, transform: "scale(1)",   offset: off(popSettle) },     // settle
        { opacity: 1, transform: "scale(1)",   offset: off(dissolveStart) }, // hold until random dissolve
        { opacity: 0, transform: "scale(1)",   offset: off(dissolveStart + DISSOLVE_FADE) },
        { opacity: 0, transform: "scale(1)",   offset: 1 },
      ], {
        duration: TOTAL,
        iterations: Infinity,
        easing: "ease-out",
      });

      animations.push(anim);
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
