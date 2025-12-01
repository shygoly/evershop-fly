import React from 'react';
import { ChatButton } from './ChatButton';
import { ChatWindow } from './ChatWindow';
import { useChatbot } from '../../hooks/useChatbot';
import type { ChatWidgetProps } from '../../types/chat';

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
  
  const {
    isOpen,
    messages,
    isLoading,
    isTyping,
    toggleChat,
    sendMessage,
  } = useChatbot({ 
    shopId, 
    botId, 
    customerId,
    customerEmail,
    customerName,
    userRole: effectiveUserRole,
  });

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
          isLoading={isLoading}
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


