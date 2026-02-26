"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "../Text";
import { OpalMessage } from "./OpalMessage";
import { OpalSuggestions } from "./OpalSuggestions";
import { ChatMessage } from "@/app/hooks/useOpalState";
import { useEffect, useRef } from "react";
import { opalTypography } from "@/app/styles/opalTypography";
import { useOpalContext } from "@/app/context/OpalContext";

type OpalChatProps = {
  messages: ChatMessage[];
  onSuggestionClick: (suggestion: string) => void;
  hideSuggestions?: boolean;
  variant?: 'assistant' | 'home';
  onMessageEdit?: (id: string, newContent: string) => void;
  onRegenerate?: (id: string) => void;
};

export function OpalChat({ messages, onSuggestionClick, hideSuggestions, variant = 'assistant', onMessageEdit, onRegenerate }: OpalChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  let opalContext;
  try {
    opalContext = useOpalContext();
  } catch (e) {
    // Context might not be available in some cases
  }



  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="16"
      p={variant === 'assistant' ? "16" : "0"}
      style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        width: '100%',
      }}
    >
      {!hasMessages ? (
        !hideSuggestions && (
          <>
            <Text
              style={{
                ...opalTypography.body,
                margin: 0,
                color: 'var(--opal-text-body)',
              }}
            >
              Hi, I'm Opal, Optimizely's AI. I can help answer your questions about using Optimizely, analyze your website and suggest effective tests, plus do web research to boost conversions.
              <br /><br />
              What can I help you with?
            </Text>
            <OpalSuggestions onSuggestionClick={onSuggestionClick} />
          </>
        )
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          gap="16"
          w="full"
          style={{
            maxWidth: variant === 'home' ? '768px' : 'margin: 0',
            margin: variant === 'home' ? '0 auto' : '0',
            width: '100%',
          }}
        >
          {messages.map((message) => (
            <OpalMessage key={message.id} message={message} onEdit={onMessageEdit} onRegenerate={onRegenerate} />
          ))}
        </Box>
      )}
      <div ref={chatEndRef} />
    </Box>
  );
}
