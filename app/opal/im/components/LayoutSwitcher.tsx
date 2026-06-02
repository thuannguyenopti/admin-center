"use client";

import { Box, Button, Text, Tooltip } from "@optiaxiom/react";
import { IconSliders, IconArrowsRotate } from "@optiaxiom/icons";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserSwitcher } from "./UserSwitcher";

export type LayoutKey = "A" | "B" | "C";

const LABELS: Record<LayoutKey, string> = {
  A: "Pei",
  B: "Erika",
  C: "Ana",
};

const KEYS: LayoutKey[] = ["A", "B", "C"];

function isLayoutKey(value: string | null): value is LayoutKey {
  return value === "A" || value === "B" || value === "C";
}

function readStoredLayout(): LayoutKey {
  try {
    const raw = localStorage.getItem("im-layout");
    if (!raw) return "A";
    const parsed = JSON.parse(raw);
    return isLayoutKey(parsed) ? parsed : "A";
  } catch {
    return "A";
  }
}

export function LayoutSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [current, setCurrent] = useState<LayoutKey>("A");
  const [open, setOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Sync active pill from localStorage after hydration
  useEffect(() => {
    setCurrent(readStoredLayout());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const setLayout = (key: LayoutKey) => {
    setCurrent(key);
    try { localStorage.setItem("im-layout", JSON.stringify(key)); } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent("im-layout-change", { detail: key }));
    if (pathname.startsWith("/opal/im")) {
      router.replace(`/opal/im?layout=${key}`);
    }
  };

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
          {/* Acting as */}
          <Box display="flex" flexDirection="column" gap="6">
            <Text fontSize="xs" fontWeight="500" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: 0.4 }}>
              Acting as
            </Text>
            <UserSwitcher />
          </Box>

          {/* Layout */}
          <Box display="flex" flexDirection="column" gap="6">
            <Text fontSize="xs" fontWeight="500" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: 0.4 }}>
              Layout
            </Text>
            <Box display="flex" alignItems="center" gap="6">
              {KEYS.map((k) => {
                const isActive = current === k;
                return (
                  <Tooltip key={k} delayDuration={200} content={LABELS[k]}>
                    <button
                      type="button"
                      onClick={() => setLayout(k)}
                      style={{
                        minWidth: 36,
                        height: 32,
                        padding: "0 12px",
                        borderRadius: 999,
                        background: isActive
                          ? "var(--ax-colors-bg-accent)"
                          : "transparent",
                        color: isActive
                          ? "var(--ax-colors-fg-accent-on-accent, #202320)"
                          : "var(--ax-colors-fg-default)",
                        border: isActive ? "none" : "1px solid var(--ax-colors-border-default)",
                        cursor: "pointer",
                        fontWeight: isActive ? 600 : 500,
                        fontSize: 13,
                      }}
                    >
                      {k}
                    </button>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>

          {/* Demo reset */}
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
