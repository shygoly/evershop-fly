import { registerWidget } from "@evershop/evershop/lib/widget";
import { initializeStreamChatService } from "./services/StreamChatService";
import path from 'path';
import { CONSTANTS } from "@evershop/evershop/lib/helpers";

export default async () => {
  // Extension initialization
  console.log('Chatbot extension with Stream Chat loaded');
  
  // Register Hello Float Widget
  registerWidget({
    type: "hello_float_widget",
    name: "Hello Float Widget",
    description: "A floating hello button widget for testing",
    settingComponent: path.resolve(
      CONSTANTS.LIBPATH,
      "components/widgets/HelloWidgetSetting.js"
    ),
    component: path.resolve(
      CONSTANTS.LIBPATH,
      "components/widgets/HelloWidget.js"
    ),
    enabled: true,
    defaultSettings: {
      text: "Hello, world!",
      className: "",
    },
  });
  
  console.log('Hello Float Widget registered successfully');
  
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
  
  // Initialize Stream Chat Service
  try {
    const streamChatApiKey = process.env.STREAM_CHAT_API_KEY;
    const streamChatApiSecret = process.env.STREAM_CHAT_API_SECRET;
    const streamChatEnabled = process.env.STREAM_CHAT_ENABLED === 'true';
    
    if (streamChatEnabled && streamChatApiKey && streamChatApiSecret) {
      console.log('Initializing Stream Chat service...');
      const streamChatService = initializeStreamChatService({
        apiKey: streamChatApiKey,
        apiSecret: streamChatApiSecret,
        enabled: true
      });
      
      await streamChatService.initialize();
      
      // Create chatbot assistant user if not exists
      await streamChatService.upsertUser({
        userId: 'chatbot-assistant',
        name: 'AI Assistant',
        role: 'admin'
      });
      
      console.log('Stream Chat service initialized successfully');
    } else {
      console.log('Stream Chat is disabled or not configured');
    }
  } catch (error) {
    console.error('Failed to initialize Stream Chat service:', error);
  }
};
