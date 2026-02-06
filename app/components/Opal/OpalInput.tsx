"use client";

import { Box, Button, Textarea, Switch } from "@optiaxiom/react";
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
  enableAI?: boolean;
  onEnableAIChange?: (enabled: boolean) => void;
};

export function OpalInput({
  value,
  onChange,
  onSend,
  disabled,
  error,
  isLoading,
  variant = 'assistant',
  enableAI,
  onEnableAIChange
}: OpalInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [contextChip, setContextChip] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    const container = containerRef.current;
    if (textarea && container) {
      // Temporarily reset height to 34px to get the most accurate scrollHeight
      textarea.style.setProperty('height', '34px', 'important');
      const naturalHeight = textarea.scrollHeight;

      // Calculate final heights
      // Total 88px = Textarea 34px + Offset 54px
      // Offset 54px = Padding (8+8=16) + Margin (2) + Submit Button (32) + Extra Gap (4)
      const offset = 54;
      const minTextareaHeight = 34;
      const minContainerHeight = 88;
      const maxContainerHeight = window.innerHeight * 0.5; // 50vh

      const targetTextareaHeight = Math.max(naturalHeight, minTextareaHeight);
      const neededContainerHeight = targetTextareaHeight + offset;
      const finalContainerHeight = Math.round(Math.min(neededContainerHeight, maxContainerHeight));
      const finalTextareaHeight = finalContainerHeight - offset;

      // Apply heights with !important
      container.style.setProperty('height', `${finalContainerHeight}px`, 'important');
      textarea.style.setProperty('height', `${finalTextareaHeight}px`, 'important');

      // Strict scrollbar control
      if (naturalHeight > finalTextareaHeight + 1) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }

      container.style.boxSizing = 'border-box';
      textarea.style.boxSizing = 'border-box';
    }
  }, [value]);

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

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Add a ref to track retry attempts
  const retryCount = useRef(0);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      // Reset retry count on manual stop
      retryCount.current = 0;
      return;
    }

    // Abort any existing recognition before starting a new one
    recognitionRef.current?.abort();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      // We don't reset retry count here to avoid infinite loops on immediate start/fail cycles,
      // but we could reset it if we successfully get a result.
    };

    recognition.onend = () => {
      setIsRecording(false);
      // If we stopped but it wasn't a manual stop (and no error fired), we might want to stay stopped.
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition warning:', event.error);
      setIsRecording(false);

      if (event.error === 'network') {
        if (retryCount.current < 2) {
          // Auto-retry silently for network errors
          retryCount.current += 1;
          console.log(`Speech recognition network error, retrying... (${retryCount.current}/2)`);
          setTimeout(() => {
            toggleRecording();
          }, 500);
        } else {
          // Give up silently after retries fail
          console.log('Voice input failed after retries. Stopping.');
          retryCount.current = 0;
        }
      } else if (event.error === 'not-allowed') {
        alert("Microphone access was denied. Please check your browser permissions.");
      }
    };

    recognition.onresult = (event: any) => {
      // Successful result, reset retry count
      retryCount.current = 0;

      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onChange(value + (value && !value.endsWith(' ') ? ' ' : '') + finalTranscript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleInputChange = (newValue: string) => {
    if (isRecording) {
      recognitionRef.current?.abort();
      setIsRecording(false);
    }
    onChange(newValue);
  };

  const handleMainAction = () => {
    if (isLoading) {
      onSend();
    } else if (hasValue) {
      onSend();
    } else {
      toggleRecording();
    }
  };

  // Determine border color based on state
  let borderColor = 'var(--opal-border-input)';
  if (isFocused || hasValue || isLoading || isRecording) {
    borderColor = 'var(--opal-accent-purple)';
  }

  // CTA Icon state logic
  let ctaIcon = <IconMicrophone size={20} />;
  if (isLoading || isRecording) {
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
      borderT="0"
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
        ref={containerRef}
        display="flex"
        flexDirection="column"
        px="12"
        border="1"
        rounded="lg"
        style={{
          backgroundColor: 'var(--opal-bg-input)',
          borderColor: borderColor,
          borderRadius: '12px',
          boxShadow: variant === 'home' ? 'var(--shadow-sm)' : 'none',
          transition: 'all 0.2s ease',
          minHeight: '88px',
          boxSizing: 'border-box',
          paddingTop: '8px',
          paddingBottom: '8px',
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
          ref={textareaRef}
          placeholder={selectedAgent ? "Ask anything..." : "Ask Opal"}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled && !isLoading}
          style={{
            flex: 1,
            border: 'none',
            padding: 0,
            resize: 'none',
            height: '34px',
            minHeight: '0px',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '22.4px',
            fontFamily: 'Inter, sans-serif',
            color: 'var(--opal-text-body)',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            outline: 'none',
            overflowY: 'hidden',
            boxSizing: 'border-box',
          }}
        />

        {/* Actions Row */}
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          style={{ marginTop: '2px' }}
        >
          {/* Left Actions */}
          <Box display="flex" gap="4">
            <Button
              appearance="subtle"
              size="sm"
              icon={<IconAgent size={16} />}
              aria-label="Agent selection"
              style={{ padding: '4px', height: 'auto', color: 'var(--opal-text-tertiary)' }}
            />
            <Button
              appearance="subtle"
              size="sm"
              icon={<IconFileArrowUp size={16} />}
              aria-label="Upload file"
              onClick={handleAddContext}
              style={{ padding: '4px', height: 'auto', color: 'var(--opal-text-tertiary)' }}
            />
          </Box>

          {/* Right Action (Send/Stop/Mic) */}
          <Button
            appearance="default"
            size="md"
            aria-label={isLoading ? "Stop generating" : (isRecording ? "Stop recording" : (hasValue ? "Send message" : "Voice input"))}
            onClick={handleMainAction}
            disabled={!isLoading && !hasValue && !isRecording && false}
            style={{
              width: '32px',
              height: '32px',
              padding: 0,
              borderRadius: '8px',
              backgroundColor: (isLoading || isRecording)
                ? (isRecording ? '#E01E5A' : 'var(--opal-stop-btn-bg)')
                : 'var(--opal-accent-purple)',
              color: (isLoading || isRecording) ? (isRecording ? 'white' : 'var(--opal-accent-purple)') : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              animation: isRecording ? 'opal-pulse 1.5s infinite' : 'none',
            }}
          >
            {ctaIcon}
          </Button>
        </Box>
      </Box>

      {/* Footer Area: Disclaimer + Testing Toggle */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        w="full"
        mt="4"
        style={{ opacity: 0.8 }}
      >
        <Text
          style={{
            ...opalTypography.disclaimer,
            margin: 0,
            color: 'var(--opal-text-tertiary)',
            fontSize: '11px',
          }}
        >
          Opal can make mistakes. Double-check its responses.
        </Text>


      </Box>
    </Box>
  );
}