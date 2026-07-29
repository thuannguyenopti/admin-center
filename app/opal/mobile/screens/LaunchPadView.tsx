"use client";

import { useState } from "react";
import { Box, Heading, Text, Avatar, Badge, Button } from "@optiaxiom/react";
import {
  IconBell,
  IconArrowUp,
  IconFlask,
  IconStar,
  IconChartMixed,
  IconChevronRight,
  IconTriangleExclamation,
  IconPlus,
  IconRecordVoiceOver,
} from "@optiaxiom/icons";
import { mobileType } from "../typography";

// ── Data ──────────────────────────────────────────────────────────────────────

const ATTENTION = [
  {
    title: "Q3 Marketing Roadmap Brief",
    sub: "Review before 3 PM meeting today — 4 sections need your input",
    urgent: true,
  },
  {
    title: "Homepage hero CTA test reached significance",
    sub: "Day 14 · +12.4% lift · 98% confidence · Experimentation",
    urgent: false,
  },
];

const STARTERS = [
  { icon: IconStar,       label: "What's winning this week?" },
  { icon: IconFlask,      label: "Draft an A/B test hypothesis" },
  { icon: IconChartMixed, label: "Summarize Q3 results" },
];

const CANVASES = [
  {
    title: "Boston Marathon Landing Page",
    meta: "Exp · edited 2h ago",
    img: "/boston-marathon-hero.png",
  },
  {
    title: "Landing Page Sign Up Form",
    meta: "CMS · edited yesterday",
    img: "/features-card-1.jpg",
  },
];

const RECENTS = [
  { name: "Ollie Barker",  src: "/avatars/avatar-1.png",   preview: "Homepage hero CTA test reached significance — +12.4% lift", time: "2m",  unread: 2 },
  { name: "Marcus Chen",   src: null, colorScheme: "purple" as const, preview: "Sounds good — I'll align with the team before Friday",       time: "14m", unread: 0 },
  { name: "Sofia Reyes",   src: "/avatars/avatar-2.png",   preview: "Dropped the Q3 brief in the canvas, lmk what you think",     time: "1h",  unread: 3 },
];

// ── Heading font helper ───────────────────────────────────────────────────────

// ── Recent avatar (48px + presence dot, no badge) ────────────────────────────
function RecentAvatar({ name, src, colorScheme }: { name: string; src?: string | null; colorScheme?: "neutral" | "purple" }) {
  return (
    <Box style={{ position: "relative", width: 50, height: 50, flexShrink: 0 }}>
      <Avatar
        name={name}
        src={src ?? undefined}
        size="lg"
        colorScheme={colorScheme ?? "neutral"}
        style={{ position: "absolute", left: 1, top: 1, width: 48, height: 48 }}
      />
      {/* Presence dot */}
      <Box style={{
        position: "absolute", left: 37, top: 37,
        width: 12, height: 12, borderRadius: "50%",
        background: "var(--ax-colors-fg-success)",
        border: "2px solid var(--ax-colors-bg-default)",
      }} />
    </Box>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function LaunchPadView({ onBellClick, onAvatarClick, showPreview = true }: { onBellClick?: () => void; onAvatarClick?: () => void; showPreview?: boolean }) {
  const [promptText, setPromptText] = useState("");
  const [focused, setFocused] = useState(false);
  const isTyping = promptText.length > 0;

  return (
    <Box display="flex" flexDirection="column" style={{ height: "100%", background: "var(--ax-colors-bg-page)" }}>

      {/* Header */}
      <Box display="flex" alignItems="center" gap="12" style={{ padding: "14px 20px 10px", flexShrink: 0 }}>
        {/* Photo avatar (annotation: "photo image - match the main opal prototype") */}
        <Avatar name="Jamie Cohen" src="/avatars/jc.png" size="lg" onClick={onAvatarClick} style={{ flexShrink: 0, cursor: onAvatarClick ? "pointer" : "default" }} />
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)", lineHeight: 1.33 }}>
            Good morning
          </Text>
          <Heading level="3">Jamie Cohen</Heading>
        </Box>
        {/* annotation: "use info intent for indicator" */}
        <Box onClick={onBellClick} style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "var(--ax-colors-bg-default)",
          border: "1px solid var(--ax-colors-border-secondary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", position: "relative", flexShrink: 0,
        }}>
          <IconBell style={{ width: 22, height: 22, color: "var(--ax-colors-fg-secondary)" }} />
          <Box style={{
            position: "absolute", top: 9, right: 10,
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--ax-colors-fg-information)",   // teal info, not success green
            border: "1.5px solid var(--ax-colors-bg-default)",
          }} />
        </Box>
      </Box>

      {/* Scrollable body */}
      <Box style={{ flex: 1, overflowY: "auto", padding: "6px 20px 24px" }}>

        {/* Opal composer — compact by default, expands on focus */}
        <Box rounded="xl" style={{
          background: "linear-gradient(4deg, #e4f3ff 0%, #ffffff 44%, #e9ffe1 81%)",
          border: "1px solid var(--ax-colors-border-secondary)",
          padding: focused ? "12px 12px 10px" : "10px 8px 10px 12px",
          display: focused ? "block" : "flex",
          alignItems: focused ? undefined : "center",
          transition: "padding 0.15s",
        }}>
          <input
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { if (!promptText) setFocused(false); }}
            placeholder="Ask Opal"
            style={{
              flex: focused ? undefined : 1,
              width: focused ? "100%" : undefined,
              border: "none", outline: "none", background: "transparent",
              ...mobileType.body, color: "var(--ax-colors-fg-default)",
              fontFamily: "inherit",
            }}
          />
          {focused ? (
            <Box display="flex" alignItems="center" gap="4" style={{ marginTop: 10 }}>
              <Button appearance="subtle" size="lg" aria-label="Add" icon={<IconPlus style={{ width: 18, height: 18 }} />} />
              <Box style={{ flex: 1 }} />
              <Button appearance="primary" size="lg" aria-label={isTyping ? "Send" : "Voice input"}
                icon={isTyping ? <IconArrowUp style={{ width: 18, height: 18 }} /> : <IconRecordVoiceOver style={{ width: 18, height: 18 }} />} />
            </Box>
          ) : (
            <Box style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "var(--ax-colors-bg-accent, #abff44)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <IconRecordVoiceOver style={{ width: 16, height: 16, color: "var(--ax-colors-fg-default)" }} />
            </Box>
          )}
        </Box>

        {/* Needs Your Attention — annotation: "h4 for home section titles", icon after text */}
        <Box style={{ marginTop: 16 }}>
          <Box display="flex" alignItems="center" gap="6" style={{ marginBottom: 8 }}>
            <Heading level="4">Needs your attention</Heading>
            <IconTriangleExclamation style={{ width: 14, height: 14, color: "var(--ax-colors-fg-warning)", flexShrink: 0 }} />
          </Box>
          <Box style={{ border: "1px solid var(--ax-colors-border-secondary)", borderRadius: 12, overflow: "hidden" }}>
            {ATTENTION.map((item, i) => (
              <Box key={i} style={{
                padding: "12px 14px",
                borderBottom: i < ATTENTION.length - 1 ? "1px solid var(--ax-colors-border-secondary)" : undefined,
                cursor: "pointer",
              }}>
                <Box display="flex" alignItems="center" gap="8" style={{ marginBottom: 2 }}>
                  <Text style={{ ...mobileType.body, fontWeight: 600, color: "var(--ax-colors-fg-default)", flex: 1 }}>
                    {item.title}
                  </Text>
                  {/* annotation: "danger badge" — use Axiom Badge */}
                  {item.urgent && <Badge intent="danger">Urgent</Badge>}
                </Box>
                <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)", lineHeight: 1.35 }}>
                  {item.sub}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Quick starters — annotation: "Opal chips" */}
        <Box display="flex" gap="8" style={{ marginTop: 16, overflowX: "auto", paddingBottom: 2 }}>
          {STARTERS.map(({ icon: Icon, label }) => (
            <Box key={label} style={{
              flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
              background: "var(--ax-colors-bg-default)",
              border: "1px solid var(--ax-colors-border-secondary)",
              borderRadius: 999, padding: "9px 14px",
              cursor: "pointer",
            }}>
              <Icon style={{ width: 16, height: 16, color: "var(--ax-colors-fg-accent-strong)", flexShrink: 0 }} />
              <Text style={{ ...mobileType.secondary, fontWeight: 500, color: "var(--ax-colors-fg-default)", whiteSpace: "nowrap" }}>
                {label}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Jump back in — annotation: "subtle button" for Artifacts */}
        <Box display="flex" alignItems="center" justifyContent="space-between" style={{ margin: "22px 0 12px" }}>
          <Heading level="4">Jump back in</Heading>
          {/* annotation: subtle button with trailing arrow icon */}
          <Box display="flex" alignItems="center" gap="4" style={{ cursor: "pointer" }}>
            <Text style={{ ...mobileType.secondary, fontWeight: 500, color: "var(--ax-colors-fg-accent-strong)" }}>
              Artifacts
            </Text>
            <IconChevronRight style={{ width: 14, height: 14, color: "var(--ax-colors-fg-accent-strong)" }} />
          </Box>
        </Box>
        <Box display="flex" gap="12" style={{ overflowX: "auto", paddingBottom: 2 }}>
          {CANVASES.map((c) => (
            <Box key={c.title} rounded="xl" style={{
              flexShrink: 0, width: 176,
              background: "var(--ax-colors-bg-default)",
              border: "1px solid var(--ax-colors-border-secondary)",
              overflow: "hidden", cursor: "pointer",
            }}>
              <Box style={{ height: 96, overflow: "hidden", borderBottom: "1px solid var(--ax-colors-border-secondary)" }}>
                <img src={c.img} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </Box>
              <Box style={{ padding: "11px 12px 12px" }}>
                <Text style={{ fontWeight: 600, ...mobileType.body, lineHeight: 1.25, color: "var(--ax-colors-fg-default)" }}>{c.title}</Text>
                <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)", marginTop: 4 }}>{c.meta}</Text>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Recent — dm_block pattern: avatar + presence dot on left, badge on right */}
        <Heading level="4" style={{ margin: "22px 0 6px" }}>Recent</Heading>
        <Box display="flex" flexDirection="column">
          {RECENTS.map((item, i) => (
            <Box key={i} display="flex" alignItems="center" gap="12"
              style={{ padding: "10px 0", borderBottom: "1px solid var(--ax-colors-border-secondary)", cursor: "pointer" }}>
              <RecentAvatar name={item.name} src={item.src} colorScheme={item.colorScheme} />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontWeight: 600, ...mobileType.primary, lineHeight: 1.5, color: "var(--ax-colors-fg-default)" }}>
                  {item.name}
                </Text>
                {showPreview && <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.33 }}>
                  {item.preview}
                </Text>}
              </Box>
              {/* Right: time + unread badge */}
              <Box display="flex" flexDirection="column" alignItems="end" gap="4" style={{ flexShrink: 0 }}>
                <Text style={{ ...mobileType.meta, color: "var(--ax-colors-fg-tertiary)" }}>{item.time}</Text>
                {item.unread > 0 && (
                  <Box style={{
                    minWidth: 20, height: 20, borderRadius: 10, padding: "0 5px",
                    background: "var(--ax-colors-fg-information-strong)",
                    color: "white", ...mobileType.label, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {item.unread}
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
