"use client";

import { Box } from "@optiaxiom/react";
import { Text } from "../Text";
import { OpalMessage } from "./OpalMessage";
import { OpalSuggestions } from "./OpalSuggestions";
import { ChatMessage } from "@/app/hooks/useOpalState";
import { useEffect, useRef } from "react";
import { opalTypography } from "@/app/styles/opalTypography";

type OpalChatProps = {
  messages: ChatMessage[];
  onSuggestionClick: (suggestion: string) => void;
};

export function OpalChat({ messages, onSuggestionClick }: OpalChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="16"
      p="16"
      style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: '300px',
      }}
    >
      {!hasMessages ? (
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
      ) : (
        <Box display="flex" flexDirection="column" w="full">
          {messages.map((message) => (
            <OpalMessage key={message.id} message={message} />
          ))}
        </Box>
      )}
      <div ref={chatEndRef} />
    </Box>
  );
}
