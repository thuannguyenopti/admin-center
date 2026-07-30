"use client";

<<<<<<< HEAD
import { Box, Disclosure, DisclosureContent, DisclosureTrigger, Text as AxiomText, Tooltip } from "@optiaxiom/react";
=======
import { Box, Disclosure, DisclosureContent, DisclosureTrigger, Link as AxiomLink, Text as AxiomText, Tooltip } from "@optiaxiom/react";
>>>>>>> origin/main
import { IconSparkles } from "@optimizely/axiom-icons";
import {
  IconPen,
  IconArrowsRotate,
  IconCopy,
  IconDownload,
  IconThumbsUp,
  IconThumbsDown,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconFileLines as IconFileText,
  IconScrewdriverWrench as IconTools,
  IconFaceSmile,
  IconQuoteRight,
  IconEllipsisStroke,
  IconShareNodes,
  IconThumbtack,
  IconLink,
<<<<<<< HEAD
=======
  IconBolt,
  IconSparkles as IconWand,
>>>>>>> origin/main
} from "@optiaxiom/icons";
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
import { useState, useEffect, useRef, type ReactNode } from "react";
import { OpalLoaderV5 } from "@/app/opal/components/OpalLoaderV5";
import { OpalLoader } from "@/app/opal/components/OpalLoader";
import { OpalLoaderV2 } from "@/app/opal/components/OpalLoaderV2";
import { OpalLoaderV3 } from "@/app/opal/components/OpalLoaderV3";
import { OpalLoaderV4 } from "@/app/opal/components/OpalLoaderV4";
import { useLoaderDev } from "@/app/opal/components/useLoaderDev";
import type { LoaderSequenceOption } from "@/app/opal/components/useLoaderDev";
<<<<<<< HEAD
=======
import { ActivityStreamBlock, type ActivityPhase } from "@/app/opal/im/components/ActivityStreamBlock";

/** Static collapsed view of all phases — used when the stream has already completed to prevent re-animation on remount */
function StaticActivitySummary({ script }: { script: ActivityPhase[] }) {
  return (
    <Box display="flex" flexDirection="column" gap="4">
      {script.map((phase, i) => (
        <Box key={i} display="flex" alignItems="center" gap="6" style={{ padding: "2px 0" }}>
          <AxiomText fontSize="md" color="fg.tertiary">{phase.summary}</AxiomText>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: "var(--ax-colors-fg-tertiary)" }}>
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Box>
      ))}
    </Box>
  );
}
import { CanvasOutputCard } from "@/app/opal/im/components/CanvasOutputCard";
>>>>>>> origin/main

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
                <IconCheck size={12} stroke="3" color="white" aria-hidden />
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
          <IconChevronRight size={18} stroke="2" color={OPAL_ICON_MUTED} />
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
                    icon: <IconFileText size={14} stroke="1.5" color={OPAL_ICON_MUTED} />,
                  },
                  {
                    label: "@experiment_summary",
                    icon: <IconSparkles size={14} color={OPAL_CHIP_SPARKLE} />,
                  },
                  {
                    label: "search_optimizely_docs",
                    icon: <IconTools size={14} stroke="1.5" color={OPAL_ICON_MUTED} />,
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
<<<<<<< HEAD
=======
  onActivityComplete?: (messageId: string) => void;
>>>>>>> origin/main
  onRegenerate?: (id: string) => void;
  onVersionChange?: (id: string, versionIndex: number, content: string) => void;
  agentContext?: { emoji: string; name: string; avatar?: string } | null;
  showOpalHeader?: boolean;
  /** Hides the quick-actions bar (used when a contextualActionCard below already provides consolidated actions) */
  hideActionBar?: boolean;
  /** When true, render the IM-flavored action bar (emoji picker + edit/copy) and reaction pills. */
  imMode?: boolean;
  /** Current user's id — used to determine reaction "is-mine" state in IM mode. */
  currentUserId?: string;
  /** Existing reactions: emoji → array of user ids. */
  reactions?: Record<string, string[]>;
  /** Called when the user toggles a reaction in IM mode. */
  onToggleReaction?: (messageId: string, emoji: string) => void;
  /** Called when the user clicks "Reply in thread" in IM mode. */
  onReplyInThread?: (messageId: string) => void;
  /** Called when the user clicks "Quote reply" in IM mode. */
  onQuoteReply?: (messageId: string) => void;
};

// Helper component for action buttons
<<<<<<< HEAD
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
=======
const ActionButton = ({ icon: Icon, onClick, tooltip }: { icon: any, onClick?: () => void, tooltip?: string }) => {
  const btn = (
    <button
      onClick={onClick}
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
  if (!tooltip) return btn;
  return <Tooltip content={tooltip} delayDuration={400}><span style={{ display: 'inline-flex' }}>{btn}</span></Tooltip>;
};
>>>>>>> origin/main

// IM mode quick-action bar: 3 MRU emoji shortcuts + full picker + (edit, own only) + copy.
// MRU is persisted in localStorage and updates whenever the user reacts.
const MRU_STORAGE_KEY = "opal-im-mru-emojis";
const DEFAULT_MRU: string[] = ["👍", "👀", "✅"];
const MAX_MRU = 3;
const MORE_EMOJIS = [
  "❤️", "😄", "🎉", "😢", "🤔", "🙌",
  "🔥", "👏", "🙏", "💯", "😍", "🚀",
  "👀", "✨", "💪", "😅", "😎", "🤯",
];

let mruCache: string[] | null = null;
const mruListeners = new Set<() => void>();

function loadMRU(): string[] {
  if (mruCache) return mruCache;
  if (typeof window === "undefined") return [...DEFAULT_MRU];
  try {
    const raw = window.localStorage.getItem(MRU_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
        const list = parsed.slice(0, MAX_MRU);
        for (const fallback of DEFAULT_MRU) {
          if (list.length >= MAX_MRU) break;
          if (!list.includes(fallback)) list.push(fallback);
        }
        mruCache = list;
        return mruCache;
      }
    }
  } catch {
    /* fall through to default */
  }
  mruCache = [...DEFAULT_MRU];
  return mruCache;
}

function pushMRU(emoji: string) {
  const current = loadMRU();
  const next = [emoji, ...current.filter((e) => e !== emoji)].slice(0, MAX_MRU);
  for (const fallback of DEFAULT_MRU) {
    if (next.length >= MAX_MRU) break;
    if (!next.includes(fallback)) next.push(fallback);
  }
  mruCache = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(MRU_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  }
  for (const l of mruListeners) l();
}

function useMRUEmojis(): string[] {
  const [, setTick] = useState(0);
  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    mruListeners.add(listener);
    return () => {
      mruListeners.delete(listener);
    };
  }, []);
  return loadMRU();
}

function EmojiShortcutButton({
  emoji,
  onClick,
}: {
  emoji: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`React with ${emoji}`}
      style={{
        width: 28,
        height: 28,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
        fontSize: 16,
        borderRadius: 6,
        lineHeight: 1,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {emoji}
    </button>
  );
}

function IMQuickActions({
  messageId,
  isOwn,
  onEdit,
  onCopy,
  onToggleReaction,
  onQuoteReply,
}: {
  messageId: string;
  isOwn: boolean;
  onEdit?: () => void;
  onCopy?: () => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onQuoteReply?: (messageId: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const mruEmojis = useMRUEmojis();
  const handleReact = (emoji: string) => {
    pushMRU(emoji);
    onToggleReaction?.(messageId, emoji);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px", position: "relative" }}>
      {mruEmojis.map((emoji) => (
        <EmojiShortcutButton
          key={emoji}
          emoji={emoji}
          onClick={() => handleReact(emoji)}
        />
      ))}
      <ActionButton
        icon={IconFaceSmile}
        tooltip="More reactions"
        onClick={() => setPickerOpen((v) => !v)}
      />
      {isOwn ? (
        onEdit && <ActionButton icon={IconPen} tooltip="Edit" onClick={onEdit} />
      ) : (
        onQuoteReply && (
          <ActionButton
            icon={IconQuoteRight}
            tooltip="Reply with quote"
            onClick={() => onQuoteReply(messageId)}
          />
        )
      )}
      <IMOverflowMenu
        isOwn={isOwn}
        onQuoteReply={onQuoteReply ? () => onQuoteReply(messageId) : undefined}
        onCopyLink={onCopy}
      />
      {pickerOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: isOwn ? "auto" : 0,
            right: isOwn ? 0 : "auto",
            marginTop: 4,
            background: "var(--ax-colors-bg-default)",
            border: "1px solid var(--ax-colors-border-secondary)",
            borderRadius: 8,
            padding: "4px 6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            display: "flex",
            gap: 4,
            zIndex: 10,
          }}
          onMouseLeave={() => setPickerOpen(false)}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 2,
            }}
          >
            {MORE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  handleReact(emoji);
                  setPickerOpen(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  fontSize: 18,
                  borderRadius: 4,
                  lineHeight: 1,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IMOverflowMenu({
  isOwn,
  onQuoteReply,
  onCopyLink,
}: {
  isOwn: boolean;
  onQuoteReply?: () => void;
  onCopyLink?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items: { label: string; icon: ReactNode; onClick: () => void }[] = [];
  if (isOwn && onQuoteReply) {
    items.push({ label: "Reply with quote", icon: <IconQuoteRight size={14} />, onClick: onQuoteReply });
  }
  items.push({ label: "Forward", icon: <IconShareNodes size={14} />, onClick: () => {} });
  items.push({ label: "Pin", icon: <IconThumbtack size={14} />, onClick: () => {} });
  if (onCopyLink) {
    items.push({ label: "Copy link", icon: <IconLink size={14} />, onClick: onCopyLink });
  }

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-flex" }}>
      <ActionButton
        icon={IconEllipsisStroke}
        tooltip="More"
        onClick={() => setOpen((v) => !v)}
      />
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 4,
            background: "var(--ax-colors-bg-default)",
            border: "1px solid var(--ax-colors-border-secondary)",
            borderRadius: 8,
            padding: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            minWidth: 180,
            zIndex: 20,
          }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "7px 10px",
                borderRadius: 6,
                fontSize: 13,
                color: "var(--ax-colors-fg-default)",
                textAlign: "left",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ display: "inline-flex", color: "var(--ax-colors-fg-secondary)" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReactionPills({
  messageId,
  reactions,
  currentUserId,
  alignRight,
  onToggleReaction,
}: {
  messageId: string;
  reactions: Record<string, string[]>;
  currentUserId?: string;
  alignRight: boolean;
  onToggleReaction?: (messageId: string, emoji: string) => void;
}) {
  const entries = Object.entries(reactions).filter(([, ids]) => ids.length > 0);
  if (entries.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        marginTop: 4,
        justifyContent: alignRight ? "flex-end" : "flex-start",
        marginRight: alignRight ? 32 : 0,
        marginLeft: alignRight ? 0 : 8,
      }}
    >
      {entries.map(([emoji, ids]) => {
        const mine = !!currentUserId && ids.includes(currentUserId);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onToggleReaction?.(messageId, emoji)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 999,
              background: mine
                ? "var(--ax-colors-bg-accent-subtle, var(--ax-colors-bg-secondary))"
                : "var(--ax-colors-bg-secondary)",
              border: mine
                ? "1px solid var(--ax-colors-border-accent, var(--ax-colors-border-default))"
                : "1px solid var(--ax-colors-border-secondary)",
              cursor: "pointer",
              fontSize: 12,
              lineHeight: 1.2,
            }}
          >
            <span>{emoji}</span>
            <span style={{ color: "var(--ax-colors-fg-tertiary)" }}>{ids.length}</span>
          </button>
        );
      })}
    </div>
  );
}

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
<<<<<<< HEAD
          a: ({ node, href, ...props }) => {
            const isInternal = typeof href === 'string' && href.startsWith('/');
            return (
              <a
                href={href}
                style={{ color: 'var(--ax-colors-fg-accent)', textDecoration: 'underline' }}
                {...(isInternal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                {...props}
              />
=======
          a: ({ node, href, children }) => {
            const isInternal = typeof href === 'string' && href.startsWith('/');
            return (
              <AxiomLink
                href={href ?? '#'}
                {...(!isInternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {children}
              </AxiomLink>
>>>>>>> origin/main
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

const PURPLE = "var(--ax-colors-fg-accent)";
const PHASE1_MS = 4000;      // how long to show the big V5 loader
const ACTIVITY_INTERVAL = 3500; // ms between each activity row appearing
const SHIMMER_PURPLE_1 = "var(--ax-colors-fg-accent)";
const SHIMMER_PURPLE_2 = "var(--ax-colors-bg-accent-light, #6A8FFC)";
const SHIMMER_PURPLE_3 = "var(--ax-colors-bg-accent-subtle, #B3C3FF)";

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
<<<<<<< HEAD
=======
  onActivityComplete,
>>>>>>> origin/main
  onRegenerate,
  onVersionChange,
  agentContext,
  showOpalHeader,
  hideActionBar,
  imMode,
  currentUserId,
  reactions,
  onToggleReaction,
  onReplyInThread,
  onQuoteReply,
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
        <span style={{ fontSize: 12, color: '#4f576e', fontFamily: 'var(--ax-fontFamily-sans, sans-serif)' }}>{message.content}</span>
      </div>
    );
  }

  // IM mode (Threads): Teams-style chat row. VAU messages have an avatar
  // top-left with name + time as a header, message text wrapping below
  // (no bubble bg). User messages are fully right-aligned with the time
  // above a subtle-green bubble, avatar to the right.
  // Triggered by the adapter setting metadata.imMode = true.
  if (message.metadata?.imMode) {
    const authorName: string = message.metadata.authorName ?? '';
    const authorAvatar: string | undefined = message.metadata.authorAvatar;
    const time = formatChatTime(message.timestamp);
    const initials = authorName
      .split(/\s+/)
      .map((w: string) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    const avatarEl = authorAvatar ? (
      <span style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', display: 'inline-flex', flexShrink: 0 }}>
        <img src={authorAvatar} alt={authorName} width={36} height={36} style={{ display: 'block', objectFit: 'cover' }} />
      </span>
    ) : (
      <span style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ax-colors-bg-tertiary)', color: 'var(--ax-colors-fg-secondary)', fontSize: 12, fontWeight: 600 }}>
        {initials}
      </span>
    );
    const isVAU: boolean = !!message.metadata?.isVAU;
    const presenceStatus: string | undefined = !isVAU ? message.metadata?.presenceStatus : undefined;
    const presenceDot = presenceStatus && presenceStatus !== 'offline' ? (
      <span style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: presenceStatus === 'online'
          ? 'var(--ax-colors-fg-success)'
          : 'var(--ax-colors-fg-warning)',
        border: '1.5px solid var(--ax-colors-bg-default)',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }} />
    ) : null;
<<<<<<< HEAD
    const avatarWithPresence = presenceDot ? (
      <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
        {avatarEl}
        {presenceDot}
=======
    const vauBadge = isVAU ? (
      <span style={{
        position: 'absolute',
        bottom: -1,
        right: -1,
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: 'var(--ax-colors-bg-accent)',
        border: '1.5px solid var(--ax-colors-bg-default)',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <IconBolt style={{ width: 9, height: 9, color: 'var(--ax-colors-fg-accent)', flexShrink: 0 }} />
      </span>
    ) : null;
    const avatarWithPresence = (presenceDot || vauBadge) ? (
      <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
        {avatarEl}
        {presenceDot}
        {vauBadge}
>>>>>>> origin/main
      </span>
    ) : avatarEl;
    // Humans → accent-subtle (pale lime in V3); VAUs → subtle gray.
    const bubbleBg = isVAU
      ? 'var(--ax-colors-bg-secondary)'
      : 'var(--ax-colors-bg-accent-subtle)';
    // Layout sums: avatar width (36) + outer gap (8) = 44 → meta-row inset.
    if (isUser) {
      return (
        <div
          style={{ width: '100%', marginBottom: 16 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Time row, right-aligned, inset on the right to clear avatar+gap */}
          <Box display="flex" justifyContent="flex-end" style={{ paddingRight: 44, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--ax-colors-fg-tertiary)' }}>{time}</span>
          </Box>
          {/* Bubble + avatar row — avatar top-aligns with the bubble */}
          <Box display="flex" alignItems="start" gap="8" w="full">
            <Box display="flex" justifyContent="flex-end" style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  maxWidth: '100%',
                  marginRight: -2,
                  padding: '12px 16px',
                  borderRadius: 12,
                  backgroundColor: bubbleBg,
                  color: 'var(--opal-text-body)',
                  fontSize: 14,
                  lineHeight: '20px',
                  wordBreak: 'break-word',
                  boxSizing: 'border-box',
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            </Box>
            {avatarWithPresence}
          </Box>
          {/* Action bar + reaction pills */}
          {reactions && Object.keys(reactions).length > 0 && (
            <ReactionPills
              messageId={message.id}
              reactions={reactions}
              currentUserId={currentUserId}
              alignRight
              onToggleReaction={onToggleReaction}
            />
          )}
          <div style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s', display: 'flex', justifyContent: 'flex-end', paddingRight: 44, marginTop: 2 }}>
            <IMQuickActions
              messageId={message.id}
              isOwn
              onEdit={() => setIsEditing(true)}
              onCopy={handleCopy}
              onToggleReaction={onToggleReaction}
              onQuoteReply={onQuoteReply}
            />
          </div>
        </div>
      );
    }
    return (
      <div
        style={{ width: '100%', marginBottom: 16 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Name + time row, inset to clear avatar+gap */}
        <Box display="flex" alignItems="center" gap="8" style={{ paddingLeft: 44, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ax-colors-fg-default)' }}>{authorName}</span>
<<<<<<< HEAD
=======
          {isVAU && <IconWand size={13} style={{ color: 'var(--ax-colors-fg-secondary)', flexShrink: 0 }} />}
>>>>>>> origin/main
          <span style={{ fontSize: 11, color: 'var(--ax-colors-fg-tertiary)' }}>{time}</span>
        </Box>
        {/* Avatar + bubble row — avatar top-aligns with the bubble */}
        <Box display="flex" alignItems="start" gap="8" w="full">
          {avatarWithPresence}
          <Box display="flex" style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                maxWidth: '100%',
                marginLeft: -2,
                padding: '8px 12px',
                borderRadius: 12,
                backgroundColor: bubbleBg,
                color: 'var(--opal-text-body)',
                fontSize: 14,
                lineHeight: '20px',
                wordBreak: 'break-word',
                boxSizing: 'border-box',
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          </Box>
        </Box>
        {/* Action bar + reaction pills */}
        {reactions && Object.keys(reactions).length > 0 && (
          <ReactionPills
            messageId={message.id}
            reactions={reactions}
            currentUserId={currentUserId}
            alignRight={false}
            onToggleReaction={onToggleReaction}
          />
        )}
        <div style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s', display: 'flex', justifyContent: 'flex-start', paddingLeft: 44, marginTop: 2 }}>
          <IMQuickActions
            messageId={message.id}
            isOwn={false}
            onCopy={handleCopy}
            onToggleReaction={onToggleReaction}
            onQuoteReply={onQuoteReply}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ width: '100%', display: 'flex', flexDirection: 'column', marginBottom: '16px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      {/* Agent or Opal name header for assistant messages */}
      {!isUser && agentContext && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, paddingLeft: 8 }}>
          {agentContext.avatar ? (
            <img src={agentContext.avatar} alt={agentContext.name} width={18} height={18} style={{ borderRadius: '50%', flexShrink: 0 }} />
          ) : (
            <span style={{ fontSize: 15, lineHeight: 1 }}>{agentContext.emoji}</span>
          )}
          <span style={{ fontSize: 12, fontWeight: 500, color: '#2e3442', fontFamily: 'var(--ax-fontFamily-sans, sans-serif)' }}>{agentContext.name}</span>
        </div>
      )}
      {!isUser && showOpalHeader && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, paddingLeft: 8 }}>
          <img src="/opal.png" alt="Opal" width={16} height={16} style={{ borderRadius: 4 }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: '#2e3442', fontFamily: 'var(--ax-fontFamily-sans, sans-serif)' }}>Opal</span>
        </div>
      )}
      {!isUser && !agentContext && !showOpalHeader && message.authorName && !message.authorInlineAvatar && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, paddingLeft: 8 }}>
          <AuthorAvatarHover name={message.authorName} title={message.authorTitle}>
            {message.authorAvatar ? (
              <img
                src={message.authorAvatar}
                alt={message.authorName}
                width={28}
                height={28}
                style={{ borderRadius: '50%', flexShrink: 0, objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--ax-colors-bg-avatar-purple)',
                  color: 'var(--ax-colors-fg-avatar-purple)',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  letterSpacing: '0.02em',
                  flexShrink: 0,
                }}
              >
                {message.authorName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            )}
          </AuthorAvatarHover>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 13, fontWeight: 400, color: '#2e3442', fontFamily: 'var(--ax-fontFamily-sans, sans-serif)' }}>
            <span>{message.authorName}</span>
            {message.timestamp && (
              <span style={{ fontSize: 11, color: 'var(--ax-colors-fg-tertiary)', fontWeight: 400 }}>
                {formatChatTime(message.timestamp)}
              </span>
            )}
          </span>
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
        {isUser && message.timestamp && imMode && (
          <span
            style={{
              fontSize: 11,
              color: 'var(--ax-colors-fg-tertiary)',
              fontFamily: 'var(--ax-fontFamily-sans, sans-serif)',
              marginBottom: 2,
              paddingRight: 4,
            }}
          >
            {formatChatTime(message.timestamp)}
          </span>
        )}
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
          {message.authorInlineAvatar && !isUser && message.authorAvatar && (
            <img
              src={message.authorAvatar}
              alt={message.authorName ?? ''}
              width={28}
              height={28}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
                marginTop: 4,
              }}
            />
          )}
          <Box
            style={{
              maxWidth: isUser ? '85%' : '100%',
              backgroundColor: isUser ? 'var(--ax-colors-bg-accent-subtle)' : 'transparent',
              color: isUser ? 'var(--opal-text-user)' : 'var(--opal-text-body)',
              borderRadius: isEditing ? '12px' : (isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px'),
              padding: isEditing ? '8px' : (isUser ? '12px 16px' : '4px 8px'),
              position: 'relative',
              width: isEditing ? '100%' : 'auto',
            }}
          >
            {message.authorInlineAvatar && !isUser && message.authorName && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 400,
                  color: '#2e3442',
                  fontFamily: 'var(--ax-fontFamily-sans, sans-serif)',
                  marginBottom: 2,
                }}
              >
                <span>{message.authorName}</span>
                {message.timestamp && (
                  <span style={{ fontSize: 11, color: 'var(--ax-colors-fg-tertiary)', fontWeight: 400 }}>
                    {formatChatTime(message.timestamp)}
                  </span>
                )}
              </span>
            )}
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
<<<<<<< HEAD
=======
              message.activityScript ? (
                <Box display="flex" flexDirection="column" gap="12" w="full">
                  {/* When stream is done, render a static summary to avoid re-animation on remount */}
                  {!isLoading && !message.isLoading && (message as any).showCanvasCard ? (
                    <StaticActivitySummary script={message.activityScript} />
                  ) : (
                    <ActivityStreamBlock key={`${message.id}-${message.timestamp}`} script={message.activityScript} onComplete={() => onActivityComplete?.(message.id)} />
                  )}
                  {!isLoading && message.content && (
                    <MarkdownContent content={message.content} />
                  )}
                  {!isLoading && (message as any).showCanvasCard && (
                    <Box mt="8" mb="8">
                      <CanvasOutputCard />
                    </Box>
                  )}
                </Box>
              ) : (
>>>>>>> origin/main
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
                        <OpalLoaderV5 size={16} color="var(--ax-colors-fg-accent)" />
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
                    <OpalLoaderV5 size={16} color="var(--ax-colors-fg-accent)" />
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
<<<<<<< HEAD
=======
              )
>>>>>>> origin/main
            )}
          </Box>

          {!isEditing && isUser && (
            <Box
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                marginTop: '4px',
                background: message.authorAvatar ? undefined : message.authorName ? 'var(--ax-colors-bg-avatar-purple)' : 'var(--ax-colors-bg-accent-strong, #1a2e1a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {message.authorAvatar ? (
                <img
                  src={message.authorAvatar}
                  alt={message.authorName ?? 'User'}
                  width={28}
                  height={28}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : message.authorName ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ax-colors-fg-avatar-purple)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em', lineHeight: 1 }}>
                  {message.authorName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </span>
              ) : (
                <Image
                  src="/avatar-user.png"
                  alt="User"
                  width={24}
                  height={24}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </Box>
          )}
        </Box>
        )}

        {/* IM reaction pills (above the action row) */}
        {imMode && reactions && (
          <ReactionPills
            messageId={message.id}
            reactions={reactions}
            currentUserId={currentUserId}
            alignRight={isUser}
            onToggleReaction={onToggleReaction}
          />
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
              opacity: imMode ? (isHovered ? 1 : 0) : isUser ? (isHovered ? 1 : 0) : 1,
              transition: 'opacity 0.2s',
              marginTop: isUser ? '4px' : isFullWidthSpecialBlock ? '16px' : '-8px',
              width: '100%',
              justifyContent: imMode && isUser ? 'flex-end' : 'space-between',
              alignItems: 'center',
            }}
          >
            {imMode ? (
              // IM Mode: emoji picker + (edit if own) + copy. No "Edit in Canvas" / regenerate / thumbs.
              <IMQuickActions
                messageId={message.id}
                isOwn={isUser}
                onEdit={isUser ? () => setIsEditing(true) : undefined}
                onCopy={handleCopy}
                onToggleReaction={onToggleReaction}
                onQuoteReply={onQuoteReply}
              />
            ) : isUser ? (
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

function AuthorAvatarHover({ name, title, children }: { name: string; title?: string; children: ReactNode }) {
  if (!title) return <>{children}</>;
  return (
    <Tooltip
      delayDuration={300}
      content={
        <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 2, lineHeight: 1.3 }}>
          <span style={{ fontWeight: 600 }}>{name}</span>
          <span style={{ opacity: 0.85 }}>{title}</span>
        </span>
      }
    >
      <span style={{ display: 'inline-flex', flexShrink: 0 }}>{children}</span>
    </Tooltip>
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
