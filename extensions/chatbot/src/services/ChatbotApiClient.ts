/**
 * Chatbot Admin API Client
 * Integrates with chatbotadmin backend API
 * Based on chatbot/app/models/ChadaApi.js
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { tokenCache, TokenInfo } from './TokenCache.js';

interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

interface ShopInfo {
  id: string;
  name: string;
  email?: string;
  domain?: string;
}

interface SyncInfo {
  productCount: number;
  productDate: string | null;
  orderCount?: number;
  orderDate: string | null;
  customerCount?: number;
  customerDate: string | null;
}

interface ChatStatistics {
  todayCount: number;
  increasePer: number;
}

interface BotSetting {
  id?: number;
  shopId: string;
  botId?: string;
  shopName?: string;
  [key: string]: any;
}

export class ChatbotApiClient {
  private baseURL: string;
  private defaultTenantId: number;
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:48080', defaultTenantId: number = 1) {
    this.baseURL = baseURL;
    this.defaultTenantId = defaultTenantId;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get shop info by subject token
   */
  async getShopInfo(data: { shop?: string; subjectToken?: string }): Promise<ShopInfo | null> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<ShopInfo>>(
        '/admin-api/mail/shopify/auth/getShopBySubjectToken',
        { params: data }
      );

      if (response.data.code === 0) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Get shop info error:', error);
      return null;
    }
  }

  /**
   * Get authentication token for shop
   */
  async getAuthToken(shopName: string): Promise<TokenInfo | null> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<TokenInfo>>(
        '/admin-api/mail/shopify/auth/login',
        { shopName }
      );

      if (response.data.code === 0) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Get auth token error:', error);
      return null;
    }
  }

  /**
   * Make authenticated request to chatbotadmin API
   */
  async request<T = any>(
    shopInfo: ShopInfo,
    options: {
      path: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
    }
  ): Promise<T | null> {
    let tokenInfo = tokenCache.get(shopInfo.id);
    const now = Date.now();

    // Refresh token if expired or not exists
    if (!tokenInfo || now > tokenInfo.expiresTime - 100) {
      tokenInfo = await this.getAuthToken(shopInfo.id);
      if (tokenInfo) {
        tokenCache.set(shopInfo.id, tokenInfo);
      } else {
        console.error('Failed to get auth token for shop:', shopInfo.id);
        return null;
      }
    }

    try {
      const config: AxiosRequestConfig = {
        method: options.method,
        url: options.path,
        headers: {
          'Content-Type': 'application/json',
          'tenant-id': tokenInfo.tenantId.toString(),
          'Authorization': `Bearer ${tokenInfo.accessToken}`
        }
      };

      if (options.body) {
        config.data = options.body;
      }

      const response = await this.axiosInstance.request<ApiResponse<T>>(config);

      if (response.data.code === 0) {
        return response.data.data;
      }
      
      console.error('API request failed:', response.data.msg);
      return null;
    } catch (error) {
      console.error('API request error:', error);
      return null;
    }
  }

  /**
   * Initialize shop in chatbotadmin
   */
  async initializeShop(data: {
    subjectToken?: string;
    accessToken?: string;
    shop: string;
  }): Promise<ShopInfo | null> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<ShopInfo>>(
        '/admin-api/mail/shopify/auth/initialization',
        data,
        {
          headers: {
            'tenant-id': this.defaultTenantId.toString()
          }
        }
      );

      if (response.data.code === 0) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Initialize shop error:', error);
      return null;
    }
  }

  /**
   * Get bot settings for a shop
   */
  async getBotSetting(shopInfo: ShopInfo): Promise<BotSetting | null> {
    return this.request<BotSetting>(shopInfo, {
      path: `/admin-api/mail/shopify/botSettings/shop/${shopInfo.id}`,
      method: 'GET'
    });
  }

  /**
   * Update bot settings
   */
  async updateBotSetting(shopInfo: ShopInfo, settings: any): Promise<any> {
    return this.request(shopInfo, {
      path: '/admin-api/mail/shopify/botSettings/update',
      method: 'PUT',
      body: settings
    });
  }

  /**
   * Update bot knowledge base
   */
  async updateBotKnowledge(shopInfo: ShopInfo, data: { docType: number; shopId: string }): Promise<any> {
    return this.request(shopInfo, {
      path: '/admin-api/mail/coze/api/createOrUpdateDocument',
      method: 'POST',
      body: data
    });
  }

  /**
   * Get sync information
   */
  async getSyncInfo(shopInfo: ShopInfo): Promise<SyncInfo | null> {
    return this.request<SyncInfo>(shopInfo, {
      path: `/admin-api/mail/coze/api/datasetStatistic/${shopInfo.id}`,
      method: 'GET'
    });
  }

  /**
   * Get today's chat statistics
   */
  async getChatNumberToday(shopInfo: ShopInfo): Promise<ChatStatistics | null> {
    return this.request<ChatStatistics>(shopInfo, {
      path: '/admin-api/mail/coze-chat-history/todayChatStatistics',
      method: 'GET'
    });
  }

  /**
   * Create or get Coze bot
   */
  async createBot(shopInfo: ShopInfo, botData: {
    name: string;
    description: string;
    promptInfo: string;
  }): Promise<{ botId: string } | null> {
    return this.request<{ botId: string }>(shopInfo, {
      path: '/admin-api/mail/coze/bot/create',
      method: 'POST',
      body: botData
    });
  }

  /**
   * Manual sync dataset by type
   */
  async manualSyncDataset(shopInfo: ShopInfo, dateType: string): Promise<any> {
    return this.request(shopInfo, {
      path: `/admin-api/mail/coze/manualSyncDataset?dateType=${dateType}`,
      method: 'POST'
    });
  }
}

// Singleton instance
export const chatbotApiClient = new ChatbotApiClient();

