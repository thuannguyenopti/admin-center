"use client";

import { Box, Button, Textarea } from "@optiaxiom/react";
import { Text } from "../Text";
import { IconMicrophone } from "@tabler/icons-react";
import { KeyboardEvent } from "react";
import IconSend from "@/app/assets/opal/icon-send.svg";
import { opalTypography } from "@/app/styles/opalTypography";

type OpalInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  error?: string;
};

export function OpalInput({ value, onChange, onSend, disabled, error }: OpalInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="4"
      p="16"
      borderT="1"
      borderColor="border.secondary"
      style={{
        backgroundColor: 'var(--opal-bg-primary)',
      }}
    >
      {error && (
        <Text
          fontSize="xs"
          color="fg.error"
          style={{ margin: 0 }}
        >
          {error}
        </Text>
      )}
      <Box
        display="flex"
        flexDirection="row"
        alignItems="end"
        gap="8"
        p="12"
        border="1"
        style={{
          backgroundColor: 'var(--opal-bg-input)',
          borderColor: 'var(--opal-border-input)',
          borderRadius: '8px',
        }}
      >
        <Textarea
          placeholder="Ask Opal anything—like 'What is CMAB?' or 'How do I set up an A/B test?'"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={3}
          style={{
            flex: 1,
            border: 'none',
            padding: 0,
            resize: 'none',
            minHeight: '68px',
            overflowY: 'hidden',
            fontSize: '14px',
            fontWeight: 400,
            letterSpacing: '-0.21px',
            lineHeight: '22.4px',
            fontFamily: 'Inter, sans-serif',
            color: disabled ? 'var(--opal-text-placeholder)' : 'var(--opal-text-body)',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            outline: 'none',
          }}
        />
        <Box display="flex" alignItems="center" gap="4">
          <Button
            appearance="subtle"
            size="sm"
            icon={<IconMicrophone size={16} />}
            aria-label="Voice input"
            disabled={disabled}
          />
          <Button
            appearance="default"
            size="sm"
            aria-label="Send message"
            onClick={onSend}
            disabled={disabled || !value.trim()}
            className="opal-send-btn"
            style={{
              width: '24px',
              height: '24px',
              padding: 0,
              borderRadius: '6px',
              backgroundColor: disabled || !value.trim() ? 'var(--opal-button-disabled)' : 'var(--opal-send-btn-bg)',
              color: disabled || !value.trim() ? 'var(--opal-text-placeholder)' : 'var(--opal-send-btn-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            <IconSend style={{ width: '16px', height: '14px' }} />
          </Button>
        </Box>
      </Box>
      <Text
        style={{ 
          ...opalTypography.disclaimer,
          margin: 0,
          color: 'var(--opal-text-tertiary)',
        }}
      >
        Opal can make mistakes. Double-check its responses.
      </Text>
    </Box>
  );
}