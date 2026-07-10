"use client";

import { Box, Button, Tooltip } from "@optiaxiom/react";
import { IconSliders, IconArrowsRotate } from "@optiaxiom/icons";
import { useEffect, useRef, useState } from "react";

export function DemoResetButton() {
  const [open, setOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const resetDemo = async () => {
    setResetting(true);
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
          icon={<IconSliders size={20} />}
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
            zIndex: 1000,
            padding: 12,
            background: "var(--ax-colors-bg-default)",
            border: "1px solid var(--ax-colors-border-secondary)",
            minWidth: 180,
          }}
        >
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
