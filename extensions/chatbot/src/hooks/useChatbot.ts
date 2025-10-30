/**
 * useChatbot Hook
 * Main hook for managing chat state and interactions
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { chatbotNodeClient } from '../services/ChatbotNodeClient';
import { useChatStorage } from './useChatStorage';
import type { Message, UseChatbotOptions, UseChatbotReturn } from '../types/chat';

export const useChatbot = ({
  shopId,
  botId,
  customerId,
}: UseChatbotOptions): UseChatbotReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { saveMessages, loadMessages, getSessionId } = useChatStorage();
  const sessionIdRef = useRef<string>('');
  const assistantMessageRef = useRef<string>('');

  /**
   * Initialize session and load history
   */
  useEffect(() => {
    sessionIdRef.current = getSessionId();
    const history = loadMessages();
    if (history.length > 0) {
      setMessages(history);
    }
  }, [getSessionId, loadMessages]);

  /**
   * Save messages whenever they change
   */
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, saveMessages]);

  /**
   * Toggle chat window
   */
  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
    setError(null);
  }, []);

  /**
   * Send a chat message
   */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessageId = `msg_${Date.now()}_user`;
      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
        status: 'sending',
      };

      // Add user message immediately
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);
      assistantMessageRef.current = '';

      try {
        const userId = customerId || sessionIdRef.current;
        const assistantMessageId = `msg_${Date.now()}_assistant`;
        
        // Mark user message as sent
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessageId ? { ...msg, status: 'sent' } : msg
          )
        );
        
        setIsTyping(true);
        assistantMessageRef.current = '';

        // Use ChatbotNodeClient to send message with streaming
        await chatbotNodeClient.sendChatMessage(
          text.trim(),
          userId,
          // onChunk
          (chunk: string) => {
            assistantMessageRef.current += chunk;
            
            // Update or add assistant message
            setMessages((prev) => {
              const existing = prev.find((m) => m.id === assistantMessageId);
              if (existing) {
                return prev.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: assistantMessageRef.current }
                    : m
                );
              } else {
                return [
                  ...prev,
                  {
                    id: assistantMessageId,
                    role: 'assistant' as const,
                    content: assistantMessageRef.current,
                    timestamp: new Date(),
                  },
                ];
              }
            });
          },
          // onComplete
          () => {
            setIsTyping(false);
            setIsLoading(false);
          },
          // onError
          (error: Error) => {
            console.error('Chat error:', error);
            setError(error.message);
            setIsTyping(false);
            setIsLoading(false);
            
            // Mark user message as error
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === userMessageId ? { ...msg, status: 'error' } : msg
              )
            );
          }
        );
      } catch (err) {
        console.error('Failed to send message:', err);
        setError(err instanceof Error ? err.message : 'Failed to send message');
        setIsLoading(false);
        setIsTyping(false);

        // Mark user message as error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessageId ? { ...msg, status: 'error' } : msg
          )
        );
      }
    },
    [isLoading, shopId, botId, customerId]
  );

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Reset chat session
   */
  const resetChat = useCallback(() => {
    clearMessages();
    sessionIdRef.current = getSessionId();
  }, [clearMessages, getSessionId]);

  return {
    isOpen,
    messages,
    isLoading,
    isTyping,
    error,
    toggleChat,
    sendMessage,
    clearMessages,
    resetChat,
  };
};

