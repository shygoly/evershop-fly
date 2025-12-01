import React, { useState, useEffect } from 'react';
import { StreamChatWidget } from '../../../components/StreamChatWidget/StreamChatWidget';
import './AdminChatPanel.scss';

export default function AdminChatPanel() {
  const [chatConfig, setChatConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAdminChat = async () => {
      try {
        // 从后台会话获取管理员信息
        const adminUser = window.__INITIAL_STATE__?.admin || {};
        const adminId = `admin-${adminUser.id || 'unknown'}`;
        const adminName = adminUser.name || adminUser.email || 'Admin';
        const adminEmail = adminUser.email || 'admin@example.com';

        console.log('Initializing admin chat with:', {
          adminId,
          adminName,
          adminEmail
        });

        setChatConfig({
          userId: adminId,
          userName: adminName,
          userEmail: adminEmail,
          userRole: 'admin', // 重要：标记为管理员角色
          shopId: process.env.CHATBOT_SHOP_ID || 'evershop-fly'
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize admin chat:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeAdminChat();
  }, []);

  if (isLoading) {
    return (
      <div className="admin-chat-panel loading">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>初始化聊天面板...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-chat-panel error">
        <div className="error-message">
          <p>加载失败: {error}</p>
          <button onClick={() => window.location.reload()}>重新加载</button>
        </div>
      </div>
    );
  }

  if (!chatConfig) {
    return null;
  }

  return (
    <div className="admin-chat-panel">
      <StreamChatWidget {...chatConfig} />
    </div>
  );
}

export const layout = {
  areaId: 'adminPage',
  sortOrder: 5
};
