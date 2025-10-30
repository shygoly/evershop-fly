import { Request, Response } from 'express';
import { ChatService } from '../../services/ChatService.js';
import { ChatbotSettingService } from '../../services/ChatbotSettingService.js';
import { chatbotApiClient } from '../../services/ChatbotApiClient.js';

export default async function sendMessage(
  request: Request,
  response: Response,
  next: Function
) {
  try {
    const { shop_id, conversation_id, content, customer_email, customer_name } = request.body;

    if (!shop_id || !content) {
      throw new Error('Shop ID and message content are required');
    }

    // Get or create conversation
    let conversation;
    if (conversation_id) {
      conversation = await ChatService.getConversation(conversation_id);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
    } else {
      conversation = await ChatService.getOrCreateConversation({
        shop_id,
        customer_email: customer_email || 'anonymous@customer.com'
      });
    }

    // Save user message
    await ChatService.saveMessage({
      conversation_id: conversation.conversation_id,
      shop_id,
      sender: 'user',
      content
    });

    // Get chatbot setting
    const setting = await ChatbotSettingService.getByShopId(shop_id);
    
    if (!setting || !setting.bot_id) {
      throw new Error('Chatbot not configured. Please contact store admin.');
    }

    // Call chatbotadmin API to get bot response
    // Note: This will use SSE (Server-Sent Events) for streaming
    const shopInfo = {
      id: shop_id,
      name: setting.shop_name || shop_id
    };

    // For now, we'll make a simple request and return the response
    // In production, you might want to use SSE for real-time streaming
    try {
      const botResponse = await chatbotApiClient.request(shopInfo, {
        path: '/admin-api/mail/coze/chat',
        method: 'POST',
        body: {
          userId: 1, // Can be mapped to customer ID
          content,
          imgPath: []
        }
      });

      // Save bot response
      if (botResponse) {
        await ChatService.saveMessage({
          conversation_id: conversation.conversation_id,
          shop_id,
          sender: 'bot',
          content: typeof botResponse === 'string' ? botResponse : JSON.stringify(botResponse)
        });
      }

      response.$body = {
        success: true,
        data: {
          conversation_id: conversation.conversation_id,
          user_message: content,
          bot_response: botResponse,
          timestamp: new Date()
        }
      };
    } catch (apiError) {
      console.error('Chatbot API error:', apiError);
      
      // Fallback response
      const fallbackMessage = "抱歉，我现在无法回复。请稍后再试或联系客服。";
      
      await ChatService.saveMessage({
        conversation_id: conversation.conversation_id,
        shop_id,
        sender: 'bot',
        content: fallbackMessage
      });

      response.$body = {
        success: true,
        data: {
          conversation_id: conversation.conversation_id,
          bot_response: fallbackMessage,
          error: 'Bot temporarily unavailable'
        }
      };
    }

    next();
  } catch (error: any) {
    response.$body = {
      success: false,
      message: error.message || 'Failed to send message'
    };
    next();
  }
}

