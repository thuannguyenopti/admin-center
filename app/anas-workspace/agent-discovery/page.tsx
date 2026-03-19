"use client";

import { useState } from "react";
import { Box, Heading, Grid } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { Flex } from "@/app/components/Flex";
import {
  IconRocket,
  IconPencil,
  IconChartBar,
  IconPhoto,
  IconRefresh,
  IconSearch,
  IconMessageCircle,
  IconMail,
  IconActivity,
  IconLayoutList,
  IconTool,
  IconSettings,
  IconFileText,
  IconArrowUp,
  IconFile,
  IconBrandFigma,
} from "@tabler/icons-react";

// Figma asset URLs (expire after 7 days — for experimentation only)
const IMG_EMAIL_ILLUSTRATION =
  "https://www.figma.com/api/mcp/asset/bfedfe67-07c1-4419-a8a3-72759e3c4501";
const IMG_CARD_ICON =
  "https://www.figma.com/api/mcp/asset/c054f9d2-73fb-48e3-b75c-69efe038f99f";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tag = { label: string; bg: string; color: string };
type Agent = {
  id: string;
  name: string;
  description: string;
  tags: Tag[];
  handle: string;
  illustrationUrl?: string;
  illustrationBg: string;
};

// ─── Data ────────────────────────────────────────────────────────────────────

const agents: Agent[] = [
  {
    id: "email-campaign",
    illustrationUrl: IMG_EMAIL_ILLUSTRATION,
    illustrationBg: "#ede9fe",
    name: "Write an email campaign",
    description:
      "Deep review of competitor positioning, messaging, and market gaps, with a summary brief.",
    tags: [
      { label: "Content strategy", bg: "#c6dbfa", color: "#0d46a0" },
      { label: "Market Review", bg: "#fffaea", color: "#4e1d09" },
    ],
    handle: "@email_gen_agent",
  },
  {
    id: "geo-optimizer",
    illustrationBg: "#fde9d5",
    name: "Optimize my GEO",
    description:
      "Optimize my GEO using industry best standards in order to broaden company reach.",
    tags: [
      { label: "GEO/SEO/AEO Analysis", bg: "#c6dbfa", color: "#0d46a0" },
      { label: "Market Intelligence", bg: "#dcfce7", color: "#14532d" },
    ],
    handle: "@campaign_agent",
  },
  {
    id: "analyze-competitors",
    illustrationBg: "#fde8ea",
    name: "Analyze my competitors",
    description:
      "Deep review of competitor positioning, messaging, and market gaps, with a summary.",
    tags: [
      { label: "Content strategy", bg: "#c6dbfa", color: "#0d46a0" },
      { label: "Competitive analysis", bg: "#fde8ea", color: "#7f1d1d" },
    ],
    handle: "@competitors_are_dust",
  },
  {
    id: "ab-test",
    illustrationBg: "#fef3c7",
    name: "Set up an A/B experiment",
    description:
      "Define hypothesis, set variants, and configure your test without clunky back-and-forth.",
    tags: [
      { label: "Testing", bg: "#c6dbfa", color: "#0d46a0" },
      { label: "Experimentation", bg: "#dcfce7", color: "#14532d" },
    ],
    handle: "@ab_test",
  },
  {
    id: "content-calendar",
    illustrationBg: "#dbeafe",
    name: "Build a content calendar",
    description:
      "Plan and schedule your content across channels with smart timing recommendations.",
    tags: [
      { label: "Content strategy", bg: "#c6dbfa", color: "#0d46a0" },
      { label: "Planning", bg: "#ede9fe", color: "#3b0764" },
    ],
    handle: "@content_calendar_agent",
  },
  {
    id: "ad-variations",
    illustrationBg: "#dcfce7",
    name: "Generate ad variations",
    description:
      "Optimize my GEO using industry best standards in order to broaden company reach.",
    tags: [
      { label: "Market Intelligence", bg: "#dcfce7", color: "#14532d" },
      { label: "Testing", bg: "#c6dbfa", color: "#0d46a0" },
    ],
    handle: "@ad_variations_agent",
  },
  {
    id: "seo-audit",
    illustrationBg: "#fce7f3",
    name: "Audit my SEO performance",
    description:
      "Deep review of competitor positioning, messaging, and market gaps, with a summary.",
    tags: [
      { label: "Competitive analysis", bg: "#fde8ea", color: "#7f1d1d" },
      { label: "Market Review", bg: "#fffaea", color: "#4e1d09" },
    ],
    handle: "@seo_genie",
  },
  {
    id: "social-media",
    illustrationBg: "#f3e8ff",
    name: "Create social media strategy",
    description:
      "Time to take your social media game to the next level — use this agent to craft a strategy.",
    tags: [
      { label: "Strategy", bg: "#c6dbfa", color: "#0d46a0" },
      { label: "Social media", bg: "#fce7f3", color: "#701a75" },
    ],
    handle: "@social_media_pro",
  },
];

const CATEGORIES = [
  "Recommended",
  "Featured",
  "Brainstorm",
  "Create",
  "Test",
  "Analyze & Optimize",
];

const QUICK_ACTIONS = [
  { icon: <IconRocket size={13} color="#f97316" />, label: "Generate presentation" },
  { icon: <IconPencil size={13} color="#eab308" />, label: "Draft blog post" },
  { icon: <IconChartBar size={13} color="#22c55e" />, label: "Craft a report" },
  { icon: <IconPhoto size={13} color="#3b82f6" />, label: "Create an image" },
  { icon: <IconRefresh size={13} color="#10b981" />, label: "Repurpose content" },
];

const NAV_ICONS = [
  { icon: <IconMessageCircle size={18} />, label: "Chat" },
  { icon: <IconFileText size={18} />, label: "Pages" },
  { icon: <IconMail size={18} />, label: "Inbox" },
  { icon: <IconActivity size={18} />, label: "Activity" },
  { icon: <IconLayoutList size={18} />, label: "Lists" },
  { icon: <IconTool size={18} />, label: "Tools" },
];

// ─── Components ──────────────────────────────────────────────────────────────

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Box
      style={{
        backgroundColor: "white",
        border: "1px solid #ddd6fe",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        cursor: "pointer",
      }}
    >
      {/* Illustration + title + description */}
      <Flex gap="16" alignItems="start" style={{ minHeight: "80px" }}>
        <Box
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "8px",
            backgroundColor: agent.illustrationBg,
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {agent.illustrationUrl && (
            <img
              src={agent.illustrationUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </Box>
        <Box style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <Text
            style={{
              fontSize: "16px",
              fontWeight: 500,
              color: "#080736",
              letterSpacing: "-0.2px",
              lineHeight: "24px",
              margin: 0,
            }}
          >
            {agent.name}
          </Text>
          <Text
            style={{
              fontSize: "14px",
              color: "#66708c",
              letterSpacing: "-0.1px",
              lineHeight: "20px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              margin: 0,
            }}
          >
            {agent.description}
          </Text>
        </Box>
      </Flex>

      {/* Tags */}
      <Flex gap="8" flexWrap="wrap">
        {agent.tags.map((tag) => (
          <Box
            key={tag.label}
            style={{
              backgroundColor: tag.bg,
              color: tag.color,
              padding: "2px 6px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 400,
              lineHeight: "16px",
              whiteSpace: "nowrap",
            }}
          >
            {tag.label}
          </Box>
        ))}
      </Flex>

      {/* Divider */}
      <Box style={{ height: "1px", backgroundColor: "#dadfeb" }} />

      {/* @handle */}
      <Flex gap="6" alignItems="center">
        <Box
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            backgroundColor: "#ede9fe",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <img
            src={IMG_CARD_ICON}
            alt=""
            style={{ width: "100%", height: "100%" }}
          />
        </Box>
        <Text
          style={{
            fontSize: "12px",
            color: "#4f576e",
            fontWeight: 500,
            letterSpacing: "0.01px",
            margin: 0,
          }}
        >
          {agent.handle}
        </Text>
      </Flex>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgentDiscovery() {
  const [activeTab, setActiveTab] = useState("Recommended");
  const [prompt, setPrompt] = useState("");

  return (
    <Box display="flex" style={{ minHeight: "100vh", backgroundColor: "#f7f8fc" }}>
      {/* Left icon-only sidebar */}
      <Box
        style={{
          width: "52px",
          borderRight: "1px solid #e5e9f0",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "16px",
          paddingBottom: "16px",
          gap: "4px",
          flexShrink: 0,
        }}
      >
        {NAV_ICONS.map((item) => (
          <Box
            key={item.label}
            aria-label={item.label}
            style={{
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#66708c",
            }}
          >
            {item.icon}
          </Box>
        ))}
        <Box style={{ flex: 1 }} />
        <Box
          aria-label="Settings"
          style={{
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            cursor: "pointer",
            color: "#66708c",
          }}
        >
          <IconSettings size={18} />
        </Box>
      </Box>

      {/* Main content */}
      <Box style={{ flex: 1, overflowY: "auto" }}>
        <Box
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            padding: "72px 40px 80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Hero */}
          <Heading
            level="1"
            style={{
              fontSize: "32px",
              fontWeight: 500,
              color: "#080736",
              marginBottom: "28px",
              textAlign: "center",
            }}
          >
            What are we working on today?
          </Heading>

          {/* Prompt input */}
          <Box
            style={{
              width: "100%",
              maxWidth: "700px",
              border: "1.5px solid #a78bfa",
              borderRadius: "12px",
              backgroundColor: "white",
              marginBottom: "16px",
            }}
          >
            <textarea
              placeholder="Ask Opal anything—like 'Plan a new campaign' or 'Suggest an image for travel audience'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{
                width: "100%",
                minHeight: "80px",
                padding: "16px",
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
                color: "#080736",
                backgroundColor: "transparent",
                letterSpacing: "-0.1px",
                lineHeight: "22px",
                boxSizing: "border-box",
              }}
            />
            <Flex
              px="12"
              py="8"
              justifyContent="space-between"
              alignItems="center"
              style={{ borderTop: "1px solid #f0f0f5" }}
            >
              <Flex gap="4">
                <Button
                  appearance="subtle"
                  size="sm"
                  icon={<IconFile size={16} />}
                  aria-label="Attach file"
                />
                <Button
                  appearance="subtle"
                  size="sm"
                  icon={<IconBrandFigma size={16} />}
                  aria-label="Figma"
                />
              </Flex>
              <Box
                onClick={() => {}}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: prompt.trim() ? "#7c3aed" : "#e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: prompt.trim() ? "pointer" : "default",
                  transition: "background-color 0.15s ease",
                }}
              >
                <IconArrowUp size={16} color={prompt.trim() ? "white" : "#9ca3af"} />
              </Box>
            </Flex>
          </Box>

          {/* Quick actions */}
          <Box
            style={{
              width: "100%",
              maxWidth: "700px",
              display: "flex",
              gap: "6px",
              marginBottom: "64px",
              overflow: "hidden",
            }}
          >
            {QUICK_ACTIONS.map((action) => (
              <Box
                key={action.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 10px",
                  backgroundColor: "white",
                  border: "1px solid #e2e5ec",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "#3d4659",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {action.icon}
                {action.label}
              </Box>
            ))}
          </Box>

          {/* Agent Library */}
          <Box style={{ width: "100%" }}>
            <Heading
              level="2"
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#080736",
                marginBottom: "4px",
              }}
            >
              Agent Library
            </Heading>
            <Text
              color="fg.secondary"
              style={{ marginBottom: "20px", display: "block" }}
            >
              Agents crafted with care to help you get your work done
            </Text>

            {/* Category tabs */}
            <Flex
              style={{
                borderBottom: "1px solid #e5e9f0",
                marginBottom: "24px",
                overflowX: "auto",
              }}
            >
              {CATEGORIES.map((cat) => (
                <Box
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: activeTab === cat ? 500 : 400,
                    color: activeTab === cat ? "#080736" : "#66708c",
                    borderBottom:
                      activeTab === cat
                        ? "2px solid #7c3aed"
                        : "2px solid transparent",
                    whiteSpace: "nowrap",
                    marginBottom: "-1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flexShrink: 0,
                  }}
                >
                  {cat === "Recommended" && (
                    <IconRocket
                      size={13}
                      color={activeTab === cat ? "#7c3aed" : "#66708c"}
                    />
                  )}
                  {cat}
                </Box>
              ))}
              <Box style={{ flex: 1 }} />
              <Box
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  color: "#66708c",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <IconSearch size={16} />
              </Box>
            </Flex>

            {/* Agent card grid */}
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
