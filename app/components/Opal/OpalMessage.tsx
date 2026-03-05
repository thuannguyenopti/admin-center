"use client";

import {Box} from "@optiaxiom/react";
import {Text} from "../Text";
import {ChatMessage} from "@/app/hooks/useOpalState";
import Image from "next/image";
import {PreflightProgressIndicator} from "../ai/PreflightProgressIndicator";
import {PreflightResultsTable} from "../ai/PreflightResultsTable";

type OpalMessageProps = {
  message: ChatMessage;
};

export function OpalMessage({ message }: OpalMessageProps) {
  const isUser = message.role === 'user';
  const isLoading = message.isLoading;

  return (
    <Box
      display="flex"
      flexDirection="column"
      w="full"
      mb="12"
      gap="8"
      style={{
        alignItems: isUser ? "flex-end" : "flex-start",
      }}
    >
      <Box
        display="flex"
        flexDirection="row"
        alignItems="start"
        gap="8"
        style={{
          maxWidth: '80%',
        }}
      >
        <Box
          p="12"
          style={{
            flex: 1,
            backgroundColor: isUser ? 'var(--opal-bg-user)' : 'var(--opal-bg-assistant)',
            color: isUser ? 'var(--opal-text-user)' : 'var(--opal-text-body)',
            borderRadius: '8px',
            borderTopRightRadius: isUser ? '4px' : undefined,
            borderTopLeftRadius: !isUser ? '4px' : undefined,
          }}
        >
          {isLoading ? (
            <Box display="flex" alignItems="center" gap="8">
              <Box
                className="opal-loading-spinner"
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid currentColor',
                  borderTopColor: 'currentColor',
                  opacity: 0.3,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <Text
                fontSize="sm"
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                Opal is thinking...
              </Text>
            </Box>
          ) : message.messageType === 'preflight-progress' && message.metadata?.checklist ? (
            <PreflightProgressIndicator checklist={message.metadata.checklist} />
          ) : message.messageType === 'preflight-results' && message.metadata?.auditResult ? (
            <>
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
              <PreflightResultsTable result={message.metadata.auditResult} messageId={message.id} />
            </>
          ) : (
            <Text
              fontSize="sm"
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {message.content}
            </Text>
          )}
        </Box>
        {isUser && (
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <Image
              src="/avatar-user.png"
              alt="User avatar"
              width={20}
              height={20}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
      </Box>
      <Text
        fontSize="xs"
        color="fg.tertiary"
        style={{ margin: 0 }}
      >
        {formatTimestamp(message.timestamp)}
      </Text>
    </Box>
  );
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  
  return new Date(timestamp).toLocaleDateString();
}