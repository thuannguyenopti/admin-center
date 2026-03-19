"use client";

import { Box, Heading, Dialog, DialogContent, DialogBody, DialogFooter } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconX, IconBrandGoogle, IconBrandSlack, IconBrandNotion, IconBrandAirtable, IconBrandGithub, IconBrandAsana, IconSearch, IconBrandFigma } from "@tabler/icons-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { OpalInput } from "@/app/components/Opal/OpalInput";

const LIBRARY_TABS = ["Recommended for you", "Featured", "Brainstorm & Plan", "Create", "Test & Experiment", "Optimize", "Search"];

const TOOL_ICONS: Record<string, { icon: React.ReactNode; bigIcon: React.ReactNode; bg: string; name: string }> = {
  figma:   { icon: <IconBrandFigma size={11} />,   bigIcon: <IconBrandFigma size={16} />,   bg: "#9b59b6", name: "Figma"    },
  google:  { icon: <IconBrandGoogle size={11} />,  bigIcon: <IconBrandGoogle size={16} />,  bg: "#4285F4", name: "Google"   },
  slack:   { icon: <IconBrandSlack size={11} />,   bigIcon: <IconBrandSlack size={16} />,   bg: "#4A154B", name: "Slack"    },
  notion:  { icon: <IconBrandNotion size={11} />,  bigIcon: <IconBrandNotion size={16} />,  bg: "#000000", name: "Notion"   },
  airtable:{ icon: <IconBrandAirtable size={11} />,bigIcon: <IconBrandAirtable size={16} />,bg: "#18BFFF", name: "Airtable" },
  github:  { icon: <IconBrandGithub size={11} />,  bigIcon: <IconBrandGithub size={16} />,  bg: "#24292e", name: "GitHub"   },
  asana:   { icon: <IconBrandAsana size={11} />,   bigIcon: <IconBrandAsana size={16} />,   bg: "#F06A6A", name: "Asana"   },
};

const AGENTS = [
  {
    emoji: "✉️",
    title: "Write an email campaign",
    description: "Deep review of competitor positioning, messaging, and market gaps, with a summary brief.",
    tags: [{ label: "Content strategy", bg: "#c6dbfa", color: "#0d46a0" }, { label: "Copywriting", bg: "#e9f7f1", color: "#17492b" }, { label: "Email marketing", bg: "#fdf4ff", color: "#701a75" }],
    isNew: true,
    handle: "@email_gen_agent",
    tab: "Create",
    tools: ["google", "notion", "slack"],
    capabilities: [
      { bold: "Draft", rest: " multi-step email sequences from a single brief" },
      { bold: "Personalise", rest: " copy for different audience segments" },
      { bold: "Optimise", rest: " subject lines for open rate performance" },
    ],
    createdBy: "Notion",
  },
  {
    emoji: "🌐",
    title: "Optimize my GEO",
    description: "Optimize my GEO using industry best standards in order to broaden company reach.",
    tags: [{ label: "SEO/GEO", bg: "#f5f3ff", color: "#4c1d95" }, { label: "Analytics", bg: "#c6dbfa", color: "#0d46a0" }],
    handle: "@campaign_agent",
    tab: "Optimize",
    tools: ["google", "airtable"],
    capabilities: [
      { bold: "Audit", rest: " your current GEO footprint against competitors" },
      { bold: "Identify", rest: " high-opportunity markets and regions" },
      { bold: "Generate", rest: " localised messaging recommendations" },
    ],
    createdBy: "Google",
  },
  {
    emoji: "📊",
    title: "Analyze my competitors",
    description: "Deep review of competitor positioning, messaging, and market gaps, with a summary brief.",
    tags: [{ label: "Competitive analysis", bg: "#e9f7f1", color: "#17492b" }, { label: "Research", bg: "#f5f3ff", color: "#4c1d95" }],
    handle: "@competitors_are_dust",
    tab: "Optimize",
    tools: ["notion", "github", "slack"],
    capabilities: [
      { bold: "Map", rest: " competitor messaging and positioning at scale" },
      { bold: "Surface", rest: " content gaps and untapped angles" },
      { bold: "Summarise", rest: " findings into an actionable brief" },
    ],
    createdBy: "Slack",
  },
  {
    emoji: "🧪",
    title: "Set up an A/B experiment",
    description: "Define hypothesis, write variants, and configure your test without clunky back-and-forth.",
    tags: [{ label: "Testing", bg: "#e0f2fe", color: "#0369a1" }, { label: "Experimentation", bg: "#f5f3ff", color: "#4c1d95" }, { label: "CRO", bg: "#e9f7f1", color: "#17492b" }],
    isNew: true,
    handle: "@ab_test",
    tab: "Test & Experiment",
    tools: ["asana", "slack", "google"],
    capabilities: [
      { bold: "Define", rest: " a clear hypothesis and success metrics" },
      { bold: "Generate", rest: " copy and design variants automatically" },
      { bold: "Configure", rest: " test parameters and traffic splits" },
    ],
    createdBy: "Asana",
  },
  {
    emoji: "🗓️",
    title: "Build a content calendar",
    description: "Plan and schedule your content across channels with smart timing recommendations.",
    tags: [{ label: "Content strategy", bg: "#c6dbfa", color: "#0d46a0" }, { label: "Planning", bg: "#fffaea", color: "#7a2e0d" }],
    isNew: true,
    handle: "@content_calendar_agent",
    tab: "Brainstorm & Plan",
    tools: ["notion", "airtable"],
    capabilities: [
      { bold: "Plan", rest: " weekly content across all your channels" },
      { bold: "Recommend", rest: " optimal publish times per channel" },
      { bold: "Align", rest: " content themes to campaigns and goals" },
    ],
    createdBy: "Airtable",
  },
  {
    emoji: "⚡",
    title: "Generate ad variations",
    description: "Optimize my GEO using industry best standards in order to broaden company reach.",
    tags: [{ label: "Paid media", bg: "#c6dbfa", color: "#0d46a0" }, { label: "Testing", bg: "#e0f2fe", color: "#0369a1" }],
    handle: "@ad_variations_agent",
    tab: "Create",
    tools: ["figma", "google", "slack"],
    capabilities: [
      { bold: "Create", rest: " multiple ad copy variations from a single brief" },
      { bold: "Tailor", rest: " messaging for different platforms and formats" },
      { bold: "Score", rest: " variations by predicted performance" },
    ],
    createdBy: "Figma",
  },
  {
    emoji: "🔍",
    title: "Audit my SEO performance",
    description: "Deep review of competitor positioning, messaging, and market gaps, with a summary brief.",
    tags: [{ label: "Competitive analysis", bg: "#e9f7f1", color: "#17492b" }, { label: "Market review", bg: "#fffaea", color: "#7a2e0d" }, { label: "Keywords", bg: "#f5f3ff", color: "#4c1d95" }, { label: "Technical SEO", bg: "#e0f2fe", color: "#0369a1" }],
    handle: "@seo_genie",
    tab: "Optimize",
    tools: ["google", "notion"],
    capabilities: [
      { bold: "Crawl", rest: " your site for technical SEO issues" },
      { bold: "Benchmark", rest: " keyword rankings against competitors" },
      { bold: "Prioritise", rest: " fixes by estimated traffic impact" },
    ],
    createdBy: "Google",
  },
  {
    emoji: "📱",
    title: "Create social media strategy",
    description: "Time to take your social media game to the next level, use this agent to help you create a strategy.",
    tags: [{ label: "Strategy", bg: "#f5f3ff", color: "#4c1d95" }, { label: "Social media", bg: "#fdf4ff", color: "#701a75" }],
    handle: "@social_media_pro",
    tab: "Create",
    tools: ["figma", "airtable", "asana"],
    capabilities: [
      { bold: "Build", rest: " a channel-by-channel social strategy" },
      { bold: "Define", rest: " tone, cadence, and content pillars" },
      { bold: "Generate", rest: " a 30-day content starter pack" },
    ],
    createdBy: "Asana",
  },
  {
    emoji: "🚀",
    title: "Launch a campaign from brief",
    description: "Turn a creative brief into a fully configured campaign with copy, targeting, and scheduling.",
    tags: [{ label: "Automation", bg: "#fffaea", color: "#7a2e0d" }, { label: "Campaigns", bg: "#e9f7f1", color: "#17492b" }],
    handle: "@brief_to_campaign",
    tab: "Featured",
    tools: ["notion", "slack", "google"],
    capabilities: [
      { bold: "Parse", rest: " a creative brief and extract key requirements" },
      { bold: "Configure", rest: " campaign settings, targeting, and scheduling" },
      { bold: "Generate", rest: " copy and assets ready for launch" },
    ],
    createdBy: "Notion",
  },
  {
    emoji: "🎯",
    title: "Personalize audience segments",
    description: "Identify high-value audience clusters and generate tailored messaging for each segment.",
    tags: [{ label: "Personalization", bg: "#fdf4ff", color: "#701a75" }, { label: "Segmentation", bg: "#d9e7fc", color: "#09306d" }],
    handle: "@audience_agent",
    tab: "Featured",
    tools: ["airtable", "google", "figma"],
    capabilities: [
      { bold: "Cluster", rest: " your audience into high-value segments" },
      { bold: "Generate", rest: " tailored messaging for each segment" },
      { bold: "Predict", rest: " conversion likelihood per segment" },
    ],
    createdBy: "Airtable",
  },
];

const QUICK_ACTIONS = [
  {
    emoji: "💥",
    label: "Brainstorm",
    suggestions: [
      "Brainstorm campaign ideas for Q2 with @campaign_agent",
      "Generate content angles for our product launch",
      "Suggest A/B test variations for our homepage with @ab_test",
      "Identify new audience segments to target with @audience_agent",
      "Brainstorm ways to improve email open rates",
    ],
  },
  {
    emoji: "✏️",
    label: "Create",
    suggestions: [
      "Write an email campaign for our new feature with @email_gen_agent",
      "Draft a landing page for our spring sale",
      "Create social media posts for this week with @social_media_pro",
      "Generate ad copy variations for Google Ads with @ad_variations_agent",
      "Write a product description for our homepage",
    ],
  },
  {
    emoji: "♻️",
    label: "Repurpose",
    suggestions: [
      "Repurpose our blog post into social content with @social_media_pro",
      "Turn this webinar transcript into a blog post",
      "Convert our case study into an email campaign with @brief_to_campaign",
      "Adapt our video script for LinkedIn",
      "Reformat our whitepaper into a slide deck",
    ],
  },
  {
    emoji: "🧪",
    label: "Test",
    suggestions: [
      "Set up an A/B test for our hero headline with @ab_test",
      "Plan a multivariate test for our CTA button with @ab_test",
      "Design an experiment for our checkout flow",
      "Create a hypothesis for our email subject line",
      "Define success metrics for our homepage test",
    ],
  },
  {
    emoji: "🔍",
    label: "Optimize",
    suggestions: [
      "Optimize our homepage performance this month",
      "Review our email open and click rates with @email_gen_agent",
      "Identify drop-off points in our signup funnel with @audience_agent",
      "Summarize results from our last campaign with @campaign_agent",
      "Compare performance across audience segments",
    ],
  },
  {
    emoji: "🧠",
    label: "Learn",
    suggestions: [
      "Explain what CMAB is and how it works",
      "How do I set up a statistically valid A/B test?",
      "What is GEO optimization?",
      "How does multivariate testing differ from A/B?",
      "What metrics should I track for content performance?",
    ],
  },
];

function renderWithMentions(text: string) {
  const parts = text.split(/(@\w+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^@\w+$/.test(part) ? (
          <span key={i} style={{
            display: "inline-flex",
            alignItems: "center",
            background: "#F5F3FF",
            border: "1px solid #7c3aed",
            color: "#7c3aed",
            borderRadius: "9999px",
            padding: "2px 8px",
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "-0.1px",
            margin: "0 4px",
            verticalAlign: "middle",
            lineHeight: "20px",
            fontFamily: "Inter, sans-serif",
          }}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

type Agent = typeof AGENTS[number];

function AgentCard({ agent, onSelect }: { agent: Agent; onSelect: (a: Agent) => void }) {
  return (
    <Box
      bg="bg.default"
      border="1"
      borderColor="border.tertiary"
      rounded="lg"
      className="agent-card"
      style={{ padding: "20px", cursor: "pointer", transition: "box-shadow 0.15s ease", display: "flex", flexDirection: "column" }}
      onClick={() => onSelect(agent)}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--ax-shadows-lg)"; (e.currentTarget as HTMLElement).style.borderColor = "#C4B5FD"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = "var(--ax-colors-border-tertiary)"; }}
    >
      <Box display="flex" gap="16" mb="12" style={{ flex: 1 }}>
        <Box rounded="lg" style={{ width: "64px", height: "64px", minWidth: "64px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", background: "linear-gradient(135deg, #EDE9FE 0%, #EFF6FF 100%)" }}>
          <span className="agent-icon" style={{ display: "inline-block" }}>{agent.emoji}</span>
        </Box>
        <Box style={{ flex: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginBottom: "12px" }}>
            <Text fontWeight="600" color="fg.default" style={{ fontSize: "18px", letterSpacing: "-0.1px" }}>
              {agent.title}
            </Text>
            {agent.isNew && (
              <Box style={{
                background: "linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #7C3AED 100%)",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                padding: "4px 12px",
                borderRadius: "9999px",
                whiteSpace: "nowrap",
                flexShrink: 0,
                marginLeft: "8px",
              }}>
                New
              </Box>
            )}
          </Box>
          <Text fontSize="sm" color="fg.tertiary" lineClamp="2" mb="4">
            {agent.description}
          </Text>
        </Box>
      </Box>
      <Box display="flex" gap="6" mb="8" style={{ flexWrap: "nowrap", overflow: "hidden" }}>
        {agent.tags.slice(0, 3).map((tag) => (
          <Box key={tag.label} style={{ padding: "2px 8px", borderRadius: "6px", backgroundColor: tag.bg, fontSize: "12px", fontFamily: "Inter, sans-serif", color: tag.color, lineHeight: "16px" }}>
            {tag.label}
          </Box>
        ))}
        {agent.tags.length > 3 && (
          <Box style={{ padding: "2px 8px", borderRadius: "6px", backgroundColor: "var(--ax-colors-bg-secondary)", fontSize: "12px", fontFamily: "Inter, sans-serif", color: "var(--ax-colors-fg-tertiary)", lineHeight: "16px" }}>
            +{agent.tags.length - 3}
          </Box>
        )}
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" style={{ height: "32px" }}>
          <Text color="fg.tertiary" fontSize="sm">
            {agent.handle}
          </Text>
        </Box>
        <Box display="flex" alignItems="center" gap="4">
          {agent.tools.map((toolKey) => {
            const tool = TOOL_ICONS[toolKey];
            return (
              <Box key={toolKey} style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "transparent", border: "1px solid var(--ax-colors-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", color: tool.bg }}>
                {tool.bigIcon}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default function OpalPage() {
  const [inputValue, setInputValue] = useState("");
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);
  const [activePill, setActivePill] = useState<string | null>(null);
  const [focusedChipIndex, setFocusedChipIndex] = useState(-1);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState("Recommended for you");
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeAction = QUICK_ACTIONS.find((a) => a.label === activePill);

  // Reset focused suggestion index when dropdown opens
  useEffect(() => {
    if (activeAction) setFocusedSuggestionIndex(0);
  }, [activePill]);

  // Scroll focused suggestion into view
  useEffect(() => {
    suggestionRefs.current[focusedSuggestionIndex]?.scrollIntoView({ block: "nearest" });
  }, [focusedSuggestionIndex]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    setActivePill(null);
    // OpalInput auto-focuses when value changes from empty to non-empty
  }, []);

  // ↑/↓/Enter/Escape keyboard nav within suggestion dropdown
  useEffect(() => {
    if (!activeAction) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedSuggestionIndex((prev) => (prev + 1) % activeAction.suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedSuggestionIndex((prev) => (prev - 1 + activeAction.suggestions.length) % activeAction.suggestions.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSuggestionClick(activeAction.suggestions[focusedSuggestionIndex]);
      } else if (e.key === "Escape") {
        setActivePill(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeAction, focusedSuggestionIndex, handleSuggestionClick]);

  // ←/→ keyboard nav between chips (skip when typing in textarea/input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = focusedChipIndex < QUICK_ACTIONS.length - 1 ? focusedChipIndex + 1 : 0;
        setFocusedChipIndex(next);
        setActivePill(QUICK_ACTIONS[next].label);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = focusedChipIndex > 0 ? focusedChipIndex - 1 : QUICK_ACTIONS.length - 1;
        setFocusedChipIndex(prev);
        setActivePill(QUICK_ACTIONS[prev].label);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedChipIndex]);

  const handlePillClick = (label: string) => {
    const idx = QUICK_ACTIONS.findIndex((a) => a.label === label);
    setFocusedChipIndex(idx);
    setActivePill(activePill === label ? null : label);
  };

  return (
    <Box style={{ height: "100%", overflowY: "auto", overflowX: "hidden" }}>
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      style={{ paddingTop: "120px", paddingBottom: "32px", position: "relative", overflow: "hidden" }}
    >
      {/* Radial gradient glow behind input */}
      <Box
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1400px",
          height: "600px",
          background: "radial-gradient(ellipse 40% 40% at 50% 42%, rgba(167, 139, 250, 0.12) 0%, rgba(167, 139, 250, 0.07) 30%, rgba(167, 139, 250, 0.02) 55%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Heading */}
      <Heading
        level="2"
        style={{
          position: "relative",
          zIndex: 1,
          fontSize: "29px",
          fontWeight: 500,
          color: "var(--ax-colors-fg-default)",
          letterSpacing: "-0.6px",
          lineHeight: "40px",
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        What are we working on today?
      </Heading>

      {/* Input — main OpalInput with home variant */}
      <Box style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "800px", marginBottom: "20px" }}>
        <OpalInput
          value={inputValue}
          onChange={setInputValue}
          onSend={() => { /* standalone prototype — no chat backend wired */ }}
          disabled={false}
          variant="home"
        />
      </Box>

      {/* Quick action pills */}
      <Box
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "800px",
          marginBottom: activeAction ? "12px" : "0",
        }}
      >
        {QUICK_ACTIONS.map((action) => {
          const isActive = activePill === action.label;
          const isHovered = hoveredPill === action.label;
          return (
            <Box
              key={action.label}
              onClick={() => handlePillClick(action.label)}
              onMouseEnter={() => setHoveredPill(action.label)}
              onMouseLeave={() => setHoveredPill(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                background: isActive
                  ? "#F5F3FF"
                  : isHovered
                  ? "#F5F3FF"
                  : "var(--ax-colors-bg-default)",
                border: isActive || isHovered ? "1px solid #7c3aed" : "1px solid var(--ax-colors-border-default)",
                outline: focusedChipIndex === QUICK_ACTIONS.findIndex((a) => a.label === action.label) && !isActive ? "2px solid #c4b5fd" : "none",
                outlineOffset: "2px",
                borderRadius: "9999px",
                cursor: "pointer",
                fontSize: "14px",
                color: "var(--ax-colors-fg-default)",
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                letterSpacing: "-0.21px",
                whiteSpace: "nowrap",
                transition: "background 0.15s ease, border-color 0.15s ease",
              }}
            >
              <span>{action.emoji}</span>
              <Text
                style={{
                  fontSize: "14px",
                  color: "var(--ax-colors-fg-default)",
                  letterSpacing: "-0.21px",
                  lineHeight: "1.6",
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                {action.label}
              </Text>
            </Box>
          );
        })}
      </Box>

      {/* Suggestion dropdown card */}
      {activeAction && (

        <Box
          bg="bg.default"
          border="1"
          borderColor="border.tertiary"
          rounded="lg"
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "800px",
            overflow: "hidden",
            boxShadow: "var(--ax-shadows-sm)",
          }}
        >
          {/* Card header */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p="12"
          >
            <Box display="flex" alignItems="center" gap="8">
              <Text color="fg.tertiary" fontWeight="500" fontSize="md">
                {activeAction.label}
              </Text>
            </Box>
            <Button
              appearance="subtle"
              size="sm"
              icon={<IconX size={14} />}
              aria-label="Close"
              onClick={() => setActivePill(null)}
            />
          </Box>

          {/* Suggestion rows */}
          {activeAction.suggestions.map((suggestion, i) => (
            <Box
              key={i}
              ref={(el) => { suggestionRefs.current[i] = el as HTMLDivElement | null; }}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setFocusedSuggestionIndex(i)}
              px="16"
              py="12"
              borderB={i < activeAction.suggestions.length - 1 ? "1" : "0"}
              borderColor="border.tertiary"
              style={{
                cursor: "pointer",
                transition: "background 0.1s ease",
                background: i === focusedSuggestionIndex
                  ? "var(--ax-colors-bg-secondary)"
                  : "var(--ax-colors-bg-default)",
              }}
            >
              <Text color="fg.default" fontSize="md">
                {renderWithMentions(suggestion)}
              </Text>
            </Box>
          ))}
        </Box>
      )}

    </Box>{/* end top section */}

    {/* Scrollable agent library section */}
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      style={{ paddingTop: "48px", paddingBottom: "80px" }}
    >
      {/* Agent Library */}
      <Box
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "920px",
          paddingTop: "80px",
        }}
      >
        {/* Section header */}
        <Box mb="4">
          <Text fontSize="lg" fontWeight="600" color="fg.default" style={{ letterSpacing: "-0.2px" }}>
            Agent Library
          </Text>
          <Text fontSize="md" color="fg.tertiary" mt="4">
            Agents crafted with care to help you get your work done
          </Text>
        </Box>

        {/* Tabs / Search */}
        {searchActive ? (
          <Box>
            {/* Search bar */}
            <Box
              display="flex"
              alignItems="center"
              style={{
                marginTop: "16px",
                marginBottom: "20px",
                border: "1px solid var(--ax-colors-border-default)",
                borderRadius: "8px",
                padding: "6px 12px",
                gap: "8px",
                backgroundColor: "var(--ax-colors-bg-default)",
              }}
            >
              <IconSearch size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                autoFocus
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "14px",
                  fontFamily: "Inter, sans-serif",
                  color: "var(--ax-colors-fg-default)",
                }}
              />
              <Button
                appearance="subtle"
                size="sm"
                icon={<IconX size={14} />}
                aria-label="Close search"
                onClick={() => { setSearchActive(false); setSearchQuery(""); }}
              />
            </Box>
            {/* Results */}
            {(() => {
              const results = AGENTS.filter((a) =>
                a.title.toLowerCase().includes(searchQuery.toLowerCase())
              );
              return results.length === 0 ? (
                <Text fontSize="md" color="fg.tertiary">No agents found.</Text>
              ) : (
                <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  {results.map((agent) => (
                    <AgentCard key={agent.handle} agent={agent} onSelect={setSelectedAgent} />
                  ))}
                </Box>
              );
            })()}
          </Box>
        ) : (
          <Box>
            {/* Custom tab bar */}
            <Box
              display="flex"
              alignItems="center"
              gap="4"
              style={{
                marginTop: "16px",
                marginBottom: "20px",
                borderBottom: "1px solid var(--ax-colors-border-tertiary)",
                overflowX: "visible",
              }}
            >
              {LIBRARY_TABS.map((tab) => {
                const isSearch = tab === "Search";
                const isActive = !isSearch && activeTab === tab;
                return (
                  <Box
                    key={tab}
                    onClick={() => {
                      if (isSearch) {
                        setSearchActive(true);
                        setSearchQuery("");
                        setTimeout(() => searchInputRef.current?.focus(), 50);
                      } else {
                        setActiveTab(tab);
                      }
                    }}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontSize: "14px",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? "#0037FF" : "var(--ax-colors-fg-secondary)",
                      borderBottom: isActive ? "2px solid #0037FF" : "2px solid transparent",
                      marginBottom: "-1px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexShrink: 0,
                    }}
                  >
                    {isSearch ? <IconSearch size={14} /> : tab}
                  </Box>
                );
              })}
            </Box>

            {/* Tab content */}
            {(() => {
              const filtered = activeTab === "Recommended for you" ? AGENTS : AGENTS.filter((a) => a.tab === activeTab);
              return filtered.length === 0 ? (
                <Text fontSize="md" color="fg.tertiary">No agents yet.</Text>
              ) : (
                <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "32px" }}>
                  {filtered.map((agent) => (
                    <AgentCard key={agent.handle} agent={agent} onSelect={setSelectedAgent} />
                  ))}
                </Box>
              );
            })()}
          </Box>
        )}
      </Box>
    </Box>{/* end scrollable section */}

    {/* Agent detail modal */}
      {selectedAgent && (
      <Dialog open={true} onOpenChange={(open) => !open && setSelectedAgent(null)}>
        <DialogContent size="md">
          <DialogBody style={{ padding: "0" }}>
            <Box>
                {/* Modal header */}
                <Box
                  display="flex"
                  alignItems="start"
                  justifyContent="space-between"
                  style={{ padding: "24px 24px 20px" }}
                >
                  <Box display="flex" alignItems="start" gap="16">
                    <Box
                      bg="bg.secondary"
                      rounded="lg"
                      style={{
                        width: "64px",
                        height: "64px",
                        minWidth: "64px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "28px",
                      }}
                    >
                      {selectedAgent.emoji}
                    </Box>
                    <Box style={{ paddingTop: "4px", display: "flex", flexDirection: "column" }}>
                      <Text fontSize="lg" fontWeight="600" color="fg.default" style={{ letterSpacing: "-0.2px", marginBottom: "2px" }}>
                        {selectedAgent.title}
                      </Text>
                      <Text fontSize="sm" color="fg.tertiary" style={{ marginBottom: "8px" }}>
                        {selectedAgent.handle}
                      </Text>
                      <Text fontSize="md" color="fg.tertiary">
                        {selectedAgent.description}
                      </Text>
                    </Box>
                  </Box>
                  <Button
                    appearance="subtle"
                    size="sm"
                    icon={<IconX size={14} />}
                    aria-label="Close"
                    onClick={() => setSelectedAgent(null)}
                  />
                </Box>

                {/* Divider */}
                <Box style={{ height: "1px", backgroundColor: "var(--ax-colors-border-tertiary)", margin: "0 24px" }} />

                {/* Body */}
                <Box style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>

                  {/* Examples of what I can do */}
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="fg.tertiary" textTransform="uppercase" mb="12" style={{ letterSpacing: "0.4px" }}>
                      Examples of what I can do
                    </Text>
                    <Box style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {selectedAgent.capabilities.map((cap, i) => (
                        <Box key={i} display="flex" alignItems="start" gap="8">
                          <Box style={{ width: "4px", height: "4px", minWidth: "4px", borderRadius: "50%", backgroundColor: "var(--ax-colors-fg-accent)", marginTop: "8px" }} />
                          <Text fontSize="md" color="fg.default">
                            <strong style={{ fontWeight: 600 }}>{cap.bold}</strong>{cap.rest}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Tags */}
                  <Box display="flex" gap="6" flexWrap="wrap">
                    {selectedAgent.tags.map((tag) => (
                      <Box
                        key={tag.label}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          backgroundColor: tag.bg,
                          fontSize: "12px",
                          fontFamily: "Inter, sans-serif",
                          color: tag.color,
                          lineHeight: "16px",
                        }}
                      >
                        {tag.label}
                      </Box>
                    ))}
                  </Box>

                  {/* Connectors */}
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="fg.tertiary" textTransform="uppercase" mb="12" style={{ letterSpacing: "0.4px" }}>
                      Connectors
                    </Text>
                    <Box display="flex" alignItems="center" gap="12" flexWrap="wrap">
                      {selectedAgent.tools.map((toolKey) => {
                        const tool = TOOL_ICONS[toolKey];
                        return (
                          <Box key={toolKey} display="flex" alignItems="center" gap="8">
                            <Box
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: "transparent",
                                border: "1px solid var(--ax-colors-border-tertiary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: tool.bg,
                              }}
                            >
                              {tool.bigIcon}
                            </Box>
                            <Text fontSize="sm" color="fg.default" fontWeight="500">
                              {tool.name}
                            </Text>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>

                </Box>
              </Box>
          </DialogBody>
          <DialogFooter style={{ justifyContent: "flex-end" }}>
            <Button
              appearance="primary"
              onClick={() => {
                setInputValue(selectedAgent.title);
                setSelectedAgent(null);
              }}
            >
              Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}

    </Box>
  );
}
