import React from 'react';
import PropTypes from 'prop-types';

export default function ChatbotWidget({ setting, customer }) {
  // Check if chatbot is enabled via environment variable
  const chatbotEnabled = process.env.CHATBOT_ENABLED === 'true';
  const chatbotNodeUrl = process.env.CHATBOT_NODE_URL;
  const shopId = process.env.CHATBOT_SHOP_ID;

  // Only render if properly configured
  if (!chatbotEnabled || !chatbotNodeUrl || !shopId) {
    return null;
  }

  // Only render if we have bot configuration
  if (!setting || !setting.botId) {
    console.log('Chatbot widget: No bot configuration found');
    return null;
  }

  // Get customer ID if logged in
  const customerId = customer?.customerId || customer?.uuid || null;

  // Inject chatbot-node widget script
  const widgetUrl = `${chatbotNodeUrl}/widget/chatbot-widget.js`;
  
  return (
    <>
      <script
        src={widgetUrl}
        data-api-url={chatbotNodeUrl}
        data-bot-id={setting.botId}
        data-shop-id={shopId}
        data-customer-id={customerId || ''}
        async
      />
    </>
  );
}

ChatbotWidget.propTypes = {
  setting: PropTypes.shape({
    shopId: PropTypes.string,
    shopName: PropTypes.string,
    shopLogoUrl: PropTypes.string,
    botId: PropTypes.string
  }),
  customer: PropTypes.shape({
    customerId: PropTypes.string,
    uuid: PropTypes.string
  })
};

export const layout = {
  areaId: 'body',
  sortOrder: 999 // Render last so it appears on top
};

export const query = `
  query Query {
    setting: chatbotSetting(shopId: "evershop-default") {
      shopId
      shopName
      shopLogoUrl
      botId
    }
    customer: currentCustomer {
      customerId
      uuid
    }
  }
`;

