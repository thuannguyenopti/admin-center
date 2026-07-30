"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Box, Text, Switch } from "@optiaxiom/react";
import { mobileType } from "./typography";
import { PhoneBase, PhoneA, PhoneB } from "./phones";

function Divider() {
  return (
    <Box style={{ alignSelf: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: 0.25 }}>
      <Box style={{ width: 1, height: 120, background: "rgba(255,255,255,0.4)" }} />
      <Text style={{ ...mobileType.label, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>vs</Text>
      <Box style={{ width: 1, height: 120, background: "rgba(255,255,255,0.4)" }} />
    </Box>
  );
}

function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <Box style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Box style={{ width: 40, height: 1, background: "rgba(255,255,255,0.15)" }} />
        <Text style={{ ...mobileType.meta, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {label}
        </Text>
        <Box style={{ width: 40, height: 1, background: "rgba(255,255,255,0.15)" }} />
      </Box>
      <Box style={{
        width: 390, height: 844,
        background: "var(--ax-colors-bg-default)",
        borderRadius: 50, overflow: "hidden",
        position: "relative", display: "flex", flexDirection: "column",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 0 0 12px #1c1c1e, 0 0 0 14px rgba(255,255,255,0.05), 0 32px 80px rgba(0,0,0,0.6), 0 0 120px rgba(99,148,255,0.08)",
      }}>
        {children}
      </Box>
    </Box>
  );
}

function MobilePageInner() {
  const router = useRouter();
  const params = useSearchParams();

  const showArtifacts = params.get("artifacts") !== "0";
  const showPreview   = params.get("preview")   === "1";
  const islandNav     = params.get("island")    !== "0";
  const foldOpal      = params.get("fold")      === "1";

  const setParam = useCallback((key: string, value: boolean, defaultOn: boolean) => {
    const next = new URLSearchParams(params.toString());
    if (value === defaultOn) next.delete(key);
    else next.set(key, value ? "1" : "0");
    router.replace(`?${next.toString()}`, { scroll: false });
  }, [params, router]);

  return (
    <Box style={{
      width: "100%", height: "100%",
      overflowX: "auto", overflowY: "auto",
      display: "flex", flexDirection: "column", alignItems: "flex-start",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      padding: "48px 48px", boxSizing: "border-box",
    }}>
      {/* Toggles */}
      <Box display="flex" justifyContent="center" alignItems="center" gap="24" style={{ width: "100%", marginBottom: 24 }}>
        <Box display="flex" alignItems="center" gap="8">
          <Switch checked={showArtifacts} onCheckedChange={(v) => setParam("artifacts", v, true)} aria-label="Artifacts tab" />
          <Text style={{ ...mobileType.secondary, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Artifacts tab</Text>
        </Box>
        <Box display="flex" alignItems="center" gap="8">
          <Switch checked={showPreview} onCheckedChange={(v) => setParam("preview", v, false)} aria-label="Message preview" />
          <Text style={{ ...mobileType.secondary, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Message preview</Text>
        </Box>
        <Box display="flex" alignItems="center" gap="8">
          <Switch checked={islandNav} onCheckedChange={(v) => setParam("island", v, true)} aria-label="Island nav" />
          <Text style={{ ...mobileType.secondary, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Island nav</Text>
        </Box>
        <Box display="flex" alignItems="center" gap="8">
          <Switch checked={foldOpal} onCheckedChange={(v) => setParam("fold", v, false)} aria-label="Fold Opal" />
          <Text style={{ ...mobileType.secondary, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Fold Opal</Text>
        </Box>
      </Box>

      <Box style={{ display: "flex", alignItems: "flex-start", gap: 64, minWidth: "max-content" }}>
        <PhoneFrame label="Base — A tabs + B home"><PhoneBase showArtifacts={showArtifacts} showPreview={showPreview} islandNav={islandNav} foldOpal={foldOpal} /></PhoneFrame>
        <Divider />
        <PhoneFrame label="Option A — Utility tabs"><PhoneA showArtifacts={showArtifacts} showPreview={showPreview} islandNav={islandNav} foldOpal={foldOpal} /></PhoneFrame>
        <Divider />
        <PhoneFrame label="Option B — Messages first"><PhoneB showArtifacts={showArtifacts} showPreview={showPreview} islandNav={islandNav} foldOpal={foldOpal} /></PhoneFrame>
      </Box>
    </Box>
  );
}

export default function MobilePage() {
  return (
    <Suspense fallback={null}>
      <MobilePageInner />
    </Suspense>
  );
}
