/**
 * Chatbot Node API Client
 * Integrates with chatbot-node backend API
 * Uses JWT authentication with SSO shared secret
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import jwt from 'jsonwebtoken';

interface TenantConfig {
  shopId: string;
  name?: string;
  logoUrl?: string;
  botId?: string;
  syncScopes?: string[];
}

interface SyncResult {
  success: boolean;
  count: number;
  message?: string;
}

interface ChatStatistics {
  todayCount: number;
  yesterdayCount?: number;
  increasePer?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export class ChatbotNodeClient {
  private baseURL: string;
  private shopId: string;
  private ssoSecret: string;
  private webhookSecret: string;
  private axiosInstance: AxiosInstance;

  constructor() {
    // Load configuration from environment variables
    this.baseURL = process.env.CHATBOT_NODE_URL || 'http://localhost:3000';
    this.shopId = process.env.CHATBOT_SHOP_ID || '';
    this.ssoSecret = process.env.CHATBOT_SSO_SECRET || '';
    this.webhookSecret = process.env.CHATBOT_WEBHOOK_SECRET || '';

    if (!this.shopId || !this.ssoSecret) {
      console.warn('ChatbotNodeClient: Missing CHATBOT_SHOP_ID or CHATBOT_SSO_SECRET environment variables');
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Generate JWT token for authentication
   * Token expires in 1 hour
   */
  private generateJWT(): string {
    if (!this.ssoSecret) {
      throw new Error('SSO secret not configured');
    }

    const token = jwt.sign(
      { 
        shopId: this.shopId,
        role: 'admin'
      },
      this.ssoSecret,
      {
        issuer: 'shopsaas',
        audience: 'chatbot-node',
        expiresIn: '1h'
      }
    );

    return token;
  }

  /**
   * Make authenticated request to chatbot-node API
   */
  private async request<T = any>(options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    body?: any;
    headers?: Record<string, string>;
  }): Promise<T> {
    try {
      const token = this.generateJWT();
      
      const config: AxiosRequestConfig = {
        method: options.method,
        url: options.path,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      };

      if (options.body) {
        config.data = options.body;
      }

      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error: any) {
      console.error('ChatbotNodeClient request error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        throw new Error(error.response.data?.message || error.response.data?.error || 'API request failed');
      }
      throw error;
    }
  }

  /**
   * Get tenant configuration
   */
  async getTenantConfig(): Promise<TenantConfig | null> {
    try {
      const config = await this.request<TenantConfig>({
        method: 'GET',
        path: `/api/admin/tenants/${this.shopId}/config`
      });
      return config;
    } catch (error) {
      console.error('Failed to get tenant config:', error);
      return null;
    }
  }

  /**
   * Update bot configuration
   */
  async updateBotConfig(updates: {
    name?: string;
    logoUrl?: string;
    syncScopes?: string[];
  }): Promise<TenantConfig | null> {
    try {
      const config = await this.request<TenantConfig>({
        method: 'PUT',
        path: `/api/admin/tenants/${this.shopId}/config`,
        body: updates
      });
      return config;
    } catch (error) {
      console.error('Failed to update bot config:', error);
      return null;
    }
  }

  /**
   * Sync dataset to knowledge base
   * @param type - Dataset type: 'products', 'orders', or 'customers'
   * @param data - Array of items to sync
   */
  async syncDataset(type: 'products' | 'orders' | 'customers', data: any[]): Promise<SyncResult> {
    try {
      const result = await this.request<SyncResult>({
        method: 'POST',
        path: `/api/coze/bot/updateDataset/${type}`,
        body: {
          shopId: this.shopId,
          type,
          data
        }
      });
      return result;
    } catch (error: any) {
      console.error(`Failed to sync ${type}:`, error);
      return {
        success: false,
        count: 0,
        message: error.message
      };
    }
  }

  /**
   * Get chat statistics
   */
  async getChatStats(): Promise<ChatStatistics | null> {
    try {
      const stats = await this.request<ChatStatistics>({
        method: 'GET',
        path: '/api/chat-history/statistics/today'
      });
      return stats;
    } catch (error) {
      console.error('Failed to get chat stats:', error);
      return null;
    }
  }

  /**
   * Get bot ID from config
   */
  async getBotId(): Promise<string | null> {
    const config = await this.getTenantConfig();
    return config?.botId || null;
  }

  /**
   * Check if chatbot is properly configured
   */
  isConfigured(): boolean {
    return Boolean(this.shopId && this.ssoSecret && this.baseURL);
  }

  /**
   * Get shop ID
   */
  getShopId(): string {
    return this.shopId;
  }

  /**
   * Get base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Send chat message with streaming response
   * @param message - User message
   * @param userId - User/session ID
   * @param onChunk - Callback for each response chunk
   * @param onComplete - Callback when response is complete
   * @param onError - Callback for errors
   */
  async sendChatMessage(
    message: string,
    userId: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const token = this.generateJWT();
      const url = `${this.baseURL}/api/coze/chat`;

      // Send POST request with streaming response
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopId: this.shopId,
          message,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              if (data.type === 'chunk' && data.content) {
                onChunk(data.content);
              } else if (data.type === 'done' || data.type === 'complete') {
                onComplete();
                return;
              } else if (data.type === 'error') {
                onError(new Error(data.message || 'Chat error'));
                return;
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      onComplete();
    } catch (error) {
      onError(error as Error);
    }
  }

  /**
   * Verify webhook signature
   * @param payload - Request body
   * @param signature - HMAC signature from header
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn('Webhook secret not configured');
      return false;
    }

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    return signature === expectedSignature;
  }
}

// Singleton instance
export const chatbotNodeClient = new ChatbotNodeClient();

