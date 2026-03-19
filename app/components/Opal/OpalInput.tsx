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

  const [focusedAgentIndex, setFocusedAgentIndex] = useState(0);

  useEffect(() => {
    if (showAgentDropdown) {
      setFocusedAgentIndex(0);
    }
  }, [showAgentDropdown]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showAgentDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedAgentIndex((prev) => (prev + 1) % MOCK_AGENTS.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedAgentIndex((prev) => (prev - 1 + MOCK_AGENTS.length) % MOCK_AGENTS.length);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowAgentDropdown(false);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectAgent(MOCK_AGENTS[focusedAgentIndex]);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Add global Escape listener for stopping generation
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && isLoading) {
        e.preventDefault();
        onSend(); // Trigger stop
        // Optional: refocus textarea
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    };

    if (isLoading) {
      document.addEventListener('keydown', handleGlobalKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isLoading, onSend]);



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
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const toggleRecording = async () => {
    if (isRecording) {
      console.log('[Voice] Stopping recording...');
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    console.log('[Voice] Starting recording...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release the mic
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('[Voice] Recording complete, sending to Whisper...', {
          size: `${(audioBlob.size / 1024).toFixed(1)}KB`,
        });

        if (audioBlob.size < 1000) {
          console.log('[Voice] Audio too short, skipping transcription');
          return;
        }

        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const err = await response.json();
            console.error('[Voice] Transcription failed:', err);
            return;
          }

          const { text } = await response.json();
          if (text?.trim()) {
            console.log('[Voice] Transcribed:', text);
            onChange(value + (value && !value.endsWith(' ') ? ' ' : '') + text);
          }
        } catch (error) {
          console.error('[Voice] Transcription error:', error);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.onerror = () => {
        console.error('[Voice] MediaRecorder error');
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      console.log('[Voice] Recording started');
    } catch (err) {
      console.error('[Voice] Mic access denied or unavailable:', err);
      alert('Microphone access was denied. Please check your browser permissions.');
    }
  };

  const handleInputChange = (newValue: string) => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
    onChange(newValue);
  };



  // Determine border color based on state
  let borderColor = 'var(--opal-border-input)';
  if (isFocused || hasValue || isLoading || isRecording || isTranscribing) {
    borderColor = '#7C3AED';
  }

  // CTA Icon state logic
  let ctaIcon = <IconMicrophone size={20} />;
  if (isLoading || isRecording || isTranscribing) {
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
          {MOCK_AGENTS.map((agent, index) => (
            <Box
              key={agent.id}
              p="12"
              display="flex"
              flexDirection="column"
              style={{
                cursor: 'pointer',
                backgroundColor: index === focusedAgentIndex ? 'var(--opal-bg-sidebar)' : 'transparent'
              }}
              onClick={() => handleSelectAgent(agent)}
              onMouseEnter={() => setFocusedAgentIndex(index)}
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
                  border: '1px solid #7C3AED',
                }}
              >
                <Text fontSize="xs" fontWeight="600" style={{ color: '#7C3AED' }}>@{selectedAgent.name}</Text>
                <IconXmark size={12} style={{ cursor: 'pointer', color: '#7C3AED' }} onClick={removeAgent} />
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

          {/* Right Actions (Mic + Send) */}
          <Box display="flex" gap="8" alignItems="center">
            <Button
              appearance="subtle"
              size="sm"
              icon={isRecording ? <IconCircleStop size={20} /> : <IconMicrophone size={20} />}
              aria-label={isRecording ? "Stop recording" : "Voice input"}
              onClick={toggleRecording}
              disabled={isTranscribing}
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                borderRadius: '50%',
                color: isRecording ? '#E01E5A' : 'var(--opal-text-primary)',
                backgroundColor: isRecording ? 'rgba(224, 30, 90, 0.1)' : 'transparent',
                animation: isRecording ? 'opal-pulse 1.5s infinite' : 'none',
                opacity: isTranscribing ? 0.5 : 1,
                cursor: isTranscribing ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
              }}
            />
            <Button
              appearance="default"
              size="md"
              icon={isLoading ? <IconCircleStop size={20} /> : <IconArrowUp size={20} />}
              aria-label={isLoading ? "Stop generating" : "Send message"}
              onClick={() => {
                if (isLoading) {
                  onSend();
                } else {
                  onSend();
                  // Refocus after sending
                  setTimeout(() => textareaRef.current?.focus(), 50);
                }
              }}
              disabled={!isLoading && !hasValue}
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                borderRadius: '8px',
                backgroundColor: isLoading
                  ? 'var(--ax-colors-bg-secondary)'
                  : '#7C3AED',
                color: isLoading ? '#7C3AED' : 'var(--opal-send-btn-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: (!isLoading && !hasValue) ? 0.4 : 1,
              }}
            />
          </Box>
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