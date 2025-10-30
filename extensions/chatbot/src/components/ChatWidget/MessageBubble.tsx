import React from 'react';
import type { Message } from '../../types/chat';
import './MessageBubble.scss';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { role, content, timestamp, status } = message;

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`message-bubble ${role}`}>
      <div className="message-content">
        {content}
      </div>
      <div className="message-meta">
        <span className="message-time">{formatTime(timestamp)}</span>
        {status && role === 'user' && (
          <span className={`message-status ${status}`}>
            {status === 'sending' && '发送中...'}
            {status === 'sent' && '✓'}
            {status === 'error' && '✗'}
          </span>
        )}
      </div>
    </div>
  );
};

