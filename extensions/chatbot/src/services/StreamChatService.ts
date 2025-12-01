/**
 * Stream Chat Service
 * Integrates with Stream Chat API and chatbot-node backend
 */

import { StreamChat } from 'stream-chat';
import { chatbotNodeClient } from './ChatbotNodeClient';

interface StreamChatConfig {
  apiKey: string;
  apiSecret: string;
  enabled: boolean;
}

interface UserInfo {
  userId: string;
  customerId?: string;
  email?: string;
  name?: string;
  role?: 'visitor' | 'customer' | 'admin';
}

export class StreamChatService {
  private client: StreamChat | null = null;
  private config: StreamChatConfig;
  private initialized: boolean = false;

  constructor(config: StreamChatConfig) {
    this.config = config;
  }

  /**
   * Initialize Stream Chat client
   */
  async initialize(): Promise<void> {
    if (this.initialized || !this.config.enabled) {
      return;
    }

    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        console.warn('Stream Chat API credentials not configured');
        return;
      }

      this.client = StreamChat.getInstance(this.config.apiKey, this.config.apiSecret);
      this.initialized = true;
      console.log('Stream Chat service initialized');
    } catch (error) {
      console.error('Failed to initialize Stream Chat:', error);
      throw error;
    }
  }

  /**
   * Create or update user in Stream Chat
   */
  async upsertUser(userInfo: UserInfo): Promise<void> {
    if (!this.client) {
      throw new Error('Stream Chat client not initialized');
    }

    try {
      await this.client.upsertUser({
        id: userInfo.userId,
        name: userInfo.name || 'Guest',
        role: userInfo.role || 'visitor',
        email: userInfo.email,
        customerId: userInfo.customerId,
      });
    } catch (error) {
      console.error('Failed to upsert user:', error);
      throw error;
    }
  }

  /**
   * Generate user token for Stream Chat authentication
   */
  async generateUserToken(userId: string): Promise<string> {
    if (!this.client) {
      throw new Error('Stream Chat client not initialized');
    }

    try {
      const token = this.client.createToken(userId);
      return token;
    } catch (error) {
      console.error('Failed to generate user token:', error);
      throw error;
    }
  }

  /**
   * Create or get a chat channel
   */
  async getOrCreateChannel(userId: string, channelId?: string): Promise<any> {
    if (!this.client) {
      throw new Error('Stream Chat client not initialized');
    }

    try {
      const shopId = chatbotNodeClient.getShopId();
      const id = channelId || `${shopId}-${userId}`;

      // Create messaging channel
      const channel = this.client.channel('messaging', id, {
        name: `Chat with ${shopId}`,
        members: [userId, 'chatbot-assistant'],
        created_by_id: userId,
      });

      await channel.create();
      return channel;
    } catch (error) {
      console.error('Failed to create channel:', error);
      throw error;
    }
  }

  /**
   * Send message to channel
   * This method integrates with chatbot-node for AI responses
   */
  async sendMessage(
    channelId: string,
    userId: string,
    message: string,
    userRole: 'visitor' | 'customer' = 'visitor'
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Stream Chat client not initialized');
    }

    try {
      // Get the channel
      const shopId = chatbotNodeClient.getShopId();
      const channel = this.client.channel('messaging', channelId || `${shopId}-${userId}`);

      // Send user message
      await channel.sendMessage({
        text: message,
        user_id: userId,
      });

      // Stream AI response from chatbot-node
      let aiResponse = '';
      
      await chatbotNodeClient.sendChatMessage(
        message,
        userId,
        (chunk: string) => {
          // Accumulate chunks
          aiResponse += chunk;
        },
        async () => {
          // Send complete AI response to channel
          if (aiResponse) {
            await channel.sendMessage({
              text: aiResponse,
              user_id: 'chatbot-assistant',
            });
          }
        },
        async (error: Error) => {
          console.error('Chat error:', error);
          // Send error message to channel
          await channel.sendMessage({
            text: 'Sorry, I encountered an error. Please try again.',
            user_id: 'chatbot-assistant',
          });
        },
        userRole
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Get channel history
   */
  async getChannelHistory(channelId: string, limit: number = 50): Promise<any[]> {
    if (!this.client) {
      throw new Error('Stream Chat client not initialized');
    }

    try {
      const channel = this.client.channel('messaging', channelId);
      const state = await channel.watch();
      const messages = state.messages || [];
      if (!limit || messages.length <= limit) {
        return messages;
      }
      return messages.slice(-limit);
    } catch (error) {
      console.error('Failed to get channel history:', error);
      throw error;
    }
  }

  /**
   * Delete channel
   */
  async deleteChannel(channelId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Stream Chat client not initialized');
    }

    try {
      const channel = this.client.channel('messaging', channelId);
      await channel.delete();
    } catch (error) {
      console.error('Failed to delete channel:', error);
      throw error;
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Disconnect Stream Chat client
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnectUser();
      this.initialized = false;
    }
  }
}

// Export singleton instance (will be initialized in bootstrap)
let streamChatService: StreamChatService | null = null;

export function initializeStreamChatService(config: StreamChatConfig): StreamChatService {
  if (!streamChatService) {
    streamChatService = new StreamChatService(config);
  }
  return streamChatService;
}

export function getStreamChatService(): StreamChatService {
  if (!streamChatService) {
    throw new Error('StreamChatService not initialized. Call initializeStreamChatService first.');
  }
  return streamChatService;
}

