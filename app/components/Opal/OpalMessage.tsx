"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "../Text";
import { ChatMessage } from "@/app/hooks/useOpalState";
import Image from "next/image";
import { getAdaptiveBlockComponent } from "../ai/AdaptiveBlockRegistry";
import "../ai/blocks"; // Auto-register all blocks
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { opalTypography } from "@/app/styles/opalTypography";
import { IconCopy, IconPen, IconArrowsRotate, IconThumbsUp, IconThumbsDown } from "@/app/lib/axiom-icons";
import { useState, useEffect, useRef } from "react";
import { OpalLoaderV5 } from "@/app/opal/components/OpalLoaderV5";
import { OpalLoader } from "@/app/opal/components/OpalLoader";
import { OpalLoaderV2 } from "@/app/opal/components/OpalLoaderV2";
import { OpalLoaderV3 } from "@/app/opal/components/OpalLoaderV3";
import { OpalLoaderV4 } from "@/app/opal/components/OpalLoaderV4";
import { useLoaderDev } from "@/app/opal/components/useLoaderDev";
import type { LoaderSequenceOption } from "@/app/opal/components/useLoaderDev";

type OpalMessageProps = {
  message: ChatMessage;
  onEdit?: (id: string, newContent: string) => void;
  onRegenerate?: (id: string) => void;
  onVersionChange?: (id: string, versionIndex: number, content: string) => void;
  agentContext?: { emoji: string; name: string } | null;
  showOpalHeader?: boolean;
};

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
      borderRadius: '6px',
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

// ──────────────────────────────────────────────────────────────────────────────

export function OpalMessage({ message, onEdit, onRegenerate, onVersionChange, agentContext, showOpalHeader }: OpalMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const isSavingRef = useRef(false);
  const { enabled: devMode, sequence } = useLoaderDev();

  const isUser = message.role === 'user';
  const isLoading = message.isLoading;

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
          <span style={{ fontSize: 15, lineHeight: 1 }}>{agentContext.emoji}</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#2e3442', fontFamily: 'Inter, sans-serif' }}>{agentContext.name}</span>
        </div>
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
              backgroundColor: isUser ? '#e9edf5' : 'transparent',
              color: isUser ? '#080736' : 'var(--opal-text-body)',
              borderRadius: isEditing ? '12px' : '8px',
              padding: isEditing ? '8px' : (isUser ? '8px 16px' : '4px 8px'),
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
                devMode ? (
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

          {!isEditing && isUser && (
            <Box
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                marginTop: '10px',
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

        {/* Quick Actions Row */}
        {!isLoading && !isEditing && (
          <Box
            display="flex"
            gap="8"
            mt={isUser ? "4" : "0"}
            style={{
              marginLeft: isUser ? '0' : '8px',
              marginRight: isUser ? '32px' : '0',
              opacity: isUser ? (isHovered ? 1 : 0) : 1,
              transition: 'opacity 0.2s',
              marginTop: isUser ? '4px' : (message.messageType && message.metadata) ? '8px' : '-8px',
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

  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
