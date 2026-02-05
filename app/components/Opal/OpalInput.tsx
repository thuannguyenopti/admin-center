"use client";

import { Box, Button, Textarea } from "@optiaxiom/react";
import { Text } from "../Text";
import { IconMicrophone } from "@tabler/icons-react";
import {
  IconAgent,
  IconFileArrowUp,
  IconArrowUp,
  IconCircleStop,
  IconXmark
} from "@optimizely/axiom-icons";
import { KeyboardEvent, useState, useRef, useEffect } from "react";
import { opalTypography } from "@/app/styles/opalTypography";

type Agent = {
  id: string;
  name: string;
  description: string;
  icon?: string;
};

const MOCK_AGENTS: Agent[] = [
  { id: '1', name: 'Industry Marketer', description: 'Create industry-specific variation' },
  { id: '2', name: 'Suggested test ideas', description: 'Get experiment ideas for web optimization' },
  { id: '3', name: 'Opal Assistant', description: 'General purpose AI assistant' },
];

type OpalInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  error?: string;
  isLoading?: boolean;
  variant?: 'assistant' | 'home';
};

export function OpalInput({
  value,
  onChange,
  onSend,
  disabled,
  error,
  isLoading,
  variant = 'assistant'
}: OpalInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [contextChip, setContextChip] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.startsWith('@') && !selectedAgent) {
      setShowAgentDropdown(true);
    } else {
      setShowAgentDropdown(false);
    }
  }, [value, selectedAgent]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (showAgentDropdown && MOCK_AGENTS.length > 0) {
        handleSelectAgent(MOCK_AGENTS[0]);
        e.preventDefault();
      } else {
        e.preventDefault();
        onSend();
      }
    }
  };

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgentDropdown(false);
    onChange(value.replace(/^@\w*/, ''));
  };

  const removeAgent = () => {
    setSelectedAgent(null);
  };

  const removeContext = () => {
    setContextChip(null);
  };

  const handleAddContext = () => {
    setContextChip('Mosey Bank / Mobile Handoff'); // Mock context
  };

  const hasValue = value.trim().length > 0 || selectedAgent !== null;

  // Determine border color based on state
  let borderColor = 'var(--opal-border-input)';
  if (isFocused || hasValue || isLoading) {
    borderColor = 'var(--opal-accent-purple)';
  }

  // CTA Icon state logic
  let ctaIcon = <IconMicrophone size={20} />;
  if (isLoading) {
    ctaIcon = <IconCircleStop size={20} />;
  } else if (hasValue) {
    ctaIcon = <IconArrowUp size={20} />;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="4"
      p={variant === 'assistant' ? "16" : "0"}
      borderT={variant === 'assistant' ? "1" : "0"}
      borderColor="border.secondary"
      style={{
        backgroundColor: variant === 'assistant' ? 'var(--opal-bg-primary)' : 'transparent',
        position: 'relative',
        width: '100%',
        maxWidth: variant === 'home' ? '768px' : 'none',
        margin: variant === 'home' ? '0 auto' : '0',
      }}
    >
      {/* Agent Dropdown */}
      {showAgentDropdown && (
        <Box
          ref={dropdownRef}
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '16px',
            right: '16px',
            backgroundColor: 'var(--opal-bg-input)',
            border: '1px solid var(--opal-border-primary)',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 100,
            marginBottom: '8px',
            maxHeight: '240px',
            overflowY: 'auto',
          }}
        >
          <Box p="8" borderB="1" borderColor="border.secondary" bg="bg.secondary">
            <Text fontSize="xs" fontWeight="600" color="fg.tertiary">Recently used agents</Text>
          </Box>
          {MOCK_AGENTS.map((agent) => (
            <Box
              key={agent.id}
              p="12"
              display="flex"
              flexDirection="column"
              style={{ cursor: 'pointer' }}
              onClick={() => handleSelectAgent(agent)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--opal-bg-sidebar)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Text fontSize="sm" fontWeight="600" color="fg.default">{agent.name}</Text>
              <Text fontSize="xs" color="fg.tertiary">{agent.description}</Text>
            </Box>
          ))}
        </Box>
      )}

      {error && (
        <Text
          fontSize="xs"
          color="fg.error"
          style={{ margin: 0, marginBottom: '4px' }}
        >
          {error}
        </Text>
      )}

      {/* Input Container */}
      <Box
        display="flex"
        flexDirection="column"
        p="12"
        border="1"
        rounded="lg"
        style={{
          backgroundColor: 'var(--opal-bg-input)',
          borderColor: borderColor,
          borderRadius: '12px',
          boxShadow: variant === 'home' ? 'var(--shadow-sm)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Active Context/Agent Chips */}
        {(selectedAgent || contextChip) && (
          <Box display="flex" gap="8" mb="8" flexWrap="wrap">
            {selectedAgent && (
              <Box
                display="flex"
                alignItems="center"
                gap="4"
                px="8"
                py="2"
                style={{
                  backgroundColor: 'var(--opal-bg-user)',
                  borderRadius: '16px',
                  border: '1px solid var(--opal-accent-purple)',
                }}
              >
                <Text fontSize="xs" fontWeight="600" style={{ color: 'var(--opal-accent-purple)' }}>@{selectedAgent.name}</Text>
                <IconXmark size={12} style={{ cursor: 'pointer', color: 'var(--opal-accent-purple)' }} onClick={removeAgent} />
              </Box>
            )}
            {contextChip && (
              <Box
                display="flex"
                alignItems="center"
                gap="4"
                px="8"
                py="2"
                style={{
                  backgroundColor: 'var(--opal-bg-sidebar)',
                  borderRadius: '16px',
                  border: '1px solid var(--opal-border-primary)',
                }}
              >
                <Text fontSize="xs" color="fg.secondary">{contextChip}</Text>
                <IconXmark size={12} style={{ cursor: 'pointer' }} onClick={removeContext} />
              </Box>
            )}
          </Box>
        )}

        <Textarea
          placeholder={selectedAgent ? "Ask anything..." : "Ask Opal"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled && !isLoading}
          rows={2}
          style={{
            flex: 1,
            border: 'none',
            padding: 0,
            resize: 'none',
            minHeight: '48px',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '22.4px',
            fontFamily: 'Inter, sans-serif',
            color: 'var(--opal-text-body)',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            outline: 'none',
          }}
        />

        {/* Actions Row */}
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mt="8"
        >
          {/* Left Actions */}
          <Box display="flex" gap="4">
            <Button
              appearance="subtle"
              size="sm"
              icon={<IconAgent size={20} />}
              aria-label="Agent selection"
              style={{ padding: '4px', height: 'auto', color: 'var(--opal-text-tertiary)' }}
            />
            <Button
              appearance="subtle"
              size="sm"
              icon={<IconFileArrowUp size={20} />}
              aria-label="Upload file"
              onClick={handleAddContext}
              style={{ padding: '4px', height: 'auto', color: 'var(--opal-text-tertiary)' }}
            />
          </Box>

          {/* Right Action (Send/Stop/Mic) */}
          <Button
            appearance="default"
            size="sm"
            aria-label={isLoading ? "Stop generating" : (hasValue ? "Send message" : "Voice input")}
            onClick={onSend}
            disabled={!isLoading && !hasValue && false}
            style={{
              width: '32px',
              height: '32px',
              padding: 0,
              borderRadius: '8px',
              backgroundColor: isLoading
                ? 'var(--opal-stop-btn-bg)'
                : 'var(--opal-accent-purple)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {ctaIcon}
          </Button>
        </Box>
      </Box>

      {/* Disclaimer */}
      <Text
        style={{
          ...opalTypography.disclaimer,
          margin: 0,
          marginTop: '4px',
          color: 'var(--opal-text-tertiary)',
          fontSize: '11px',
          opacity: 0.8,
        }}
      >
        Opal can make mistakes. Double-check its responses.
      </Text>
    </Box>
  );
}