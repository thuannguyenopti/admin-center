"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "../Text";
import { ChatMessage } from "@/app/hooks/useOpalState";
import Image from "next/image";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { opalTypography } from "@/app/styles/opalTypography";
import { IconCopy, IconPen, IconArrowsRotate, IconThumbsUp, IconThumbsDown } from "@optimizely/axiom-icons";
import { useState, useEffect, useRef } from "react";

type OpalMessageProps = {
  message: ChatMessage;
  onEdit?: (id: string, newContent: string) => void;
  onRegenerate?: (id: string) => void;
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
          a: ({ node, ...props }) => <a style={{ color: 'var(--axiom-fg-accent, #7C3AED)', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export function OpalMessage({ message, onEdit, onRegenerate }: OpalMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const isSavingRef = useRef(false);

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

  return (
    <div
      style={{ width: '100%', display: 'flex', flexDirection: 'column', marginBottom: '16px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
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
                <Box display="flex" alignItems="center" gap="12" py="4">
                  <Box
                    className="opal-loading-spinner"
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid currentColor',
                      borderTopColor: 'transparent',
                      opacity: 0.5,
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
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
              marginTop: isUser ? '4px' : '-8px', // Negative margin for Opal to pull up against markdown spacing
            }}
          >
            {isUser ? (
              // User Actions: Edit, Copy
              <>
                <ActionButton icon={IconPen} tooltip="Edit" onClick={() => setIsEditing(true)} />
                <ActionButton icon={IconCopy} tooltip="Copy" onClick={handleCopy} />
              </>
            ) : (
              // Assistant Actions: Regenerate, Copy, Like, Dislike
              <>
                <ActionButton icon={IconArrowsRotate} tooltip="Regenerate" onClick={() => onRegenerate?.(message.id)} />
                <ActionButton icon={IconCopy} tooltip="Copy" onClick={handleCopy} />
                <ActionButton icon={IconThumbsUp} tooltip="Helpful" onClick={() => console.log('Like clicked')} />
                <ActionButton icon={IconThumbsDown} tooltip="Not helpful" onClick={() => console.log('Dislike clicked')} />
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