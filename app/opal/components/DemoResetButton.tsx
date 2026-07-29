"use client";

import { Box, Button, Switch, Tooltip, SegmentedControl, SegmentedControlItem } from "@optiaxiom/react";
import { Range } from "@optiaxiom/react/unstable";
import { IconKey, IconArrowsRotate } from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";
import { useEffect, useRef, useState } from "react";
import { usePlannerLabel, setPlannerLabel, type PlannerLabel } from "@/app/opal/tracker/usePlannerLabel";
import { usePlannerNavVisible, setPlannerNavVisible } from "@/app/opal/usePlannerNavVisible";
import { useStrideDsNavVisible, setStrideDsNavVisible } from "@/app/opal/useStrideDsNavVisible";
import { useTrayDesign, setTrayDesign, type TrayDesign } from "@/app/opal/tracker/useTrayDesign";
import { clearSessionTracker } from "@/app/opal/tracker/useSessionTasks";

const HINT_BANNER_KEY = "opal-demo-hint-banner";
// "Fun level" slider order: Basic → Rich → Ready ("good to go") → Fun.
const DESIGN_ORDER: TrayDesign[] = ["basic", "rich", "ready", "fun"];

export function DemoResetButton() {
  const [open, setOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const plannerLabel = usePlannerLabel();
  const plannerNavVisible = usePlannerNavVisible();
  const strideDsNavVisible = useStrideDsNavVisible();
  const trayDesign = useTrayDesign();
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
      clearSessionTracker(); // wipe added notes/tasks + done/trash → back to seed
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
            minWidth: 300,
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

          {/* Divider above the Sticky board section */}
          <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "4px 0" }} />

          {/* Sticky board section header */}
          <Box style={{ padding: "4px 8px" }}>
            <Text fontFamily="mono" fontSize="xs" fontWeight="400" color="fg.tertiary" textTransform="uppercase">
              Sticky board
            </Text>
          </Box>

          {/* Sticky board label (Planner / Tracker) */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap="12"
            style={{ padding: "8px 8px" }}
          >
            <Text style={{ fontSize: 14 }}>Label</Text>
            <SegmentedControl
              value={plannerLabel}
              onValueChange={(v: string) => v && setPlannerLabel(v as PlannerLabel)}
            >
              <SegmentedControlItem value="Planner">Planner</SegmentedControlItem>
              <SegmentedControlItem value="Tracker">Tracker</SegmentedControlItem>
            </SegmentedControl>
          </Box>

          {/* Sticky board design — a "Fun level" slider.
              None → Basic · Min → Rich · Med → Sticky · Max → Fun */}
          <Box style={{ padding: "8px 8px 16px" }}>
            <Text style={{ fontSize: 14, display: "block", marginBottom: 12 }}>Fun Slider 🥊</Text>
            <Range
              value={Math.max(0, DESIGN_ORDER.indexOf(trayDesign))}
              onValueChange={(v: number) => setTrayDesign(DESIGN_ORDER[v])}
              min={0}
              max={3}
              step={1}
              marks={[
                { value: 0, label: "😿" },
                { value: 1, label: "😺" },
                { value: 2, label: "👍" },
                { value: 3, label: "😻" },
              ]}
            />
          </Box>

          {/* Show/hide the Planner item in the left nav */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap="12"
            style={{ padding: "8px 8px" }}
          >
            <Text style={{ fontSize: 14 }}>{plannerLabel} in left nav</Text>
            <Switch
              size="md"
              checked={plannerNavVisible}
              onCheckedChange={setPlannerNavVisible}
            />
          </Box>

          {/* Show/hide the Design System Setup item in the left nav */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap="12"
            style={{ padding: "8px 8px" }}
          >
            <Text style={{ fontSize: 14 }}>DS Setup in left nav</Text>
            <Switch
              size="md"
              checked={strideDsNavVisible}
              onCheckedChange={setStrideDsNavVisible}
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
