"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Text } from "@optiaxiom/react";
import { Pill } from "@optiaxiom/react/unstable";
import {
  IconFolder,
  IconSearch,
  IconPen,
  IconCheckCircleSolid,
  IconChevronDown,
  IconChevronRight,
  IconSparkles,
  IconGalleryThumbnails,
  IconUser,
  IconGlobe,
  IconArrowRightToLine,
  IconPause,
} from "@optiaxiom/icons";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SearchResult = { title: string; domain: string };

export type Skill = { label: string; personal?: boolean };

export type ActivityPhaseItem =
  | { type: "skills"; skills: Skill[] }
  | { type: "agent-run"; agentName: string }
  | { type: "search"; query: string; resultCount?: number; results?: SearchResult[] }
  | { type: "tool-search"; toolName: string }
  | { type: "image-generate"; prompt: string; imageUrl?: string; isLoading?: boolean }
  | { type: "tool-use"; icon: string; text: string }
  | { type: "canvas-edit"; label?: string };

/** One phase = one collapsible row. durationMs = how long before next phase starts. */
export type ActivityPhase = {
  summary: string;
  items: ActivityPhaseItem[];
  durationMs: number;
  /** "waiting" = standard automatic wait (no button); "paused" = needs user/system action (dark + Continue button) */
  waitStyle?: "waiting" | "paused";
  /** xs explainer shown below the Paused indicator */
  explainerText?: string;
  /** Optional card rendered below the Paused indicator; receives onContinue to advance the stream */
  actionCard?: (onContinue: () => void) => React.ReactNode;
};

// Legacy aliases so page.tsx / useOpalState stay unchanged
export type ActivityScriptEntry = ActivityPhase;

// ── Demo scripts ──────────────────────────────────────────────────────────────

const RESEARCH_RESULTS_1: SearchResult[] = [
  { title: "Intuit Introduces Ground-Breaking Virtual Team of AI Agents to Fuel…", domain: "investors.intuit.com" },
  { title: "Rebuilding Workflows for AI Agent Teammates - LinkedIn", domain: "linkedin.com" },
  { title: "Intuit introduces ground-breaking virtual team of AI agents - article", domain: "quickbooks.intuit.com" },
  { title: "Miro Agents Revolutionize Team Collaboration with AI Integration", domain: "linkedin.com" },
];

const RESEARCH_RESULTS_2: SearchResult[] = [
  { title: "What is marketing automation? - IBM", domain: "ibm.com" },
  { title: "What Is a Virtual Agent? | Salesforce EU", domain: "salesforce.com" },
  { title: "12 marketing automation tools every SMB needs - RingCentral", domain: "ringcentral.com" },
  { title: "CRM software: key things to know + 10 Best CRM for 2026", domain: "creatio.com" },
];

export const RESEARCH_ACTIVITY_SCRIPT: ActivityPhase[] = [
  {
    summary: "Picked up 4 skills",
    items: [{ type: "skills", skills: [
      { label: "CONTEXT ABOUT OPTIMIZELY" },
      { label: "SPECIALIZED AGENT BUILDER" },
      { label: "CANVAS STYLE", personal: true },
      { label: "OPTIMIZELY'S TONE AND VOICE" },
    ] }],
    durationMs: 3400,
  },
  {
    summary: "Ran agent: research",
    items: [{ type: "agent-run", agentName: "research" }],
    durationMs: 6800,
    waitStyle: "paused",
    explainerText: "Waiting for system execution",
  },
  {
    summary: "Searched the web",
    items: [
      { type: "search", query: "virtual teammates agents marketing AI", resultCount: 10, results: RESEARCH_RESULTS_1 },
      { type: "search", query: '"marketing automation" "virtual agents" team collaboration', resultCount: 10, results: RESEARCH_RESULTS_2 },
    ],
    durationMs: 4000,
  },
];

export const IMAGE_GEN_ACTIVITY_SCRIPT: ActivityPhase[] = [
  {
    summary: "Picked up 2 skills",
    items: [{ type: "skills", skills: [
      { label: "CANVAS STYLE", personal: true },
      { label: "OPTIMIZELY'S TONE AND VOICE" },
    ] }],
    durationMs: 3000,
  },
  {
    summary: "Searched tools",
    items: [{ type: "tool-search", toolName: "generate or edit image" }],
    durationMs: 2900,
  },
  {
    summary: "Generated image",
    items: [{ type: "image-generate", prompt: "A simple, cute illustration of a unicorn riding a dinosaur. Flat design, bright cheerful colors…", imageUrl: "/avatars/vau-frank.png" }],
    durationMs: 5200,
  },
];

export const ASK_QUESTIONS_ACTIVITY_SCRIPT: ActivityPhase[] = [
  {
    summary: "Picked up 2 skills",
    items: [{ type: "skills", skills: [
      { label: "CANVAS STYLE", personal: true },
      { label: "OPTIMIZELY'S TONE AND VOICE" },
    ] }],
    durationMs: 3000,
  },
  {
    summary: "Asking clarifying questions",
    items: [{ type: "tool-use", icon: "💬", text: "Gathering your input to personalise the response" }],
    durationMs: 1200,
    waitStyle: "paused",
    explainerText: "Waiting for your input",
  },
  {
    summary: "Generating response",
    items: [{ type: "agent-run", agentName: "content" }],
    durationMs: 3500,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const ICON_FG   = "var(--ax-colors-fg-secondary)";
const ICON_MUTED = "var(--ax-colors-fg-tertiary)";
const LINE_COLOR = "var(--ax-colors-border-secondary)";
const GREEN      = "var(--ax-colors-fg-success)";

function ImagePlaceholder() {
  return (
    <Box style={{ width: 152, height: 152, borderRadius: 10, background: "var(--ax-colors-bg-accent-subtle)", border: "1px solid color-mix(in srgb, var(--ax-colors-border-accent) 40%, transparent)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <IconGalleryThumbnails size={28} style={{ color: ICON_MUTED, opacity: 0.6 }} />
      <Box style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", width: 80, height: 4, borderRadius: 2, background: LINE_COLOR, overflow: "hidden" }}>
        <Box style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, var(--ax-colors-fg-tertiary), transparent)", backgroundSize: "200% 100%", animation: "img-shimmer 1.4s ease-in-out infinite" }} />
        <style>{`@keyframes img-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </Box>
    </Box>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <Box display="flex" alignItems="center" gap="12" style={{ padding: "12px 16px", borderBottom: `1px solid ${LINE_COLOR}` }}>
      <img src={`https://www.google.com/s2/favicons?domain=${result.domain}&sz=16`} alt="" width={16} height={16} style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0, display: "block" }} />
      <Text style={{ flex: 1, fontSize: 14, color: "var(--ax-colors-fg-default)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: "20px" }}>{result.title}</Text>
      <Text style={{ fontSize: 13, color: ICON_MUTED, flexShrink: 0, whiteSpace: "nowrap" }}>{result.domain}</Text>
    </Box>
  );
}

// ── Phase item renderer ───────────────────────────────────────────────────────

function PhaseItemRenderer({ item }: { item: ActivityPhaseItem }) {
  if (item.type === "skills") {
    return (
      <Box display="flex" flexDirection="column">
        <Box display="flex" alignItems="center" gap="12">
          <Box style={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "center" }}>
            <IconFolder size={18} style={{ color: ICON_FG }} />
          </Box>
          <Text style={{ fontSize: 13, color: "var(--ax-colors-fg-default)", lineHeight: "20px" }}>Picked up skills</Text>
        </Box>
        {/* border-left carries the line continuously through the pills area */}
        <Box
          display="flex"
          flexWrap="wrap"
          gap="8"
          style={{
            marginLeft: 9,
            paddingLeft: 23,
            paddingTop: 8,
            paddingBottom: 4,
            borderLeft: `1px solid ${LINE_COLOR}`,
          }}
        >
          {item.skills.map((s) => (
            <Pill key={s.label} readOnly size="sm">
              {s.personal ? (
                <Box asChild display="inline-flex" alignItems="center" gap="4">
                  <span>
                    <IconUser size={12} style={{ flexShrink: 0, opacity: 0.65 }} />
                    {s.label}
                  </span>
                </Box>
              ) : s.label}
            </Pill>
          ))}
        </Box>
      </Box>
    );
  }

  if (item.type === "agent-run") {
    return (
      <Box display="flex" alignItems="center" gap="12">
        <Box style={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "center" }}>
          <IconSparkles size={16} style={{ color: ICON_MUTED }} />
        </Box>
        <Text style={{ fontSize: 13, color: ICON_MUTED, lineHeight: "20px" }}>
          Ran agent: <span style={{ color: "var(--ax-colors-fg-secondary)" }}>{item.agentName}</span>
        </Text>
      </Box>
    );
  }

  if (item.type === "search") {
    return (
      <Box display="flex" flexDirection="column" gap="8">
        <Box display="flex" alignItems="center" gap="12">
          <Box style={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "center" }}>
            <IconSearch size={16} style={{ color: ICON_MUTED }} />
          </Box>
          <Box display="flex" gap="8" style={{ flex: 1, minWidth: 0, alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: "var(--ax-colors-fg-default)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: "20px" }}>{item.query}</Text>
            <Box style={{ flex: 1 }} />
            {item.resultCount != null && <Text style={{ fontSize: 12, color: ICON_MUTED, flexShrink: 0, whiteSpace: "nowrap" }}>{item.resultCount} results</Text>}
          </Box>
        </Box>
        {item.results && item.results.length > 0 && (
          <Box mt="8" style={{ marginLeft: 32, border: `1px solid ${LINE_COLOR}`, borderRadius: 10, overflow: "hidden" }}>
            {item.results.map((r, i) => <SearchResultCard key={i} result={r} />)}
          </Box>
        )}
      </Box>
    );
  }

  if (item.type === "tool-search") {
    return (
      <Box display="flex" alignItems="center" gap="12">
        <Box style={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "center" }}>
          <IconSearch size={16} style={{ color: ICON_MUTED }} />
        </Box>
        <Text style={{ fontSize: 13, color: ICON_MUTED, lineHeight: "20px" }}>
          Searched tools: <span style={{ color: "var(--ax-colors-fg-default)" }}>{item.toolName}</span>
        </Text>
      </Box>
    );
  }

  if (item.type === "image-generate") {
    return (
      <Box display="flex" flexDirection="column" gap="8">
        <Box display="flex" alignItems="center" gap="12">
          <Box style={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "center" }}>
            <IconGalleryThumbnails size={16} style={{ color: ICON_FG }} />
          </Box>
          <Text style={{ flex: 1, fontSize: 13, color: ICON_MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: "20px" }}>{item.prompt}</Text>
        </Box>
        <Box style={{ marginLeft: 32 }}>
          {item.imageUrl
            ? <img src={item.imageUrl} alt="Generated" style={{ width: 152, height: 152, objectFit: "cover", borderRadius: 10, display: "block" }} />
            : <ImagePlaceholder />
          }
        </Box>
      </Box>
    );
  }

  if (item.type === "canvas-edit") {
    return (
      <Box display="flex" alignItems="center" gap="12">
        <Box style={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "center" }}>
          <IconPen size={16} style={{ color: ICON_MUTED }} />
        </Box>
        <Text style={{ fontSize: 13, color: ICON_MUTED, lineHeight: "20px" }}>{item.label ?? "Edited canvas"}</Text>
      </Box>
    );
  }

  return null;
}

// ── Single phase row ──────────────────────────────────────────────────────────

function PhaseRow({ phase, isActive, isVisible, isDone, onSkip, isWaitingForUser }: { phase: ActivityPhase; isActive: boolean; isVisible: boolean; isDone: boolean; onSkip?: () => void; isWaitingForUser?: boolean }) {
  const isComplete = !isActive && isVisible;
  const [expanded, setExpanded] = useState(true);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    if (isComplete) {
      // Show "Done" briefly, then collapse
      setShowDone(true);
      const t = setTimeout(() => setExpanded(false), 900);
      return () => clearTimeout(t);
    } else {
      setShowDone(false);
      setExpanded(true);
    }
  }, [isComplete]);

  if (!isVisible) return null;

  return (
    <Box
      display="flex"
      flexDirection="column"
      style={{ animation: "activity-item-in 0.22s ease forwards", opacity: 0 }}
    >
      <style>{`@keyframes activity-item-in{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Summary row */}
      <Box
        display="flex"
        alignItems="center"
        gap="6"
        style={{ cursor: "pointer", userSelect: "none", padding: "2px 0" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Text fontSize="md" color={isActive ? "fg.secondary" : "fg.tertiary"}>
          {phase.summary}
        </Text>
        {expanded
          ? <IconChevronDown size={16} style={{ color: ICON_MUTED, flexShrink: 0 }} />
          : <IconChevronRight size={16} style={{ color: ICON_MUTED, flexShrink: 0 }} />
        }
      </Box>

      {/* Expanded detail — segment lines drawn BETWEEN icon rows, never through them */}
      {expanded && (
        <Box display="flex" flexDirection="column" style={{ paddingTop: 10, paddingBottom: 4 }}>
          {phase.items.map((item, i) => {
            const hasNext = i < phase.items.length - 1 || showDone || isActive;
            return (
              <React.Fragment key={i}>
                <PhaseItemRenderer item={item} />
                {hasNext && (
                  <Box style={{ width: 1, height: 8, background: LINE_COLOR, marginLeft: 9, flexShrink: 0 }} />
                )}
              </React.Fragment>
            );
          })}

          {/* Working / Waiting / Paused indicator */}
          {isActive && (
            <Box display="flex" flexDirection="column" gap="4" style={{ paddingTop: 2 }}>
              <style>{`@keyframes opal-wait-pulse{0%,100%{opacity:1}50%{opacity:0.35}} @keyframes opal-spin{to{transform:rotate(360deg)}}`}</style>
              <Box display="flex" alignItems="center" gap="12">
                <Box style={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "center" }}>
                  {!phase.waitStyle ? (
                    /* Default: spinner */
                    <Box style={{ width: 18, height: 18, borderRadius: "50%", border: `2.5px solid color-mix(in srgb, ${GREEN} 22%, transparent)`, borderTopColor: GREEN, animation: "opal-spin 0.9s linear infinite", flexShrink: 0 }} />
                  ) : (
                    /* waiting / paused: pulsing pause icon */
                    <IconPause
                      size={16}
                      style={{
                        color: phase.waitStyle === "paused" ? "var(--ax-colors-fg-default)" : GREEN,
                        animation: "opal-wait-pulse 1.6s ease-in-out infinite",
                      }}
                    />
                  )}
                </Box>
                <Text style={{
                  fontSize: 13,
                  color: phase.waitStyle === "paused" ? "var(--ax-colors-fg-default)" : GREEN,
                  lineHeight: "20px",
                }}>
                  {phase.waitStyle === "paused" ? "Paused" : phase.waitStyle === "waiting" ? "Waiting" : "Working…"}
                </Text>
                {phase.waitStyle === "paused" && onSkip && (
                  <Button
                    appearance="subtle"
                    size="sm"
                    icon={<IconArrowRightToLine size={14} />}
                    onClick={onSkip}
                  >
                    Continue
                  </Button>
                )}
              </Box>
              {phase.waitStyle === "paused" && phase.explainerText && (
                <Box style={{ paddingLeft: 32 }}>
                  <Text fontSize="sm" color="fg.tertiary">{phase.explainerText}</Text>
                </Box>
              )}
            </Box>
          )}

          {/* Action card — rendered when this phase is paused and waiting for user */}
          {isWaitingForUser && phase.actionCard && onSkip && (
            <Box style={{ paddingTop: 12, minWidth: 640 }}>
              {phase.actionCard(onSkip)}
            </Box>
          )}

          {/* Done checkmark */}
          {showDone && (
            <Box display="flex" alignItems="center" gap="12" style={{ paddingTop: 2 }}>
              <Box style={{ width: 20, flexShrink: 0, display: "flex", justifyContent: "center" }}>
                <IconCheckCircleSolid size={18} style={{ color: ICON_MUTED }} />
              </Box>
              <Text style={{ fontSize: 13, color: ICON_MUTED, lineHeight: "20px" }}>Done</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ActivityStreamBlock({
  script = RESEARCH_ACTIVITY_SCRIPT,
  onComplete,
}: {
  script?: ActivityPhase[];
  onComplete?: () => void;
}) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [waitingForUser, setWaitingForUser] = useState(false);

  // Advance to the next phase or complete
  const advance = useCallback(() => {
    setWaitingForUser(false);
    if (currentPhase < script.length - 1) {
      setCurrentPhase(p => p + 1);
    } else {
      setIsDone(true);
      setTimeout(() => onComplete?.(), 800);
    }
  }, [currentPhase, script.length, onComplete]);

  // Per-phase timer: fires after durationMs, then either auto-advances or pauses for user
  useEffect(() => {
    if (isDone || waitingForUser) return;
    let cancelled = false;
    const phase = script[currentPhase];
    if (!phase) return;

    const t = setTimeout(() => {
      if (cancelled) return;
      if (phase.waitStyle === "paused") {
        setWaitingForUser(true); // stay on this phase until user clicks Continue
      } else {
        // Auto-advance
        if (currentPhase < script.length - 1) {
          setCurrentPhase(p => p + 1);
        } else {
          setIsDone(true);
          setTimeout(() => { if (!cancelled) onComplete?.(); }, 800);
        }
      }
    }, phase.durationMs);

    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhase, isDone, waitingForUser]);

  return (
    <Box display="flex" flexDirection="column" gap="4">
      {script.map((phase, i) => (
        <PhaseRow
          key={i}
          phase={phase}
          isActive={i === currentPhase && !isDone}
          isVisible={i <= currentPhase}
          isDone={isDone && i === currentPhase}
          onSkip={advance}
          isWaitingForUser={i === currentPhase && waitingForUser}
        />
      ))}
    </Box>
  );
}
