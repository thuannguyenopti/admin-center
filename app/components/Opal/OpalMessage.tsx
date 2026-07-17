"use client";

import { Alert, Avatar, Box, Disclosure, DisclosureContent, DisclosureTrigger, Text as AxiomText } from "@optiaxiom/react";
import {
  IconPen,
  IconArrowsRotate,
  IconCopy,
  IconDownload,
  IconThumbsUp,
  IconThumbsDown,
  IconSparkles,
  IconFaceSmile,
  IconEllipsisStroke,
  IconReply,
  IconThumbtack,
  IconPaperPlaneTop,
  IconLink,
} from "@optimizely/axiom-icons";
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconFileText,
  IconTools,
} from "@/app/lib/axiom-icons";
import { Text } from "../Text";
import { ChatMessage } from "@/app/hooks/useOpalState";
import { ExperimentSummaryBlock } from "./ExperimentSummaryBlock";
import { ExperimentCreationAgentBlock } from "./ExperimentCreationAgentBlock";
import type { ExperimentCreationAgentPayload } from "./experimentCreationAgentTypes";
import type { ExperimentSummaryPayload } from "@/app/web-experimentation/optimizations/[id]/results/types";
import { Button } from "../Button";
import Image from "next/image";
import { getAdaptiveBlockComponent } from "../ai/AdaptiveBlockRegistry";
import "../ai/blocks"; // Auto-register all blocks
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { opalTypography } from "@/app/styles/opalTypography";
import React, { useState, useEffect, useRef, CSSProperties } from "react";
import { OpalLoaderV5 } from "@/app/opal/components/OpalLoaderV5";
import { OpalLoader } from "@/app/opal/components/OpalLoader";
import { OpalLoaderV2 } from "@/app/opal/components/OpalLoaderV2";
import { OpalLoaderV3 } from "@/app/opal/components/OpalLoaderV3";
import { OpalLoaderV4 } from "@/app/opal/components/OpalLoaderV4";
import { useLoaderDev } from "@/app/opal/components/useLoaderDev";
import type { LoaderSequenceOption } from "@/app/opal/components/useLoaderDev";
import { IMEditEditor } from "@/app/opal/im/components/IMEditEditor";

/** Borders / strokes — Opal greys (no product blue accent). */
const OPAL_STEP_BORDER = "var(--opal-border-secondary)";
const OPAL_STEP_DIVIDER = "var(--opal-border-secondary)";
/** Fixed Opal purple for processing UI (see --opal-processing-brand in opalStyles). */
const OPAL_ICON_BRAND = "var(--opal-processing-brand)";
const OPAL_WORKING_LABEL = "var(--opal-processing-brand)";
/** Sparkle chip — same family, slightly softer. */
const OPAL_CHIP_SPARKLE = "var(--opal-processing-brand-muted)";
/** Secondary iconography + chevrons. */
const OPAL_ICON_MUTED = "var(--opal-neutral-600)";

/** Placeholder body for the expanded active step (matches accordion detail treatment in design). */
const OPAL_ACTIVE_STEP_BODY =
  "Next, I'll continue processing this step in the background. Opal will pull signals from your experiment context, summarize results, and surface the next steps in the pipeline.";

type OpalProcessingStepState = "done" | "active" | "pending";

function OpalProcessingStepCard({
  stepLabel,
  state,
}: {
  stepLabel: string;
  state: OpalProcessingStepState;
}) {
  const isActive = state === "active";
  const isDone = state === "done";
  const pending = state === "pending";

  return (
    <Box
      display="flex"
      flexDirection="column"
      w="full"
      style={{
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: OPAL_STEP_BORDER,
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
    >
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap="10"
        px="12"
        py="12"
        style={{ minWidth: 0 }}
      >
        <Box display="flex" flexDirection="row" alignItems="center" gap="12" style={{ minWidth: 0, flex: 1 }}>
          <Box
            style={{
              width: 24,
              height: 24,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isDone ? (
              <Box
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  backgroundColor: OPAL_ICON_BRAND,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconCheck size={12} color="white" aria-hidden />
              </Box>
            ) : isActive ? (
              <Box
                className="opal-loading-spinner"
                role="status"
                aria-label="Loading"
                style={{
                  width: 20,
                  height: 20,
                  flexShrink: 0,
                  border: "2px solid rgba(124, 92, 255, 0.22)",
                  borderTopColor: "var(--opal-processing-brand)",
                  borderRadius: "50%",
                  animation: "spin 0.85s linear infinite",
                }}
              />
            ) : (
              <Box
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "var(--opal-border-secondary)",
                  opacity: 0.75,
                }}
              />
            )}
          </Box>
          <Text
            fontSize="sm"
            fontWeight="500"
            color={pending ? "fg.tertiary" : "fg.default"}
            style={{
              margin: 0,
              lineHeight: 1.4,
              opacity: pending ? 0.55 : 1,
              ...(isActive ? { color: OPAL_ICON_BRAND } : {}),
            }}
          >
            {stepLabel}
          </Text>
        </Box>
        <Box
          className="opal-processing-step-chevron"
          data-expanded={isActive ? "true" : "false"}
          alignItems="center"
          aria-hidden
        >
          <IconChevronRight size={18} color={OPAL_ICON_MUTED} />
        </Box>
      </Box>
      <Box
        className="opal-processing-step-expand"
        data-expanded={isActive ? "true" : "false"}
        w="full"
      >
        <Box className="opal-processing-step-expand__inner" w="full">
          <Box
            className="opal-processing-step-expand__content"
            px="12"
            pb="16"
            pt="0"
            display="flex"
            flexDirection="column"
            gap="12"
          >
            <Text fontSize="sm" color="fg.secondary" style={{ margin: 0, lineHeight: 1.65 }}>
              {OPAL_ACTIVE_STEP_BODY}
            </Text>
            <Box display="flex" flexWrap="wrap" gap="8" alignItems="center">
              {(
                [
                  {
                    label: "Stride Business Context",
                    icon: <IconFileText size={14} stroke={1.5} color={OPAL_ICON_MUTED} />,
                  },
                  {
                    label: "@experiment_summary",
                    icon: <IconSparkles size={14} color={OPAL_CHIP_SPARKLE} />,
                  },
                  {
                    label: "search_optimizely_docs",
                    icon: <IconTools size={14} stroke={1.5} color={OPAL_ICON_MUTED} />,
                  },
                ] as const
              ).map((chip) => (
                <Box
                  key={chip.label}
                  display="inline-flex"
                  alignItems="center"
                  gap="6"
                  px="10"
                  py="4"
                  rounded="md"
                  style={{
                    backgroundColor: "transparent",
                    border: `1px solid ${OPAL_STEP_BORDER}`,
                  }}
                >
                  <Box style={{ display: "flex", flexShrink: 0 }}>{chip.icon}</Box>
                  <AxiomText fontSize="xs" color="fg.secondary" style={{ margin: 0, lineHeight: 1.45 }}>
                    {chip.label}
                  </AxiomText>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

type OpalMessageProps = {
  message: ChatMessage;
  onSuggestionClick?: (suggestion: string) => void;
  onSubmitPrompt?: (message: string) => void;
  streamingMode?: "collapsed" | "expanded";
  isStreamingExpanded?: boolean;
  onStreamingExpandedChange?: (open: boolean) => void;
  isOpalLoading?: boolean;
  onEdit?: (id: string, newContent: string) => void;
  onRegenerate?: (id: string) => void;
  onVersionChange?: (id: string, versionIndex: number, content: string) => void;
  agentContext?: { emoji: string; name: string; avatar?: string; templateName?: string } | null;
  showOpalHeader?: boolean;
  /** Hides the quick-actions bar (used when a contextualActionCard below already provides consolidated actions) */
  hideActionBar?: boolean;
  /** IM mode: toggle an emoji reaction on this message */
  onReaction?: (messageId: string, emoji: string) => void;
  /** IM mode: quote/reply to this message */
  onQuote?: (messageId: string) => void;
};

// Agent header row with inline tooltip (avoids Radix portal positioning issues)
function AgentHeaderRow({ agentContext }: {
  agentContext: { emoji: string; name: string; avatar?: string; templateName?: string };
}) {
  const [hovered, setHovered] = useState(false);
  const hasTemplate = !!agentContext.templateName && agentContext.templateName !== agentContext.name;

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', marginBottom: 4, paddingLeft: 8 }}
      onMouseEnter={() => hasTemplate && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'default' }}>
        {agentContext.avatar ? (
          <span style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#d1fae5', flexShrink: 0 }}>
            <img src={agentContext.avatar} alt={agentContext.name} width={28} height={28} style={{ display: 'block', objectFit: 'cover' }} />
          </span>
        ) : (
          <span style={{ fontSize: 15, lineHeight: 1 }}>{agentContext.emoji}</span>
        )}
        <span style={{ fontSize: 12, fontWeight: 500, color: '#2e3442', fontFamily: 'Inter, sans-serif' }}>{agentContext.name}</span>
      </div>
      {hovered && hasTemplate && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          background: '#1f2937',
          color: 'white',
          fontSize: 12,
          lineHeight: 1.4,
          padding: '4px 8px',
          borderRadius: 6,
          whiteSpace: 'nowrap',
          zIndex: 50,
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}>
          {agentContext.templateName}
        </div>
      )}
    </div>
  );
}

// Helper component for action buttons
const ActionButton = ({ icon: Icon, onClick, tooltip }: { icon: any, onClick?: () => void, tooltip?: string }) => (
  <button
    onClick={onClick}
    title={tooltip}
    style={{
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      color: 'var(--opal-text-tertiary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      transition: 'color 0.2s, background-color 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = 'var(--opal-text-body)';
      e.currentTarget.style.backgroundColor = 'var(--opal-bg-sidebar)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = 'var(--opal-text-tertiary)';
      e.currentTarget.style.backgroundColor = 'transparent';
    }}
  >
    <Icon size={16} />
  </button>
);

const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <Box className="opal-markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 style={{ ...opalTypography.title, fontSize: '24px', margin: '24px 0 12px' }} {...props} />,
          h2: ({ node, ...props }) => <h2 style={{ ...opalTypography.title, fontSize: '20px', margin: '20px 0 10px' }} {...props} />,
          h3: ({ node, ...props }) => <h3 style={{ ...opalTypography.title, margin: '16px 0 8px' }} {...props} />,
          p: ({ node, ...props }) => <div style={{ ...opalTypography.body, margin: '0 0 16px' }} {...props} />,
          ul: ({ node, ...props }) => <ul style={{ margin: '0 0 16px', paddingLeft: '24px', listStyleType: 'disc' }} {...props} />,
          ol: ({ node, ...props }) => <ol style={{ margin: '0 0 16px', paddingLeft: '24px', listStyleType: 'decimal' }} {...props} />,
          li: ({ node, ...props }) => <li style={{ margin: '8px 0', ...opalTypography.body }} {...props} />,
          pre: ({ node, ...props }) => <>{props.children}</>, // Avoid double pre wrapping
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9em' }} {...props} />
            ) : (
              <pre style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '16px', borderRadius: '8px', overflowX: 'auto', margin: '16px 0', fontFamily: 'monospace', fontSize: '0.9em' }} {...props} />
            ),
          strong: ({ node, ...props }) => <strong style={{ fontWeight: 600 }} {...props} />,
          em: ({ node, ...props }) => <em style={{ fontStyle: 'italic' }} {...props} />,
          a: ({ node, href, ...props }) => {
            const isInternal = typeof href === 'string' && href.startsWith('/');
            return (
              <a
                href={href}
                style={{ color: 'var(--axiom-fg-accent, #7C3AED)', textDecoration: 'underline' }}
                {...(isInternal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                {...props}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

// ── Dev-mode loading sequence ─────────────────────────────────────────────────

const PURPLE = "#7C3AED";
const PHASE1_MS = 4000;      // how long to show the big V5 loader
const ACTIVITY_INTERVAL = 3500; // ms between each activity row appearing
const SHIMMER_PURPLE_1 = "#7C3AED";
const SHIMMER_PURPLE_2 = "#9D74F5";
const SHIMMER_PURPLE_3 = "#C2A8FA";

const ACTIVITY_LABELS = [
  "thinking",
  "Fetching user instructions",
  "Searching knowledge base",
  "Analyzing context",
  "Generating response",
] as const;

function getLoaderForSequence(sequence: LoaderSequenceOption, rowIndex: number) {
  if (sequence === "V4") return OpalLoaderV4;
  if (sequence === "V2_TO_V3") {
    return rowIndex === 0 ? OpalLoaderV2 : OpalLoaderV3;
  }
  return rowIndex === 0 ? OpalLoader : OpalLoaderV2;
}

function ShimmerText({ text }: { text: string }) {
  return (
    <span style={{
      backgroundImage: `linear-gradient(90deg,${SHIMMER_PURPLE_1} 0%,${SHIMMER_PURPLE_2} 30%,${SHIMMER_PURPLE_3} 50%,${SHIMMER_PURPLE_2} 70%,${SHIMMER_PURPLE_1} 100%)`,
      backgroundSize: "300% auto",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      color: "transparent",
      animation: "shimmer-text-msg 3s linear infinite",
      fontSize: "13px",
    }}>
      <style>{`@keyframes shimmer-text-msg{0%{background-position:200% center}100%{background-position:-100% center}}`}</style>
      {text}
    </span>
  );
}

function DevLoadingState({ sequence }: { sequence: LoaderSequenceOption }) {
  const [phase, setPhase] = useState<1 | 2>(1);
  const [activeActivityIndex, setActiveActivityIndex] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), PHASE1_MS);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase !== 2) return;
    setActiveActivityIndex(0);
    const timers = ACTIVITY_LABELS.map((_, idx) => {
      if (idx === 0) return null;
      return setTimeout(() => setActiveActivityIndex(idx), ACTIVITY_INTERVAL * idx);
    });
    return () => timers.forEach(t => t && clearTimeout(t));
  }, [phase]);

  if (phase === 1) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-start", padding: "12px 0 8px" }}>
        <OpalLoaderV5 size={20} color={PURPLE} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px 0" }}>
      <div
        key={activeActivityIndex}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          animation: "activity-in 0.3s ease forwards",
          opacity: 0,
        }}
      >
        <style>{`@keyframes activity-in{to{opacity:1;transform:translateY(0)}from{opacity:0;transform:translateY(4px)}}`}</style>
        {(() => {
          const Loader = getLoaderForSequence(sequence, activeActivityIndex);
          return <Loader size={16} color={PURPLE} />;
        })()}
        <ShimmerText text={ACTIVITY_LABELS[activeActivityIndex]} />
      </div>
    </div>
  );
}

// ── IM message row (Teams-style chat bubble with hover actions + reactions) ────

const IM_RECENT_KEY = 'im-recent-emojis';
const IM_EMOJI_DEFAULTS = ['👍', '❤️', '😂'];

function getRecentEmojis(): string[] {
  if (typeof window === 'undefined') return IM_EMOJI_DEFAULTS;
  try {
    const s = localStorage.getItem(IM_RECENT_KEY);
    return s ? JSON.parse(s) : IM_EMOJI_DEFAULTS;
  } catch { return IM_EMOJI_DEFAULTS; }
}

function addRecentEmoji(emoji: string): string[] {
  const next = [emoji, ...getRecentEmojis().filter((e) => e !== emoji)].slice(0, 3);
  try { localStorage.setItem(IM_RECENT_KEY, JSON.stringify(next)); } catch {}
  return next;
}

const imActionBtnStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  width: 30,
  height: 30,
  flexShrink: 0,
  color: 'var(--ax-colors-fg-tertiary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 6,
  lineHeight: 1,
  transition: 'background 0.12s',
};

function IMActionBtn({ icon: Icon, tooltip, onClick }: { icon: any, tooltip: string, onClick?: () => void }) {
  return (
    <button
      title={tooltip}
      onClick={onClick}
      style={imActionBtnStyle}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ax-colors-bg-tertiary)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <Icon size={16} />
    </button>
  );
}

function IMMessageRow({
  message,
  onReaction,
  onQuote,
  onEdit,
}: {
  message: ChatMessage;
  onReaction?: (messageId: string, emoji: string) => void;
  onQuote?: (messageId: string) => void;
  onEdit?: (id: string, newContent: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState<string[]>(IM_EMOJI_DEFAULTS);
  const [isEditing, setIsEditing] = useState(false);

  // Hydrate recent emojis from localStorage after mount
  useEffect(() => { setRecentEmojis(getRecentEmojis()); }, []);

  const authorName: string = message.metadata?.authorName ?? '';
  const authorAvatar: string | undefined = message.metadata?.authorAvatar;
  const authorStatus: 'online' | 'away' | 'offline' | undefined = message.metadata?.authorStatus;
  const time = formatChatTime(message.timestamp);
  const isUser = message.role === 'user';
  const isVAU: boolean = !!message.metadata?.isVAU;
  const reactions: Record<string, string[]> = message.metadata?.reactions ?? {};
  const currentUserId: string = message.metadata?.currentUserId ?? '';

  const initials = authorName
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const statusDot = (!isVAU && authorStatus) ? (
    <span style={{
      position: 'absolute', bottom: 0, right: 0,
      width: 10, height: 10, borderRadius: '50%',
      background: authorStatus === 'online' ? '#22c55e' : authorStatus === 'away' ? '#f59e0b' : '#9ca3af',
      border: '1px solid var(--ax-colors-bg-default)',
      boxSizing: 'border-box',
    }} />
  ) : null;

  const vauBadge = isVAU ? (
    <span style={{
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: '#7c5cff',
      border: '1px solid var(--ax-colors-bg-default)',
      boxSizing: 'border-box',
      pointerEvents: 'none',
    }} />
  ) : null;


  const avatarEl = (
    <span style={{ position: 'relative', width: 32, height: 32, flexShrink: 0, display: 'inline-flex' }}>
      {authorAvatar ? (
        <span style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', display: 'inline-flex' }}>
          <img src={authorAvatar} alt={authorName} width={32} height={32} style={{ display: 'block', objectFit: 'cover' }} />
        </span>
      ) : (
        <span style={{ width: 32, height: 32, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ax-colors-bg-tertiary)', color: 'var(--ax-colors-fg-secondary)', fontSize: 12, fontWeight: 600 }}>
          {initials}
        </span>
      )}
      {statusDot}
      {vauBadge}
    </span>
  );

  const bubbleBg = isVAU ? 'var(--ax-colors-bg-secondary)' : 'var(--ax-colors-bg-accent-subtle)';
  const showActions = isHovered || moreOpen || pickerOpen;

  const reactionEntries = Object.entries(reactions).filter(([, users]) => users.length > 0);

  const handleQuickEmoji = (emoji: string) => {
    onReaction?.(message.id, emoji);
    setRecentEmojis(addRecentEmoji(emoji));
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  // Action bar — absolutely positioned below the bubble, anchored to the outer message row
  const hoverBar = (showActions && !isEditing) ? (
    <div style={{
      position: 'absolute',
      bottom: 4,
      ...(isUser ? { right: 36 } : { left: 40 }),
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      background: 'var(--ax-colors-bg-default)',
      border: '1px solid var(--ax-colors-border-secondary)',
      borderRadius: 10,
      padding: '4px 6px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      zIndex: 10,
    }}>
      {recentEmojis.slice(0, 3).map((emoji) => (
        <button
          key={emoji}
          title={emoji}
          onClick={() => handleQuickEmoji(emoji)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, borderRadius: 6, fontSize: 14, lineHeight: 1, transition: 'background 0.12s', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ax-colors-bg-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {emoji}
        </button>
      ))}
      <div style={{ position: 'relative' }}>
        <IMActionBtn icon={IconFaceSmile} tooltip="Add reaction" onClick={() => { setPickerOpen((v) => !v); setMoreOpen(false); }} />
        {pickerOpen && (
          <>
            <div onClick={() => setPickerOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 19 }} />
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              background: 'var(--ax-colors-bg-default)',
              border: '1px solid var(--ax-colors-border-secondary)',
              borderRadius: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
              padding: '8px',
              zIndex: 20,
              width: 232,
            }}>
              {[
                { label: 'Frequently used', emojis: recentEmojis },
                { label: 'Reactions', emojis: ['👍','👎','❤️','😂','😮','😢','😡','🎉','🔥','👏','🙌','💯','✅','⭐','🚀'] },
                { label: 'Expressions', emojis: ['😊','😍','🤔','😅','😭','🥰','🤣','😎','🥳','🤩','😏','😴','🤗','😬','🙄'] },
                { label: 'Symbols', emojis: ['💡','📌','🎯','⚡','✨','💬','🔔','💥','🏆','🎊','💪','🙏','👋','🤝','❓'] },
              ].map(({ label, emojis }) => (
                <div key={label} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ax-colors-fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, paddingLeft: 2 }}>{label}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        title={emoji}
                        onClick={() => { handleQuickEmoji(emoji); setPickerOpen(false); }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '3px', borderRadius: 4, fontSize: 18, lineHeight: 1, transition: 'background 0.1s', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ax-colors-bg-secondary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {isUser
        ? <IMActionBtn icon={IconPen} tooltip="Edit message" onClick={() => setIsEditing(true)} />
        : <IMActionBtn icon={IconReply} tooltip="Reply with quote" onClick={() => onQuote?.(message.id)} />
      }
      <div style={{ position: 'relative' }}>
        <IMActionBtn icon={IconEllipsisStroke} tooltip="More actions" onClick={() => setMoreOpen((v) => !v)} />
        {moreOpen && (
          <>
            <div onClick={() => setMoreOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 19 }} />
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              background: 'var(--ax-colors-bg-default)',
              border: '1px solid var(--ax-colors-border-secondary)',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              padding: 4,
              zIndex: 20,
              minWidth: 160,
            }}>
              {[
                { icon: IconLink, label: 'Copy URL', action: () => { navigator.clipboard.writeText(window.location.href); setMoreOpen(false); } },
                { icon: IconThumbtack, label: 'Pin message', action: () => setMoreOpen(false) },
                { icon: IconPaperPlaneTop, label: 'Forward', action: () => setMoreOpen(false) },
              ].map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 4, fontSize: 13, color: 'var(--ax-colors-fg-default)', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ax-colors-bg-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon size={14} style={{ flexShrink: 0, color: 'var(--ax-colors-fg-secondary)' }} />
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  ) : null;

  const reactionPills = reactionEntries.length > 0 ? (
    <Box
      display="flex"
      gap="4"
      flexWrap="wrap"
      style={{
        marginTop: 6,
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        paddingLeft: isUser ? 0 : 40,
      }}
    >
      {reactionEntries.map(([emoji, users]) => {
        const isActive = currentUserId ? users.includes(currentUserId) : false;
        return (
          <button
            key={emoji}
            onClick={() => handleQuickEmoji(emoji)}
            style={{
              background: isActive ? 'var(--ax-colors-bg-accent-subtle)' : 'var(--ax-colors-bg-secondary)',
              border: `1px solid ${isActive ? 'var(--ax-colors-border-accent)' : 'var(--ax-colors-border-secondary)'}`,
              borderRadius: 10,
              padding: '1px 6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              lineHeight: 1.4,
            }}
          >
            <span style={{ fontSize: 12 }}>{emoji}</span>
            <span style={{ fontSize: 11, color: isActive ? 'var(--ax-colors-fg-accent)' : 'var(--ax-colors-fg-secondary)', fontWeight: isActive ? 600 : 400 }}>
              {users.length}
            </span>
          </button>
        );
      })}
    </Box>
  ) : null;

  if (isUser) {
    return (
      <div
        style={{ width: '100%', paddingBottom: isEditing ? 8 : 36, marginBottom: isEditing ? 0 : -20, position: 'relative', zIndex: moreOpen || pickerOpen || isEditing ? 100 : 1 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box display="flex" justifyContent="flex-end" style={{ paddingRight: 36, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--ax-colors-fg-tertiary)' }}>{time}</span>
        </Box>
        <Box display="flex" alignItems="start" gap="8" w="full">
          <Box display="flex" flexDirection="column" alignItems="end" style={{ flex: 1, minWidth: 0 }}>
            {isEditing ? (
              <IMEditEditor
                initialContent={message.content}
                onSave={(md) => { onEdit?.(message.id, md); setIsEditing(false); }}
                onCancel={handleEditCancel}
              />
            ) : (
              <div style={{
                maxWidth: '100%',
                marginRight: -2,
                padding: '8px 12px',
                borderRadius: 12,
                backgroundColor: bubbleBg,
                color: 'var(--opal-text-body)',
                fontSize: 14,
                lineHeight: '24px',
                wordBreak: 'break-word',
                boxSizing: 'border-box',
              }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            )}
          </Box>
          {avatarEl}
        </Box>
        {reactionPills}
        {hoverBar}
      </div>
    );
  }

  return (
    <div
      style={{ width: '100%', paddingBottom: 36, marginBottom: -20, position: 'relative', zIndex: moreOpen || pickerOpen ? 100 : 1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box display="flex" alignItems="center" gap="8" style={{ paddingLeft: 40, marginBottom: 4 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ax-colors-fg-default)' }}>{authorName}</span>
          {isVAU && <IconSparkles size={12} style={{ color: '#7c5cff', flexShrink: 0 }} />}
        </span>
        <span style={{ fontSize: 11, color: 'var(--ax-colors-fg-tertiary)' }}>{time}</span>
      </Box>
      <Box display="flex" alignItems="start" gap="8" w="full">
        {avatarEl}
        <Box display="flex" flexDirection="column" alignItems="start" style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            maxWidth: '100%',
            marginLeft: -2,
            padding: '8px 12px',
            borderRadius: 12,
            backgroundColor: bubbleBg,
            color: 'var(--opal-text-body)',
            fontSize: 14,
            lineHeight: '24px',
            wordBreak: 'break-word',
            boxSizing: 'border-box',
          }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        </Box>
      </Box>
      {reactionPills}
      {hoverBar}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

function isExperimentCreationPayload(
  message: ChatMessage,
): message is ChatMessage & { type: 'experiment_creation_agent'; payload: ExperimentCreationAgentPayload } {
  return (
    message.type === 'experiment_creation_agent' &&
    message.payload != null &&
    'intro' in message.payload
  );
}

export function OpalMessage({
  message,
  onSuggestionClick,
  onSubmitPrompt,
  streamingMode = "collapsed",
  isStreamingExpanded = true,
  onStreamingExpandedChange,
  isOpalLoading,
  onEdit,
  onRegenerate,
  onVersionChange,
  agentContext,
  showOpalHeader,
  hideActionBar,
  onReaction,
  onQuote,
}: OpalMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const isSavingRef = useRef(false);
  const { enabled: devMode, sequence } = useLoaderDev();
  const isUser = message.role === 'user';
  const isLoading = message.isLoading;
  const isExperimentSummary =
    message.type === 'experiment_summary' && message.payload != null;
  const isExperimentCreation = isExperimentCreationPayload(message);
  const isFullWidthSpecialBlock =
    isExperimentCreation || isExperimentSummary || Boolean(message.messageType && message.metadata);

  const bubbleMaxWidth = isExperimentSummary || isExperimentCreation ? '100%' : '80%';

  /** No outer chat “card” around Working… + step list — only nested step cards show borders. */
  const isProcessingStepsLoading =
    isLoading && (message.loadingSteps?.length ?? 0) > 0;

  // Sync editValue with message.content when message updates (but not while editing or saving)
  useEffect(() => {
    if (!isEditing && !isSavingRef.current) {
      setEditValue(message.content);
    }
  }, [message.content, isEditing]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    // Could add toast here
  };

  const currentStreamingLabel =
    message.loadingSteps?.[
      Math.min(message.loadingStepIndex ?? 0, Math.max((message.loadingSteps?.length ?? 1) - 1, 0))
    ] ?? "Working...";

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (!trimmedValue) {
      setIsEditing(false);
      return;
    }

    // Mark that we're saving to prevent useEffect from resetting editValue
    isSavingRef.current = true;
    setIsEditing(false);

    if (onEdit) {
      onEdit(message.id, trimmedValue);
    }

    // Reset the flag after a short delay to allow state updates to complete
    setTimeout(() => {
      isSavingRef.current = false;
    }, 100);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(message.content);
  };

  // Render agent conversation event markers
  if (message.role === 'event') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0', paddingLeft: 8, justifyContent: 'flex-start' }}>
        {message.eventType !== 'agent-end' && (
          <span style={{ fontSize: 14 }}>{message.agentEmoji}</span>
        )}
        <span style={{ fontSize: 12, color: '#4f576e', fontFamily: 'Inter, sans-serif' }}>{message.content}</span>
      </div>
    );
  }

  // Inline system alert — renders as an Axiom Alert in the message stream.
  // Used by the GEO Q&A flow to surface "Approved" inline (above any later
  // VAU messages), instead of pinning it to the bottom as a contextualActionCard.
  if (message.metadata?.systemAlert) {
    const intent = (message.metadata.systemAlertIntent ?? 'success') as 'success' | 'warning' | 'danger' | 'information';
    return (
      <div style={{ width: '100%', marginBottom: 16 }}>
        <Alert intent={intent}>{message.content}</Alert>
      </div>
    );
  }

  if (message.metadata?.imMode) {
    return (
      <>
        <IMMessageRow message={message} onReaction={onReaction} onQuote={onQuote} onEdit={onEdit} />
        {message.metadata?.artifactCard && (
          <div style={{ paddingLeft: 48, paddingBottom: 8, paddingRight: 16 }}>
            {message.metadata.artifactCard}
          </div>
        )}
      </>
    );
  }

  return (
    <div
      style={{ width: '100%', display: 'flex', flexDirection: 'column', marginBottom: '16px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      {/* Author label + avatar for named user messages (multi-user thread) */}
      {isUser && message.metadata?.authorName && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginBottom: 6, paddingRight: 4 }}>
          <span style={{ fontSize: 13, color: 'var(--ax-colors-fg-secondary)', fontFamily: 'Inter, sans-serif' }}>{message.metadata.authorName}</span>
          {message.metadata?.authorAvatar ? (
            <span style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', display: 'inline-flex', flexShrink: 0 }}>
              <img src={message.metadata.authorAvatar} alt={message.metadata.authorName} width={28} height={28} style={{ display: 'block', objectFit: 'cover' }} />
            </span>
          ) : (
            <Avatar name={message.metadata.authorName} size="xs" colorScheme="purple" style={{ width: 28, height: 28, fontSize: 11, background: '#ede9fe', color: '#7c3aed' } as React.CSSProperties} />
          )}
        </div>
      )}

      {/* Agent or Opal name header for assistant messages */}
      {!isUser && agentContext && (
        <AgentHeaderRow agentContext={agentContext} />
      )}
      {!isUser && showOpalHeader && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, paddingLeft: 8 }}>
          <img src="/opal.png" alt="Opal" width={16} height={16} style={{ borderRadius: 4 }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: '#2e3442', fontFamily: 'Inter, sans-serif' }}>Opal</span>
        </div>
      )}

      <Box
        display="flex"
        flexDirection="column"
        w="full"
        style={{
          alignItems: isUser ? "flex-end" : "flex-start",
        }}
      >
        {/* Experiment blocks are full-width, rendered outside the normal bubble */}
        {!isLoading && isExperimentCreation && message.payload ? (
          <ExperimentCreationAgentBlock
            payload={message.payload}
            onSubmitPrompt={onSubmitPrompt ?? (() => {})}
            disabled={isOpalLoading === true}
          />
        ) : !isLoading && isExperimentSummary && message.payload ? (
          <ExperimentSummaryBlock
            payload={message.payload as ExperimentSummaryPayload}
            onSuggestionClick={onSuggestionClick}
          />
        ) : (
        <Box
          display="flex"
          flexDirection="row"
          alignItems="start"
          gap="8"
          w="full"
          style={{
            justifyContent: isUser ? 'flex-end' : 'flex-start',
          }}
        >
          <Box
            style={{
              maxWidth: isUser ? '85%' : '100%',
              backgroundColor: isUser ? '#F3F4F6' : 'transparent',
              color: isUser ? 'var(--opal-text-user)' : 'var(--opal-text-body)',
              borderRadius: isEditing ? '12px' : (isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px'),
              padding: isEditing ? '8px' : (isUser ? '12px 16px' : '4px 8px'),
              position: 'relative',
              width: isEditing ? '100%' : 'auto',
            }}
          >
            {isEditing ? (
              <Box display="flex" flexDirection="column" gap="8" w="full">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px',
                    borderRadius: '12px',
                    border: '1px solid var(--opal-border-subtle, #e5e7eb)',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                    backgroundColor: 'white',
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                />
                <Box display="flex" gap="8" justifyContent="flex-end">
                  <button
                    onClick={handleCancel}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      background: '#E5E7EB',
                      color: '#374151',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      background: 'black',
                      color: 'white',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Update
                  </button>
                </Box>
              </Box>
            ) : (
              isLoading ? (
                isProcessingStepsLoading && streamingMode === "expanded" ? (
                  <Disclosure open={isStreamingExpanded} onOpenChange={onStreamingExpandedChange} w="full">
                    <DisclosureTrigger chevronPosition="end">
                      <Box
                        display="inline-flex"
                        alignItems="center"
                        gap="12"
                        style={{ width: "fit-content", maxWidth: "100%" }}
                      >
                        <OpalLoaderV5 size={16} color="#7C3AED" />
                        <Text
                          style={{
                            ...opalTypography.body,
                            color: 'fg.tertiary',
                            margin: 0,
                          }}
                        >
                          {currentStreamingLabel}
                        </Text>
                      </Box>
                    </DisclosureTrigger>
                    <DisclosureContent pt="12">
                      <Box display="flex" flexDirection="column" gap="8" w="full">
                        {(message.loadingSteps ?? []).map((stepLabel, index) => {
                          const stepIndex = message.loadingStepIndex ?? 0;
                          const state: OpalProcessingStepState =
                            index < stepIndex
                              ? "done"
                              : index === stepIndex
                                ? "active"
                                : "pending";

                          return (
                            <OpalProcessingStepCard
                              key={`${message.id}-${stepLabel}-${index}`}
                              stepLabel={stepLabel}
                              state={state}
                            />
                          );
                        })}
                      </Box>
                    </DisclosureContent>
                  </Disclosure>
                ) : devMode ? (
                  <DevLoadingState key={`${message.id}-${sequence}`} sequence={sequence} />
                ) : (
                  <Box display="flex" alignItems="center" gap="12" py="4">
                    <OpalLoaderV5 size={16} color="#7C3AED" />
                    <Text
                      style={{
                        ...opalTypography.body,
                        color: 'fg.tertiary',
                        margin: 0,
                      }}
                    >
                      Opal is thinking...
                    </Text>
                  </Box>
                )
              ) : (
                isUser ? (
                  <Text
                    style={{
                      ...opalTypography.body,
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {message.content}
                  </Text>
                ) : message.messageType && message.metadata ? (
                  (() => {
                    const BlockComponent = getAdaptiveBlockComponent(message.messageType);
                    if (BlockComponent) {
                      return (
                        <>
                          {message.content && (
                            <Text
                              fontSize="sm"
                              style={{
                                margin: 0,
                                marginBottom: '12px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }}
                            >
                              {message.content}
                            </Text>
                          )}
                          <BlockComponent
                            metadata={{ ...message.metadata, blockType: message.messageType }}
                            messageId={message.id}
                          />
                        </>
                      );
                    }
                    return <MarkdownContent content={message.content} />;
                  })()
                ) : (
                  <MarkdownContent content={message.content} />
                )
              )
            )}
          </Box>

          {!isEditing && isUser && !message.metadata?.authorName && (
            <Box
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                marginTop: '4px'
              }}
            >
              <Image
                src="/avatar-user.png"
                alt="User"
                width={24}
                height={24}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          )}
        </Box>
        )}

        {/* Quick Actions Row */}
        {!isLoading && !isEditing && !isExperimentCreation && !isExperimentSummary && !hideActionBar && (
          <Box
            display="flex"
            gap="8"
            mt={isUser ? "4" : "0"}
            style={{
              marginLeft: isUser ? '0' : '8px',
              marginRight: isUser ? '32px' : '0',
              opacity: isUser ? (isHovered ? 1 : 0) : 1,
              transition: 'opacity 0.2s',
              marginTop: isUser ? '4px' : isFullWidthSpecialBlock ? '16px' : '-8px',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {isUser ? (
              // User Actions: Edit, Copy
              <>
                <ActionButton icon={IconPen} tooltip="Edit" onClick={() => setIsEditing(true)} />
                <ActionButton icon={IconCopy} tooltip="Copy" onClick={handleCopy} />
              </>
            ) : (
              // Assistant Actions: left group + version nav far right
              <>
                {/* Left group */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      color: 'var(--opal-text-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      transition: 'color 0.2s, background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--opal-text-body)';
                      e.currentTarget.style.backgroundColor = 'var(--opal-bg-sidebar)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--opal-text-tertiary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <IconPen size={14} />
                    Edit in Canvas
                  </button>
                  <ActionButton icon={IconArrowsRotate} tooltip="Regenerate" onClick={() => onRegenerate?.(message.id)} />
                  <ActionButton icon={IconCopy} tooltip="Copy" onClick={handleCopy} />
                  <ActionButton icon={IconThumbsUp} tooltip="Helpful" onClick={() => console.log('Like clicked')} />
                  <ActionButton icon={IconThumbsDown} tooltip="Not helpful" onClick={() => console.log('Dislike clicked')} />
                </div>

                {/* Version navigator — far right, shown once there are multiple versions */}
                {message.versions && message.versions.length > 1 && (() => {
                  const total = message.versions.length;
                  const current = (message.currentVersionIndex ?? total - 1) + 1;
                  const canPrev = current > 1;
                  const canNext = current < total;
                  const navigate = (delta: number) => {
                    const nextIdx = (message.currentVersionIndex ?? total - 1) + delta;
                    const nextContent = message.versions![nextIdx];
                    onVersionChange?.(message.id, nextIdx, nextContent);
                  };
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <button onClick={() => navigate(-1)} disabled={!canPrev} style={{
                        background: 'transparent', border: 'none', cursor: canPrev ? 'pointer' : 'default',
                        padding: '4px', borderRadius: '4px', color: 'var(--opal-text-tertiary)',
                        opacity: canPrev ? 1 : 0.35, fontSize: '14px', lineHeight: 1,
                      }}>‹</button>
                      <span style={{ fontSize: '12px', color: 'var(--opal-text-tertiary)', userSelect: 'none', minWidth: '28px', textAlign: 'center' }}>
                        {current}/{total}
                      </span>
                      <button onClick={() => navigate(1)} disabled={!canNext} style={{
                        background: 'transparent', border: 'none', cursor: canNext ? 'pointer' : 'default',
                        padding: '4px', borderRadius: '4px', color: 'var(--opal-text-tertiary)',
                        opacity: canNext ? 1 : 0.35, fontSize: '14px', lineHeight: 1,
                      }}>›</button>
                    </div>
                  );
                })()}
              </>
            )}
          </Box>
        )}
      </Box>
    </div>
  );
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return new Date(timestamp).toLocaleDateString();
}

function formatChatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
