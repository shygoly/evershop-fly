/**
 * API route to send message via Stream Chat
 * Integrates with chatbot-node for AI responses
 */

import { getStreamChatService } from '../../services/StreamChatService';

export default async function sendStreamMessage(request, response) {
  try {
    const { userId, channelId, message, userRole } = request.body;

    if (!userId || !message) {
      return response.status(400).json({
        error: 'userId and message are required'
      });
    }

    const streamChatService = getStreamChatService();

    if (!streamChatService.isInitialized()) {
      return response.status(503).json({
        error: 'Stream Chat service not initialized'
      });
    }

    // Send message and trigger AI response
    await streamChatService.sendMessage(
      channelId,
      userId,
      message,
      userRole || 'visitor'
    );

    response.status(200).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    response.status(500).json({
      error: 'Failed to send message',
      message: error.message
    });
  }
}


