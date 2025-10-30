import { addProcessor } from "@evershop/evershop/lib/util/registry";

export default () => {
  // Extension initialization
  console.log('Chatbot extension loaded');
  
  // Check if chatbot is enabled via environment variable
  const chatbotEnabled = process.env.CHATBOT_ENABLED === 'true';
  const chatbotNodeUrl = process.env.CHATBOT_NODE_URL;
  const shopId = process.env.CHATBOT_SHOP_ID;
  
  if (!chatbotEnabled) {
    console.log('Chatbot is disabled (CHATBOT_ENABLED != true)');
    return;
  }
  
  if (!chatbotNodeUrl || !shopId) {
    console.warn('Chatbot is enabled but missing CHATBOT_NODE_URL or CHATBOT_SHOP_ID');
    return;
  }
  
  console.log(`Chatbot enabled for shop: ${shopId}, URL: ${chatbotNodeUrl}`);
};

