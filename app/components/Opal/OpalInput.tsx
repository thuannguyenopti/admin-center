"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
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
import { Pill } from "@optiaxiom/react/unstable";
import { Text } from "../Text";
import {
  IconArrowUp,
  IconBold,
  IconBook,
  IconBooks,
  IconCircleArrowUp,
  IconCircleCheckSolid,
  IconCircleStop,
  IconGrid2Plus,
  IconItalic,
  IconListOl,
  IconListUl,
  IconPlus,
  IconStrikethrough,
  IconText,
  IconUpload,
  IconUser,
  IconXmark,
} from "@optiaxiom/icons";
import { IconAgent, IconSubAgent } from "@optimizely/axiom-icons";
import { IconBuilding } from "@tabler/icons-react";
import { IconMicrophone } from "@/app/lib/axiom-icons";
import { KeyboardEvent, useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { opalTypography } from "@/app/styles/opalTypography";
import { QUICK_ACTIONS } from "./OpalLanding";
import { CONNECTORS } from "@/app/opal/tools/data/connectors";
import { ConnectorAvatar } from "@/app/opal/tools/components/ConnectorAvatar";

function ConnectorDetailStatus({
  isAuth,
  onToggle,
}: {
  isAuth: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const row = el.closest('[tabindex="-1"]') as HTMLElement | null;
    if (!row) return;
    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    row.addEventListener("mouseenter", enter);
    row.addEventListener("mouseleave", leave);
    return () => {
      row.removeEventListener("mouseenter", enter);
      row.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <span
      ref={ref}
      style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", position: "relative" }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        appearance="default"
        size="sm"
        style={{ opacity: hovered ? 1 : 0, pointerEvents: hovered ? undefined : "none" }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
      >
        {isAuth ? "Disconnect" : "Connect"}
      </Button>
      <span style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        opacity: hovered ? 0 : 1,
        pointerEvents: "none",
      }}>
        {isAuth
          ? <IconCircleCheckSolid size={16} style={{ color: "var(--ax-colors-fg-success)" }} />
          : <IconPlus size={16} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
        }
      </span>
    </span>
  );
}

export type MentionableAgent = {
  id: string;
  name: string;
  subtitle?: string;
  emoji?: string;
  handle: string;
  group?: 'agent' | 'uau' | 'user';
};

type MentionUser = MentionableAgent & { avatar?: string; email?: string };

const MOCK_MENTION_USERS: MentionUser[] = [
  { id: 'user_jc', name: 'Jamie Chen', email: 'jamie.chen@optimizely.com', handle: '@jamie.chen', group: 'user' },
  { id: 'user_ma', name: 'Mary Anne Torres', email: 'maryanne.torres@optimizely.com', handle: '@maryanne.torres', group: 'user' },
  { id: 'user_sk', name: 'Sarah Kim', email: 'sarah.kim@optimizely.com', handle: '@sarah.kim', group: 'user' },
  { id: 'user_ap', name: 'Alex Park', email: 'alex.park@optimizely.com', handle: '@alex.park', group: 'user' },
  { id: 'user_rw', name: 'Ryan Walsh', email: 'ryan.walsh@optimizely.com', handle: '@ryan.walsh', group: 'user' },
];

const MOCK_MENTION_VAUS: MentionUser[] = [
  { id: 'vau_ppc', name: 'Pixel Perfect Checker', email: 'pixel-perfect@opal.optimizely.com', handle: '@pixel-perfect', avatar: '/avatars/mock-avatar-seo.svg', group: 'uau' },
  { id: 'vau_geo', name: 'GEO Q&A Generator', email: 'geo-qa@opal.optimizely.com', handle: '@geo-qa', avatar: '/avatars/mock-avatar-geo.svg', group: 'uau' },
  { id: 'vau_traffic', name: 'Weekly Traffic Reporter', email: 'traffic-reporter@opal.optimizely.com', handle: '@traffic-reporter', avatar: '/avatars/mock-avatar-traffic.svg', group: 'uau' },
  { id: 'vau_plq', name: 'Product Launch Quarterback', email: 'product-launch@opal.optimizely.com', handle: '@product-launch', avatar: '/avatars/mock-avatar-abu.svg', group: 'uau' },
  { id: 'vau_abm', name: 'ABM Page Generator', email: 'abm-generator@opal.optimizely.com', handle: '@abm-generator', avatar: '/avatars/mock-avatar-geo.svg', group: 'uau' },
];

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
  inputAgentCtx?: { name: string; handle?: string } | null;
  mentionableAgents?: MentionableAgent[];
  onMentionSelect?: (agent: MentionableAgent) => void;
  /** Called when the user tries to submit but is blocked (e.g. during resume flow) */
  onSubmitBlocked?: () => void;
  contextChip?: string | null;
  contextContent?: string | null;
  onContextChipRemove?: () => void;
  imMode?: boolean;
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
  inputAgentCtx,
  mentionableAgents = [],
  onMentionSelect,
  onSubmitBlocked,
  contextChip,
  contextContent,
  onContextChipRemove,
  imMode = false,
}: OpalInputProps) {
  const featuredConnectorMenuIds = useMemo(
    () => ["figma", "google-docs", "google-sheets", "google-slides"],
    []
  );
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [showFormatBar, setShowFormatBar] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>();
  const [agentPillIndent, setAgentPillIndent] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const agentPillRef = useRef<HTMLSpanElement>(null);

  // Always track the input container's current width so the dropdown matches exactly
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setDropdownWidth(el.offsetWidth));
    obs.observe(el);
    setDropdownWidth(el.offsetWidth); // initial read
    return () => obs.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = agentPillRef.current;
    if (!el || !inputAgentCtx) {
      setAgentPillIndent(0);
      return;
    }

    const updateIndent = () => setAgentPillIndent(el.offsetWidth + 12);
    const obs = new ResizeObserver(updateIndent);
    obs.observe(el);
    updateIndent();
    return () => obs.disconnect();
  }, [inputAgentCtx]);

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
      textarea.style.height = 'auto';
      const naturalHeight = textarea.scrollHeight;

      const offset = 58;
      let minTextareaHeight: number;
      let minContainerHeight: number;
      if (imMode) {
        const hasVal = value.trim().length > 0;
        minTextareaHeight = isFocused || hasVal ? 50 : 22;
        minContainerHeight = isFocused || hasVal ? 108 : 80;
      } else if (variant === 'home') {
        minTextareaHeight = 90;
        minContainerHeight = 148;
      } else if (contextChip) {
        minTextareaHeight = 72;
        minContainerHeight = 130;
      } else {
        minTextareaHeight = 34;
        minContainerHeight = 92;
      }
      const maxContainerHeight = window.innerHeight * 0.5;

      const isImCompact = imMode && !isFocused && value.trim() === '';
      const targetTextareaHeight = isImCompact ? minTextareaHeight : Math.max(naturalHeight, minTextareaHeight);
      const formatBarExtra = imMode && showFormatBar ? 38 : 0;
      const neededContainerHeight = targetTextareaHeight + offset + formatBarExtra;
      const finalContainerHeight = Math.round(Math.min(neededContainerHeight, maxContainerHeight));
      const finalTextareaHeight = finalContainerHeight - offset - formatBarExtra;

      container.style.setProperty('height', `${finalContainerHeight}px`, 'important');
      textarea.style.setProperty('height', `${finalTextareaHeight}px`, 'important');

      if (isImCompact || naturalHeight <= finalTextareaHeight + 1) {
        textarea.style.overflowY = 'hidden';
      } else {
        textarea.style.overflowY = 'auto';
      }

      container.style.boxSizing = 'border-box';
      textarea.style.boxSizing = 'border-box';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, contextChip, isFocused, imMode, showFormatBar]);

  // Filter mentionable agents based on text after @
  const mentionQuery = value.startsWith('@') ? value.slice(1).toLowerCase() : '';
  const matchesMentionQuery = (a: MentionableAgent) =>
    !mentionQuery || a.name.toLowerCase().includes(mentionQuery) || a.handle.toLowerCase().includes(mentionQuery);
  const filteredAgents = mentionableAgents.filter(matchesMentionQuery);
  const filteredUsers = MOCK_MENTION_USERS.filter(matchesMentionQuery);
  const filteredVAUs = MOCK_MENTION_VAUS.filter(matchesMentionQuery);

  useEffect(() => {
    if (value.startsWith('@') && mentionableAgents.length > 0) {
      setShowAgentDropdown(true);
    } else {
      setShowAgentDropdown(false);
    }
  }, [value, mentionableAgents]);

  // Slash command menu — auto-open when user types "/"
  const showSlashMenu = imMode && value.startsWith('/') && !showAgentDropdown;
  const slashTriggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (showSlashMenu) setTimeout(() => slashTriggerRef.current?.click(), 10);
  }, [showSlashMenu]);

  const [focusedAgentIndex, setFocusedAgentIndex] = useState(0);
  const allMentionItems = [...filteredUsers, ...filteredVAUs, ...filteredAgents];
  const agentListLength = allMentionItems.length;

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
    if (showSlashMenu && e.key === 'Escape') {
      e.preventDefault();
      onChange('');
      return;
    }
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
        if (allMentionItems[focusedAgentIndex]) {
          handleSelectAgent(allMentionItems[focusedAgentIndex]);
        }
        return;
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
  const [authenticatedConnectorIds, setAuthenticatedConnectorIds] = useState<string[]>([]);
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
        addon: <IconBooks size={16} />,
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
          ...featuredConnectors.map<MenuOption>((connector) => {
            const isAuth = authenticatedConnectorIds.includes(connector.id);
            const toggle = () => setAuthenticatedConnectorIds((prev) =>
              prev.includes(connector.id)
                ? prev.filter((id) => id !== connector.id)
                : [...prev, connector.id]
            );
            return {
              addon: <ConnectorAvatar connector={connector} size={16} framed={false} />,
              detail: <ConnectorDetailStatus isAuth={isAuth} onToggle={toggle} />,
              group: { label: "Connectors", priority: 2 },
              key: connector.id,
              label: connector.name,
            };
          }),
          {
            group: { hidden: true, label: "Connectors footer", priority: 1, separator: true },
            key: "view-all-connectors",
            label: "Browse all connectors",
            execute: () => { router.push("/opal/connectors?tab=connectors"); },
          },
        ],
      },
    ],
    [featuredConnectors, authenticatedConnectorIds, router]
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

  const MOCK_SKILLS: { label: string; scope: "personal" | "org" }[] = [
    { label: "Email Campaign Writer", scope: "personal" },
    { label: "SEO Content Generator", scope: "org" },
    { label: "A/B Test Designer", scope: "personal" },
    { label: "Audience Insights Analyst", scope: "org" },
    { label: "Social Media Scheduler", scope: "personal" },
    { label: "Brand Voice Checker", scope: "org" },
    { label: "Landing Page Optimizer", scope: "personal" },
    { label: "Competitive Research", scope: "org" },
  ];

  const skillMenuOptions = useMemo<MenuOption[]>(
    () =>
      MOCK_SKILLS.map<MenuOption>((skill) => ({
        addon: skill.scope === "personal"
          ? <IconUser style={{ width: 14, height: 14, color: "var(--ax-colors-fg-tertiary)" }} />
          : <IconBuilding style={{ width: 14, height: 14, color: "var(--ax-colors-fg-tertiary)" }} />,
        group: { label: "SKILLS", priority: 2 },
        key: skill.label,
        label: skill.label,
        execute: () => {
          onChange(`{Skill: ${skill.label}}`);
          setTimeout(() => textareaRef.current?.focus(), 50);
        },
      })),
    [onChange]
  );

  const slashCommandMenuOptions = useMemo<MenuOption[]>(() => [
    {
      addon: <IconAgent size={16} />,
      description: "Invoke an agent for this task",
      group: { hidden: true, label: "Commands", priority: 3 },
      key: "agents",
      label: "Agents",
      subOptions: mentionableAgents.slice(0, 8).map<MenuOption>((agent) => ({
        addon: agent.emoji ? <span style={{ fontSize: 16, lineHeight: 1 }}>{agent.emoji}</span> : <IconAgent size={16} />,
        description: agent.subtitle,
        group: { hidden: true, label: "Agents", priority: 2 },
        key: agent.id,
        label: agent.name,
        execute: () => { onChange(''); onMentionSelect?.(agent); setTimeout(() => textareaRef.current?.focus(), 50); },
      })),
    },
    {
      addon: <IconBook size={16} />,
      description: "Apply a skill or instruction",
      group: { hidden: true, label: "Commands", priority: 3 },
      key: "skills",
      label: "Skills",
      subOptions: MOCK_SKILLS.map<MenuOption>((skill) => ({
        addon: skill.scope === "personal"
          ? <IconUser style={{ width: 14, height: 14, color: "var(--ax-colors-fg-tertiary)" }} />
          : <IconBuilding style={{ width: 14, height: 14, color: "var(--ax-colors-fg-tertiary)" }} />,
        group: { hidden: true, label: "Skills", priority: 2 },
        key: skill.label,
        label: skill.label,
        execute: () => { onChange(`{Skill: ${skill.label}}`); setTimeout(() => textareaRef.current?.focus(), 50); },
      })),
    },
    {
      addon: <IconGrid2Plus size={16} />,
      description: "Use a connected tool or integration",
      group: { hidden: true, label: "Commands", priority: 3 },
      key: "tools",
      label: "Tools",
      subOptions: featuredConnectors.map<MenuOption>((connector) => ({
        addon: <ConnectorAvatar connector={connector} size={16} framed={false} />,
        group: { hidden: true, label: "Tools", priority: 2 },
        key: connector.id,
        label: connector.name,
        execute: () => { onChange(''); setTimeout(() => textareaRef.current?.focus(), 50); },
      })),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [mentionableAgents, onChange, onMentionSelect, featuredConnectors]);

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
  let borderColor = isActive ? 'var(--ax-colors-border-focus)' : 'var(--ax-colors-border-default)';

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
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 0,
          margin: '0 12px -8px',
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
          rounded="lg"
          shadow={variant === 'home' ? 'sm' : 'none'}
          style={{
            backgroundColor: 'var(--opal-bg-input)',
            borderColor: borderColor,
            transition: 'height 0.15s ease, border-color 0.2s ease',
            minHeight: imMode ? '0px' : '88px',
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
                backgroundColor: 'var(--opal-neutral-50)',
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

        {/* Formatting toolbar — shown above textarea when active in IM mode */}
        {imMode && showFormatBar && (
          <Box
            display="flex"
            alignItems="center"
            gap="2"
            style={{
              borderBottom: '1px solid var(--ax-colors-border-secondary)',
              paddingBottom: '6px',
              marginBottom: '6px',
            }}
          >
            {([
              { icon: <IconBold size={13} />, title: 'Bold', wrap: '**' },
              { icon: <IconItalic size={13} />, title: 'Italic', wrap: '_' },
              { icon: <IconStrikethrough size={13} />, title: 'Strike', wrap: '~~' },
            ] as const).map(({ icon, title, wrap }) => (
              <button
                key={title}
                title={title}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const el = textareaRef.current;
                  if (!el) return;
                  const start = el.selectionStart ?? 0;
                  const end = el.selectionEnd ?? 0;
                  const selected = value.slice(start, end);
                  const newVal = value.slice(0, start) + wrap + selected + wrap + value.slice(end);
                  onChange(newVal);
                  setTimeout(() => { el.focus(); el.setSelectionRange(start + wrap.length, end + wrap.length); }, 0);
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 26, height: 26, borderRadius: 4, border: 'none', background: 'transparent',
                  cursor: 'pointer', color: 'var(--ax-colors-fg-secondary)', transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--ax-colors-bg-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >{icon}</button>
            ))}
            <div style={{ width: 1, height: 14, background: 'var(--ax-colors-border-secondary)', margin: '0 2px', flexShrink: 0 }} />
            {([
              { icon: <IconListUl size={13} />, title: 'Bullet list', prefix: '- ' },
              { icon: <IconListOl size={13} />, title: 'Numbered list', prefix: '1. ' },
            ] as const).map(({ icon, title, prefix }) => (
              <button
                key={title}
                title={title}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const el = textareaRef.current;
                  if (!el) return;
                  const pos = el.selectionStart ?? 0;
                  const lineStart = value.lastIndexOf('\n', pos - 1) + 1;
                  const newVal = value.slice(0, lineStart) + prefix + value.slice(lineStart);
                  onChange(newVal);
                  setTimeout(() => { el.focus(); el.setSelectionRange(pos + prefix.length, pos + prefix.length); }, 0);
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 26, height: 26, borderRadius: 4, border: 'none', background: 'transparent',
                  cursor: 'pointer', color: 'var(--ax-colors-fg-secondary)', transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--ax-colors-bg-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >{icon}</button>
            ))}
          </Box>
        )}

        <Box w="full" style={{ minHeight: '34px', position: 'relative' }}>
          {inputAgentCtx && (
            <span
              ref={agentPillRef}
              style={{
                left: 0,
                position: 'absolute',
                top: 0,
                zIndex: 1,
              }}
            >
              <Pill readOnly size="xs">
                {inputAgentCtx.handle ?? `@${inputAgentCtx.name}`}
              </Pill>
            </span>
          )}
          <textarea
            ref={textareaRef}
            placeholder={imMode
              ? (isFocused || value ? "type / for commands, @ to tag your agents and teammates" : "Collaborate with your team")
              : "Ask Opal"
            }
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
              color: 'var(--opal-text-body)',
              backgroundColor: 'transparent',
              outline: 'none',
              overflowY: 'hidden',
              boxSizing: 'border-box',
              width: '100%',
              textIndent: agentPillIndent ? `${agentPillIndent}px` : undefined,
            }}
          />
        </Box>

        {/* Slash command Menu — hidden anchor trigger, auto-opens when user types "/" in IM mode */}
        {imMode && (
          <Menu options={slashCommandMenuOptions} size="sm">
            <MenuTrigger asChild>
              <button
                ref={slashTriggerRef}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  bottom: 48,
                  left: 0,
                  width: 1,
                  height: 1,
                  opacity: 0,
                  pointerEvents: 'none',
                  border: 'none',
                  padding: 0,
                  background: 'transparent',
                  cursor: 'default',
                }}
              />
            </MenuTrigger>
            <MenuContent
              align="start"
              side="top"
              sideOffset={8}
              style={{ width: dropdownWidth ? `${dropdownWidth}px` : undefined }}
            />
          </Menu>
        )}

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
            <Menu options={addActionMenuOptions} size="sm">
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
            {!imMode && (
              <Menu options={agentMenuOptions}>
                <MenuTrigger asChild>
                  <Button
                    appearance="subtle"
                    size="sm"
                    icon={<IconSubAgent size={16} />}
                    aria-label="Agent selection"
                    style={{ padding: '4px', height: 'auto', color: 'var(--opal-text-tertiary)' }}
                  />
                </MenuTrigger>
                <MenuContent align="start" side="top" sideOffset={8} />
              </Menu>
            )}
            {!imMode ? (
              <Menu options={skillMenuOptions}>
                <MenuTrigger asChild>
                  <Button
                    appearance="subtle"
                    size="sm"
                    icon={<IconBook size={16} />}
                    aria-label="Skill menu"
                    style={{ padding: '4px', height: 'auto', color: 'var(--opal-text-tertiary)' }}
                  />
                </MenuTrigger>
                <MenuContent align="start" side="top" sideOffset={8} />
              </Menu>
            ) : (
              <Button
                appearance={showFormatBar ? 'default' : 'subtle'}
                size="sm"
                icon={<IconText size={16} />}
                aria-label="Text formatting"
                onClick={() => setShowFormatBar(v => !v)}
                style={{ padding: '4px', height: 'auto', color: showFormatBar ? undefined : 'var(--opal-text-tertiary)' }}
              />
            )}
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
                color: isRecording ? 'var(--ax-colors-fg-error)' : 'var(--opal-text-primary)',
                backgroundColor: isRecording ? 'var(--ax-colors-bg-error-subtlest)' : 'transparent',
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
                icon={isLoading ? <IconCircleStop size={20} /> : hasValue ? <IconCircleArrowUp size={20} /> : <IconArrowUp size={20} />}
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
                    : 'var(--ax-colors-bg-accent)',
                  color: isLoading ? 'var(--ax-colors-fg-accent)' : '#202320',
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
            {filteredUsers.length > 0 && (
              <ListboxGroup>
                <ListboxLabel px="12" pt="8" pb="4">Teammates</ListboxLabel>
                {filteredUsers.map((user, i) => {
                  const globalIdx = i;
                  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
                  return (
                    <ListboxItem
                      key={user.id}
                      addonBefore={
                        <span style={{
                          width: 28, height: 28, borderRadius: '50%',
                          border: '2px solid var(--ax-colors-bg-default)',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden', flexShrink: 0,
                          background: user.avatar ? undefined : '#6d28d9',
                          fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.02em',
                        }}>
                          {user.avatar
                            ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            : initials}
                        </span>
                      }
                      description={user.email}
                      onClick={() => handleSelectAgent(user)}
                      onMouseEnter={() => setFocusedAgentIndex(globalIdx)}
                      style={{ cursor: 'pointer', backgroundColor: globalIdx === focusedAgentIndex ? 'var(--ax-colors-bg-secondary)' : undefined }}
                    >
                      <Text fontSize="md" fontWeight="500" color="fg.default">{user.name}</Text>
                    </ListboxItem>
                  );
                })}
              </ListboxGroup>
            )}
            {filteredVAUs.length > 0 && (
              <ListboxGroup>
                <ListboxLabel px="12" pt="8" pb="4">Virtual Teammates</ListboxLabel>
                {filteredVAUs.map((vau, i) => {
                  const globalIdx = filteredUsers.length + i;
                  const initials = vau.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
                  return (
                    <ListboxItem
                      key={vau.id}
                      addonBefore={
                        <span style={{
                          width: 28, height: 28, borderRadius: '50%',
                          border: '2px solid var(--ax-colors-bg-default)',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden', flexShrink: 0,
                          background: vau.avatar ? undefined : '#6d28d9',
                          fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.02em',
                        }}>
                          {vau.avatar
                            ? <img src={vau.avatar} alt={vau.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            : initials}
                        </span>
                      }
                      description={vau.email}
                      onClick={() => handleSelectAgent(vau)}
                      onMouseEnter={() => setFocusedAgentIndex(globalIdx)}
                      style={{ cursor: 'pointer', backgroundColor: globalIdx === focusedAgentIndex ? 'var(--ax-colors-bg-secondary)' : undefined }}
                    >
                      <Text fontSize="md" fontWeight="500" color="fg.default">{vau.name}</Text>
                    </ListboxItem>
                  );
                })}
              </ListboxGroup>
            )}
            {filteredAgents.length > 0 && (
              <ListboxGroup>
                <ListboxLabel px="12" pt="8" pb="4">Agents</ListboxLabel>
                {filteredAgents.map((agent, i) => {
                  const globalIdx = filteredUsers.length + filteredVAUs.length + i;
                  return (
                    <ListboxItem
                      key={agent.id}
                      addonBefore={agent.emoji
                        ? <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{agent.emoji}</span>
                        : undefined}
                      description={agent.subtitle}
                      onClick={() => handleSelectAgent(agent)}
                      onMouseEnter={() => setFocusedAgentIndex(globalIdx)}
                      style={{ cursor: 'pointer', backgroundColor: globalIdx === focusedAgentIndex ? 'var(--ax-colors-bg-secondary)' : undefined }}
                    >
                      <Box display="flex" alignItems="center" gap="8">
                        <Text fontSize="md" fontWeight="500" color="fg.default">{agent.name}</Text>
                        <Badge variant="subtle" style={{ fontSize: 11, fontWeight: 400 }}>{agent.handle}</Badge>
                      </Box>
                    </ListboxItem>
                  );
                })}
              </ListboxGroup>
            )}
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
