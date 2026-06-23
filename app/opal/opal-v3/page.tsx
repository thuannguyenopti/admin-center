"use client";

import { Box, Dialog, DialogContent, DialogBody, DialogFooter } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconX, IconBrandGoogle, IconBrandSlack, IconBrandNotion, IconBrandAirtable, IconBrandGithub, IconBrandAsana, IconSearch, IconBrandFigma } from "@tabler/icons-react";
import { IconAgent } from "@optimizely/axiom-icons";
import React, { useState, useRef, useCallback } from "react";
import { OpalInput } from "@/app/components/Opal/OpalInput";
import { OpalChatView } from "@/app/components/Opal/OpalChatView";
import { useOpalContext } from "@/app/context/OpalContext";
import { OpalLanding } from "@/app/components/Opal/OpalLanding";
import { useAgentChatMode } from "@/app/hooks/useAgentChatMode";
import { FEATURED_AGENTS, AGENT_PROMPTS } from "@/app/opal/opalAgents";
import { useAtlassianConnectorSuggestion } from "@/app/hooks/useAtlassianConnectorSuggestion";

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
    emoji: "✍️",
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
    addMessage,
  } = opalContext.chatState;

  const {
    agentSession,
    setAgentSession,
    lastEndedSession,
    isResuming,
    triggerResumeHighlight,
    agentBarElement,
    sortedAgents,
    handleSelectAgent,
    handleSendMessage,
    handleSuggestionClick,
    showAgents,
    setShowAgents,
    showAllAgents,
    setShowAllAgents,
    collapsedSessionIds,
    handleExpandSession,
    opalDisclosureIds,
    opalClosedIds,
    collapsingOpalEndId,
    highlightedOpalEndId,
    handleOpenOpalRange,
    handleCloseOpalRange,
  } = useAgentChatMode({
    messages, inputValue, setInputValue, sendMessage, addMessage,
    onCollapseComplete: () => {
      (document.querySelector('textarea') as HTMLTextAreaElement | null)?.focus();
    },
    onResumeNoComplete: () => {
      inputContainerRef.current?.querySelector('textarea')?.focus();
    },
  });

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState("Recommended for you");
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { actionCard: atlassianActionCard, modalElement } = useAtlassianConnectorSuggestion(inputValue);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pageScrollRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Wraps every agent-selection path: scroll to top + focus the chat input
  const handleAgentActivated = useCallback((agent: Parameters<typeof handleSelectAgent>[0]) => {
    const isResume = lastEndedSession?.agent.id === agent.id;
    handleSelectAgent(agent);
    pageScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    // In resume state AgentBar focuses "Yes" — skip textarea focus to avoid fighting it
    if (!isResume) {
      setTimeout(() => {
        inputContainerRef.current?.querySelector("textarea")?.focus();
      }, 350);
    }
  }, [handleSelectAgent, lastEndedSession]);

  const hasMessages = messages.length > 0;

  // Once a conversation starts, show the full chat view
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
        {modalElement}
        <OpalChatView
          variant="home"
          messages={messages}
          inputValue={inputValue}
          isLoading={isLoading}
          error={error}
          setInputValue={setInputValue}
          onSend={handleSendMessage}
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
          agentBar={agentBarElement}
          collapsedSessionIds={collapsedSessionIds}
          onExpandSession={handleExpandSession}
          opalDisclosureIds={opalDisclosureIds}
          opalClosedIds={opalClosedIds}
          collapsingOpalEndId={collapsingOpalEndId}
          highlightedOpalEndId={highlightedOpalEndId}
          onOpenOpalRange={handleOpenOpalRange}
          onCloseOpalRange={handleCloseOpalRange}
          mentionableAgents={sortedAgents}
          onMentionSelect={handleSelectAgent}
          activeAgentCtx={agentSession?.state === 'in-chat' ? { emoji: agentSession.agent.emoji, name: agentSession.agent.name } : null}
          disabled={isResuming}
          onSubmitBlocked={triggerResumeHighlight}
          contextualActionCard={atlassianActionCard}
        />
      </Box>
    );
  }

  return (
    <Box ref={pageScrollRef} style={{ height: "100%", overflowY: "auto", overflowX: "hidden" }}>
      {modalElement}

      {/* Shared landing: heading + OpalInput + chips + dropdown */}
      <OpalLanding
        topSlot={
          <Box
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: "768px",
              marginBottom: "16px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <Button
              appearance="default-opal"
              size="md"
              onClick={() => { setShowAgents(!showAgents); setShowAllAgents(false); }}
              icon={<IconAgent />}
              style={{ borderRadius: "9999px" }}
            >
              View Agents
            </Button>
            {showAgents && (showAllAgents ? sortedAgents : sortedAgents.slice(0, 3)).map((agent) => (
              <Button
                key={agent.handle}
                appearance="default-opal"
                size="md"
                icon={<span style={{ fontSize: 14, lineHeight: 1 }}>{agent.emoji}</span>}
                style={{ borderRadius: "9999px" }}
                onClick={() => {
                  handleAgentActivated(agent);
                  // Skip prompt if this is the resume flow — handleResumeNo will set it
                  const isResume = lastEndedSession?.agent.id === agent.id;
                  if (!isResume) {
                    const prompt = AGENT_PROMPTS[agent.id];
                    if (prompt) setInputValue(prompt);
                  }
                  setShowAgents(false);
                  setShowAllAgents(false);
                }}
              >
                {agent.name}
              </Button>
            ))}
            {showAgents && !showAllAgents && FEATURED_AGENTS.length > 3 && (
              <Button
                appearance="default-opal"
                size="md"
                style={{ borderRadius: "9999px" }}
                onClick={() => setShowAllAgents(true)}
              >
                More agents
              </Button>
            )}
          </Box>
        }
        inputSlot={
          <div ref={inputContainerRef}>
            <OpalInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendMessage}
              disabled={isResuming}
              isLoading={isLoading}
              error={error}
              variant="home"
              agentBar={agentBarElement}
              mentionableAgents={sortedAgents}
              onMentionSelect={handleAgentActivated}
              onSubmitBlocked={triggerResumeHighlight}
            />
          </div>
        }
        onSuggestionClick={handleSuggestionClick}
        contextualActionCard={atlassianActionCard}
      />

    {/* Scrollable agent library section */}

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
                const featured = FEATURED_AGENTS.find((f) => f.handle === selectedAgent.handle) ?? {
                  id: selectedAgent.handle.replace(/^@/, ""),
                  name: selectedAgent.title,
                  handle: selectedAgent.handle,
                  subtitle: selectedAgent.description,
                };
                // Always use the emoji from the agent directory card so AgentBar matches
                handleAgentActivated({ ...featured, emoji: selectedAgent.emoji });
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
