/**
 * API route to generate Stream Chat token
 */

import { getStreamChatService } from '../../services/StreamChatService';

export default async function getStreamChatToken(request, response) {
  try {
    const { userId, userName, userRole } = request.body;

    if (!userId) {
      return response.status(400).json({
        error: 'userId is required'
      });
    }

    const streamChatService = getStreamChatService();

    if (!streamChatService.isInitialized()) {
      return response.status(503).json({
        error: 'Stream Chat service not initialized'
      });
    }

    // Create or update user
    await streamChatService.upsertUser({
      userId,
      name: userName,
      role: userRole || 'visitor'
    });

    // Generate token
    const token = await streamChatService.generateUserToken(userId);

    response.status(200).json({
      token,
      userId,
      apiKey: process.env.STREAM_CHAT_API_KEY
    });
  } catch (error) {
    console.error('Failed to generate Stream Chat token:', error);
    response.status(500).json({
      error: 'Failed to generate token',
      message: error.message
    });
  }
}


