import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';

// Lazy load ChatWidget component for better performance
const ChatWidget = lazy(() => import('../../../components/ChatWidget').then(module => ({ default: module.ChatWidget })));

export default function NativeChatWidget({ setting, customer }) {
  // Check if chatbot is enabled via environment variable
  const chatbotEnabled = process.env.CHATBOT_ENABLED === 'true';
  const shopId = process.env.CHATBOT_SHOP_ID;

  // Only render if properly configured
  if (!chatbotEnabled || !shopId) {
    return null;
  }

  // Only render if we have bot configuration
  if (!setting || !setting.botId) {
    console.log('Chatbot widget: No bot configuration found');
    return null;
  }

  // Get customer ID if logged in
  const customerId = customer?.customerId || customer?.uuid || undefined;
  const customerEmail = customer?.email || undefined;
  const customerName = customer?.fullName || undefined;
  
  // Determine user role based on customer presence
  const userRole = customerId ? 'customer' : 'visitor';

  return (
    <Suspense fallback={null}>
      <ChatWidget
        shopId={shopId}
        botId={setting.botId}
        customerId={customerId}
        customerEmail={customerEmail}
        customerName={customerName}
        userRole={userRole}
      />
    </Suspense>
  );
}

NativeChatWidget.propTypes = {
  setting: PropTypes.shape({
    shopId: PropTypes.string,
    shopName: PropTypes.string,
    shopLogoUrl: PropTypes.string,
    botId: PropTypes.string
  }),
  customer: PropTypes.shape({
    customerId: PropTypes.string,
    uuid: PropTypes.string,
    email: PropTypes.string,
    fullName: PropTypes.string
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
      email
      fullName
    }
  }
`;


