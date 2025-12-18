"use client";

import { useState, useCallback, useEffect } from 'react';

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

const STORAGE_KEY = 'opal_chat_history';
const PANEL_STATE_KEY = 'opal_panel_state';

export function useOpalState() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY);
      const savedPanelState = localStorage.getItem(PANEL_STATE_KEY);
      
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      
      if (savedPanelState) {
        const { isOpen: savedIsOpen } = JSON.parse(savedPanelState);
        setIsOpen(savedIsOpen);
      }
    } catch (err) {
      console.error('Failed to load Opal state from localStorage:', err);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (err) {
      console.error('Failed to save messages to localStorage:', err);
    }
  }, [messages]);

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

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(undefined);
    setIsLoading(true);

    // Add user message
    const userMessage = addMessage({
      role: 'user',
      content: content.trim(),
    });

    // Clear input
    setInputValue('');

    // Add loading message
    const loadingMessage = addMessage({
      role: 'assistant',
      content: '',
      isLoading: true,
    });

    try {
      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Opal');
      }

      const data = await response.json();
      
      // Update loading message with actual response
      updateMessage(loadingMessage.id, {
        content: data.response || 'Sorry, I couldn\'t generate a response.',
        isLoading: false,
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Remove loading message on error
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, addMessage, updateMessage]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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
  };
}