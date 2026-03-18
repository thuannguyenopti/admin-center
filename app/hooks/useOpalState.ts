"use client";

import { useState, useCallback, useEffect } from 'react';
import { OpalContextType } from '@/app/context/OpalContext';
import { useOpalGeneration } from '@/app/context/OpalGenerationContext';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isLoading?: boolean;
  messageType?: 'preflight-progress' | 'preflight-results' | 'page-generation-progress' | 'page-generation-complete';
  metadata?: {
    checklist?: Array<{
      label: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
    }>;
    auditResult?: any; // Will be typed as PreflightAuditResult when imported
    loading?: boolean;
    loadingMessage?: string;
  };
};

export type OpalState = {
  isOpen: boolean;
  messages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;
  error?: string;
};

const PANEL_STATE_KEY = 'opal_panel_state';

type UseOpalStateProps = {
  activeChatId?: string | null;
  onMessageSent?: (content: string) => void;
  opalContext?: OpalContextType;
};

const MOCK_CHAT_IDS = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9']);

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

export function useOpalState({ activeChatId, onMessageSent, opalContext }: UseOpalStateProps = {}) {
  const {activePageId, onPageUpdate, getCurrentPageData} = useOpalGeneration();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isInputDisabled, setIsInputDisabled] = useState(false);

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

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(undefined);
    setIsLoading(true);

    // Add user message
    const userMessage = addMessage({
      role: 'user',
      content: content.trim(),
    });

    // Notify parent about new message
    if (onMessageSent) {
      onMessageSent(content.trim());
    }

    // Clear input
    setInputValue('');

    // Add loading message
    const loadingMessage = addMessage({
      role: 'assistant',
      content: '',
      isLoading: true,
    });

    try {
      // Check if we're iterating on a generated page
      // If there's an activePageId, we're in iteration mode
      const isIterating = !!activePageId;

      let requestBody: any;
      if (isIterating) {
        const currentPageData = getCurrentPageData();
        console.log('[Opal Iteration] Current page data:', {
          hasData: !!currentPageData,
          outlinesCount: currentPageData?.outlines?.length,
          hasVariations: !!currentPageData?.variations,
        });
        requestBody = {
          pageId: activePageId,
          feedback: content.trim(),
          currentPage: currentPageData,
        };
      } else {
        requestBody = {
          userMessage: content.trim(),
          context: opalContext
            ? {
                currentPage: opalContext.currentPage,
                availableFeatures: opalContext.availableFeatures,
                opalCapabilities: opalContext.opalCapabilities,
              }
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
        throw new Error('Failed to get response from Opal');
      }

      const data = await response.json();

      // Update loading message with actual response
      if (isIterating) {
        // Handle iteration response
        updateMessage(loadingMessage.id, {
          content: data.summary || 'Changes applied successfully!',
          isLoading: false,
        });

        // Apply the changes to the page if we have the callback
        if (data.outlines && onPageUpdate) {
          console.log('[Opal Iteration] Applying changes to page');
          onPageUpdate({
            outlines: data.outlines,
            variationId: 'original',
          });
        } else {
          console.warn('[Opal Iteration] Cannot apply changes - missing outlines or callback');
        }
      } else {
        // Handle regular chat response
        updateMessage(loadingMessage.id, {
          content: data.response || 'Sorry, I couldn\'t generate a response.',
          isLoading: false,
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');

      // Remove loading message on error
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, addMessage, updateMessage, opalContext, activePageId, onPageUpdate]);

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
    setInputValue,
    setInputDisabled: setIsInputDisabled,
    sendMessage,
    clearHistory,
    addMessage,
    updateMessage,
    removeMessage,
  };
}