/**
 * StreamChat-like Widget (no Stream Chat SDK)
 * Uses chatbot-node SSE streaming via server proxy
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import './StreamChatWidget.scss';

type UserRole = 'visitor' | 'customer';

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface StreamChatWidgetProps {
  userId: string;
  userName?: string;
  userRole?: UserRole;
  shopId: string;
}

export const StreamChatWidget: React.FC<StreamChatWidgetProps> = ({
  userId,
  userName,
  userRole = 'visitor',
  shopId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const assistantWelcome = useMemo<MessageItem>(() => ({
    id: `m-${Date.now()}-welcome`,
    role: 'assistant',
    content: '你好！我可以帮你查询商品、库存、物流与店铺政策等问题～'
  }), []);

  useEffect(() => {
    // Initialize with one welcome message once
    setMessages([assistantWelcome]);
  }, [assistantWelcome]);

  useEffect(() => {
    // Auto scroll to bottom on new messages
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) setUnreadCount(0);
  };

  async function sendMessage() {
    const text = input.trim();
    if (!text || isSending) return;

    const userMessage: MessageItem = {
      id: `m-${Date.now()}-u`,
      role: 'user',
      content: text
    };
    const assistantMessage: MessageItem = {
      id: `m-${Date.now()}-a`,
      role: 'assistant',
      content: ''
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chatbot/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId,
          userRole,
          shopId
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Chat stream failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.substring(6));
            if (data.type === 'chunk' && data.content) {
              setMessages(prev => prev.map(m => m.id === assistantMessage.id ? { ...m, content: m.content + data.content } : m));
            } else if (data.type === 'done' || data.type === 'complete') {
              // stream finished
            } else if (data.type === 'error') {
              throw new Error(data.message || 'Chat error');
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => prev.map(m => m.id === assistantMessage.id ? { ...m, content: '抱歉，服务暂时不可用，请稍后再试。' } : m));
      if (!isOpen) setUnreadCount(c => c + 1);
      // eslint-disable-next-line no-console
      console.error('Chat error:', err);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="stream-chat-widget">
      <button
        className="stream-chat-toggle-button"
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        {unreadCount > 0 && (
          <span className="stream-chat-unread-badge">{unreadCount}</span>
        )}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
        </svg>
      </button>

      {isOpen && (
        <div className="stream-chat-window">
          <div className="str-chat__channel-header" style={{ padding: 12 }}>
            <div style={{ fontWeight: 600 }}>{userName || '游客'}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>正在与 {shopId} 智能助手对话</div>
          </div>
          <div ref={listRef} className="str-chat__list" style={{ flex: 1, overflowY: 'auto' }}>
            {messages.map(m => (
              <div key={m.id} className={`str-chat__message-simple ${m.role === 'user' ? 'str-chat__message-simple--me' : ''}`} style={{ margin: '8px 12px' }}>
                <div className="str-chat__message-simple-text-inner" style={{ padding: '10px 12px', borderRadius: 8 }}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div className="str-chat__input-flat" style={{ display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              placeholder={isSending ? '发送中...' : '输入消息...'}
              disabled={isSending}
              style={{ flex: 1, padding: '10px 12px', borderRadius: 8 }}
            />
            <button className="str-chat__send-button" onClick={sendMessage} disabled={isSending || !input.trim()} style={{ padding: '8px 14px', color: '#fff', borderRadius: 8 }}>
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamChatWidget;

