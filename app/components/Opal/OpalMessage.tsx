"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "../Text";
import { ChatMessage } from "@/app/hooks/useOpalState";
import Image from "next/image";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { opalTypography } from "@/app/styles/opalTypography";

type OpalMessageProps = {
  message: ChatMessage;
};

const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <Box className="opal-markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 style={{ ...opalTypography.title, fontSize: '24px', margin: '24px 0 12px' }} {...props} />,
          h2: ({ node, ...props }) => <h2 style={{ ...opalTypography.title, fontSize: '20px', margin: '20px 0 10px' }} {...props} />,
          h3: ({ node, ...props }) => <h3 style={{ ...opalTypography.title, margin: '16px 0 8px' }} {...props} />,
          p: ({ node, ...props }) => <p style={{ ...opalTypography.body, margin: '0 0 16px' }} {...props} />,
          ul: ({ node, ...props }) => <ul style={{ margin: '0 0 16px', paddingLeft: '24px', listStyleType: 'disc' }} {...props} />,
          ol: ({ node, ...props }) => <ol style={{ margin: '0 0 16px', paddingLeft: '24px', listStyleType: 'decimal' }} {...props} />,
          li: ({ node, ...props }) => <li style={{ margin: '8px 0', ...opalTypography.body }} {...props} />,
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

export function OpalMessage({ message }: OpalMessageProps) {
  const isUser = message.role === 'user';
  const isLoading = message.isLoading;

  return (
    <Box
      display="flex"
      flexDirection="column"
      w="full"
      mb="16"
      gap="4"
      style={{
        alignItems: isUser ? "flex-end" : "flex-start",
      }}
    >
      {/* Name/Badge Area - Hidden for now until multiple agents are supported */}
      {/* {!isUser && (
        <Box display="flex" alignItems="center" gap="8" mb="4" ml="4">
          <Box
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--opal-accent-purple)', // Updated to purple
            }}
          />
          <Text
            style={{
              ...opalTypography.label,
              fontWeight: 600,
              color: 'var(--opal-text-body)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Opal
          </Text>
        </Box>
      )} */}

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
            borderRadius: '16px',
            padding: isUser ? '12px 16px' : '4px 8px',
            borderTopRightRadius: isUser ? '4px' : '16px',
            borderTopLeftRadius: isUser ? '16px' : '4px',
            position: 'relative',
          }}
        >
          {isLoading ? (
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
          )}
        </Box>

        {isUser && (
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

      {/* Timestamp */}
      <Text
        style={{
          ...opalTypography.disclaimer,
          color: 'fg.tertiary',
          margin: isUser ? '0 32px 0 0' : '0 0 0 32px',
        }}
      >
        {formatTimestamp(message.timestamp)}
      </Text>
    </Box>
  );
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return new Date(timestamp).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' });
}