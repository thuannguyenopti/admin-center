"use client";

import React from "react";
import { OpalLoader } from "../components/OpalLoader";
import { OpalLoaderV2 } from "../components/OpalLoaderV2";
import { OpalLoaderV3 } from "../components/OpalLoaderV3";
import { OpalLoaderV4 } from "../components/OpalLoaderV4";
import { OpalLoaderV5 } from "../components/OpalLoaderV5";

const COLOR = "#7C3AED";

const VERSIONS = [
  { label: "V1", sub: "Radial fill · outer dissolves first (collapses in)", Loader: OpalLoader },
  { label: "V2", sub: "Radial fill · center dissolves first (expands out)", Loader: OpalLoaderV2 },
  { label: "V3 — Spiral", sub: "Traces spiral outward · unwinds back to center", Loader: OpalLoaderV3 },
  { label: "V4 — Sparkles", sub: "Globe-mapped dots · each pops in randomly", Loader: OpalLoaderV4 },
  { label: "V5 — Bubbles", sub: "Sparkle fill · bubble dissolve center outward", Loader: OpalLoaderV5 },
];

export default function LoaderPreviewPage() {
  return (
    <div className="min-h-screen bg-white px-16 py-12 flex flex-col gap-12">
      <h1 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Opal Loader Variants</h1>

      {/* Inline strip — all 4 at 14px */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
        {VERSIONS.map(({ label, Loader }, i) => (
          <div key={i} className="flex items-center gap-2">
            <Loader size={14} color={COLOR} />
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Per-version rows */}
      {VERSIONS.map(({ label, sub, Loader }) => (
        <div key={label} className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
          <div className="flex items-end gap-10">
            {[16, 20, 32].map(sz => (
              <div key={sz} className="flex flex-col items-center gap-2">
                <Loader size={sz} color={COLOR} />
                <span className="text-[10px] text-gray-400">{sz}px</span>
              </div>
            ))}
            {/* dark bg */}
            <div className="flex flex-col items-center gap-2">
              <div className="bg-gray-900 rounded-lg p-3 flex items-center justify-center">
                <Loader size={16} color="white" />
              </div>
              <span className="text-[10px] text-gray-400">16px · dark</span>
            </div>
            {/* in-context */}
            <div className="flex flex-col gap-1 justify-end pb-1">
              <div className="flex items-center gap-1.5">
                <Loader size={16} color={COLOR} />
                <span className="text-xs text-gray-500">Thinking…</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
