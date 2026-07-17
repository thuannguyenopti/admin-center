"use client";

import { Box, Heading, Textarea, Dialog, DialogContent, DialogBody, SearchInput } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconMicrophone, IconFile, IconBrandFigma, IconX, IconSparkles } from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";

const AGENT_CATEGORIES = ["All", "New", "Plan", "Create", "Test", "Analyze", "Optimize"];

const AGENTS = [
  {
    emoji: "📅",
    title: "Write an email campaign",
    description: "Deep review of competitor positioning, messaging, and market gaps, with a summary brief.",
    tags: [
      { label: "Email strategy", bg: "#fdf4ff", color: "#701a75" },
      { label: "Automation", bg: "#fffaea", color: "#7a2e0d" },
      { label: "Copywriting", bg: "#d9e7fc", color: "#09306d" },
    ],
    handle: "@email_gen_agent",
    category: "Create",
  },
  {
    emoji: "🧪",
    title: "Set up an A/B experiment",
    description: "Define hypothesis, write variants, and configure your test without clunky back-and-forth.",
    tags: [
      { label: "Testing", bg: "#e9f7f1", color: "#17492b" },
      { label: "Experimentation", bg: "#f5f3ff", color: "#4c1d95" },
    ],
    handle: "@ab_test",
    category: "Test",
  },
  {
    emoji: "📊",
    title: "Craft a performance report",
    description: "Summarize campaign results and surface key insights from your analytics data.",
    tags: [
      { label: "Reporting", bg: "#e9f7f1", color: "#17492b" },
      { label: "Analytics", bg: "#d9e7fc", color: "#09306d" },
    ],
    handle: "@report_builder",
    category: "Analyze",
  },
  {
    emoji: "✏️",
    title: "Draft a blog post",
    description: "Generate a structured, on-brand blog post from a topic or brief in seconds.",
    tags: [
      { label: "Content", bg: "#fdf4ff", color: "#701a75" },
      { label: "Copywriting", bg: "#d9e7fc", color: "#09306d" },
    ],
    handle: "@blog_writer",
    category: "Create",
  },
  {
    emoji: "🚀",
    title: "Launch a new campaign",
    description: "Spin up a fully configured campaign from scratch with recommended settings and copy.",
    tags: [
      { label: "Campaigns", bg: "#e9f7f1", color: "#17492b" },
      { label: "Quick start", bg: "#f5f3ff", color: "#4c1d95" },
    ],
    handle: "@campaign_launcher",
    category: "New",
  },
  {
    emoji: "🗺️",
    title: "Plan a content calendar",
    description: "Build a multi-week content plan aligned to your goals, audience, and publish cadence.",
    tags: [
      { label: "Planning", bg: "#fffaea", color: "#7a2e0d" },
      { label: "Content strategy", bg: "#c6dbfa", color: "#0d46a0" },
    ],
    handle: "@content_planner",
    category: "Plan",
  },
  {
    emoji: "⚡",
    title: "Optimize landing page copy",
    description: "Identify weak headlines, CTAs, and messaging gaps — then rewrite them for conversion.",
    tags: [
      { label: "Conversion", bg: "#e9f7f1", color: "#17492b" },
      { label: "Copywriting", bg: "#d9e7fc", color: "#09306d" },
    ],
    handle: "@copy_optimizer",
    category: "Optimize",
  },
];

const QUICK_ACTIONS = [
  {
    emoji: "💥",
    label: "Brainstorm",
    suggestions: [
      "Brainstorm campaign ideas for Q2",
      "Generate content angles for our product launch",
      "Suggest A/B test variations for our homepage",
      "Identify new audience segments to target",
      "Brainstorm ways to improve email open rates",
    ],
  },
  {
    emoji: "✏️",
    label: "Create",
    suggestions: [
      "Write an email campaign for our new feature",
      "Draft a landing page for our spring sale",
      "Create social media posts for this week",
      "Generate ad copy variations for Google Ads",
      "Write a product description for our homepage",
    ],
  },
  {
    emoji: "♻️",
    label: "Repurpose",
    suggestions: [
      "Repurpose our blog post into social content",
      "Turn this webinar transcript into a blog post",
      "Convert our case study into an email campaign",
      "Adapt our video script for LinkedIn",
      "Reformat our whitepaper into a slide deck",
    ],
  },
  {
    emoji: "🧪",
    label: "Test",
    suggestions: [
      "Set up an A/B test for our hero headline",
      "Plan a multivariate test for our CTA button",
      "Design an experiment for our checkout flow",
      "Create a hypothesis for our email subject line",
      "Define success metrics for our homepage test",
    ],
  },
  {
    emoji: "🔍",
    label: "Analyze",
    suggestions: [
      "Analyze our homepage performance this month",
      "Review our email open and click rates",
      "Identify drop-off points in our signup funnel",
      "Summarize results from our last campaign",
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

export default function OpalPage() {
  const [inputValue, setInputValue] = useState("");
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);
  const [activePill, setActivePill] = useState<string | null>(null);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        window.innerHeight / 3
      )}px`;
    }
  }, [inputValue]);

  const handlePillClick = (label: string) => {
    setActivePill(activePill === label ? null : label);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setActivePill(null);
    textareaRef.current?.focus();
  };

  const activeAction = QUICK_ACTIONS.find((a) => a.label === activePill);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      style={{ paddingTop: "120px", paddingBottom: "80px", position: "relative", overflow: "hidden" }}
    >
      <style>{`
        @keyframes agents-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes agents-glow {
          0%, 100% { box-shadow: 0 2px 10px rgba(100, 60, 220, 0.3); }
          50% { box-shadow: 0 2px 20px rgba(100, 60, 220, 0.55); }
        }
        .agents-btn {
          animation: agents-glow 2.5s ease-in-out infinite;
          border-radius: 8px;
        }
        .agents-btn button {
          background-image: linear-gradient(138deg, rgb(57, 46, 207) 0%, rgb(119, 64, 236) 38%, rgba(165, 140, 240, 0.85) 50%, rgb(119, 64, 236) 62%, rgb(57, 46, 207) 100%) !important;
          background-size: 250% auto !important;
          animation: agents-shimmer 10s ease-in-out infinite !important;
          border: none !important;
          outline: none !important;
        }
      `}</style>

      {/* Floating Agents button */}
      <Box style={{ position: "fixed", top: "38px", right: "40px", zIndex: 50 }} className="agents-btn">
        <Button
          appearance="primary"
          size="lg"
          icon={<IconSparkles size={16} />}
          onClick={() => setAgentsOpen(true)}
          style={{
            backgroundImage: "linear-gradient(138deg, rgb(57, 46, 207) 16%, rgb(119, 64, 236) 85%)",
            border: "none",
            outline: "none",
          }}
        >
          Agents
        </Button>
      </Box>

      {/* Agents Modal */}
      <Dialog open={agentsOpen} onOpenChange={setAgentsOpen}>
        <DialogContent size="md">
          <DialogBody>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginBottom: "12px", marginTop: "16px" }}>
              <Box display="flex" alignItems="center" gap="8">
                <IconSparkles size={18} color="#2e3442" />
                <Text style={{ fontSize: "20px", fontWeight: 500, color: "#2e3442", letterSpacing: "-0.35px", lineHeight: "1" }}>
                  Agents
                </Text>
              </Box>
              <Button appearance="subtle" size="sm" icon={<IconX size={14} />} aria-label="Close" onClick={() => setAgentsOpen(false)} />
            </Box>

            {/* Search */}
            <SearchInput
              placeholder="Search agents"
              value={agentSearch}
              onChange={(e: any) => setAgentSearch(e.target.value)}
              size="lg"
            />

            {/* Category filters */}
            <Box display="flex" gap="8" flexWrap="wrap" style={{ marginTop: "8px", marginBottom: "4px" }}>
              {AGENT_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <Box
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "9999px",
                      border: `1px solid ${isActive ? "#7c3aed" : "#ddd6fe"}`,
                      backgroundImage: isActive ? "linear-gradient(141deg, rgb(57, 46, 207) 16%, rgb(119, 64, 236) 85%)" : undefined,
                      backgroundColor: isActive ? undefined : "white",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontFamily: "Inter, sans-serif",
                      color: isActive ? "#f9fafc" : "#2e3442",
                      letterSpacing: "-0.21px",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {cat}
                  </Box>
                );
              })}
            </Box>

            {/* Divider */}
            <Box style={{ height: "1px", background: "#e9edf5", opacity: 0.8, marginBottom: "0" }} />

            {/* Agent list */}
            <Box display="flex" flexDirection="column" style={{ maxHeight: "440px", overflowY: "auto", paddingRight: "8px" }}>
              {AGENTS
                .filter((a) => activeCategory === "All" || a.category === activeCategory)
                .filter((a) => !agentSearch || a.title.toLowerCase().includes(agentSearch.toLowerCase()))
                .map((agent, i, arr) => (
                  <Box key={agent.handle}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      gap="12"
                      onClick={() => {}}
                      onMouseEnter={() => setHoveredAgent(agent.handle)}
                      onMouseLeave={() => setHoveredAgent(null)}
                      style={{
                        padding: "16px 16px",
                        margin: "0 -16px",
                        borderRadius: "8px",
                        backgroundColor: hoveredAgent === agent.handle ? "#F5F6FA" : "transparent",
                        cursor: "pointer",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      {/* Icon + content */}
                      <Box display="flex" gap="16">
                        <Box
                          style={{
                            width: "80px",
                            height: "80px",
                            minWidth: "80px",
                            borderRadius: "8px",
                            backgroundImage: "radial-gradient(at 0% 0%, rgba(245,243,255,1) 5%, rgba(229,239,255,1) 61%, rgba(221,214,254,1) 85%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "32px",
                          }}
                        >
                          {agent.emoji}
                        </Box>
                        <Box display="flex" flexDirection="column" gap="6" style={{ flex: 1, paddingTop: "2px" }}>
                          <Text style={{ fontSize: "16px", fontWeight: 500, color: "#080736", letterSpacing: "-0.2px", lineHeight: "24px" }}>
                            {agent.title}
                          </Text>
                          <Text style={{ fontSize: "14px", color: "#66708c", lineHeight: "20px", letterSpacing: "-0.1px" }}>
                            {agent.description}
                          </Text>
                        </Box>
                      </Box>
                      {/* Tags */}
                      <Box display="flex" gap="6" flexWrap="wrap">
                        {agent.tags.map((tag) => (
                          <Box
                            key={tag.label}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              backgroundColor: tag.bg,
                              fontSize: "12px",
                              fontFamily: "Inter, sans-serif",
                              color: tag.color,
                              letterSpacing: "0.01px",
                              lineHeight: "16px",
                            }}
                          >
                            {tag.label}
                          </Box>
                        ))}
                      </Box>
                      {/* Handle */}
                      <Box display="flex" alignItems="center" gap="4">
                        <IconSparkles size={12} color="#4f576e" />
                        <Text style={{ fontSize: "12px", color: "#4f576e", letterSpacing: "0.01px", lineHeight: "16px" }}>
                          {agent.handle}
                        </Text>
                      </Box>
                    </Box>
                    {/* Divider between agents */}
                    {i < arr.length - 1 && (
                      <Box style={{ height: "1px", background: "#f0f2f7" }} />
                    )}
                  </Box>
                ))}
            </Box>
          </DialogBody>
        </DialogContent>
      </Dialog>

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
          color: "#2e3442",
          letterSpacing: "-0.6px",
          lineHeight: "40px",
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        What are we working on today?
      </Heading>

      {/* Input box */}
      <Box
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "720px",
          backgroundColor: "white",
          border: "1px solid #7c3aed",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "8px",
          marginBottom: "20px",
        }}
      >
        <Textarea
          ref={textareaRef}
          placeholder='Ask Opal anything—like "Plan a new campaign" or "Suggest an image for travel audience"'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={4}
          style={{
            border: "none",
            padding: "8px",
            resize: "none",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            color: "#2e3442",
            backgroundColor: "transparent",
            letterSpacing: "-0.21px",
            lineHeight: "1.6",
            outline: "none",
            boxShadow: "none",
            width: "100%",
          }}
        />

        {/* Bottom bar */}
        <Box
          display="flex"
          alignItems="end"
          justifyContent="space-between"
          style={{ padding: "0 4px 4px" }}
        >
          <Box display="flex" gap="4">
            <Button appearance="subtle" size="sm" icon={<IconFile size={16} />} aria-label="Attach file" />
            <Button appearance="subtle" size="sm" icon={<IconBrandFigma size={16} />} aria-label="Figma" />
          </Box>
          <Box
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              backgroundColor: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Send"
          >
            <IconMicrophone size={14} color="white" />
          </Box>
        </Box>
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
          maxWidth: "720px",
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
                  : "white",
                border: isActive || isHovered ? "1px solid #7c3aed" : "1px solid #CACFDC",
                borderRadius: "9999px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#262b37",
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
                  color: "#262b37",
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
            maxWidth: "720px",
            overflow: "hidden",
            boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.05)",
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
              onClick={() => handleSuggestionClick(suggestion)}
              px="16"
              py="12"
              borderB={i < activeAction.suggestions.length - 1 ? "1" : "0"}
              borderColor="border.tertiary"
              style={{ cursor: "pointer", transition: "background 0.1s ease" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--ax-colors-bg-secondary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--ax-colors-bg-default)";
              }}
            >
              <Text color="fg.default" fontSize="md">
                {suggestion}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
