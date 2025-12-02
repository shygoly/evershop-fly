import React, { useEffect, useState } from 'react';
import { ChatButton } from './ChatButton';
import { ChatWindow } from './ChatWindow';
import { useChatbot } from '../../hooks/useChatbot';
import { useStreamingChat } from '../../hooks/useStreamingChat';
import chatbotSocketService from '../../services/ChatbotSocketService';
import type { ChatWidgetProps } from '../../types/chat';

// Generate a unique conversation ID based on customer/visitor
const generateConversationId = (customerId?: string, visitorId?: string): string => {
  if (customerId) {
    return `customer_${customerId}`;
  }
  // Visitor ID is usually stored in session/cookie
  return `visitor_${visitorId || Math.random().toString(36).substr(2, 9)}`;
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  shopId,
  botId,
  customerId,
  customerEmail,
  customerName,
  userRole,
}) => {
  // Determine effective user role
  const effectiveUserRole = userRole || (customerId ? 'customer' : 'visitor');

  // Generate conversation ID
  const conversationId = generateConversationId(customerId);

  // Try to use streaming chat first, fall back to regular chat
  const [useStreaming, setUseStreaming] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Regular chat hook (fallback)
  const regularChat = useChatbot({
    shopId,
    botId,
    customerId,
    customerEmail,
    customerName,
    userRole: effectiveUserRole,
  });

  // Streaming chat hook (primary)
  const streamingChat = useStreamingChat(conversationId);

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        // Get server URL from environment or current host
        const serverUrl = process.env.CHATBOT_SERVER_URL ||
          `${window.location.protocol}//${window.location.host}`;

        await chatbotSocketService.connect({
          serverUrl,
          userId: customerId || 'visitor',
          userName: customerName || 'Guest',
          role: effectiveUserRole as 'admin' | 'customer',
          sessionId: 'session_' + Math.random().toString(36).substr(2, 9),
        });

        // Join conversation room
        chatbotSocketService.joinConversation(conversationId);
        setUseStreaming(true);

        // Load chat history after successful connection
        if (streamingChat.loadHistory) {
          try {
            await streamingChat.loadHistory(1, 50);
            console.log('Chat history loaded successfully');
          } catch (historyError) {
            console.warn('Failed to load chat history:', historyError);
            // Don't fail the entire initialization if history loading fails
          }
        }
      } catch (error) {
        console.warn('Failed to initialize WebSocket, falling back to HTTP:', error);
        setUseStreaming(false);
      }
    };

    if (isOpen) {
      initializeSocket();
    }

    return () => {
      // Cleanup on unmount
      if (isOpen) {
        chatbotSocketService.leaveConversation(conversationId);
      }
    };
  }, [isOpen, conversationId, customerId, customerName, effectiveUserRole, streamingChat]);

  // Select the appropriate chat interface
  const selectedChat = useStreaming && streamingChat.isConnected ? streamingChat : regularChat;

  // Map streaming messages to Message format (add role property)
  const messages = (selectedChat.messages || regularChat.messages).map((msg: any) => ({
    id: msg.id,
    role: msg.role || msg.messageType || (msg.sender?.role === 'ai' ? 'assistant' : 'user'),
    content: msg.content,
    timestamp: msg.timestamp,
    status: msg.status,
  }));
  const isLoading = selectedChat.isLoading !== undefined ? selectedChat.isLoading : regularChat.isLoading;
  const isTyping = selectedChat.isTyping !== undefined ? selectedChat.isTyping : regularChat.isTyping;
  const isLoadingHistory = streamingChat.isLoadingHistory || false;

  const sendMessage = (content: string) => {
    if (useStreaming && streamingChat.isConnected) {
      streamingChat.sendStreamingMessage(content, botId);
    } else {
      regularChat.sendMessage(content);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      regularChat.toggleChat?.();
    }
  };

  return (
    <>
      <ChatButton
        onClick={toggleChat}
        isOpen={isOpen}
        unreadCount={0}
        userRole={effectiveUserRole}
      />

      {isOpen && (
        <ChatWindow
          messages={messages}
          isLoading={isLoading || isLoadingHistory}
          isTyping={isTyping}
          onClose={toggleChat}
          onSendMessage={sendMessage}
          userRole={effectiveUserRole}
          customerName={customerName}
        />
      )}
    </>
  );
};


