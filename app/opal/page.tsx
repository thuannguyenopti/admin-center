"use client";

import { Box, Heading } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconX } from "@tabler/icons-react";
import { IconAgent } from "@optimizely/axiom-icons";
import { useState, useEffect, useRef } from "react";
import { useOpalContext } from "@/app/context/OpalContext";
import { OpalInput } from "@/app/components/Opal/OpalInput";
import { OpalChatView } from "@/app/components/Opal/OpalChatView";

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
    label: "Analyze",
    suggestions: [
      "Analyze our homepage performance this month",
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

const FEATURED_AGENTS = [
  { emoji: "✉️", name: "Email campaign writer", handle: "@email_gen_agent", prompt: "Write an email campaign for our new feature launch @email_gen_agent" },
  { emoji: "🧪", name: "A/B experiment setup", handle: "@ab_test", prompt: "Set up an A/B test for our hero headline @ab_test" },
  { emoji: "📊", name: "Competitor analysis", handle: "@competitors_are_dust", prompt: "Analyze my competitors' positioning and messaging @competitors_are_dust" },
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

export default function OpalPage() {
  const opalContext = useOpalContext();
  const {
    messages,
    inputValue,
    isLoading,
    error,
    setInputValue,
    sendMessage,
    regenerate,
    switchVersion,
  } = opalContext.chatState;

  const [hoveredPill, setHoveredPill] = useState<string | null>(null);
  const [activePill, setActivePill] = useState<string | null>(null);
  const [showAgents, setShowAgents] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(0);
  const [focusedChipIndex, setFocusedChipIndex] = useState<number>(-1);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const hasMessages = messages.length > 0;

  const activeAction = QUICK_ACTIONS.find((a) => a.label === activePill);

  // Reset focused index when dropdown opens
  useEffect(() => {
    if (activeAction) setFocusedSuggestionIndex(0);
  }, [activePill]);

  // Scroll focused item into view
  useEffect(() => {
    suggestionRefs.current[focusedSuggestionIndex]?.scrollIntoView({ block: 'nearest' });
  }, [focusedSuggestionIndex]);

  // Keyboard navigation for suggestion dropdown
  useEffect(() => {
    if (!activeAction) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedSuggestionIndex((prev) => (prev + 1) % activeAction.suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedSuggestionIndex((prev) => (prev - 1 + activeAction.suggestions.length) % activeAction.suggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSuggestionClick(activeAction.suggestions[focusedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setActivePill(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeAction, focusedSuggestionIndex]);

  // Left/Right arrow keys to navigate between chips (skip when typing in textarea)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = focusedChipIndex < QUICK_ACTIONS.length - 1 ? focusedChipIndex + 1 : 0;
        setFocusedChipIndex(next);
        setActivePill(QUICK_ACTIONS[next].label);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = focusedChipIndex > 0 ? focusedChipIndex - 1 : QUICK_ACTIONS.length - 1;
        setFocusedChipIndex(prev);
        setActivePill(QUICK_ACTIONS[prev].label);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedChipIndex]);

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setActivePill(null);
    // OpalInput auto-focuses when value changes from empty to non-empty
  };

  // Once a conversation starts, hand off to the full chat view
  if (hasMessages) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        h="full"
        w="full"
        style={{ backgroundColor: 'var(--opal-bg-page)', overflow: 'hidden', minHeight: 0 }}
      >
        <OpalChatView
          variant="home"
          messages={messages}
          inputValue={inputValue}
          isLoading={isLoading}
          error={error}
          setInputValue={setInputValue}
          onSend={sendMessage}
          onSuggestionClick={sendMessage}
          onToggleHistory={opalContext.history.toggleHistory}
          onNewChat={opalContext.history.createNewChat}
          isHistoryVisible={opalContext.history.isHistoryVisible}
          groupedHistory={opalContext.history.groupedHistory}
          activeChat={opalContext.history.activeChat}
          searchQuery={opalContext.history.searchQuery}
          onSearchChange={opalContext.history.setSearchQuery}
          onDeleteChat={opalContext.history.deleteChat}
          onSelectChat={opalContext.history.selectChat}
          onMessageEdit={() => {}}
          onRegenerate={regenerate}
          onMessageVersionChange={switchVersion}
        />
      </Box>
    );
  }

  // Landing state — Ana's design with main's OpalInput
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      style={{ paddingTop: "120px", paddingBottom: "80px", position: "relative", overflow: "auto", height: "100%" }}
    >
      {/* Radial gradient glow */}
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

      {/* View Agents button + agent pills */}
      <Box
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "800px",
          marginBottom: "16px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <Button
          appearance="default-opal"
          size="md"
          onClick={() => setShowAgents(!showAgents)}
          icon={<IconAgent />}
          style={{ borderRadius: "9999px" }}
        >
          View Agents
        </Button>

        {showAgents && FEATURED_AGENTS.map((agent) => (
          <Button
            key={agent.handle}
            appearance="default-opal"
            size="md"
            icon={<IconAgent />}
            style={{ borderRadius: "9999px" }}
            onClick={() => { setInputValue(agent.prompt); setShowAgents(false); }}
          >
            {agent.name}
          </Button>
        ))}

        {showAgents && (
          <Button
            appearance="default-opal"
            size="md"
            style={{ borderRadius: "9999px" }}
          >
            More agents
          </Button>
        )}
      </Box>

      {/* Main Input — main's OpalInput with home variant (taller default, all buttons + audio) */}
      <Box style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "800px", marginBottom: "20px" }}>
        <OpalInput
          value={inputValue}
          onChange={setInputValue}
          onSend={(content) => sendMessage(content ?? inputValue)}
          disabled={false}
          isLoading={isLoading}
          error={error}
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
              onClick={() => {
                const idx = QUICK_ACTIONS.findIndex((a) => a.label === action.label);
                setFocusedChipIndex(idx);
                setActivePill(isActive ? null : action.label);
              }}
              onMouseEnter={() => setHoveredPill(action.label)}
              onMouseLeave={() => setHoveredPill(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                background: isActive || isHovered ? "#F5F3FF" : "var(--ax-colors-bg-default)",
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

      {/* Suggestion dropdown */}
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
            marginTop: "12px",
          }}
        >
          {/* Card header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" p="12">
            <Text color="fg.tertiary" fontWeight="500" fontSize="md">
              {activeAction.label}
            </Text>
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
    </Box>
  );
}
