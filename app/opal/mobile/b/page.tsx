"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PhoneB } from "../phones";

function OptionBContent() {
  const params = useSearchParams();
  const showArtifacts = params.get("artifacts") === "1";
  const showPreview = params.get("preview") !== "0";
  const islandNav = params.get("island") === "1";
  const foldOpal = params.get("fold") === "1";
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--ax-colors-bg-default)" }}>
      <PhoneB standalone showArtifacts={showArtifacts} showPreview={showPreview} islandNav={islandNav} foldOpal={foldOpal} />
    </div>
  );
}

export default function OptionBPage() {
  return (
    <Suspense fallback={<div style={{ height: "100%", background: "var(--ax-colors-bg-default)" }} />}>
      <OptionBContent />
    </Suspense>
  );
}
