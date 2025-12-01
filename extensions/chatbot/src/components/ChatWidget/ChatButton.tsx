import React from 'react';
import { ChatIcon } from '../icons/ChatIcon';
import { CloseIcon } from '../icons/CloseIcon';
import type { UserRole } from '../../types/chat';
import './ChatButton.scss';

interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
  unreadCount?: number;
  userRole?: UserRole;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  onClick,
  isOpen,
  unreadCount = 0,
  userRole = 'visitor',
}) => {
  const ariaLabel = isOpen 
    ? '关闭聊天' 
    : userRole === 'customer' 
      ? '打开聊天 (已登录)' 
      : '打开聊天 (访客模式)';

  return (
    <button
      className={`chat-button ${isOpen ? 'open' : ''} ${userRole === 'customer' ? 'authenticated' : ''}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {isOpen ? (
        <CloseIcon className="icon close-icon" />
      ) : (
        <>
          <ChatIcon className="icon chat-icon" />
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
          {userRole === 'customer' && (
            <span className="auth-indicator" title="已登录"></span>
          )}
        </>
      )}
    </button>
  );
};


