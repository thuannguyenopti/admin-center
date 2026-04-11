"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Menu,
  MenuContent,
  MenuTrigger,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Listbox,
  ListboxGroup,
  ListboxItem,
  ListboxLabel,
  type MenuOption,
} from "@optiaxiom/react";
import { Text } from "../Text";
import { IconMicrophone } from "@tabler/icons-react";
import {
  IconAgent,
  IconArrowUp,
  IconBook,
  IconCircleStop,
  IconFolderImage,
  IconGrid2Plus,
  IconPlus,
  IconUpload,
  IconXmark,
} from "@/app/lib/axiom-icons";
import { KeyboardEvent, useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { opalTypography } from "@/app/styles/opalTypography";
import { QUICK_ACTIONS } from "./OpalLanding";
import { CONNECTORS } from "@/app/opal/tools/data/connectors";
import { ConnectorAvatar } from "@/app/opal/tools/components/ConnectorAvatar";

export type MentionableAgent = {
  id: string;
  name: string;
  subtitle?: string;
  emoji?: string;
  handle: string;
};

type OpalInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: (content?: string) => void;
  disabled: boolean;
  error?: string;
  isLoading?: boolean;
  variant?: 'assistant' | 'home';
  enableAI?: boolean;
  onEnableAIChange?: (enabled: boolean) => void;
  agentBar?: React.ReactNode;
  mentionableAgents?: MentionableAgent[];
  onMentionSelect?: (agent: MentionableAgent) => void;
  /** Called when the user tries to submit but is blocked (e.g. during resume flow) */
  onSubmitBlocked?: () => void;
  contextChip?: string | null;
  contextContent?: string | null;
  onContextChipRemove?: () => void;
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
  onEnableAIChange,
  agentBar,
  mentionableAgents = [],
  onMentionSelect,
  onSubmitBlocked,
  contextChip,
  contextContent,
  onContextChipRemove,
}: OpalInputProps) {
  const featuredConnectorMenuIds = useMemo(
    () => ["figma", "google-docs", "google-sheets", "google-slides"],
    []
  );
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Always track the input container's current width so the dropdown matches exactly
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setDropdownWidth(el.offsetWidth));
    obs.observe(el);
    setDropdownWidth(el.offsetWidth); // initial read
    return () => obs.disconnect();
  }, []);

  // Auto-focus textarea when value is set externally (e.g. suggestion/card click)
  const prevValueRef = useRef('');
  useEffect(() => {
    const prev = prevValueRef.current;
    prevValueRef.current = value;
    if (value && !prev && document.activeElement !== textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [value]);

  // Auto-focus textarea when loading finishes (Opal/agent response complete)
  const prevIsLoadingRef = useRef(false);
  useEffect(() => {
    const wasLoading = prevIsLoadingRef.current;
    prevIsLoadingRef.current = !!isLoading;
    if (wasLoading && !isLoading) {
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [isLoading]);

  // Auto-focus textarea when a context chip is added (e.g. via "Ask Opal" from selection tooltip)
  const prevContextChipRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const prev = prevContextChipRef.current;
    prevContextChipRef.current = contextChip;
    if (contextChip && !prev) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [contextChip]);

  // Auto-resize textarea based on content — useLayoutEffect fires synchronously
  // before paint, so heights are always correct (including reset after send)
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    const container = containerRef.current;
    if (textarea && container) {
      // Reset to auto so scrollHeight reflects true content height (not flex-stretched height)
      textarea.style.height = 'auto';
      const naturalHeight = textarea.scrollHeight;

      // Calculate final heights
      // Total 88px = Textarea 34px + Offset 54px
      // Offset 54px = Padding (8+8=16) + Margin (2) + Submit Button (32) + Extra Gap (4)
      const offset = 54;
      // Home variant starts taller (4-row default like Ana's design)
      // Context chip variant starts taller so the input is clearly in view
      const minTextareaHeight = variant === 'home' ? 90 : contextChip ? 72 : 34;
      const minContainerHeight = variant === 'home' ? 144 : contextChip ? 126 : 88;
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
  }, [value, contextChip]);

  // Filter mentionable agents based on text after @
  const mentionQuery = value.startsWith('@') ? value.slice(1).toLowerCase() : '';
  const filteredAgents = mentionableAgents.filter(a =>
    !mentionQuery || a.name.toLowerCase().includes(mentionQuery) || a.handle.toLowerCase().includes(mentionQuery)
  );

  useEffect(() => {
    if (value.startsWith('@') && mentionableAgents.length > 0) {
      setShowAgentDropdown(true);
    } else {
      setShowAgentDropdown(false);
    }
  }, [value, mentionableAgents]);

  const [focusedAgentIndex, setFocusedAgentIndex] = useState(0);
  const agentListLength = filteredAgents.length;

  useEffect(() => {
    if (showAgentDropdown) {
      setFocusedAgentIndex(0);
    }
  }, [showAgentDropdown]);

  // Defined early so handleKeyDown can reference it
  const hasValue = value.trim().length > 0;

  // Build full message content and fire onSend
  const triggerSend = () => {
    if (disabled) { onSubmitBlocked?.(); return; }
    if (!hasValue || isLoading) return;
    const message = contextContent
      ? `${value.trim()}\n\nContext — Selected text in Prompt:\n\n"${contextContent}"`
      : value.trim();
    onSend(message);
    onContextChipRemove?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showAgentDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedAgentIndex((prev) => (prev + 1) % agentListLength);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedAgentIndex((prev) => (prev - 1 + agentListLength) % agentListLength);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowAgentDropdown(false);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredAgents[focusedAgentIndex]) {
          handleSelectAgent(filteredAgents[focusedAgentIndex]);
        }
        return; // never fall through to triggerSend while dropdown is open
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      triggerSend();
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



  const handleSelectAgent = (agent: MentionableAgent) => {
    setShowAgentDropdown(false);
    onChange(value.replace(/^@\S*/, '').trimStart());
    onMentionSelect?.(agent);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };


  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [featuredConnectorIds, setFeaturedConnectorIds] = useState<string[]>([
    "google-docs",
    "google-sheets",
    "google-slides",
  ]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const featuredConnectors = useMemo(
    () =>
      featuredConnectorMenuIds
        .map((connectorId) => CONNECTORS.find((connector) => connector.id === connectorId))
        .filter((connector): connector is NonNullable<typeof connector> => Boolean(connector)),
    [featuredConnectorMenuIds]
  );

  const addActionMenuOptions = useMemo<MenuOption[]>(
    () => [
      {
        addon: <IconUpload size={16} />,
        group: { hidden: true, label: "Primary actions", priority: 2 },
        key: "upload-device",
        label: "Upload from device",
      },
      {
        addon: <IconFolderImage size={16} />,
        group: { hidden: true, label: "Primary actions", priority: 2 },
        key: "add-dam",
        label: "Add from DAM",
      },
      {
        addon: <IconGrid2Plus size={16} />,
        group: { hidden: true, label: "Primary actions", priority: 2, separator: true },
        key: "connector-submenu",
        label: "Connectors",
        subOptions: [
          ...featuredConnectors.map<MenuOption>((connector) => ({
            addon: <ConnectorAvatar connector={connector} size={16} framed={false} />,
            group: { label: "Connectors", priority: 2 },
            key: connector.id,
            label: connector.name,
            selected: featuredConnectorIds.includes(connector.id),
            switch: true,
            execute: () => {
              setFeaturedConnectorIds((prev) =>
                prev.includes(connector.id)
                  ? prev.filter((id) => id !== connector.id)
                  : [...prev, connector.id]
              );
            },
          })),
          {
            group: { hidden: true, label: "Connectors footer", priority: 1, separator: true },
            key: "view-all-connectors",
            label: "Browse all connectors",
            execute: () => {
              router.push("/opal/connectors?tab=connectors");
            },
          },
        ],
      },
    ],
    [featuredConnectors, featuredConnectorIds, router]
  );

  const agentMenuOptions = useMemo<MenuOption[]>(
    () =>
      filteredAgents.slice(0, 8).map((agent) => ({
        addon: agent.emoji ? (
          <span style={{ fontSize: 16, lineHeight: 1 }}>{agent.emoji}</span>
        ) : (
          <IconAgent size={16} />
        ),
        description: agent.subtitle,
        group: { label: "Recently used agents", priority: 2 },
        key: agent.id,
        label: agent.name,
        execute: () => handleSelectAgent(agent),
      })),
    [filteredAgents]
  );

  const instructionMenuOptions = useMemo<MenuOption[]>(
    () =>
      QUICK_ACTIONS.map<MenuOption>((action) => ({
        addon: <span style={{ fontSize: 16, lineHeight: 1 }}>{action.emoji}</span>,
        group: { label: "Instructions", priority: 2 },
        key: action.label,
        label: action.label,
        subOptions: action.suggestions.map<MenuOption>((suggestion) => ({
          group: { hidden: true, label: `${action.label} suggestions`, priority: 2 },
          key: suggestion,
          label: suggestion,
          execute: () => {
            onChange(suggestion);
            setTimeout(() => textareaRef.current?.focus(), 50);
          },
        })),
      })),
    [onChange]
  );

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
          // Refocus textarea so user can press Enter to submit immediately
          setTimeout(() => textareaRef.current?.focus(), 50);
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
  const isActive = isFocused || hasValue || isLoading || isRecording || isTranscribing;
  let borderColor = isActive ? '#7C3AED' : 'var(--ax-colors-border-default, #e5e7eb)';

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
      gap="0"
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

      {error && (
        <Text
          fontSize="xs"
          color="fg.error"
          style={{ margin: 0, marginBottom: '4px' }}
        >
          {error}
        </Text>
      )}

      {/* AgentBar slot — bottom 8px tucks under input box */}
      {agentBar && (
        <Box style={{
          borderRadius: '6px',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 0,
          marginBottom: '-8px',
          animation: 'agentBarSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {agentBar}
        </Box>
      )}

      {/* Input Container — always 8px radius all corners, sits on top */}
      <Popover
        open={showAgentDropdown}
        onOpenChange={(open) => { if (!open) setShowAgentDropdown(false); }}
      >
        <PopoverAnchor asChild>
        <Box
          ref={containerRef}
          display="flex"
          flexDirection="column"
          px="12"
          border="1"
          style={{
            backgroundColor: 'var(--opal-bg-input)',
            borderColor: borderColor,
            borderRadius: '8px',
            boxShadow: variant === 'home' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s ease',
            minHeight: '88px',
            boxSizing: 'border-box',
            paddingTop: '8px',
            paddingBottom: '8px',
            position: 'relative',
            zIndex: 1,
          }}
        >
        {/* Active Context Chips */}
        {contextChip && (
          <Box display="flex" gap="8" mb="8" flexWrap="wrap">
            <Box
              display="inline-flex"
              alignItems="center"
              gap="4"
              style={{
                backgroundColor: 'var(--ax-colors-bg-avatar-neutral)',
                borderRadius: '6px',
                height: '24px',
                padding: '2px 6px',
                flexShrink: 0,
              }}
            >
              <Text fontSize="xs" style={{ color: 'var(--ax-colors-fg-default)', whiteSpace: 'nowrap' }}>{contextChip}</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{ width: 16, borderRadius: 4, padding: 2, cursor: 'pointer', color: 'var(--ax-colors-fg-secondary)' }}
                onClick={onContextChipRemove}
              >
                <IconXmark size={12} />
              </Box>
            </Box>
          </Box>
        )}

        <textarea
          ref={textareaRef}
          placeholder="Ask Opal"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          rows={1}
          style={{
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
            width: '100%',
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
            <Menu options={addActionMenuOptions}>
              <MenuTrigger asChild>
                <Button
                  appearance="subtle"
                  size="sm"
                  icon={<IconPlus size={16} />}
                  aria-label="Add content"
                  style={{ padding: '4px', height: 'auto', color: 'var(--opal-text-tertiary)' }}
                />
              </MenuTrigger>
              <MenuContent align="start" side="top" sideOffset={8} />
            </Menu>
            <Menu options={agentMenuOptions}>
              <MenuTrigger asChild>
                <Button
                  appearance="subtle"
                  size="sm"
                  icon={<IconAgent size={16} />}
                  aria-label="Agent selection"
                  style={{ padding: '4px', height: 'auto', color: 'var(--opal-text-tertiary)' }}
                />
              </MenuTrigger>
              <MenuContent align="start" side="top" sideOffset={8} />
            </Menu>
            <Menu options={instructionMenuOptions}>
              <MenuTrigger asChild>
                <Button
                  appearance="subtle"
                  size="sm"
                  icon={<IconBook size={16} />}
                  aria-label="Instruction menu"
                  style={{ padding: '4px', height: 'auto', color: 'var(--opal-text-tertiary)' }}
                />
              </MenuTrigger>
              <MenuContent align="start" side="top" sideOffset={8} />
            </Menu>
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
            <span style={{
              display: 'inline-flex',
              opacity: ((!isLoading && !hasValue) || disabled) ? 0.4 : 1,
              transition: 'opacity 0.2s ease',
            }}>
              <Button
                appearance="default"
                size="md"
                icon={isLoading ? <IconCircleStop size={20} /> : <IconArrowUp size={20} />}
                aria-label={isLoading ? "Stop generating" : "Send message"}
                onClick={() => {
                  if (isLoading) {
                    onSend();
                  } else {
                    triggerSend();
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
                }}
              />
            </span>
          </Box>
        </Box>
        </Box>{/* end containerRef Box */}
        </PopoverAnchor>
        <PopoverContent
          side="top"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          style={{
            width: dropdownWidth ? `${dropdownWidth}px` : undefined,
            minWidth: dropdownWidth ? `${dropdownWidth}px` : undefined,
            maxWidth: dropdownWidth ? `${dropdownWidth}px` : undefined,
            padding: 0,
            maxHeight: '280px',
            overflowY: 'auto',
          }}
        >
          <Listbox>
            <ListboxGroup>
              <ListboxLabel px="12" pt="8" pb="4">
                Recently used agents
              </ListboxLabel>
              {filteredAgents.map((agent, index) => (
                <ListboxItem
                  key={agent.id}
                  addonBefore={agent.emoji
                    ? <span style={{ fontSize: 16, lineHeight: 1 }}>{agent.emoji}</span>
                    : undefined}
                  description={agent.subtitle}
                  onClick={() => handleSelectAgent(agent)}
                  onMouseEnter={() => setFocusedAgentIndex(index)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: index === focusedAgentIndex
                      ? 'var(--ax-colors-bg-secondary)'
                      : undefined,
                  }}
                >
                  <Box display="flex" alignItems="center" gap="8">
                    <Text fontSize="md" fontWeight="500" color="fg.default">{agent.name}</Text>
                    <Text fontSize="sm" color="fg.link.visited">{agent.handle}</Text>
                  </Box>
                </ListboxItem>
              ))}
            </ListboxGroup>
          </Listbox>
        </PopoverContent>
      </Popover>

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
