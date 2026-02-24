"use client";

import { OpalLoader } from "../components/OpalLoader";
import { OpalLoaderV2 } from "../components/OpalLoaderV2";
import { OpalLoaderV3 } from "../components/OpalLoaderV3";
import { OpalLoaderV4 } from "../components/OpalLoaderV4";

const COLOR = "#7E22CE";

function Row({
  label,
  sub,
  children,
}: {
  label: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <div className="flex items-end gap-8">{children}</div>
    </div>
  );
}

function Swatch({
  size,
  dark,
  children,
}: {
  size: number;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex items-center justify-center rounded-lg ${dark ? "bg-gray-900 p-3" : "p-1"}`}>
        {children}
      </div>
      <span className="text-[10px] text-gray-400">{size}px{dark ? " · dark" : ""}</span>
    </div>
  );
}

/** Animated shimmer text — gradient highlight sweeps left → right on loop */
function ShimmerText({ children, className = "", gradient }: { children: React.ReactNode; className?: string; gradient?: string }) {
  const bg = gradient ?? "linear-gradient(90deg, #7E22CE 0%, #8B30D8 25%, #B06FE0 50%, #8B30D8 75%, #7E22CE 100%)";
  return (
    <span
      className={className}
      style={{
        backgroundImage: bg,
        backgroundSize: "300% auto",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        animation: "shimmer-text 3s linear infinite",
      }}
    >
      {children}
    </span>
  );
}

export default function LoaderPreviewPage() {
  return (
    <div className="min-h-screen bg-white px-16 py-12 flex flex-col gap-12">
      {/* Shimmer keyframes injected once */}
      <style>{`
        @keyframes shimmer-text {
          0%   { background-position: 200% center; }
          100% { background-position: -100% center; }
        }
      `}</style>

      <h1 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Opal Loader — All Variants</h1>

      {/* Inline strip — all 4 */}
      <div className="flex items-center gap-8 pb-4 border-b border-gray-100">
        {[OpalLoader, OpalLoaderV2, OpalLoaderV3, OpalLoaderV4].map((Loader, i) => (
          <div key={i} className="flex items-center gap-1.5 text-sm text-[#7E22CE]">
            <Loader size={14} color={COLOR} />
            <span className="text-xs text-gray-500">V{i + 1}</span>
          </div>
        ))}
      </div>

      {/* V1 */}
      <Row label="V1" sub="Radial fill (center → out) · dissolve outer → in">
        <Swatch size={16}><OpalLoader size={16} color={COLOR} /></Swatch>
        <Swatch size={20}><OpalLoader size={20} color={COLOR} /></Swatch>
        <Swatch size={32}><OpalLoader size={32} color={COLOR} /></Swatch>
        <Swatch size={16} dark><OpalLoader size={16} color="white" /></Swatch>
      </Row>

      {/* V2 */}
      <Row label="V2" sub="Radial fill (center → out) · dissolve center → out">
        <Swatch size={16}><OpalLoaderV2 size={16} color={COLOR} /></Swatch>
        <Swatch size={20}><OpalLoaderV2 size={20} color={COLOR} /></Swatch>
        <Swatch size={32}><OpalLoaderV2 size={32} color={COLOR} /></Swatch>
        <Swatch size={16} dark><OpalLoaderV2 size={16} color="white" /></Swatch>
      </Row>

      {/* V3 */}
      <Row label="V3 — Spiral" sub="Traces outward along a spiral path · unwinds back in">
        <Swatch size={16}><OpalLoaderV3 size={16} color={COLOR} /></Swatch>
        <Swatch size={20}><OpalLoaderV3 size={20} color={COLOR} /></Swatch>
        <Swatch size={32}><OpalLoaderV3 size={32} color={COLOR} /></Swatch>
        <Swatch size={16} dark><OpalLoaderV3 size={16} color="white" /></Swatch>
      </Row>

      {/* V4 */}
      <Row label="V4 — Sparkles" sub="Each dot pops in randomly · fast burst · slow fade">
        <Swatch size={16}><OpalLoaderV4 size={16} color={COLOR} /></Swatch>
        <Swatch size={20}><OpalLoaderV4 size={20} color={COLOR} /></Swatch>
        <Swatch size={32}><OpalLoaderV4 size={32} color={COLOR} /></Swatch>
        <Swatch size={16} dark><OpalLoaderV4 size={16} color="white" /></Swatch>
      </Row>

      {/* With Text */}
      <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest">With Text</p>
          <p className="text-xs text-gray-400 mt-0.5">Loader + animated shimmer label · as used in context</p>
        </div>
        <div className="flex flex-col gap-10">
          {[
            { Loader: OpalLoader, label: "V1" },
            { Loader: OpalLoaderV2, label: "V2" },
            { Loader: OpalLoaderV3, label: "V3" },
            { Loader: OpalLoaderV4, label: "V4" },
          ].map(({ Loader, label }) => (
            <div key={label} className="flex flex-col gap-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</span>
              {/* 16px inline */}
              <div className="flex items-center gap-2">
                <Loader size={16} color={COLOR} />
                <ShimmerText className="text-sm">Fetching user instructions</ShimmerText>
              </div>
              {/* dark chip */}
              <div className="inline-flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2 self-start">
                <Loader size={16} color="white" />
                <ShimmerText
                  className="text-sm"
                  gradient="linear-gradient(90deg, #A855F7 0%, #B57FD8 35%, #C4A8E8 50%, #B57FD8 65%, #A855F7 100%)"
                >
                  Fetching user instructions
                </ShimmerText>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
