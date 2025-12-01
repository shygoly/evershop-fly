// @ts-nocheck
import { Request, Response } from 'express';
import { ChatbotSettingService } from '../../services/ChatbotSettingService.js';
import { chatbotNodeClient } from '../../services/ChatbotNodeClient.js';

export default async function getChatbotStatus(
  request: Request,
  response: Response,
  next: Function
) {
  try {
    const { shop_id } = request.query;

    if (!shop_id || typeof shop_id !== 'string') {
      throw new Error('Shop ID is required');
    }

    // Get local settings
    const setting = await ChatbotSettingService.getByShopId(shop_id);

    if (!setting) {
      response.$body = {
        data: null,
        success: false,
        message: 'Chatbot not configured for this shop'
      };
      next();
      return;
    }

    // Check if chatbot-node is configured
    if (!chatbotNodeClient.isConfigured()) {
      console.warn('Chatbot-node client not configured, returning local settings only');
      response.$body = {
        data: {
          setting,
          syncInfo: null,
          chatStats: null,
          recentLogs: []
        },
        success: true,
        message: 'Chatbot-node not configured'
      };
      next();
      return;
    }

    // Get data from chatbot-node API
    const [tenantConfig, chatStats] = await Promise.all([
      chatbotNodeClient.getTenantConfig(),
      chatbotNodeClient.getChatStats()
    ]);

    // Get recent sync logs
    const recentLogs = await ChatbotSettingService.getRecentSyncLogs(shop_id, 5);

    response.$body = {
      data: {
        setting,
        tenantConfig,
        chatStats,
        recentLogs
      },
      success: true
    };

    next();
  } catch (error: any) {
    console.error('Get chatbot status error:', error);
    response.$body = {
      success: false,
      message: error.message || 'Failed to get chatbot status'
    };
    next();
  }
}

