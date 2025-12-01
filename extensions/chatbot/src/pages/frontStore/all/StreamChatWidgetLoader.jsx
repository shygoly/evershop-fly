/**
 * Stream Chat Widget Loader
 * Loads on all front store pages
 */

import React, { useEffect, useState } from 'react';
import { StreamChatWidget } from '../../../components/StreamChatWidget/StreamChatWidget';

export default function StreamChatWidgetLoader() {
  const [chatConfig, setChatConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Get user ID from session or generate new one
        let userId = localStorage.getItem('chatbot_user_id');
        if (!userId) {
          userId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('chatbot_user_id', userId);
        }

        // Check if user is logged in (from EverShop session)
        const customerData = window.__INITIAL_STATE__?.customer;
        const isLoggedIn = Boolean(customerData?.customerId);
        const userName = customerData?.fullName || customerData?.email || 'Guest';
        const userRole = isLoggedIn ? 'customer' : 'visitor';

        setChatConfig({
          userId,
          userName,
          userRole,
          shopId: process.env.CHATBOT_SHOP_ID || 'evershop-fly'
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize chat widget:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    // Check if chatbot is enabled
    const chatbotEnabled = window.__CHATBOT_CONFIG__?.enabled !== false;
    if (chatbotEnabled) {
      initializeChat();
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading || error || !chatConfig) {
    return null;
  }

  return <StreamChatWidget {...chatConfig} />;
}

export const layout = {
  areaId: 'body',
  sortOrder: 998
};

