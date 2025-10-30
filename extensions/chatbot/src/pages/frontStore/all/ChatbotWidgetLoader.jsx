/**
 * Alternative loader for ChatWidget that doesn't rely on GraphQL
 * Loads setting from API and injects chatbot-node widget
 */

import React, { useState, useEffect } from 'react';

export default function ChatbotWidgetLoader() {
  const [botId, setBotId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Check environment configuration
  const chatbotEnabled = process.env.CHATBOT_ENABLED === 'true';
  const chatbotNodeUrl = process.env.CHATBOT_NODE_URL;
  const shopId = process.env.CHATBOT_SHOP_ID;

  useEffect(() => {
    if (!chatbotEnabled || !chatbotNodeUrl || !shopId) {
      setLoaded(true);
      return;
    }

    // Load chatbot setting to get bot ID
    async function loadBotId() {
      try {
        const response = await fetch(`/api/chatbot/status?shop_id=${shopId}`);
        const result = await response.json();

        if (result.success && result.data?.setting?.bot_id) {
          setBotId(result.data.setting.bot_id);
        }
      } catch (error) {
        console.error('Failed to load chatbot setting:', error);
      } finally {
        setLoaded(true);
      }
    }

    loadBotId();
  }, [chatbotEnabled, chatbotNodeUrl, shopId]);

  // Don't render until loaded
  if (!loaded) {
    return null;
  }

  // Don't render if not properly configured
  if (!chatbotEnabled || !chatbotNodeUrl || !shopId || !botId) {
    return null;
  }

  // Inject chatbot-node widget script
  const widgetUrl = `${chatbotNodeUrl}/widget/chatbot-widget.js`;
  
  return (
    <script
      src={widgetUrl}
      data-api-url={chatbotNodeUrl}
      data-bot-id={botId}
      data-shop-id={shopId}
      data-customer-id=""
      async
    />
  );
}

export const layout = {
  areaId: 'body',
  sortOrder: 999
};

