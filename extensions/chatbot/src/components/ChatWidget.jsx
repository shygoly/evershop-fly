import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import './ChatWidget.scss';

export default function ChatWidget({ shopId, shopName, shopLogo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history when opening chat
  useEffect(() => {
    if (isOpen && conversationId) {
      loadChatHistory();
    }
  }, [isOpen, conversationId]);

  // Load chat history
  const loadChatHistory = async () => {
    if (!conversationId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/chatbot/chat/history?conversation_id=${conversationId}`);
      const result = await response.json();

      if (result.success && result.data.messages) {
        setMessages(result.data.messages.map(msg => ({
          id: msg.message_id,
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.created_at)
        })));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage = {
      id: Date.now(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chatbot/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shop_id: shopId || 'evershop-default',
          conversation_id: conversationId,
          content: inputValue,
          customer_email: localStorage.getItem('customer_email') || ''
        })
      });

      const result = await response.json();

      if (result.success) {
        // Save conversation ID for future messages
        if (result.data.conversation_id) {
          setConversationId(result.data.conversation_id);
        }

        // Add bot response
        if (result.data.bot_response) {
          const botMessage = {
            id: Date.now() + 1,
            content: typeof result.data.bot_response === 'string' 
              ? result.data.bot_response 
              : 'Received response',
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
        }
      } else {
        // Show error message
        const errorMessage = {
          id: Date.now() + 1,
          content: result.message || '抱歉，发送失败，请重试。',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Send message error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        content: '抱歉，网络连接失败，请检查网络后重试。',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle chat window
  const toggleChat = () => {
    setIsOpen(!isOpen);
    
    // Send welcome message on first open
    if (!isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: 0,
        content: `您好！欢迎来到${shopName || '我们的商店'}！我是AI智能客服，有什么可以帮助您的吗？`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  return (
    <div className="chatbot-widget">
      {/* Chat Button */}
      {!isOpen && (
        <button
          className="chat-button"
          onClick={toggleChat}
          aria-label="Open chat"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 9H17M7 13H13M12 20C8.13 20 5 16.87 5 13C5 9.13 8.13 6 12 6C15.87 6 19 9.13 19 13C19 14.39 18.59 15.68 17.88 16.77C17.82 16.87 17.79 16.98 17.79 17.09L17.85 18.63C17.87 18.95 17.58 19.21 17.27 19.14L15.73 18.79C15.6 18.76 15.46 18.77 15.35 18.84C14.28 19.45 13 19.79 11.65 19.79"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Notification badge */}
          <span className="badge">1</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="header-content">
              {shopLogo && (
                <img src={shopLogo} alt={shopName} className="shop-logo" />
              )}
              <div className="shop-info">
                <h3>{shopName || 'AI 客服'}</h3>
                <p className="status">
                  <span className="status-dot"></span>
                  在线
                </p>
              </div>
            </div>
            <button
              className="close-button"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>加载中...</p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                  >
                    {message.sender === 'bot' && (
                      <div className="message-avatar">
                        {shopLogo ? (
                          <img src={shopLogo} alt="Bot" />
                        ) : (
                          <div className="avatar-placeholder">🤖</div>
                        )}
                      </div>
                    )}
                    <div className="message-bubble">
                      <div className="message-content">{message.content}</div>
                      <div className="message-time">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="chat-input">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入您的问题..."
              rows={1}
              disabled={isSending}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
              className="send-button"
              aria-label="Send message"
            >
              {isSending ? (
                <div className="sending-spinner"></div>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Powered by */}
          <div className="chat-footer">
            <span className="powered-by">
              Powered by <strong>AI Assistant</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

ChatWidget.propTypes = {
  shopId: PropTypes.string,
  shopName: PropTypes.string,
  shopLogo: PropTypes.string
};

ChatWidget.defaultProps = {
  shopId: 'evershop-default',
  shopName: 'AI 客服',
  shopLogo: null
};

