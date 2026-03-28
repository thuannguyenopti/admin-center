"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';

export type ChatHistoryItem = {
  id: string;
  title: string;
  date: Date;
  hasSmile?: boolean;
  hasRedDot?: boolean;
  isPinned?: boolean;
};

export type OpalMode = 'docked' | 'popped-out';

const HISTORY_STORAGE_KEY = 'opal_chat_history_items';
const MODE_STORAGE_KEY = 'opal_panel_mode';
const HISTORY_VISIBLE_KEY = 'opal_history_visible';
const ACTIVE_CHAT_ID_KEY = 'opal_active_chat_id';

// Mock chat history data
const mockChatHistory: ChatHistoryItem[] = [
  {
    id: '1',
    title: 'Creating a Mobile-First Design Strategy: An Actionable Plan',
    date: new Date(),
    hasSmile: true,
  },
  {
    id: '2',
    title: 'Conducting a Usability Audit: A Detailed Action Plan',
    date: new Date(),
  },
  {
    id: '3',
    title: 'Designing for User-Centeredness: A Proven Action Plan',
    date: new Date(),
    hasSmile: true,
  },
  {
    id: '4',
    title: 'Enhancing User Experience: A Comprehensive Action Plan',
    date: new Date(),
  },
  {
    id: '5',
    title: 'Streamlining Design Processes for Efficient Delivery',
    date: new Date(Date.now() - 86400000),
    hasRedDot: true,
  },
  {
    id: '6',
    title: 'Implementing Accessibility Standards: A Pragmatic Action Plan',
    date: new Date(Date.now() - 86400000),
  },
  {
    id: '7',
    title: 'Conducting a Usability Audit: A Detailed Action Plan',
    date: new Date(Date.now() - 86400000),
  },
  {
    id: '8',
    title: 'Developing an Effective Design System: A Structured Action Plan',
    date: new Date(Date.now() - 172800000),
  },
  {
    id: '9',
    title: 'Improving Website Navigation and Accessibility: An Action Plan',
    date: new Date(Date.now() - 172800000),
  },
];

export function useOpalHistory() {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [mode, setMode] = useState<OpalMode>('docked');

  // Load from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
      const savedHistoryVisible = localStorage.getItem(HISTORY_VISIBLE_KEY);
      const savedActiveChatId = localStorage.getItem(ACTIVE_CHAT_ID_KEY);

      const loadedHistory: ChatHistoryItem[] = savedHistory
        ? JSON.parse(savedHistory).map((item: any) => ({
            ...item,
            date: new Date(item.date),
          }))
        : mockChatHistory;

      setChatHistory(loadedHistory);

      // Prefer restoring previously selected chat; otherwise select the first chat if any.
      const initialActive =
        (savedActiveChatId && loadedHistory.some(h => h.id === savedActiveChatId) && savedActiveChatId) ||
        (loadedHistory.length > 0 ? loadedHistory[0].id : null);
      setActiveChat(initialActive);

      if (savedMode) {
        setMode(savedMode as OpalMode);
      }

      if (savedHistoryVisible) {
        setIsHistoryVisible(JSON.parse(savedHistoryVisible));
      }
    } catch (err) {
      console.error('Failed to load history from localStorage:', err);
      setChatHistory(mockChatHistory);
      setActiveChat(mockChatHistory.length > 0 ? mockChatHistory[0].id : null);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(chatHistory));
    } catch (err) {
      console.error('Failed to save history to localStorage:', err);
    }
  }, [chatHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch (err) {
      console.error('Failed to save mode to localStorage:', err);
    }
  }, [mode]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_VISIBLE_KEY, JSON.stringify(isHistoryVisible));
    } catch (err) {
      console.error('Failed to save history visibility to localStorage:', err);
    }
  }, [isHistoryVisible]);

  // Persist active chat selection
  useEffect(() => {
    try {
      if (activeChat) {
        localStorage.setItem(ACTIVE_CHAT_ID_KEY, activeChat);
      } else {
        localStorage.removeItem(ACTIVE_CHAT_ID_KEY);
      }
    } catch (err) {
      console.error('Failed to save active chat id to localStorage:', err);
    }
  }, [activeChat]);

  // Filter and group chat history
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return chatHistory;
    
    const query = searchQuery.toLowerCase();
    return chatHistory.filter(item => 
      item.title.toLowerCase().includes(query)
    );
  }, [chatHistory, searchQuery]);

  const groupedHistory = useMemo(() => {
    const groups: { [key: string]: ChatHistoryItem[] } = {
      Today: [],
      Yesterday: [],
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    filteredHistory.forEach(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);

      if (itemDate.getTime() === today.getTime()) {
        groups.Today.push(item);
      } else if (itemDate.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(item);
      } else {
        const monthDay = itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!groups[monthDay]) {
          groups[monthDay] = [];
        }
        groups[monthDay].push(item);
      }
    });

    return groups;
  }, [filteredHistory]);

  const toggleHistory = useCallback(() => {
    setIsHistoryVisible(prev => !prev);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'docked' ? 'popped-out' : 'docked');
  }, []);

  const createNewChat = useCallback(() => {
    const newChat: ChatHistoryItem = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      date: new Date(),
    };
    setChatHistory(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
    return newChat.id;
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChatHistory(prev => {
      const next = prev.filter(item => item.id !== id);
      return next;
    });
    if (activeChat === id) {
      // If the active chat is deleted, fall back to the next available chat (top of list)
      setActiveChat(prevActive => (prevActive === id ? null : prevActive));
    }
  }, [activeChat]);

  const selectChat = useCallback((id: string) => {
    setActiveChat(id);
  }, []);

  const updateChat = useCallback((id: string, updates: Partial<ChatHistoryItem>) => {
    setChatHistory(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  return {
    chatHistory: filteredHistory,
    allChatHistory: chatHistory,
    groupedHistory,
    activeChat,
    searchQuery,
    isHistoryVisible,
    mode,
    setSearchQuery,
    toggleHistory,
    toggleMode,
    createNewChat,
    deleteChat,
    selectChat,
    updateChat,
  };
}
