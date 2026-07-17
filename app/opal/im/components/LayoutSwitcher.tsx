"use client";

import { Box, Button, Text, Tooltip } from "@optiaxiom/react";
import { IconSliders, IconArrowsRotate } from "@optiaxiom/icons";
import { useEffect, useRef, useState } from "react";
import { UserSwitcher } from "./UserSwitcher";

export type LayoutKey = "A";

export function LayoutSwitcher() {
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
      window.location.reload();
    } catch {
      setResetting(false);
    }
  };

  return (
    <Box
      ref={ref}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <Tooltip delayDuration={200} content="Settings">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Settings"
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: "transparent",
            border: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--ax-colors-fg-default)",
          }}
        >
          <IconSliders size={20} />
        </button>
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
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 16,
            background: "var(--ax-colors-bg-default)",
            border: "1px solid var(--ax-colors-border-secondary)",
            minWidth: 280,
          }}
        >
          <Box display="flex" flexDirection="column" gap="6">
            <Text fontSize="xs" fontWeight="500" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: 0.4 }}>
              Acting as
            </Text>
            <UserSwitcher />
          </Box>

          <Box display="flex" flexDirection="column" gap="6">
            <Text fontSize="xs" fontWeight="500" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: 0.4 }}>
              Demo
            </Text>
            <Button
              appearance="subtle"
              size="md"
              icon={<IconArrowsRotate size={16} />}
              onClick={resetDemo}
              disabled={resetting}
              style={{ justifyContent: "flex-start" }}
            >
              {resetting ? "Resetting…" : "Reset Demo"}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
