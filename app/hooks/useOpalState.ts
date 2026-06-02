"use client";

import { useState, useCallback, useEffect } from 'react';
import { OpalContextType } from '@/app/context/OpalContext';
import { useOpalGeneration } from '@/app/context/OpalGenerationContext';
import { useExperimentResultsContext } from '@/app/context/ExperimentResultsContext';
import type { ExperimentSummaryPayload } from '@/app/web-experimentation/optimizations/[id]/results/types';
import { EXPERIMENT_SUMMARY_STEP_LABELS } from '@/app/web-experimentation/optimizations/[id]/results/summaryStepLabels';
import type { ExperimentCreationAgentPayload } from '@/app/components/Opal/experimentCreationAgentTypes';
import {
  addDynamicOptimization,
  setPendingVariationBuild,
} from '@/app/web-experimentation/optimizations/dynamicOptimizationStorage';
import {
  buildExperimentCreatedRationale,
  parseExperimentCreationRunMessage,
} from '@/app/web-experimentation/optimizations/parseExperimentCreationRun';
import type { Optimization } from '@/app/web-experimentation/optimizations/mockData';
import { useOpalPageEditing } from './useOpalPageEditing';

const EXPERIMENT_CREATION_STEPS = [
  'Parsing experiment inputs',
  'Creating A/B test',
  'Applying targeting from your context',
  'Saving experiment draft',
] as const;

const EXPERIMENT_CREATION_STEP_MS = 1150;

// Generic loading steps shown for all regular prompts
const GENERIC_LOADING_STEPS = [
  'Reading your message…',
  'Searching knowledge base…',
  'Analyzing context…',
  'Generating response…',
  'Finalizing…',
];
const GENERIC_STEP_MS = 700;

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'event';
  content: string;
  timestamp: number;
  isLoading?: boolean;
  /** When set, message is rendered as experiment summary block */
  type?: 'text' | 'experiment_summary' | 'experiment_creation_agent';
  payload?: ExperimentSummaryPayload | ExperimentCreationAgentPayload;
  /** Shown in loading state for summary requests */
  loadingSteps?: string[];
  /** Current step index while running summary pipeline (0..length-1 active, length = all done) */
  loadingStepIndex?: number;
  versions?: string[];
  currentVersionIndex?: number;
  messageType?: string;
  metadata?: any;
  // Agent conversation fields
  eventType?: 'agent-start' | 'agent-end';
  agentEmoji?: string;
  agentName?: string;
  // Per-message author identity (for multi-user mock threads)
  authorName?: string;
  authorAvatar?: string;
  /** Subtitle shown on avatar hover — e.g. VAU template name */
  authorTitle?: string;
  /** When true, render the author's avatar inline to the left of the bubble
   * (Slack-style) instead of in a header row above it. */
  authorInlineAvatar?: boolean;
  /** Optional key used to look up an inline card rendered below this message */
  cardAfterKey?: string;
};

export type OpalState = {
  isOpen: boolean;
  messages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;
  error?: string;
};

const PANEL_STATE_KEY = 'opal_panel_state';
const OPAL_LOADER_DEV_STORAGE_KEY = 'opal_loader_dev';
const DEV_LOADER_MIN_PREVIEW_MS = 8500;
const CMP_OPAL_MODE_KEY = 'cmp_opal_mode';
const CMP_OPAL_QUICK_DRAFT_KEY = 'cmp_opal_quick_draft';

type UseOpalStateProps = {
  activeChatId?: string | null;
  onMessageSent?: (content: string) => void;
  opalContext?: OpalContextType;
  /** Used after Opal creates an experiment from the adaptive card (smooth navigation to Variations). */
  onNavigate?: (path: string) => void;
};

const MOCK_CHAT_IDS = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9']);

function isLoaderDevEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = JSON.parse(localStorage.getItem(OPAL_LOADER_DEV_STORAGE_KEY) ?? '{}');
    return !!raw?.enabled;
  } catch {
    return false;
  }
}

function sleepWithAbort(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });
}

function getSeedMessagesForMockChat(activeChatId: string): ChatMessage[] | null {
  const base = Date.now() - 1000 * 60 * 60 * 24 * 3;
  const mk = (n: number, role: ChatMessage['role'], content: string): ChatMessage => ({
    id: `${activeChatId}-${role}-${n}`,
    role,
    content,
    timestamp: base + n * 1000 * 60 * 3,
  });

  switch (activeChatId) {
    case '1':
      return [
        mk(1, 'user', 'How do I start with a mobile-first strategy?'),
        mk(2, 'assistant', 'Mobile-first is more than just design; it\'s about performance and content prioritization. Start by auditing your current mobile traffic. Which devices are most common?'),
        mk(3, 'user', 'Mostly iPhones, about 60%.'),
        mk(4, 'assistant', 'Got it. For iOS users, prioritize touch targets (min 44px) and leverage system fonts. Have you considered using a CDN to optimize image delivery for these devices?'),
      ];
    case '2':
      return [
        mk(1, 'user', 'What\'s a usability audit exactly?'),
        mk(2, 'assistant', 'It\'s a systematic review of your site to find "friction points." I recommend starting with a heuristic evaluation—checking against the 10 usability principles by Nielsen.'),
        mk(3, 'user', 'Can you list them?'),
        mk(4, 'assistant', '1. Visibility of system status\n2. Match between system and the real world\n3. User control and freedom\n4. Consistency and standards...\n\nWould you like me to analyze your homepage against the first three?'),
      ];
    case '3':
      return [
        mk(1, 'user', 'How do I make my team more user-centered?'),
        mk(2, 'assistant', 'It starts with empathy. I suggest setting up "User Fridays" where the whole team watches actual session recordings or interview clips together.'),
        mk(3, 'user', 'We have recordings but nobody watches them.'),
        mk(4, 'assistant', 'Common problem! Try "Highlight Reels." Send out a 2-minute clip every Tuesday morning of a user struggling with a key task. It creates urgency.'),
      ];
    case '4':
      return [
        mk(1, 'user', 'How can I improve my checkout conversion?'),
        mk(2, 'assistant', 'Checkout is where "last-mile friction" happens. Have you looked at your mobile vs desktop drop-off rates for the shipping address page?'),
        mk(3, 'user', 'Mobile is way higher.'),
        mk(4, 'assistant', 'Likely due to form fatigue. Try implementing Google Pay or Apple Pay to bypass the shipping/billing forms entirely. It usually bumps mobile conversion by 15-20%.'),
      ];
    case '5':
      return [
        mk(1, 'user', 'Our design-to-dev handoff is messy.'),
        mk(2, 'assistant', 'That\'s usually a documentation gap. Are you using a shared design system or just handing over static Figma files?'),
        mk(3, 'user', 'Mostly static files with some comments.'),
        mk(4, 'assistant', 'I recommend moving to "Living Specs." Link your Figma components directly to your React components in a tool like Storybook. It bridges the gap.'),
      ];
    case '6':
      return [
        mk(1, 'user', 'Is accessibility just about alt text?'),
        mk(2, 'assistant', 'Not at all! Alt text is vital, but keyboard navigation and color contrast are equally important. Can a user navigate your entire main menu using only the Tab key?'),
        mk(3, 'user', 'Probably not.'),
        mk(4, 'assistant', 'That’s a great place to start. Let’s look at your "Focus States"—the visual outline that shows where the keyboard cursor is. Many sites hide it, which breaks accessibility.'),
      ];
    case '7':
      return [
        mk(1, 'user', 'My navigation menu is too cluttered.'),
        mk(2, 'assistant', 'Clutter leads to decision paralysis. Use the "Rule of 7"—try to keep your top-level categories to seven or fewer. What are your current categories?'),
        mk(3, 'user', 'We have about 14 items in the top bar.'),
        mk(4, 'assistant', 'That\'s definitely too many! Group them into broader "Mega Menus." For example, "Support," "FAQs," and "Contact" can all go under a single "Help" menu.'),
      ];
    case '8':
      return [
        mk(1, 'user', 'How do I build a design system from scratch?'),
        mk(2, 'assistant', 'Start small with "Atoms"—colors, typography, and spacing. Don\'t try to build every component at once. What\'s your primary brand color?'),
        mk(3, 'user', 'It\'s a deep navy blue.'),
        mk(4, 'assistant', 'Navy is great for trust. Build out a palette around it: a light tint for backgrounds, a vibrant accent for buttons, and a gray scale for text. I can help you pick the hex codes.'),
      ];
    case '9':
      return [
        mk(1, 'user', 'I want to improve site search.'),
        mk(2, 'assistant', 'Search is a conversation. Start by looking at "Null Results"—what are people searching for that returns nothing?'),
        mk(3, 'user', 'People search for "returns" but we call it "exchanges."'),
        mk(4, 'assistant', 'That\'s a classic synonym gap. You should map "returns" to the "exchanges" results page in your search settings. It immediately reduces frustration.'),
      ];
    default:
      return null;
  }
}

const SUMMARY_STEP_MS = 1180;

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getImageGenResponse(content: string, returnTo = '/cmp/library'): string {
  const prompt = content.trim();
  const lower = prompt.toLowerCase();
  const draftImage = "/hero-cycling.jpg";
  const isVideoRequest =
    lower.includes('video') ||
    lower.includes('clip') ||
    lower.includes('reel') ||
    lower.includes('animation');

  if (isVideoRequest) {
    return [
      `I created a quick video concept for: "${prompt}"`,
      "",
      "I kept it aligned to Stride's premium endurance positioning and social-safe pacing.",
      "",
      "If you want a full editing surface next, we can add the advanced video canvas in the next prototype pass.",
    ].join("\n");
  }

  return [
    `I created a quick image draft for: "${prompt}"`,
    "",
    "It follows Stride's athletic visual direction, preserves copy space, and stays inside brand-safe composition rules.",
    "",
    `![Triathlon draft](${draftImage})`,
    "",
    `[Use advanced editor](/cmp/opal-studio/canvas?flow=create&asset=image&prompt=${encodeURIComponent(prompt)}&draft=${encodeURIComponent(draftImage)}&returnTo=${encodeURIComponent(returnTo)})`,
  ].join("\n");
}

function getCmpOpalMode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(CMP_OPAL_MODE_KEY);
  } catch {
    return null;
  }
}

export function useOpalState({
  activeChatId,
  onMessageSent,
  opalContext,
  onNavigate,
}: UseOpalStateProps = {}) {
  const { optimizationId } = useExperimentResultsContext();
  const {activePageId, onPageUpdate, getCurrentPageData} = useOpalGeneration();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [editTrigger, setEditTrigger] = useState<{pageId: string; instructions: string; contentTypeId: string} | null>(null);

  // Hook to handle page editing with @content_creation
  useOpalPageEditing(editTrigger, () => {
    setEditTrigger(null);
    setIsLoading(false);
  });

  // Load chat messages when activeChatId changes
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      setCurrentChatId(null);
      return;
    }

    // If we're already on this chat, don't reload
    // This prevents double-loading but allows switching to a new chat with same ID if needed (rare)
    if (activeChatId === currentChatId) return;

    try {
      // Use a versioned key for mock chats to force the new diversified data
      const isMockId = MOCK_CHAT_IDS.has(activeChatId);
      const storageKey = isMockId
        ? `opal_chat_messages_v2_${activeChatId}`
        : `opal_chat_messages_${activeChatId}`;

      const savedMessages = localStorage.getItem(storageKey);

      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // If the built-in mock chats are empty, seed them once for the demo window.
        if (Array.isArray(parsed) && parsed.length === 0 && MOCK_CHAT_IDS.has(activeChatId)) {
          const seeded = getSeedMessagesForMockChat(activeChatId) ?? [];
          setMessages(seeded);
        } else {
          setMessages(parsed);
        }
      } else {
        // If there is no stored history yet and this is one of the built-in chats (1–9),
        // seed it with mock messages. New chats (UUIDs) remain empty.
        if (MOCK_CHAT_IDS.has(activeChatId)) {
          setMessages(getSeedMessagesForMockChat(activeChatId) ?? []);
        } else {
          setMessages([]);
        }
      }
      setCurrentChatId(activeChatId);
    } catch (err) {
      console.error('Failed to load chat messages from localStorage:', err);
      setMessages([]);
      setCurrentChatId(activeChatId);
    }
  }, [activeChatId, currentChatId]);

  // Load panel state on mount
  useEffect(() => {
    try {
      const savedPanelState = localStorage.getItem(PANEL_STATE_KEY);
      if (savedPanelState) {
        const { isOpen: savedIsOpen } = JSON.parse(savedPanelState);
        setIsOpen(savedIsOpen);
      }
    } catch (err) {
      console.error('Failed to load Opal panel state from localStorage:', err);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    // Only save if activeChatId matches currentChatId (meaning we've finished loading the new chat)
    if (!activeChatId || !currentChatId || activeChatId !== currentChatId) return;

    try {
      const isMockId = MOCK_CHAT_IDS.has(activeChatId);
      const storageKey = isMockId
        ? `opal_chat_messages_v2_${activeChatId}`
        : `opal_chat_messages_${activeChatId}`;

      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (err) {
      console.error('Failed to save messages to localStorage:', err);
    }
  }, [messages, activeChatId, currentChatId]);

  // Save panel state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PANEL_STATE_KEY, JSON.stringify({ isOpen }));
    } catch (err) {
      console.error('Failed to save panel state to localStorage:', err);
    }
  }, [isOpen]);

  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openPanel = useCallback(() => {
    setIsOpen(true);
  }, []);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const showExperimentCreationAgent = useCallback(
    (payload: ExperimentCreationAgentPayload) => {
      setIsOpen(true);
      addMessage({
        role: 'assistant',
        content: '',
        type: 'experiment_creation_agent',
        payload,
      });
    },
    [addMessage],
  );

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }, []);

  const handleChatError = useCallback(
    (errorMessage: string, loadingMessageId: string) => {
      setError(errorMessage);
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessageId));
    },
    [],
  );

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const trimmed = content.trim();

    // Detect @content_creation mention for page editing
    const isContentCreation = trimmed.includes('@content_creation') && activePageId;

    console.log('[useOpalState] sendMessage called:', {
      trimmed,
      hasContentCreation: trimmed.includes('@content_creation'),
      activePageId,
      isContentCreation,
    });

    if (isContentCreation) {
      // Extract instructions (remove @content_creation mention)
      const instructions = trimmed.replace(/@content_creation\s*/g, '').trim();

      console.log('[useOpalState] Content creation detected, instructions:', instructions);

      // TODO: Get contentTypeId from OpalGenerationContext once it's available there
      // For now, we'll need to get it from the page object in the edit page context
      // This is a temporary limitation - contentTypeId should be passed to setActivePage

      // Get current page from persistent storage
      let pages: any[] = [];
      try {
        pages = JSON.parse(localStorage.getItem('pages_v5') || '[]');
      } catch (parseError) {
        console.error('[useOpalState] Failed to parse pages_v5 from localStorage', parseError);
        setError('Cannot edit page right now because saved page data is invalid. Please refresh and try again.');
        return;
      }
      const currentPage = pages.find((p: any) => p.id === activePageId);

      console.log('[useOpalState] Found page:', currentPage);

      if (!currentPage || !currentPage.contentTypeId) {
        console.error('[useOpalState] Page or content type not found');
        setError("Cannot edit page: page or content type not found");
        return;
      }

      // Trigger page editing flow via hook
      console.log('[useOpalState] Setting edit trigger:', {
        pageId: activePageId,
        instructions,
        contentTypeId: currentPage.contentTypeId,
      });

      setEditTrigger({
        pageId: activePageId,
        instructions,
        contentTypeId: currentPage.contentTypeId,
      });

      setIsLoading(true);
      return;
    }

    // Detect brief/content generation on CMP task pages
    const lower = trimmed.toLowerCase();
    const isBriefRequest = (lower.includes('generate') || lower.includes('create')) && lower.includes('brief');
    const isOnTaskPage = typeof window !== 'undefined' && /^\/cmp\/task\//.test(window.location.pathname);

    if (isBriefRequest && isOnTaskPage) {
      const taskId = window.location.pathname.split('/cmp/task/')[1]?.split('/')[0] || '';
      let taskTitle = "Task";
      try {
        const tasks = JSON.parse(localStorage.getItem('cmpTasks') || '[]');
        taskTitle = tasks.find((t: any) => t.id === taskId)?.title || "Task";
      } catch { /* use default */ }

      addMessage({
        role: 'user',
        content: trimmed,
        authorName: 'Jamie Chen',
      });

      addMessage({
        role: 'assistant',
        content: `Let's create a brief for "${taskTitle}". Fill in the details below.`,
        messageType: 'brief-wizard-step',
        metadata: {
          blockType: 'brief-wizard-step',
          taskId,
          taskTitle,
        },
      });

      return;
    }

    const isExperimentCreationRun = trimmed.startsWith('Run the Experiment Creation agent');
    const isSummarizeRequest =
      optimizationId != null &&
      (trimmed.toLowerCase().includes('summarize') || trimmed.toLowerCase().includes('summary'));

    setError(undefined);
    setIsLoading(true);

    // Add user message
    addMessage({
      role: 'user',
      content: trimmed,
      authorName: 'Jamie Chen',
    });

    if (onMessageSent) {
      onMessageSent(trimmed);
    }

    setInputValue('');

    const summaryStepLabels = [...EXPERIMENT_SUMMARY_STEP_LABELS];

    // Add loading message with steps for every prompt
    const loadingMessage = addMessage({
      role: 'assistant',
      content: '',
      isLoading: true,
      loadingSteps: isSummarizeRequest
        ? summaryStepLabels
        : isExperimentCreationRun
        ? [...EXPERIMENT_CREATION_STEPS]
        : GENERIC_LOADING_STEPS,
      loadingStepIndex: 0,
    });

    let genericStepCancelled = false;
    try {
      if (isExperimentCreationRun) {
        for (let i = 0; i < EXPERIMENT_CREATION_STEPS.length; i++) {
          updateMessage(loadingMessage.id, { loadingStepIndex: i });
          await delay(EXPERIMENT_CREATION_STEP_MS);
        }
        updateMessage(loadingMessage.id, {
          loadingStepIndex: EXPERIMENT_CREATION_STEPS.length,
        });
        await delay(420);

        const fields = parseExperimentCreationRunMessage(trimmed);
        const newId = `opal-exp-${Date.now()}`;
        const optimization: Optimization = {
          id: newId,
          name: fields.name,
          description:
            fields.description ||
            fields.hypothesis ||
            'A/B test created from your draft idea in Opal.',
          type: 'A/B Test',
          status: 'Not Started',
          modified: new Date().toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        };
        addDynamicOptimization(optimization);
        const rationale = buildExperimentCreatedRationale(fields);

        updateMessage(loadingMessage.id, {
          isLoading: false,
          loadingSteps: undefined,
          loadingStepIndex: undefined,
          content: `Your A/B test “${optimization.name}” has been created.\n\n${rationale}`,
        });

        setPendingVariationBuild({
          optimizationId: newId,
          experimentName: fields.name,
          description: fields.description,
          hypothesis: fields.hypothesis,
          destination: fields.destination,
        });

        await delay(580);
        onNavigate?.(`/web-experimentation/optimizations/${newId}`);
        setIsLoading(false);
        return;
      }

      if (isSummarizeRequest) {
        for (let i = 0; i < summaryStepLabels.length; i++) {
          updateMessage(loadingMessage.id, { loadingStepIndex: i });
          await delay(SUMMARY_STEP_MS);
        }
        updateMessage(loadingMessage.id, {
          loadingStepIndex: summaryStepLabels.length,
        });
      }

      // For regular prompts (not summarize, not experiment creation), run the generic
      // step animation concurrently while the API call is in progress.
      if (!isSummarizeRequest && !isExperimentCreationRun) {
        (async () => {
          for (let i = 1; i < GENERIC_LOADING_STEPS.length; i++) {
            await delay(GENERIC_STEP_MS);
            if (genericStepCancelled) return;
            updateMessage(loadingMessage.id, { loadingStepIndex: i });
          }
        })();
      }

      // Check if we're iterating on a generated page
      // If there's an activePageId, we're in iteration mode
      let isIterating = !!activePageId;

      let requestBody: any;
      if (isIterating) {
        const currentPageData = getCurrentPageData();
        console.log('[Opal Iteration] Current page data:', {
          hasData: !!currentPageData,
          outlinesCount: currentPageData?.outlines?.length,
          hasVariations: !!currentPageData?.variations,
        });

        // Guard against null page data - fall back to regular chat mode
        if (!currentPageData) {
          console.warn('[Opal Iteration] Page data is null, falling back to regular chat mode');
          isIterating = false;
        } else {
          requestBody = {
            pageId: activePageId,
            feedback: content.trim(),
            currentPage: currentPageData,
          };
        }
      }

      if (!isIterating) {
        const isOpalStudio = opalContext?.currentPage?.path?.startsWith('/cmp/opal-studio');
        const isLibraryImageGen =
          opalContext?.currentPage?.path?.startsWith('/cmp/library') &&
          getCmpOpalMode() === 'image-gen';

        if (isOpalStudio || isLibraryImageGen) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const returnTo = opalContext?.currentPage?.path?.startsWith('/cmp/library')
            ? opalContext.currentPage.path
            : '/cmp/library';
          const responseContent = getImageGenResponse(content.trim(), returnTo);
          updateMessage(loadingMessage.id, {
            content: responseContent,
            isLoading: false,
          });
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(
                CMP_OPAL_QUICK_DRAFT_KEY,
                JSON.stringify({
                  prompt: content.trim(),
                  image: '/hero-cycling.jpg',
                  returnTo,
                }),
              );
            } catch (storageError) {
              console.error('Failed to persist CMP Opal quick draft:', storageError);
            }
          }
          setIsLoading(false);
          return;
        }

        requestBody = {
          userMessage: trimmed,
          context: opalContext
            ? {
                currentPage: opalContext.currentPage,
                availableFeatures: opalContext.availableFeatures,
                opalCapabilities: opalContext.opalCapabilities,
              }
            : undefined,
          experimentContext:
            optimizationId && isSummarizeRequest
              ? { optimizationId, requestSummary: true }
              : undefined,
        };
      }

      // Call appropriate API endpoint
      const response = await fetch(isIterating ? '/api/iterate-page' : '/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to get response from Opal. Please try again.';
        try {
          const errorData = await response.json();
          if (errorData?.error && typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          }
        } catch {
          /* ignore */
        }
        handleChatError(errorMessage, loadingMessage.id);
        return;
      }

      let data: { response?: string; summary?: unknown };
      try {
        data = await response.json();
      } catch {
        handleChatError('Invalid response from Opal. Please try again.', loadingMessage.id);
        return;
      }

      // Update loading message with actual response
      if (isIterating) {
        // Handle iteration response
        updateMessage(loadingMessage.id, {
          content: (data.summary as string) || 'Changes applied successfully!',
          isLoading: false,
        });

        // Apply the changes to the page if we have the callback
        if ((data as any).outlines && onPageUpdate) {
          console.log('[Opal Iteration] Applying changes to page');
          onPageUpdate({
            outlines: (data as any).outlines,
            variationId: 'original',
          });
        } else {
          console.warn('[Opal Iteration] Cannot apply changes - missing outlines or callback');
        }
      } else if (data.summary != null) {
        const summary = data.summary as ExperimentSummaryPayload;
        // Replace loading message with experiment summary message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingMessage.id
              ? {
                ...msg,
                content: summary.title,
                isLoading: false,
                type: 'experiment_summary' as const,
                payload: summary,
                loadingSteps: undefined,
                loadingStepIndex: undefined,
              }
              : msg,
          ),
        );
      } else {
        updateMessage(loadingMessage.id, {
          content: data.response || "Sorry, I couldn't generate a response.",
          isLoading: false,
          loadingSteps: undefined,
          loadingStepIndex: undefined,
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const message =
        err instanceof Error && err.message === 'Failed to get response from Opal'
          ? err.message
          : 'Failed to send message. Please try again.';
      genericStepCancelled = true;
      handleChatError(message, loadingMessage.id);
    } finally {
      genericStepCancelled = true;
      setIsLoading(false);
    }
  }, [isLoading, addMessage, updateMessage, handleChatError, opalContext, optimizationId, onNavigate, activePageId, onPageUpdate, onMessageSent, getCurrentPageData]);

  const regenerate = useCallback(async (assistantMessageId: string) => {
    if (isLoading) return;

    // Find the message and the preceding user message content
    const currentMessages = await new Promise<ChatMessage[]>(resolve => {
      setMessages(prev => { resolve(prev); return prev; });
    });
    const idx = currentMessages.findIndex(m => m.id === assistantMessageId);
    if (idx < 0) return;
    const userMsg = [...currentMessages].slice(0, idx).reverse().find(m => m.role === 'user');
    if (!userMsg) return;
    const userContent = userMsg.content;
    const oldMessage = currentMessages[idx];

    // Replace the assistant message with a loading state (keep id stable)
    setIsLoading(true);
    setError(undefined);
    setMessages(prev => prev.map(m =>
      m.id === assistantMessageId
        ? { ...m, content: '', isLoading: true }
        : m
    ));

    try {
      const requestBody = {
        userMessage: userContent,
        context: opalContext ? {
          currentPage: opalContext.currentPage,
          availableFeatures: opalContext.availableFeatures,
          opalCapabilities: opalContext.opalCapabilities,
        } : undefined,
      };
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error('Failed to regenerate response');
      const data = await response.json();
      const newContent = data.response || 'Sorry, I couldn\'t generate a response.';

      // Add new version and display it
      setMessages(prev => prev.map(m => {
        if (m.id !== assistantMessageId) return m;
        const existingVersions = m.versions ?? [oldMessage.content];
        const newVersions = [...existingVersions, newContent];
        return {
          ...m,
          content: newContent,
          isLoading: false,
          versions: newVersions,
          currentVersionIndex: newVersions.length - 1,
        };
      }));
    } catch (err) {
      console.error('Error regenerating:', err);
      setError('Failed to regenerate. Please try again.');
      setMessages(prev => prev.map(m =>
        m.id === assistantMessageId
          ? { ...m, content: oldMessage.content, isLoading: false }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, opalContext]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    if (activeChatId) {
      const isMockId = MOCK_CHAT_IDS.has(activeChatId);
      const storageKey = isMockId
        ? `opal_chat_messages_v2_${activeChatId}`
        : `opal_chat_messages_${activeChatId}`;
      localStorage.removeItem(storageKey);
    }
  }, [activeChatId]);

  return {
    isOpen,
    messages,
    inputValue,
    isLoading,
    error,
    isInputDisabled,
    togglePanel,
    closePanel,
    openPanel,
    showExperimentCreationAgent,
    setInputValue,
    setInputDisabled: setIsInputDisabled,
    sendMessage,
    regenerate,
    switchVersion: (id: string, versionIndex: number, content: string) => {
      updateMessage(id, { content, currentVersionIndex: versionIndex });
    },
    clearHistory,
    addMessage,
    updateMessage,
    removeMessage,
  };
}
