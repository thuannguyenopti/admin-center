"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Box } from "@optiaxiom/react";

// Fixed, resizable width wrapper for content shown in the global aside — the
// same drawer chrome the notification tray / stickies aside use, so it loads
// from below the global nav.
export function DetailAside({ children }: { children: React.ReactNode }) {
  const [panelWidth, setPanelWidth] = useState(480);
  const resizingRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const { startX, startWidth } = resizingRef.current;
      setPanelWidth(Math.max(400, Math.min(760, startWidth - (e.clientX - startX))));
    };
    const onUp = () => {
      resizingRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startResize = (e: ReactMouseEvent<HTMLDivElement>) => {
    resizingRef.current = { startX: e.clientX, startWidth: panelWidth };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <Box h="full" style={{ width: panelWidth, position: "relative" }}>
      <Box
        aria-label="Resize"
        onMouseDown={startResize}
        h="full"
        style={{ position: "absolute", left: 0, top: 0, width: 8, transform: "translateX(-50%)", cursor: "col-resize", zIndex: 20 }}
      >
        <Box h="full" bg="bg.tertiary" style={{ position: "absolute", left: "50%", top: 0, width: 1, transform: "translateX(-50%)", opacity: 0.7 }} />
      </Box>
      {children}
    </Box>
  );
}
