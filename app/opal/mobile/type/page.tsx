"use client";

import { Box, Text } from "@optiaxiom/react";
import { mobileType } from "../typography";

const rows: { name: string; style: typeof mobileType[keyof typeof mobileType]; sample: string }[] = [
  { name: "hero",          style: mobileType.hero,          sample: "Large Title" },
  { name: "title",         style: mobileType.title,         sample: "Title" },
  { name: "sectionHeader", style: mobileType.sectionHeader, sample: "Section Header" },
  { name: "primary",       style: mobileType.primary,       sample: "Primary — sender name, list row title" },
  { name: "body",          style: mobileType.body,          sample: "Body — message preview, description text" },
  { name: "secondary",     style: mobileType.secondary,     sample: "Secondary — supporting text, footnote" },
  { name: "meta",          style: mobileType.meta,          sample: "Meta — timestamps, counts" },
  { name: "caps",          style: mobileType.caps,          sample: "Section label" },
  { name: "label",         style: mobileType.label,         sample: "11px label (no caps)" },
];

export default function TypographyPreviewPage() {
  return (
    <Box style={{ maxWidth: 640, padding: "40px 32px", display: "flex", flexDirection: "column", gap: 0 }}>
      <Text style={{ ...mobileType.caps, color: "var(--ax-colors-fg-tertiary)", marginBottom: 24 }}>
        Mobile Type Scale
      </Text>

      {rows.map(({ name, style, sample }) => (
        <Box
          key={name}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 24,
            padding: "16px 0",
            borderBottom: "1px solid var(--ax-colors-border-default)",
          }}
        >
          <Box style={{ width: 120, flexShrink: 0 }}>
            <Text style={{ fontSize: 11, color: "var(--ax-colors-fg-tertiary)", fontFamily: "monospace" }}>
              {name}
            </Text>
            <Text style={{ fontSize: 11, color: "var(--ax-colors-fg-disabled)", fontFamily: "monospace" }}>
              {style.fontSize}px / {style.lineHeight}
            </Text>
          </Box>
          <Text style={{ ...style, color: "var(--ax-colors-fg-default)" }}>
            {sample}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
