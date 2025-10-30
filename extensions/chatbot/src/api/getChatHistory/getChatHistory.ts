import { Request, Response } from 'express';
import { ChatService } from '../../services/ChatService.js';

export default async function getChatHistory(
  request: Request,
  response: Response,
  next: Function
) {
  try {
    const { conversation_id } = request.query;

    if (!conversation_id || typeof conversation_id !== 'string') {
      throw new Error('Conversation ID is required');
    }

    // Get conversation
    const conversation = await ChatService.getConversation(conversation_id);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get messages
    const messages = await ChatService.getMessages(conversation_id);

    response.$body = {
      success: true,
      data: {
        conversation,
        messages
      }
    };

    next();
  } catch (error: any) {
    response.$body = {
      success: false,
      message: error.message || 'Failed to get chat history'
    };
    next();
  }
}

