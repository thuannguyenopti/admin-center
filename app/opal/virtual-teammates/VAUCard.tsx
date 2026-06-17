"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Text,
  Tooltip,
} from "@optiaxiom/react";
import { IconArrowRight } from "@optiaxiom/icons";
import Image from "next/image";
import { type VAU } from "@/app/opal/data/vaus";
import { TOOL_ICONS } from "./tool-icons";

const MAX_VISIBLE_TOOLS = 3;
const MAX_VISIBLE_TAGS = 3;

const TAG_STYLE: React.CSSProperties = {
  background: "#D8E4CB",
  color: "var(--ax-colors-fg-default)",
  fontFamily: "Roboto Mono, monospace",
  fontSize: 10,
  letterSpacing: "0.36px",
  textTransform: "uppercase",
  lineHeight: "1.25",
  height: 21,
  padding: "0 8px",
  borderRadius: 32,
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
};

const TOOL_CHIP_STYLE: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 8,
  border: "1px solid var(--ax-colors-border-secondary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  padding: 4,
  overflow: "hidden",
};

export function VAUCard({ vau, onSelect }: { vau: VAU; onSelect: (vau: VAU) => void }) {
  const [hovered, setHovered] = useState(false);

  const thirdPartyTools = vau.tools.filter((t) => !t.startsWith("opti-"));
  const visibleTools = thirdPartyTools.slice(0, MAX_VISIBLE_TOOLS);
  const overflowToolCount = thirdPartyTools.length - visibleTools.length;
  const visibleTags = vau.tags.slice(0, MAX_VISIBLE_TAGS);
  const extraTagCount = vau.tags.length - visibleTags.length;

  return (
    <Box
      bg="bg.default"
      style={{
        position: "relative",
        border: "1px solid #dde9d2",
        borderRadius: 12,
        padding: 20,
        cursor: "pointer",
        transition: "box-shadow 0.15s ease",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflow: "hidden",
        boxShadow: hovered
          ? "0 0 0 1.5px #A1AC8D, 0 1px 3px 0 rgb(0 0 0 / 0.08), 0 2px 8px 0 rgb(0 0 0 / 0.06)"
          : "none",
      }}
      onClick={() => onSelect(vau)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header: avatar + title/tools + 3-dot menu */}
      <Box display="flex" alignItems="start" gap="8" style={{ width: "100%" }}>
        <Box
          style={{
            width: 64,
            height: 64,
            minWidth: 64,
            overflow: "hidden",
            borderRadius: 8,
            backgroundColor: vau.avatarBg,
            flexShrink: 0,
          }}
        >
          <Image
            src={vau.avatar}
            alt={vau.name}
            width={64}
            height={64}
            unoptimized
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>

        <Box display="flex" flexDirection="column" gap="12" style={{ flex: 1, minWidth: 0 }}>
          <Text
            color="fg.default"
            style={{
              fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)",
              fontSize: 20,
              fontWeight: 600,
              lineHeight: "1.1",
              letterSpacing: "0.4px",
            }}
          >
            {vau.name}
          </Text>

          {/* TOOLS USED row */}
          <Box display="flex" alignItems="center" gap="8">
            <span
              style={{
                fontFamily: "Roboto Mono, monospace",
                fontSize: 12,
                lineHeight: "1.25",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                color: "var(--ax-colors-fg-secondary)",
                flexShrink: 0,
              }}
            >
              Tools used
            </span>
            <Box display="flex" alignItems="center" gap="4">
              {visibleTools.map((toolKey) => {
                const tool = TOOL_ICONS[toolKey];
                if (!tool) return null;
                return (
                  <Tooltip key={toolKey} content={tool.name} delayDuration={300}>
                    <Box
                      style={{
                        ...TOOL_CHIP_STYLE,
                        color: tool.color,
                        fontSize: tool.icon ? undefined : 8,
                        fontFamily: tool.icon ? undefined : "Roboto Mono, monospace",
                        fontWeight: tool.icon ? undefined : 600,
                        letterSpacing: tool.icon ? undefined : "0.02em",
                        padding: tool.icon ? 4 : 2,
                      }}
                    >
                      {tool.icon ?? tool.textLabel}
                    </Box>
                  </Tooltip>
                );
              })}
              {overflowToolCount > 0 && (
                <Box
                  style={{
                    ...TOOL_CHIP_STYLE,
                    fontFamily: "var(--ax-font-family)",
                    fontSize: 12,
                    color: "var(--ax-colors-fg-secondary)",
                    letterSpacing: "0.24px",
                    padding: 0,
                  }}
                >
                  +{overflowToolCount}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

      </Box>

      {/* Description — 3-line clamp */}
      <Text
        fontSize="sm"
        color="fg.secondary"
        style={{
          lineHeight: "1.43",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {vau.description}
      </Text>

      {/* Divider */}
      <Box
        style={{
          height: 1,
          width: "100%",
          background: "var(--ax-colors-border-secondary)",
          flexShrink: 0,
        }}
      />

      {/* Footer: tags + hover-reveal CTA */}
      <div style={{ display: "flex", alignItems: "center", width: "100%", minHeight: 21 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, overflow: "hidden" }}>
          {visibleTags.map((tag) => (
            <span key={tag.label} style={TAG_STYLE}>{tag.label}</span>
          ))}
          {extraTagCount > 0 && (
            <span style={{ ...TAG_STYLE, flexShrink: 0 }}>+{extraTagCount}</span>
          )}
        </div>
        <div
          style={{
            flexShrink: 0,
            marginLeft: 8,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.15s ease",
            pointerEvents: hovered ? "auto" : "none",
          }}
        >
          <Button
            appearance="primary"
            size="sm"
            addonAfter={<IconArrowRight />}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onSelect(vau);
            }}
          >
            Hire
          </Button>
        </div>
      </div>
    </Box>
  );
}
