import React from 'react';
import { ChatIcon } from '../icons/ChatIcon';
import { CloseIcon } from '../icons/CloseIcon';
import './ChatButton.scss';

interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
  unreadCount?: number;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  onClick,
  isOpen,
  unreadCount = 0,
}) => {
  return (
    <button
      className={`chat-button ${isOpen ? 'open' : ''}`}
      onClick={onClick}
      aria-label={isOpen ? '关闭聊天' : '打开聊天'}
    >
      {isOpen ? (
        <CloseIcon className="icon close-icon" />
      ) : (
        <>
          <ChatIcon className="icon chat-icon" />
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </>
      )}
    </button>
  );
};

