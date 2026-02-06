"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { OpalContextType } from '@/app/context/OpalContext';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isLoading?: boolean;
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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [enableAI, setEnableAI] = useState<boolean>(false);

  // Manual handler to set AND save preference
  const setEnableAIWithStorage = useCallback((enabled: boolean) => {
    setEnableAI(enabled);
    localStorage.setItem('opal_ai_enabled', String(enabled));
  }, []);

  // Consolidated effect: Load preference or apply smart default on mount & path change
  useEffect(() => {
    // Check new key first, then fallback to legacy key
    let saved = localStorage.getItem('opal_ai_enabled');
    if (saved === null) {
      saved = localStorage.getItem('opal_enable_ai');
    }

    if (saved !== null) {
      // If a preference exists, ALWAYS respect it
      setEnableAI(saved === 'true');
    } else {
      // No preference? Use Smart Defaults: ON for CMS edit, OFF for everything else
      const path = opalContext?.currentPage?.path;
      const isCMSEdit = path?.startsWith('/cms/edit');
      setEnableAI(!!isCMSEdit);
    }
  }, [opalContext?.currentPage?.path]);

  // REMOVED: Auto-saving effect. We only save on manual interaction now.

  // Load chat messages when activeChatId changes or storage event triggers
  const loadMessages = useCallback(() => {
    if (!activeChatId) {
      setMessages([]);
      setCurrentChatId(null);
      return;
    }

    try {
      const isMockId = MOCK_CHAT_IDS.has(activeChatId);
      const storageKey = isMockId
        ? `opal_chat_messages_v2_${activeChatId}`
        : `opal_chat_messages_${activeChatId}`;

      const savedMessages = localStorage.getItem(storageKey);

      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length === 0 && isMockId) {
          setMessages(getSeedMessagesForMockChat(activeChatId) ?? []);
        } else {
          setMessages(parsed);
        }
      } else {
        if (isMockId) {
          setMessages(getSeedMessagesForMockChat(activeChatId) ?? []);
        } else {
          setMessages([]);
        }
      }
      setCurrentChatId(activeChatId);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
      setMessages([]);
      setCurrentChatId(activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Listen for storage changes to sync across tabs/components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!activeChatId) return;
      const isMockId = MOCK_CHAT_IDS.has(activeChatId);
      const storageKey = isMockId
        ? `opal_chat_messages_v2_${activeChatId}`
        : `opal_chat_messages_${activeChatId}`;

      if (e.key === storageKey) {
        loadMessages();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeChatId, loadMessages]);

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

  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    // If already loading, getting called again means STOP/CANCEL
    if (isLoading) {
      console.log('🛑 [Opal] User cancelled generation');
      abortControllerRef.current?.abort();
      setIsLoading(false);
      return;
    }

    if (!content.trim()) return;

    setError(undefined);
    setIsLoading(true);

    // Create new controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

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
      if (enableAI) {
        // Call API with context
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userMessage: content.trim(),
            context: opalContext ? {
              currentPage: opalContext.currentPage,
              availableFeatures: opalContext.availableFeatures,
              opalCapabilities: opalContext.opalCapabilities,
            } : undefined,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to get response from Opal');
        }

        if (!response.body) {
          throw new Error('No response body from Opal');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          // Update message with accumulated content and turn off loading flag once we have content
          updateMessage(loadingMessage.id, {
            content: accumulatedContent,
            isLoading: false,
          });
        }
      } else {
        // Simulation delay for mock data
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(resolve, 800);
          controller.signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });

        const mockResponses = [
          "That's an interesting question about optimization. Based on your current context, I'd recommend looking at your mobile conversion rates first.",
          "I've analyzed your request. You might find better results by grouping those navigation items into a single 'Help' menu as we discussed.",
          "Great idea for a campaign! To start, we should define your primary KPIs and target segments.",
          "Optimizely's Opal AI can help you with that! Try selecting one of the specialized agents for more tailored advice."
        ];
        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

        // Simulate streaming for mock data
        const words = randomResponse.split(' ');
        let simulatedContent = '';

        for (let i = 0; i < words.length; i++) {
          if (controller.signal.aborted) break;

          simulatedContent += (i === 0 ? '' : ' ') + words[i];
          updateMessage(loadingMessage.id, {
            content: simulatedContent,
            isLoading: false,
          });
          // Small delay between words
          await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 40));
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation aborted successfully');
        // Optionally remove the loading message or mark it as interrupted
      } else {
        console.error('Error sending message:', err);
        setError('Failed to send message. Please try again.');
        // Remove loading message on genuine error
        setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading, addMessage, updateMessage, opalContext, enableAI]);

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
    togglePanel,
    closePanel,
    openPanel,
    setInputValue,
    sendMessage,
    clearHistory,
    enableAI,
    setEnableAI: setEnableAIWithStorage,
  };
}