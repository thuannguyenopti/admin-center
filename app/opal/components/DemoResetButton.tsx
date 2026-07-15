"use client";

import { Box, Button, Switch, Tooltip } from "@optiaxiom/react";
import { IconKey, IconArrowsRotate } from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";
import { useEffect, useRef, useState } from "react";

const HINT_BANNER_KEY = "opal-demo-hint-banner";

export function DemoResetButton() {
  const [open, setOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Sync from localStorage on mount
  useEffect(() => {
    try {
      setHintVisible(localStorage.getItem(HINT_BANNER_KEY) === "true");
    } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const toggleHintBanner = (next: boolean) => {
    setHintVisible(next);
    try { localStorage.setItem(HINT_BANNER_KEY, String(next)); } catch {}
    // Dispatch event so page.tsx can react without a reload
    window.dispatchEvent(new CustomEvent("opal-hint-banner-change", { detail: next }));
  };

  const resetDemo = async () => {
    setResetting(true);
    setOpen(false);
    try {
      await fetch("/api/messaging/v1/reset-all", { method: "POST" });
      try { localStorage.removeItem("geo-qa-approval"); } catch {}
      try { localStorage.removeItem("vau-bubs-avatar"); } catch {}
      window.location.reload();
    } catch {
      setResetting(false);
    }
  };

  return (
    <Box
      ref={ref}
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
    >
      <Tooltip delayDuration={200} content="Demo settings">
        <Button
          appearance="subtle"
          size="md"
          icon={<IconKey size={20} />}
          color="fg.secondary"
          aria-label="Demo settings"
          onClick={() => setOpen((o) => !o)}
        />
      </Tooltip>
      {open && (
        <Box
          rounded="lg"
          shadow="lg"
          style={{
            position: "absolute",
            top: 40,
            right: 0,
            zIndex: 10001,
            padding: 12,
            background: "var(--ax-colors-bg-default)",
            border: "1px solid var(--ax-colors-border-secondary)",
            minWidth: 220,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* Hint banner toggle */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap="12"
            style={{ padding: "8px 8px" }}
          >
            <Text style={{ fontSize: 14 }}>Hint banner options</Text>
            <Switch
              size="md"
              checked={hintVisible}
              onCheckedChange={toggleHintBanner}
            />
          </Box>

          {/* Divider */}
          <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "4px 0" }} />

          {/* Reset Demo */}
          <Button
            appearance="subtle"
            size="md"
            icon={<IconArrowsRotate size={16} />}
            onClick={resetDemo}
            disabled={resetting}
            style={{ justifyContent: "flex-start", width: "100%" }}
          >
            {resetting ? "Resetting…" : "Reset Demo"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
