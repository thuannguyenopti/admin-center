"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Box, Button, Text, Tooltip } from "@optiaxiom/react";
import { IconUsers } from "@optiaxiom/icons";
import Image from "next/image";
import { type VAU } from "@/app/opal/data/vaus";
import { TOOL_ICONS } from "./tool-icons";

const MAX_VISIBLE_TOOLS = 4;

const CAPTION: React.CSSProperties = {
  fontFamily: "Roboto Mono, monospace",
  fontSize: 12,
  fontWeight: 400,
  lineHeight: "1.25",
  letterSpacing: "0.36px",
  textTransform: "uppercase",
  color: "var(--ax-colors-fg-tertiary)",
};

const TOOL_CHIP: React.CSSProperties = {
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

const DIVIDER = (
  <Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", width: "100%", flexShrink: 0, margin: "4px 0" }} />
);

function ToolChips({ tools }: { tools: string[] }) {
  const thirdParty = tools.filter((t) => !t.startsWith("opti-"));
  const visible = thirdParty.slice(0, MAX_VISIBLE_TOOLS);
  const overflow = thirdParty.length - visible.length;
  return (
    <Box display="flex" alignItems="center" gap="4">
      {visible.map((toolKey) => {
        const tool = TOOL_ICONS[toolKey];
        if (!tool) return null;
        return (
          <Tooltip key={toolKey} content={tool.name} delayDuration={300}>
            <Box style={{ ...TOOL_CHIP, color: tool.color, fontSize: tool.icon ? undefined : 8, fontFamily: tool.icon ? undefined : "Roboto Mono, monospace", fontWeight: tool.icon ? undefined : 600, padding: tool.icon ? 4 : 2 }}>
              {tool.icon ?? tool.textLabel}
            </Box>
          </Tooltip>
        );
      })}
      {overflow > 0 && (
        <Box style={{ ...TOOL_CHIP, fontFamily: "var(--ax-font-family)", fontSize: 12, color: "var(--ax-colors-fg-secondary)", padding: 0 }}>
          +{overflow}
        </Box>
      )}
    </Box>
  );
}

export function VAUCard({ vau, onSelect }: { vau: VAU; onSelect: (vau: VAU) => void }) {
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);

  const tilt = hovered && !flipped ? "rotateY(5deg) rotateX(-2deg)" : "";
  const rotation = flipped ? "rotateY(180deg)" : tilt;

  const frontSkills = vau.cardSkills ?? vau.tags.map((t) => t.label);

  return (
    <div
      style={{ perspective: "1200px", width: 344, flexShrink: 0, height: 568, cursor: "pointer" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setFlipped((f) => !f)}
    >
      {/* flip inner */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.45s ease",
          transform: rotation,
        }}
      >
        {/* ── FRONT FACE ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: "var(--ax-colors-bg-default)",
            border: "1px solid #d8e4cb",
            borderRadius: 12,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            overflow: "hidden",
          }}
        >
          {/* Header: RESUME label + title + category badge */}
          <Box display="flex" flexDirection="column" gap="8" style={{ alignItems: "flex-start" }}>
            <span style={{ ...CAPTION }}>Resume</span>
            <Text style={{ fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)", fontSize: 28, fontWeight: 800, lineHeight: "1.04", letterSpacing: "0.56px", color: "var(--ax-colors-fg-default)" }}>
              {vau.name}
            </Text>
            {vau.cardCategory && (
              <Badge intent="information" variant="subtle">{vau.cardCategory}</Badge>
            )}
          </Box>

          {DIVIDER}

          {/* Character illustration — flex: 1 absorbs height diff between 1-line and 2-line name cards */}
          <Box
            style={{
              width: "100%",
              flex: 1,
              minHeight: 140,
              borderRadius: 8,
              background: vau.cardBg ?? vau.avatarBg,
              overflow: "hidden",
              padding: vau.cardImagePadding ?? 0,
              boxSizing: "border-box",
            }}
          >
            {vau.cardImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vau.cardImage}
                alt={vau.name}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />
            )}
          </Box>

          {/* SKILLS */}
          <Box display="flex" flexDirection="column" gap="8">
            <span style={{ ...CAPTION }}>Skills</span>
            <Box display="flex" style={{ flexWrap: "wrap", gap: 4, height: 44, overflow: "hidden", alignContent: "flex-start" }}>
              {frontSkills.map((skill) => (
                <Badge key={skill} variant="subtle">{skill}</Badge>
              ))}
            </Box>
          </Box>

          {DIVIDER}

          {/* WORKS WITH YOUR TOOLS */}
          <Box display="flex" flexDirection="column" gap="8">
            <span style={{ ...CAPTION }}>Works with your tools</span>
            <ToolChips tools={vau.tools} />
          </Box>

          {DIVIDER}

          {/* Hire button */}
          <Box>
            <Button
              appearance="primary"
              size="lg"
              addonBefore={<Box style={{ width: 20, height: 20, borderRadius: 4, background: "var(--ax-colors-bg-default-inverse)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><IconUsers style={{ color: "var(--ax-colors-fg-default-inverse)", width: 13, height: 13 }} /></Box>}
              style={{ width: "100%", justifyContent: "center" }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSelect(vau);
              }}
            >
              Work together
            </Button>

          </Box>
        </div>

        {/* ── BACK FACE ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "var(--ax-colors-bg-default)",
            border: "1px solid #d8e4cb",
            borderRadius: 12,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            overflow: "hidden",
          }}
        >
          {/* Back face header: avatar + title + badge */}
          <Box display="flex" alignItems="center" gap="12">
            <Box
              style={{
                width: 52,
                height: 52,
                minWidth: 52,
                borderRadius: 8,
                border: "1px solid var(--ax-colors-border-secondary)",
                overflow: "hidden",
                background: vau.cardBg ?? vau.avatarBg,
                flexShrink: 0,
              }}
            >
              <Image src={vau.cardImage ?? vau.avatar} alt={vau.name} width={52} height={52} unoptimized style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </Box>
            <Box display="flex" flexDirection="column" gap="6" style={{ alignItems: "flex-start" }}>
              <Text style={{ fontFamily: "var(--ax-font-family-headings, 'VC Nudge', sans-serif)", fontSize: 22, fontWeight: 800, lineHeight: "1.1", letterSpacing: "0.44px", color: "var(--ax-colors-fg-default)" }}>
                {vau.name}
              </Text>
              {vau.cardCategory && <Badge intent="information" variant="subtle">{vau.cardCategory}</Badge>}
            </Box>
          </Box>

          {DIVIDER}

          {/* WHY HIRE ME */}
          {vau.whyHireMe && (
            <Box display="flex" flexDirection="column" gap="4">
              <span style={{ ...CAPTION }}>Why hire me</span>
              <Text fontSize="md" color="fg.default" style={{ lineHeight: "1.4" }}>{vau.whyHireMe}</Text>
            </Box>
          )}

          {DIVIDER}

          {/* EXPERIENCE */}
          {vau.experience && vau.experience.length > 0 && (
            <Box display="flex" flexDirection="column" gap="4">
              <span style={{ ...CAPTION }}>Experience</span>
              <ul style={{ margin: 0, paddingLeft: 18, listStyleType: "disc" }}>
                {vau.experience.map((item) => (
                  <li key={item} style={{ fontSize: 13, lineHeight: "1.4", color: "var(--ax-colors-fg-default)", marginBottom: 2, display: "list-item" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </Box>
          )}

          {DIVIDER}

          {/* WORKS WITH YOUR TOOLS */}
          <Box display="flex" flexDirection="column" gap="4">
            <span style={{ ...CAPTION }}>Works with your tools</span>
            <ToolChips tools={vau.tools} />
          </Box>

          {DIVIDER}

          {/* PASSIONS */}
          {vau.passions && (
            <Box display="flex" flexDirection="column" gap="4">
              <span style={{ ...CAPTION }}>Passions</span>
              <Text fontSize="md" color="fg.default" style={{ lineHeight: "1.4" }}>{vau.passions}</Text>
            </Box>
          )}

          {DIVIDER}

          {/* SKILLS */}
          <Box display="flex" flexDirection="column" gap="4">
            <span style={{ ...CAPTION }}>Skills</span>
            <Box display="flex" style={{ flexWrap: "wrap", gap: 4 }}>
              {frontSkills.map((skill) => (
                <Badge key={skill} variant="subtle">{skill}</Badge>
              ))}
            </Box>
          </Box>

          {/* Hire + Details buttons */}
          <Box display="flex" gap="8" style={{ paddingTop: 8, marginTop: "auto" }}>
            <Button
              appearance="primary"
              size="md"
              addonBefore={<Box style={{ width: 20, height: 20, borderRadius: 4, background: "var(--ax-colors-bg-default-inverse)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><IconUsers style={{ color: "var(--ax-colors-fg-default-inverse)", width: 13, height: 13 }} /></Box>}
              style={{ flex: 1, justifyContent: "center" }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSelect(vau);
              }}
            >
              Work together
            </Button>

            <Button
              appearance="default"
              size="md"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                router.push(`/opal/virtual-teammates/${vau.id}`);
              }}
            >
              Details
            </Button>
          </Box>
        </div>
      </div>
    </div>
  );
}
