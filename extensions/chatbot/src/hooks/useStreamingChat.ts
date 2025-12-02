import { useState, useCallback, useEffect, useRef } from 'react';
import chatbotSocketService, { StreamMessage } from '../services/ChatbotSocketService';

/**
 * Message interface
 */
export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  sender: {
    userId: string;
    userName: string;
    role: 'admin' | 'customer' | 'ai';
  };
  timestamp: string;
  messageType?: 'user' | 'assistant';
}

/**
 * useStreamingChat Hook
 * Handles real-time message streaming with WebSocket
 */
export function useStreamingChat(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const streamingMessageRef = useRef<Partial<ChatMessage> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle incoming message chunk
   */
  const handleMessageChunk = useCallback(
    (data: StreamMessage) => {
      if (data.conversationId !== conversationId) return;

      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];

        // If no last message or it's not a streaming message, create new one
        if (!lastMessage || lastMessage.messageType !== 'assistant' || lastMessage.content === undefined) {
          const newMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            conversationId,
            content: data.contentChunk || '',
            sender: {
              userId: 'assistant',
              userName: 'AI Assistant',
              role: 'ai',
            },
            timestamp: data.timestamp,
            messageType: 'assistant',
          };
          streamingMessageRef.current = newMessage;
          return [...prev, newMessage];
        }

        // Append to existing streaming message
        const updatedMessage: ChatMessage = {
          ...lastMessage,
          content: lastMessage.content + (data.contentChunk || ''),
        };
        streamingMessageRef.current = updatedMessage;

        return [...prev.slice(0, -1), updatedMessage];
      });
    },
    [conversationId]
  );

  /**
   * Handle message completion
   */
  const handleMessageComplete = useCallback(
    (data: StreamMessage) => {
      if (data.conversationId !== conversationId) return;

      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];

        // Update the last message with complete content
        if (lastMessage && lastMessage.messageType === 'assistant') {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              content: data.content || lastMessage.content,
            },
          ];
        }

        // Create new message if none exists
        if (data.content) {
          return [
            ...prev,
            {
              id: `msg_${Date.now()}`,
              conversationId,
              content: data.content,
              sender: {
                userId: 'assistant',
                userName: 'AI Assistant',
                role: 'ai',
              },
              timestamp: data.timestamp,
              messageType: 'assistant',
            },
          ];
        }

        return prev;
      });

      setIsLoading(false);
      streamingMessageRef.current = null;
      setError(null);
    },
    [conversationId]
  );

  /**
   * Handle message error
   */
  const handleMessageError = useCallback(
    (data: any) => {
      if (data.conversationId !== conversationId) return;

      setIsLoading(false);
      setError(data.error || 'Failed to get response');

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_error`,
          conversationId,
          content: `Error: ${data.error || 'Failed to get response'}`,
          sender: {
            userId: 'system',
            userName: 'System',
            role: 'ai',
          },
          timestamp: new Date().toISOString(),
          messageType: 'assistant',
        },
      ]);

      streamingMessageRef.current = null;
    },
    [conversationId]
  );

  /**
   * Handle regular message received
   */
  const handleMessageReceived = useCallback(
    (data: any) => {
      if (data.conversationId !== conversationId) return;

      // Skip if it's a message we just sent
      if (data.messageType === 'user') {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            conversationId,
            content: data.content,
            sender: data.sender,
            timestamp: data.timestamp,
            messageType: 'user',
          },
        ]);
      }
    },
    [conversationId]
  );

  /**
   * Handle typing indicator
   */
  const handleTypingIndicator = useCallback(
    (data: any) => {
      if (data.isTyping) {
        setIsTyping(true);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Auto-stop typing after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      } else {
        setIsTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    },
    []
  );

  /**
   * Setup event listeners
   */
  useEffect(() => {
    chatbotSocketService.on('connected', () => {
      setIsConnected(true);
      setError(null);
    });

    chatbotSocketService.on('disconnected', () => {
      setIsConnected(false);
    });

    chatbotSocketService.on('message_chunk', handleMessageChunk);
    chatbotSocketService.on('message_complete', handleMessageComplete);
    chatbotSocketService.on('message_error', handleMessageError);
    chatbotSocketService.on('message_received', handleMessageReceived);
    chatbotSocketService.on('typing_indicator', handleTypingIndicator);

    return () => {
      // Cleanup event listeners
      chatbotSocketService.off('connected', () => {});
      chatbotSocketService.off('disconnected', () => {});
      chatbotSocketService.off('message_chunk', handleMessageChunk);
      chatbotSocketService.off('message_complete', handleMessageComplete);
      chatbotSocketService.off('message_error', handleMessageError);
      chatbotSocketService.off('message_received', handleMessageReceived);
      chatbotSocketService.off('typing_indicator', handleTypingIndicator);

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [
    handleMessageChunk,
    handleMessageComplete,
    handleMessageError,
    handleMessageReceived,
    handleTypingIndicator,
  ]);

  /**
   * Send streaming message
   */
  const sendStreamingMessage = useCallback(
    (content: string, botId?: string) => {
      if (!chatbotSocketService.isConnected()) {
        setError('WebSocket is not connected');
        return;
      }

      setIsLoading(true);
      setError(null);

      // Add user message to state
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          conversationId,
          content,
          sender: {
            userId: 'user',
            userName: 'You',
            role: 'customer',
          },
          timestamp: new Date().toISOString(),
          messageType: 'user',
        },
      ]);

      // Send via socket
      chatbotSocketService.sendStreamingMessage(conversationId, content, botId);
    },
    [conversationId]
  );

  /**
   * Send regular message
   */
  const sendMessage = useCallback(
    (content: string) => {
      if (!chatbotSocketService.isConnected()) {
        setError('WebSocket is not connected');
        return;
      }

      // Add user message to state
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          conversationId,
          content,
          sender: {
            userId: 'user',
            userName: 'You',
            role: 'customer',
          },
          timestamp: new Date().toISOString(),
          messageType: 'user',
        },
      ]);

      // Send via socket
      chatbotSocketService.sendMessage(conversationId, content);
    },
    [conversationId]
  );

  /**
   * Load chat history from server
   */
  const loadHistory = useCallback(
    async (pageNo: number = 1, limit: number = 50) => {
      if (!chatbotSocketService.isConnected()) {
        setError('WebSocket is not connected');
        return;
      }

      setIsLoadingHistory(true);
      setError(null);

      try {
        const result = await chatbotSocketService.loadChatHistory(
          conversationId,
          limit,
          pageNo
        );

        if (result && result.messages) {
          // Merge with existing messages, removing duplicates
          setMessages((prevMessages) => {
            const existingIds = new Set(prevMessages.map((m) => m.id));
            const newMessages = result.messages.filter(
              (m: ChatMessage) => !existingIds.has(m.id)
            );

            // Sort by timestamp (oldest first)
            const allMessages = [...newMessages, ...prevMessages].sort(
              (a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

            return allMessages;
          });

          // Update hasMoreHistory flag
          setHasMoreHistory(result.hasMore || false);

          console.log('Chat history loaded:', {
            loaded: result.messages.length,
            total: result.total,
            hasMore: result.hasMore,
          });
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to load chat history';
        setError(errorMsg);
        console.error('Failed to load chat history:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [conversationId]
  );

  /**
   * Clear messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isLoadingHistory,
    isConnected,
    isTyping,
    error,
    hasMoreHistory,
    sendStreamingMessage,
    sendMessage,
    loadHistory,
    clearMessages,
    joinConversation: () => chatbotSocketService.joinConversation(conversationId),
    leaveConversation: () => chatbotSocketService.leaveConversation(conversationId),
    startTyping: () => chatbotSocketService.startTyping(conversationId),
    stopTyping: () => chatbotSocketService.stopTyping(conversationId),
  };
}

export default useStreamingChat;
