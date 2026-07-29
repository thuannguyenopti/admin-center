"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PhoneBase } from "../phones";

function BaseContent() {
  const params = useSearchParams();
  const showArtifacts = params.get("artifacts") !== "0";
  const showPreview = params.get("preview") === "1";
  const islandNav = params.get("island") !== "0";
  const foldOpal = params.get("fold") === "1";
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "var(--ax-colors-bg-default)" }}>
      <PhoneBase standalone showArtifacts={showArtifacts} showPreview={showPreview} islandNav={islandNav} foldOpal={foldOpal} />
    </div>
  );
}

export default function BasePage() {
  return (
    <Suspense fallback={<div style={{ height: "100%", background: "var(--ax-colors-bg-default)" }} />}>
      <BaseContent />
    </Suspense>
  );
}
