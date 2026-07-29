"use client";

import { Box, Heading, Text, Button, Avatar } from "@optiaxiom/react";
import { IconXmark, IconArrowRightFromBracket } from "@optiaxiom/icons";
import { mobileType } from "../typography";

interface ProfilePanelProps {
  open: boolean;
  onClose: () => void;
}

export function ProfilePanel({ open, onClose }: ProfilePanelProps) {
  return (
    <>
      {/* Scrim */}
      <Box onClick={onClose} style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 300,
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.25s",
      }} />

      {/* Sheet */}
      <Box style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "var(--ax-colors-bg-default)",
        borderRadius: "20px 20px 0 0",
        zIndex: 301,
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
        paddingBottom: 32,
      }}>
        {/* Drag handle */}
        <Box style={{ width: 36, height: 4, borderRadius: 2, background: "var(--ax-colors-border-secondary)", margin: "12px auto 0" }} />

        {/* Header row */}
        <Box display="flex" alignItems="center" justifyContent="space-between" style={{ padding: "16px 20px 8px" }}>
          <Heading level="3">Profile</Heading>
          <Button appearance="subtle" size="sm" icon={<IconXmark style={{ width: 18, height: 18 }} />} onClick={onClose} aria-label="Close" />
        </Box>

        {/* Avatar + name */}
        <Box display="flex" alignItems="center" gap="16" style={{ padding: "8px 20px 20px" }}>
          <Avatar name="Jamie Cohen" src="/avatars/jc.png" size="lg" />
          <Box>
            <Text style={{ ...mobileType.sectionHeader, fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>Jamie Cohen</Text>
            <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-tertiary)" }}>Product Designer · Optimizely</Text>
          </Box>
        </Box>

        {/* Settings rows */}
        {([
          { label: "Notifications", value: "On" },
          { label: "Theme", value: "Light" },
          { label: "Language", value: "English" },
        ]).map(({ label, value }) => (
          <Box key={label} display="flex" alignItems="center" justifyContent="space-between"
            style={{ padding: "14px 20px", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
            <Text style={{ ...mobileType.primary, color: "var(--ax-colors-fg-default)" }}>{label}</Text>
            <Text style={{ ...mobileType.body, color: "var(--ax-colors-fg-tertiary)" }}>{value}</Text>
          </Box>
        ))}

        {/* Sign out */}
        <Box style={{ padding: "16px 20px 0" }}>
          <Button appearance="subtle" icon={<IconArrowRightFromBracket style={{ width: 16, height: 16 }} />} style={{ width: "100%" }} onClick={onClose}>Sign out</Button>
        </Box>
      </Box>
    </>
  );
}
