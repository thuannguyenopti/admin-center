/**
 * DO NOT DELETE THIS FILE
 *
 * This file exists to ensure Tailwind generates all Stride typography classes.
 * Turbopack's static analysis needs to see classes used in actual JSX, not just in strings.
 * The classes below are used dynamically via the display template system.
 */

export function TailwindSafelist() {
  return (
    <div style={{ position: 'absolute', left: '-9999px', pointerEvents: 'none' }}>
      {/* Font sizes */}
      <div className="text-stride-base text-stride-lg text-stride-xl text-stride-2xl text-stride-3xl text-stride-4xl text-stride-5xl text-stride-6xl" />
      <div className="md:text-stride-xl md:text-stride-3xl" />
      <div className="text-sm text-xs" />

      {/* Font weights */}
      <div className="font-stride-normal font-stride-medium font-stride-semibold font-stride-bold font-stride-extrabold font-semibold" />

      {/* Font family */}
      <div className="font-stride-sans" />

      {/* Line heights */}
      <div className="leading-tight leading-relaxed" />

      {/* Text colors */}
      <div className="text-stride-dark text-stride-blue text-white text-red-600" />
      <div className="text-white/90 text-white/70 text-stride-dark/80 text-stride-dark/70 text-stride-dark/60" />
      <div className="hover:text-stride-blue-dark" />

      {/* Background colors */}
      <div className="bg-stride-bg bg-stride-dark bg-stride-blue bg-white" />
      <div className="hover:bg-stride-blue-dark hover:bg-stride-dark/5" />

      {/* Spacing */}
      <div className="py-12 py-24 pb-12 space-y-0 space-y-12 space-y-20" />
      <div className="px-3 px-6 py-2 py-3" />

      {/* Border radius */}
      <div className="rounded-stride-lg" />

      {/* Borders */}
      <div className="border-2 border-stride-dark/20 hover:border-stride-dark/40" />

      {/* Effects */}
      <div className="transition-colors shadow-sm" />

      {/* Text decoration */}
      <div className="underline-offset-2 hover:underline uppercase tracking-wider" />

      {/* Grid layouts */}
      <div className="grid grid-cols-1 grid-cols-2 grid-cols-3 md:grid-cols-2 md:grid-cols-3" />
      <div className="gap-2 gap-4 gap-8 gap-12 md:gap-8 md:gap-12" />
    </div>
  );
}
