import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { AuthBanner } from './AuthBanner';
import { CloseIcon } from '../icons/CloseIcon';
import type { Message, UserRole } from '../../types/chat';
import './ChatWindow.scss';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => void;
  botName?: string;
  logoUrl?: string;
  userRole?: UserRole;
  customerName?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  isTyping,
  onClose,
  onSendMessage,
  botName = '智能客服',
  logoUrl,
  userRole = 'visitor',
  customerName,
}) => {
  // Handle login click - redirect to account page
  const handleLoginClick = () => {
    window.location.href = '/account/login';
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="header-info">
          {logoUrl && (
            <img src={logoUrl} alt="logo" className="bot-logo" />
          )}
          <span className="bot-name">{botName}</span>
        </div>
        <button
          className="close-button"
          onClick={onClose}
          aria-label="关闭"
        >
          <CloseIcon className="close-icon" />
        </button>
      </div>

      {/* Auth status banner */}
      <AuthBanner 
        userRole={userRole} 
        customerName={customerName}
        onLoginClick={handleLoginClick}
      />

      <div className="chat-body">
        <MessageList messages={messages} />
        {isTyping && (
          <div className="typing-container">
            <TypingIndicator />
          </div>
        )}
      </div>

      <div className="chat-footer">
        {userRole === 'visitor' && (
          <div className="chat-footer-hint">
            As a guest, I can help with products, promotions, and policies
          </div>
        )}
        <MessageInput onSend={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};


