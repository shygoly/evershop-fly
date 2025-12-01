/**
 * useChatStorage Hook
 * Manages chat message persistence and session ID
 */

import { useCallback } from 'react';
import type { Message, UseChatStorageReturn } from '../types/chat';

const CACHE_KEY = 'chatbot_messages';
const SESSION_KEY = 'chatbot_session_id';
const MAX_CACHED_MESSAGES = 100;
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const useChatStorage = (): UseChatStorageReturn => {
  /**
   * Save messages to localStorage
   */
  const saveMessages = useCallback((messages: Message[]) => {
    try {
      // Keep only last N messages to avoid storage limits
      const toCache = messages.slice(-MAX_CACHED_MESSAGES);
      
      const storageData = {
        messages: toCache,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error('Failed to save chat messages:', error);
    }
  }, []);

  /**
   * Load messages from localStorage
   */
  const loadMessages = useCallback((): Message[] => {
    try {
      const data = localStorage.getItem(CACHE_KEY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      
      // Check if data is expired
      const isExpired = Date.now() - parsed.timestamp > SESSION_EXPIRY;
      if (isExpired) {
        localStorage.removeItem(CACHE_KEY);
        return [];
      }

      // Convert timestamp strings back to Date objects
      return parsed.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      return [];
    }
  }, []);

  /**
   * Get or create session ID
   */
  const getSessionId = useCallback((): string => {
    try {
      let sessionId = localStorage.getItem(SESSION_KEY);
      
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem(SESSION_KEY, sessionId);
      }
      
      return sessionId;
    } catch (error) {
      console.error('Failed to get session ID:', error);
      // Return a temporary session ID
      return `temp_${Date.now()}`;
    }
  }, []);

  /**
   * Clear chat history
   */
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
  }, []);

  return {
    saveMessages,
    loadMessages,
    getSessionId,
    clearHistory,
  };
};


